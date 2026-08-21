<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\OrderTrackingService;
use Illuminate\Console\Command;

class AdvanceOrderTracking extends Command
{
    protected $signature = 'orders:advance-tracking';

    protected $description = 'Automatically progress due order tracking steps every 2 minutes';

    public function handle(): int
    {
        $service = new OrderTrackingService();
        $orders = Order::where('status', '!=', 'cancelled')->get();

        $advanced = 0;
        $pending = 0;

        foreach ($orders as $order) {
            $steps = $service->ensureSteps($order);
            $service->advance($order, $steps);

            $hasPending = $steps->contains(fn ($step) => $step->status !== 'completed');
            if ($hasPending) {
                $pending++;
            } else {
                $advanced++;
            }
        }

        $this->info("Order tracking: {$pending} orders still in transit, {$advanced} orders delivered.");

        return self::SUCCESS;
    }
}