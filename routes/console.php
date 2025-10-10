<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule due date notifications to run daily at 9:00 AM
Schedule::command('notifications:check-due-dates')
    ->dailyAt('09:00')
    ->description('Check for overdue invoices and upcoming due dates')
    ->withoutOverlapping();

// Optional: Schedule upcoming due dates check twice daily (morning and afternoon)
Schedule::command('notifications:check-due-dates --upcoming')
    ->twiceDaily(9, 15)
    ->description('Check for upcoming due dates (next 3 days)')
    ->withoutOverlapping();
