<?php

use App\User;
use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class PasswordResetTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp() {
        parent::setUp();

        Config::set('mail.driver', 'log');
        (new Illuminate\Mail\MailServiceProvider(app()))->register();
    }

    public function test_it_sends_password_reset_link_via_email()
    {
        $user = factory(App\User::class)->create();

        Log::listen(function($data)  {
            $this->assertTrue(str_contains($data->message, "/password/reset/"));
        });

        $response = $this->callUrl('POST', 'secure/auth/password/email', ['email' => $user->email], null);
        $response->assertStatus(200);

        $this->assertEquals('success', $response->json()['status']);
    }

    public function test_it_resets_users_password()
    {
        $user = factory(App\User::class)->create();
        $token = App::make(PasswordBroker::class)->createToken($user);
        $payload = ['email' => $user->email, 'password' => 'test123', 'password_confirmation' => 'test123', 'token' => $token];

        $response = $this->callUrl('POST', "secure/auth/password/reset", $payload);
        $response->assertStatus(200);

        $this->assertEquals('success', $response->json()['status']);
    }
}
