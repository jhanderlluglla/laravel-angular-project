<?php namespace App\Console\Commands\E2E;

use DB;
use Artisan;
use App\User;
use App\Group;
use App\Services\DotEnvEditor;
use Illuminate\Console\Command;

class Setup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'e2e:setup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up application for e2e tests.';

    /**
     * User model instance.
     *
     * @var User
     */
    private $user;

    /**
     * @var DotEnvEditor
     */
    private $dotEnv;

    /**
     * SetUp constructor.
     *
     * @param User $user
     * @param DotEnvEditor $dotEnv
     */
    public function __construct(User $user, DotEnvEditor $dotEnv)
    {
        parent::__construct();

        $this->user = $user;
        $this->dotEnv = $dotEnv;
    }

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle()
    {
        $this->dotEnv->write([ 'APP_ENV' => 'testing',  'DB_CONNECTION' => 'sqlite']);
        DB::setDefaultConnection('sqlite');
        $this->info('Changed application environment to: testing');

        $this->cleanDatabase();
        $this->createUsers();
        $this->seedDatabase();
        $this->attachGroups();
    }

    private function cleanDatabase()
    {
        $tableNames = \Schema::getConnection()->getDoctrineSchemaManager()->listTableNames();

        foreach ($tableNames as $name) {
            if ($name == 'migrations') continue;
            DB::table($name)->truncate();
        }

        $this->info('Cleaned database.');

    }

    private function createUsers()
    {
        $password = bcrypt('tester');

        factory(User::class)->create(['email' => 'admin@tester.com', 'password' => $password, 'permissions' => '{"superAdmin":true}']);
        factory(User::class)->create(['email' => 'customer@tester.com', 'password' => $password]);
        factory(User::class)->create(['email' => 'agent@tester.com', 'password' => $password]);

        $this->info('Created test users.');
    }

    private function attachGroups()
    {
        $customer = User::where('email', 'customer@tester.com')->first();
        $customer->groups()->attach(Group::where('name', 'customers')->first()->id);

        $agent = User::where('email', 'agent@tester.com')->first();
        $agent->groups()->attach(Group::where('name', 'agents')->first()->id);
    }

    private function seedDatabase()
    {
        Artisan::call('db:seed');
        $this->info('Seeded database.');
    }
}
