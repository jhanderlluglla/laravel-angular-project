<?php

use App\User;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class UpdateUserTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_updates_existing_user()
    {
        $groups = factory(App\Group::class, 2)->create();
        $user   = $this->getAdminUser();
        $user->groups()->attach($groups[0]->id);
        $payload = ['email' => 'test@test.com', 'first_name' => 'test', 'last_name' => 'tester', 'groups' => [$groups[1]->id], 'permissions' => ['test' => true, 'test2' => false]];

        $response = $this->actingAs($user)->call('PUT', "secure/users/$user->id", $payload);
        $response->assertStatus(200);
        $response = $response->json();
        $user = User::find($user->id);

        //returns correct user
        $this->assertEquals($response['id'], $user->id);

        //assigns last name
        $this->assertEquals($user->last_name, 'tester');

        //does not change email
        $this->assertEquals($user->email, $user->email);

        //synced user groups
        $this->assertCount(1, $user->groups);
        $this->assertEquals($groups[1]->id, $user->groups->first()->id);

        //synced user permissions
        $this->assertCount(2, $user->permissions);
        $this->assertEquals(1, $user->permissions['test']);
        $this->assertEquals(0, $user->permissions['test2']);
    }

    public function test_it_validates_user_input()
    {
        $user = $this->getRegularUser();

        $response = $this->asAdmin()->json('PUT', "secure/users/$user->id", ['email' => $user->email, 'first_name' => '123']);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertArrayHasKey('messages', $response);
        $this->assertNotEmpty($response['messages']);

        //does not trigger unique value error if trying to update user email with same value
        $this->assertArrayNotHasKey('email', $response['messages']);

        //rejects to short names
        $this->assertArrayHasKey('first_name', $response['messages']);
    }

    public function test_it_checks_user_permissions()
    {
        $user1 = $this->getRegularUser();
        $user2 = $this->getRegularUser();

        //guests can't update users
        $response = $this->call('PUT', "secure/users/$user2->id");
        $response->assertStatus(403);

        //regular users can't update users
        $response = $this->actingAs($user1)->call('PUT', "secure/users/$user2->id");
        $response->assertStatus(403);

        //user can update his own model
        $response = $this->actingAs($user2)->call('PUT', "secure/users/$user2->id");
        $response->assertStatus(200);

        //user can't update his own groups or permissions
        $response = $this->actingAs($user2)->call('PUT', "secure/users/$user2->id", ['groups' => [1], 'permissions' => [1]]);
        $response->assertStatus(403);

        //user with permissions can update users
        $user1->permissions = '{"users.update":1}';
        $response = $this->actingAs($user1)->call('PUT', "secure/users/$user2->id");
        $response->assertStatus(200);
    }
}
