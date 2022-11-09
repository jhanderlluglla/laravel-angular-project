<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class ChangePasswordTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_changes_user_password()
    {
        $user = factory(App\User::class)->create(['password' => Hash::make('foo bar')]);

        $payload = ['current_password' => 'foo bar', 'new_password' => 'foo bar baz', 'new_password_confirmation' => 'foo bar baz'];
        $response = $this->actingAs($user)->json('POST', "secure/users/{$user->id}/password/change", $payload);
        $response->assertStatus(200);

        //returns user
        $this->assertEquals($response->json()['id'], $user->id);

        //changes password
        $this->assertTrue(Hash::check('foo bar baz', $user->fresh()->password));
    }

    public function test_it_validates_user_input()
    {
        $user = $this->getRegularUser();

        $payload = ['current_password' => 'foo bar', 'new_password' => 'foo bar baz'];
        $response = $this->asAdmin()->json('POST', "/secure/users/$user->id/password/change", $payload);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertArrayHasKey('current_password', $response['messages']);
        $this->assertArrayHasKey('new_password', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user1 = factory(App\User::class)->create(['password' => Hash::make('foo bar')]);
        $user2 = factory(App\User::class)->create(['password' => Hash::make('foo bar')]);
        $payload = ['current_password' => 'foo bar', 'new_password' => 'foo bar baz', 'new_password_confirmation' => 'foo bar baz'];

        //guests can't change password
        $response = $this->call('POST', "/secure/users/{$user2->id}/password/change", $payload);
        $response->assertStatus(403);

        //regular users can't change other users password
        $response = $this->actingAs($user1)->call('POST', "/secure/users/{$user2->id}/password/change", $payload);
        $response->assertStatus(403);

        //regular users can change their own password
        $response = $this->actingAs($user1)->json('POST', "/secure/users/{$user1->id}/password/change", $payload);
        $response->assertStatus(200);

        //user with permissions can change password
        $user1->permissions = '{"users.update":1}';
        $response = $this->actingAs($user1)->call('POST', "/secure/users/{$user2->id}/password/change", $payload);
        $response->assertStatus(200);
    }
}
