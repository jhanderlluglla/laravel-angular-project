<?php

use App\User;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CreateUserTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_a_new_user()
    {
        $groups = factory(App\Group::class, 2)->create();
        $payload = [
            'email' => 'test@test.com',
            'password' => 'foo',
            'first_name' => 'test',
            'last_name' => 'tester',
            'groups' => [$groups[0]->id, $groups[1]->id],
            'permissions' => ['test' => true, 'test2' => false]
        ];

        $response = $this->asAdmin()->call('POST', "secure/users", $payload);
        $response->assertStatus(201);

        //creates and returns correct user
        $user = User::where('first_name', 'test')->first();
        $this->assertEquals($response->json()['data']['id'], $user->id);

        //assigns all properties
        $this->assertEquals($user->last_name, 'tester');
        $this->assertCount(2, $user->groups);
        $this->assertCount(2, $user->permissions);
        $this->assertEquals(1, $user->permissions['test']);
        $this->assertEquals(0, $user->permissions['test2']);
    }

    public function test_it_validates_user_input()
    {
        $user = factory(App\User::class)->create();

        $response = $this->asAdmin()->json('POST', "secure/users", ['email' => $user->email, 'first_name' => '123']);
        $response->assertStatus(422);
        $response = $response->json();

        //unique email rule
        $this->assertArrayHasKey('email', $response['messages']);

        //too short names are rejected
        $this->assertArrayHasKey('first_name', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't create users
        $response = $this->json('POST', "secure/users", ['email' => 'foo123@bar.com', 'password' => 'foo']);
        $response->assertStatus(403);

        //regular users can't create users
        $response = $this->actingAs($user)->json('POST', "secure/users", ['email' => 'foo123@bar.com', 'password' => 'foo']);
        $response->assertStatus(403);

        //user with permissions can create users
        $user->permissions = '{"users.create":1}';
        $response = $this->actingAs($user)->json('POST', "secure/users", ['email' => 'foo123@bar.com', 'password' => 'foo']);
        $response->assertStatus(201);
    }
}
