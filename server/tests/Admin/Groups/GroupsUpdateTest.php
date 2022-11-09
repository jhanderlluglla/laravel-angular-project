<?php

use App\Group;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class GroupsUpdateTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_updates_existing_group()
    {
        $payload = ['name' => str_random(10), 'default' => 1, 'permissions' => ['superAdmin' => 1]];
        $group = factory(App\Group::class)->create();

        $response = $this->asAdmin()->call('PUT', "secure/groups/{$group->id}", $payload);
        $response->assertStatus(200);
        $response = $response->json();

        //check if group was updated
        $updatedGroup = Group::where('name', $payload['name'])->first();
        $this->assertEquals(1, $updatedGroup['default']);
        $this->assertEquals($payload['permissions'], $updatedGroup['permissions']);
        $this->assertDatabaseMissing('groups', ['name' => $group->name]);

        //check if updated group was returned
        $this->assertEquals($response['data']['id'], $updatedGroup->id);
    }

    public function test_it_validates_user_input()
    {
        $group = factory(App\Group::class)->create();

        $response = $this->asAdmin()->json('PUT', "secure/groups/{$group->id}", ['name' => 'x', 'default' => 'xx']);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('name', $response['messages']);
        $this->assertArrayHasKey('default', $response['messages']);
    }

    public function test_guests_cant_update_groups()
    {
        $group = factory(App\Group::class)->create();

        $response = $this->call('PUT', "secure/groups/{$group->id}");
        $response->assertStatus(403);
    }

    public function test_regular_users_update_groups()
    {
        $group = factory(App\Group::class)->create();

        $response = $this->asRegularUser()->call('PUT', "secure/groups/{$group->id}");
        $response->assertStatus(403);
    }

    public function test_user_with_permissions_can_update_groups()
    {
        $payload = ['name' => str_random(10), 'default' => 1, 'permissions' => ['superAdmin' => 1]];
        $user = $this->getRegularUser();
        $group = factory(App\Group::class)->create();

        $user->permissions = '{"groups.update":1}';
        $response = $this->actingAs($user)->call('PUT', "secure/groups/{$group->id}", $payload);
        $response->assertStatus(200);
    }
}
