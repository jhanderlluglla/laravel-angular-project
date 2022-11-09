<?php namespace App\Console\Commands\E2E;

use App\Services\DotEnvEditor;
use Illuminate\Console\Command;

class Teardown extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'e2e:teardown';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Move application from testing env and remove all testing artifacts.';

    /**
     * @var DotEnvEditor
     */
    private $dotEnv;

    /**
     * TearDown constructor.
     *
     * @param DotEnvEditor $dotEnv
     */
    public function __construct(DotEnvEditor $dotEnv)
    {
        parent::__construct();

        $this->dotEnv = $dotEnv;
    }

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle()
    {
        if (env('APP_ENV') !== 'testing') {
            $this->error('Application is not in testing environment!');
            return;
        }

        $this->dotEnv->write(['APP_ENV' => 'local',  'DB_CONNECTION' => 'mysql']);

        $this->info('Changed application environment to: local');
    }
}
