<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';
    protected $guarded = [];
    public $timestamps = false;

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }
}
