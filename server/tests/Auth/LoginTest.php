<?php

use App\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class LoginTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_logs_existing_user_in()
    {
        $user = factory(User::class)->create(['password' => bcrypt('test123')]);

        $response = $this->call('POST', 'secure/auth/login', ['email' => $user->email, 'password' => 'test123']);
        $response->assertStatus(200);
        $this->assertArrayHasKey('status', $response->json());
        $this->assertEquals($user->email, $response->json()['data']['email']);

        //logs user in
        $this->assertEquals($user->email, Auth::user()->email);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->json('POST', 'secure/auth/login');
        $response->assertStatus(422);

        $this->assertEquals('error', $response->json()['status']);
        $this->assertArrayHasKey('email', $response->json()['messages']);
        $this->assertArrayHasKey('password', $response->json()['messages']);
    }

    public function test_it_validates_user_supplied_credentials()
    {
        $response = $this->call('POST', 'secure/auth/login', ['email' => 'foo@bar.com', 'password' => 'foo bar']);
        $this->assertArrayHasKey('general', $response->json()['messages']);
    }
}
