<?php

use App\User;
use App\Services\Settings;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RegistrationTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_registers_new_user()
    {
        $defaultGroup = App\Group::firstOrCreate(['default' => 1, 'name' => 'customers']);

        $response = $this->callUrl('POST', 'secure/auth/register', ['email' => 'test@test.com', 'password' => 'test123', 'password_confirmation' => 'test123']);
        $response->assertStatus(200);
        $this->assertArrayHasKey('status', $response->json());
        $this->assertEquals('test@test.com', $response->json()['data']['email']);

        //creates a new user
        $user = User::with('groups')->where('email', 'test@test.com')->first();

        //attaches default group to new user
        $this->assertCount(1, $user->groups);
        $this->assertEquals($defaultGroup->id, $user->groups->first()->id);
    }

    public function test_it_validates_user_supplied_credentials_without_purchase_code()
    {
        $response = $this->callUrl('POST', 'secure/auth/register', []);
        $response->assertStatus(422);

        $this->assertEquals('error', $response->json()['status']);
        $this->assertArrayHasKey('email', $response->json()['messages']);
        $this->assertArrayHasKey('password', $response->json()['messages']);
        $this->assertArrayNotHasKey('purchase_code', $response->json()['messages']);
    }

    public function test_it_validates_user_supplied_credentials_with_purchase_code()
    {
        $this->app->make(Settings::class)->set('envato.enable', 1);
        $this->app->make(Settings::class)->set('envato.require_purchase_code', 1);

        $response = $this->callUrl('POST', 'secure/auth/register', []);
        $response->assertStatus(422);

        $this->assertEquals('error', $response->json()['status']);
        $this->assertArrayHasKey('email', $response->json()['messages']);
        $this->assertArrayHasKey('password', $response->json()['messages']);
        $this->assertArrayHasKey('purchase_code', $response->json()['messages']);
    }
}
