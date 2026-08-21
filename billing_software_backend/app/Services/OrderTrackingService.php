<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderTrackingStep;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class OrderTrackingService
{
    /**
     * The tracking steps for an order, in completion order.
     */
    public const STEPS = [
        'placed' => 'Order Placed',
        'confirmed' => 'Confirmed',
        'shipped' => 'Shipped',
        'out_for_delivery' => 'Out for Delivery',
        'delivered' => 'Delivered',
    ];

    /**
     * How many minutes pass before the next step auto-completes.
     */
    public const STEP_MINUTES = 2;

    /**
     * Which orders.status value each completed step maps to.
     */
    public const ORDER_STATUS_BY_STEP = [
        'placed' => 'pending',
        'confirmed' => 'confirmed',
        'shipped' => 'shipped',
        'out_for_delivery' => 'shipped',
        'delivered' => 'delivered',
    ];

    /**
     * Make sure the order has one row per tracking step.
     * The first step ("Order Placed") starts as completed at the order's
     * created_at time; the rest start pending.
     */
    public function ensureSteps(Order $order): Collection
    {
        $existing = OrderTrackingStep::where('order_id', $order->id)->orderBy('id')->get();

        if ($existing->count() === count(self::STEPS)) {
            return $existing;
        }

        OrderTrackingStep::where('order_id', $order->id)->delete();

        $base = $order->created_at ? Carbon::parse($order->created_at) : now();
        $steps = [];
        $first = true;
        foreach (self::STEPS as $key => $label) {
            $steps[] = OrderTrackingStep::create([
                'order_id' => $order->id,
                'step_key' => $key,
                'step_label' => $label,
                'status' => $first ? 'completed' : 'pending',
                'completed_at' => $first ? $base : null,
            ]);
            $first = false;
        }

        return collect($steps);
    }

    /**
     * Complete any tracking steps whose due time (2 minutes after the
     * previous step) has already passed, mark the next step as in progress,
     * and keep the order's status column in sync.
     *
     * Returns the timestamp of the next step to complete, or null when the
     * order is fully delivered.
     */
    public function advance(Order $order, ?Collection $steps = null): ?Carbon
    {
        $steps = $steps ?? OrderTrackingStep::where('order_id', $order->id)->orderBy('id')->get();
        if ($steps->count() === 0) {
            return null;
        }

        $now = now();
        $lastCompletedAt = $order->created_at ? Carbon::parse($order->created_at) : $now;
        $lastCompletedStep = null;

        foreach ($steps as $step) {
            if ($step->status === 'completed') {
                $lastCompletedAt = Carbon::parse($step->completed_at ?? $lastCompletedAt);
                $lastCompletedStep = $step;
                continue;
            }

            $dueAt = $lastCompletedAt->copy()->addMinutes(self::STEP_MINUTES);

            if ($now->gte($dueAt)) {
                $step->status = 'completed';
                $step->completed_at = $dueAt;
                $step->updated_at = $now;
                $step->save();
                $lastCompletedAt = $dueAt;
                $lastCompletedStep = $step;
            } else {
                if ($step->status !== 'in_progress') {
                    $step->status = 'in_progress';
                    $step->updated_at = $now;
                    $step->save();
                }
                break;
            }
        }

        // Keep the orders.status column in sync with the deepest completed step.
        if ($lastCompletedStep && $order->status !== 'cancelled') {
            $newStatus = self::ORDER_STATUS_BY_STEP[$lastCompletedStep->step_key] ?? $order->status;
            if ($order->status !== $newStatus) {
                $order->update(['status' => $newStatus]);
            }
        }

        return $this->nextStepAt($steps);
    }

    /**
     * When is the next (currently in-progress/pending) step due?
     */
    public function nextStepAt(Collection $steps): ?Carbon
    {
        $lastCompletedAt = null;
        $anyPending = false;

        foreach ($steps as $step) {
            if ($step->status === 'completed') {
                $lastCompletedAt = Carbon::parse($step->completed_at);
            } else {
                $anyPending = true;
                break;
            }
        }

        if (!$anyPending || $lastCompletedAt === null) {
            return null;
        }

        return $lastCompletedAt->copy()->addMinutes(self::STEP_MINUTES);
    }

    /**
     * Build the API payload for an order's live tracking.
     */
    public function payload(Order $order): array
    {
        $steps = OrderTrackingStep::where('order_id', $order->id)->orderBy('id')->get();
        $nextStepAt = $this->nextStepAt($steps);

        return [
            'order' => [
                'id' => $order->id,
                'order_no' => $order->order_no,
                'invoice_no' => $order->invoice_no,
                'status' => $order->status,
                'payment_status' => $order->payment_status === 'paid' ? 'paid' : 'pending',
                'payment_method' => $order->payment_method,
                'created_at' => $order->created_at,
                'total' => $order->total_amount,
                'customer_name' => $order->customer_name,
                'shipping_address' => $order->shipping_address,
                'items_count' => OrderItem::where('order_id', $order->id)->count(),
            ],
            'steps' => $steps->map(fn ($step) => [
                'key' => $step->step_key,
                'label' => $step->step_label,
                'status' => $step->status,
                'completed_at' => $step->completed_at,
            ]),
            'next_step_at' => $nextStepAt ? $nextStepAt->toDateTimeString() : null,
        ];
    }
}