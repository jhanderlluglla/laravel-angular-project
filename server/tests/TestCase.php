<?php

class TestCase extends Illuminate\Foundation\Testing\TestCase
{
    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        return $app;
    }

    public function jsonWithFiles($type = 'POST', $url, $payload, $file)
    {
        $content = json_encode($payload);

        $headers = array_merge([
            'CONTENT_LENGTH' => mb_strlen($content, '8bit'),
            'CONTENT_TYPE' => 'application/json',
            'Accept' => 'application/json',
        ], []);

        $res = $this->call(
            $type, $url, [], [], ['files' => [$file]], $headers, $content
        );

        return $res->getContent();
    }

    public function callUrl($type = 'GET', $url, $params = [], \App\User $user = null, $decodeJson = true, $dumpErrors = true)
    {
        $server = array('HTTP_X-Requested-With' => 'XMLHttpRequest');

        if ($user) {
            $response = $this->actingAs($user)->call($type, $url, $params, [], [], $server);
        } else {
            $response = $this->call($type, $url, $params, [], [], $server);
        }

        if ($response->getStatusCode() === 500 && $dumpErrors) {
            dd($response->exception->getFile().' - '.$response->exception->getLine().' - '.$response->exception->getMessage());
        }

        return $response;
    }

    /**
     * Ignore all calls to specified class.
     *
     * @param string $class
     */
    protected function mock($class)
    {
        $mock = Mockery::mock($class);
        $mock->shouldIgnoreMissing();
        App::instance($class, $mock);
    }

    /**
     * Return faker instance.
     *
     * @return \Faker\Generator
     */
    protected function faker() {
        return \Faker\Factory::create();
    }


    /**
     * Create and return a fresh admin user instance.
     *
     * @return \App\User
     */
    protected function getAdminUser()
    {
        return factory(App\User::class)->create([
            'permissions' => '{"superAdmin":true}'
        ]);
    }

    /**
     * Create and return a fresh regular user instance.
     *
     * @param array $params
     * @return \App\User
     */
    protected function getRegularUser($params = [])
    {
        return factory(App\User::class)->create($params);
    }

    /**
     * Act as admin user for the next request.
     *
     * @return $this
     */
    protected function asAdmin() {
        return $this->actingAs($this->getAdminUser());
    }

    /**
     * Act as regular user for the next request.
     *
     * @return $this
     */
    protected function asRegularUser() {
        return $this->actingAs($this->getRegularUser());
    }
}
