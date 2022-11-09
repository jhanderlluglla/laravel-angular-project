<?php

namespace App\Console\Commands;

use App\Services\DotEnvEditor;
use App\Setting;
use Artisan;
use DemoHelpCenterSeeder;
use DemoTicketsSeeder;
use DemoUserSeeder;
use Illuminate\Console\Command;

class RefreshDemoSite extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'demo:refresh';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refresh demo site with sample data.';

    /**
     * @var Setting
     */
    private $setting;

    /**
     * @var DotEnvEditor
     */
    private $dotEnvEditor;

    /**
     * Create a new command instance.
     *
     * @param Setting $setting
     * @param DotEnvEditor $dotEnvEditor
     */
    public function __construct(Setting $setting, DotEnvEditor $dotEnvEditor)
    {
        parent::__construct();

        $this->setting = $setting;
        $this->dotEnvEditor = $dotEnvEditor;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ( ! config('site.demo')) {
            $this->warn('This is not a demo site! Aborting...');
            return;
        }

        $progress = $this->output->createProgressBar(9);
        $progress->advance();

        Artisan::call('migrate:refresh', ['--force' => true]);
        $progress->advance();

        Artisan::call('db:seed', ['--force' => true]);
        $progress->advance();

        Artisan::call('db:seed', ['--force' => true, '--class' => DemoUserSeeder::class]);
        $progress->advance();

        Artisan::call('db:seed', ['--force' => true, '--class' => DemoHelpCenterSeeder::class]);
        $progress->advance();

        Artisan::call('db:seed', ['--force' => true, '--class' => DemoTicketsSeeder::class]);
        $progress->advance();

        Artisan::call('scout:import', ['model' => 'App\Article']);
        Artisan::call('scout:import', ['model' => 'App\User']);
        Artisan::call('scout:import', ['model' => 'App\Ticket']);
        $progress->advance();

        //menus
        $this->setting->where('name', 'menus')->update(['value' => json_encode([
            ['name' => 'Header Menu', 'position' => 'header', 'items' => [
                ['type' => 'route', 'condition' => 'auth', 'label' => 'My Tickets', 'action' => '/help-center/tickets'],
                ['type' => 'route', 'condition' => 'admin', 'label' => 'Admin Area', 'action' => '/admin'],
                ['type' => 'route', 'condition' => 'guest', 'label' => 'Register', 'action' => 'register'],
                ['type' => 'route', 'condition' => 'guest', 'label' => 'Login', 'action' => 'login']
            ]],
        ])]);

        //other settings
        $this->setting->where('name', 'branding.use_custom_theme')->update(['value' => 0]);
        $this->setting->where('name', 'i18n.enable')->update(['value' => 0]);
        $this->setting->where('name', 'mail.use_default_templates')->update(['value' => 1]);
        $this->setting->where('name', 'realtime.pusher_key')->update(['value' => 'e6a31537e073f8bdce05']);
        $this->setting->where('name', 'realtime.enable')->update(['value' => 1]);
        $this->setting->where('name', 'logging.sentry_public')->update(['value' => 'https://cc3692b6b6224c2ca965dea66017d565@sentry.io/203366']);
        $this->dotEnvEditor->write(['SCOUT_DRIVER' => 'tntsearch']);
        $progress->advance();

        Artisan::call('cache:clear');
        Artisan::call('route:clear');
        Artisan::call('config:clear');
        $progress->advance();
    }
}
