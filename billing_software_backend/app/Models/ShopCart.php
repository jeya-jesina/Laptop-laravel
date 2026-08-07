<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopCart extends Model
{
    protected $table = 'shop_carts';
    protected $guarded = [];
    public $timestamps = true;
}
