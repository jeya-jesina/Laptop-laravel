<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Advance order tracking steps automatically (run via cron: * * * * * php artisan schedule:run)
Schedule::command('orders:advance-tracking')->everyMinute();
