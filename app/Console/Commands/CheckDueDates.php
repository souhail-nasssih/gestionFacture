<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;
use App\Models\User;
use App\Models\AppNotification;

class CheckDueDates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:check-due-dates {--user= : Specific user ID to notify} {--upcoming : Check upcoming due dates only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for overdue invoices and upcoming due dates, send notifications to users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking due dates...');

        $userId = $this->option('user');
        $upcomingOnly = $this->option('upcoming');

        $notifications = [];

        if ($upcomingOnly) {
            $this->info('📅 Checking upcoming due dates (next 3 days)...');
            $notifications = NotificationService::checkUpcomingDueDates($userId);
        } else {
            $this->info('🚨 Checking overdue invoices...');
            $overdueNotifications = NotificationService::checkDueDates($userId);

            $this->info('📅 Checking upcoming due dates (next 3 days)...');
            $upcomingNotifications = NotificationService::checkUpcomingDueDates($userId);

            $notifications = array_merge($overdueNotifications, $upcomingNotifications);
        }

        if (empty($notifications)) {
            $this->info('✅ No due date notifications to send.');
            return;
        }

        $this->info("📬 Sending " . count($notifications) . " notification(s)...");

        // If no specific user, notify all users
        if (!$userId) {
            $users = User::all();
            foreach ($users as $user) {
                foreach ($notifications as $notification) {
                    // Create a copy for each user
                    AppNotification::create([
                        'user_id' => $user->id,
                        'type' => $notification->type,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'data' => $notification->data,
                    ]);
                }
            }
            $this->info("✅ Notifications sent to " . $users->count() . " user(s).");
        } else {
            $this->info("✅ Notifications sent to user ID: {$userId}");
        }

        // Display summary
        $this->displaySummary($notifications);
    }

    /**
     * Display a summary of notifications sent
     */
    private function displaySummary(array $notifications)
    {
        $summary = [];

        foreach ($notifications as $notification) {
            $type = $notification->type;
            if (!isset($summary[$type])) {
                $summary[$type] = 0;
            }
            $summary[$type]++;
        }

        $this->info("\n📊 Summary:");
        foreach ($summary as $type => $count) {
            $this->line("  - {$type}: {$count} notification(s)");
        }
    }
}
