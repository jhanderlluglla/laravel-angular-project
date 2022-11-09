<?php

use App\Group;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class GroupsStoreTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_new_groups()
    {
        $payload = ['name' => str_random(10), 'default' => 1, 'permissions' => json_decode('{"superAdmin":1}', true)];

        $response = $this->asAdmin()->call('POST', "secure/groups", $payload);
        $response->assertStatus(201);
        $response = $response->json();

        //creates group
        $group = Group::where('name', $payload['name'])->first();

        //returns correct group
        $this->assertEquals($response['data']['id'], $group->id);
    }

    public function test_it_validates_user_input()
    {
        factory(App\Group::class)->create(['name' => 'test']);

        $response = $this->asAdmin()->json('POST', "secure/groups", ['name' => 'test', 'default' => 'string', 'permissions' => 'foo']);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);

        //only unique names are allowed
        $this->assertArrayHasKey('name', $response['messages']);

        //default must be boolean
        $this->assertArrayHasKey('default', $response['messages']);

        //permissions must be an array
        $this->assertArrayHasKey('permissions', $response['messages']);
    }

    public function test_guests_cant_create_groups()
    {
        $response = $this->call('POST', "secure/groups");
        $response->assertStatus(403);
    }

    public function test_regular_users_cant_create_groups()
    {
        $response = $this->asRegularUser()->call('POST', "secure/groups");
        $response->assertStatus(403);
    }

    public function test_user_with_permissions_can_create_groups()
    {
        $user = $this->getRegularUser();
        $user->permissions = '{"groups.create":1}';
        $payload = ['name' => str_random(10), 'default' => 1, 'permissions' => json_decode('{"superAdmin":1}', true)];

        $response = $this->actingAs($user)->call('POST', "secure/groups", $payload);
        $response->assertStatus(201);
    }
}
