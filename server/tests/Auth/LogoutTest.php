<?php

use App\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class LogoutTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_logs_user_out()
    {
        $user = factory(User::class)->create();
        Auth::loginUsingId($user->id);

        $response = $this->callUrl('POST', 'secure/auth/logout');
        $response->assertStatus(200);
        $this->assertArrayHasKey('status', $response->json());

        //logs user out
        $this->assertNull(Auth::user());
    }
}
