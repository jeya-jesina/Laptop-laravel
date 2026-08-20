<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderTrackingStep extends Model
{
    protected $table = 'order_tracking_steps';
    protected $guarded = [];
    public $timestamps = false;

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}