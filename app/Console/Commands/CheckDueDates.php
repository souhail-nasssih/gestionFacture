<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class CheckDueDates extends Command
{
    protected $signature = 'notifications:check-due-dates';

    protected $description = 'Crée des notifications pour les échéances proches ou dépassées';

    public function handle(NotificationService $notifications): int
    {
        $count = $notifications->checkDueDates();
        $this->info("{$count} notification(s) d'échéance créée(s).");

        return self::SUCCESS;
    }
}
