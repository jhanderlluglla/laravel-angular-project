<?php

use App\Group;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class GroupsRemoveUsersTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_removes_multiple_users_from_group()
    {
        $group = factory(Group::class)->create();
        $users = factory(App\User::class, 3)->create();
        $group->users()->attach($users->pluck('id'));

        $response = $this->asAdmin()->call('POST', "secure/groups/{$group->id}/remove-users", ['ids' => $users->pluck('id')->toArray()]);
        $response->assertStatus(200);

        //detaches users from group
        $this->assertEmpty($group->users()->get());
    }

    public function test_it_validates_user_input()
    {
        $group = factory(Group::class)->create();

        $response = $response = $this->asAdmin()->json('POST', "secure/groups/{$group->id}/remove-users");
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('ids', $response['messages']);
    }

    public function test_guests_cant_remove_users_from_group()
    {
        $group = factory(Group::class)->create();

        $response = $this->call('POST', "secure/groups/{$group->id}/remove-users");
        $response->assertStatus(403);
    }

    public function test_regular_users_cant_remove_users_from_group()
    {
        $group = factory(Group::class)->create();

        $response = $this->asRegularUser()->call('POST', "secure/groups/{$group->id}/remove-users");
        $response->assertStatus(403);
    }

    public function test_user_with_permissions_can_remove_users_from_group()
    {
        $group = factory(Group::class)->create();
        $user = $this->getRegularUser();
        $user->permissions = '{"groups.update":1}';

        $response = $this->actingAs($user)->call('POST', "secure/groups/{$group->id}/remove-users", ['ids' => [1,2,3]]);
        $response->assertStatus(200);
    }
}
