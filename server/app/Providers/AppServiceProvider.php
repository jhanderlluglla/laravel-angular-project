<?php namespace App\Providers;

use Validator;
use Carbon\Carbon;
use App\Services\Settings;
use Laravel\Scout\EngineManager;
use App\Scout\MysqlSearchEngine;
use App\Scout\ElasticSearchEngine;
use App\Http\Validators\HashValidator;
use Illuminate\Support\ServiceProvider;
use App\Services\Envato\EnvatoApiClient;
use App\Services\SocialiteProviders\EnvatoProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerScoutEngines();
        $this->registerCustomValidators();
        $this->setDefaultDateLocale();

        if ($this->app->make(Settings::class)->get('envato.enable')) {
            $this->registerSocialiteEnvatoDriver();
            $this->addPurchaseCodeValidationRule();
        }
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //register dev service providers
        if ($this->app->environment() !== 'production') {
            $this->app->register(\Barryvdh\LaravelIdeHelper\IdeHelperServiceProvider::class);
        }
    }

    /**
     * Register custom validation rules with laravel.
     */
    private function registerCustomValidators()
    {
        //register hash validator
        Validator::resolver(function($translator, $data, $rules, $messages) {
            return new HashValidator($translator, $data, $rules, $messages);
        });
    }

    /**
     * Register custom laravel scout search engines.
     */
    private function registerScoutEngines()
    {
        $manager = $this->app->make(EngineManager::class);

        if (config('scout.driver') === 'mysql' || config('app.env') === 'testing') {
            $manager->extend('mysql', function () {
                return new MysqlSearchEngine;
            });
        }

        if (config('scout.driver') === 'elastic') {
            $manager->extend('elastic', function () {
                return new ElasticSearchEngine();
            });
        }
    }

    /**
     * Extend validator with envato purchase code check rule.
     */
    private function addPurchaseCodeValidationRule() {
        $envato = $this->app->make(EnvatoApiClient::class);

        Validator::extend('purchase_code_valid', function ($attribute, $value) use($envato) {
            return $envato->purchaseCodeIsValid($value);
        });
    }

    /**
     * Register custom laravel socialite envato driver.
     */
    private function registerSocialiteEnvatoDriver()
    {
        $socialite = $this->app->make('Laravel\Socialite\Contracts\Factory');
        $socialite->extend('envato', function ($app) use ($socialite) {
                $config = $app['config']['services.envato'];
                return $socialite->buildProvider(EnvatoProvider::class, $config);
            }
        );
    }

    /**
     * Set default date locale for the app.
     */
    private function setDefaultDateLocale()
    {
        $locale = $this->app->make(Settings::class)->get('dates.locale');
        Carbon::setLocale($locale);
    }
}
