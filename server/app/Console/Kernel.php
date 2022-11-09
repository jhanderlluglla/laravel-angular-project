<?php

namespace App\Console;

use App\Console\Commands\DeleteLooseUploads;
use App\Console\Commands\LimitSearchTermTableRowCount;
use App\Console\Commands\RefreshDemoSite;
use App\Console\Commands\TicketEscalation;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\GenerateTsClasses::class,
        Commands\E2E\Setup::class,
        Commands\E2E\Teardown::class,
        Commands\RefreshDemoSite::class,
        Commands\CreateElasticIndex::class,
        Commands\ExportTranslations::class,
        Commands\LimitSearchTermTableRowCount::class,
        Commands\DeleteLooseUploads::class,
        Commands\TicketEscalation::class
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command(DeleteLooseUploads::class)->daily();
        $schedule->command(LimitSearchTermTableRowCount::class)->daily();
        $schedule->command(TicketEscalation::class)->everyMinute();

        if (config('site.demo')) {
            $schedule->command(RefreshDemoSite::class)->daily();
        }
    }
}
