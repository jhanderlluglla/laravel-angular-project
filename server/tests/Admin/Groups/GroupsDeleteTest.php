<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class GroupDeleteTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_existing_group()
    {
        $group = factory(App\Group::class)->create();
        $user   = $this->getRegularUser();
        $user->groups()->attach($group->id);

        $response = $this->asAdmin()->call('DELETE', "secure/groups/$group->id");
        $response->assertStatus(204);

        //deletes group
        $this->assertDatabaseMissing('groups', ['id' => $group->id]);

        //detaches deleted group from users
        $this->assertCount(0, $user->groups()->get());
    }

    public function test_it_checks_user_permissions()
    {
        $group = factory(App\Group::class)->create();
        $user  = $this->getRegularUser();

        //guests can't delete groups
        $response = $this->actingAs($user)->call('DELETE', "secure/groups/$group->id");
        $response->assertStatus(403);

        //regular users can't delete groups
        $user->permissions = null;
        $response = $this->actingAs($user)->call('DELETE', "secure/groups/$group->id");
        $response->assertStatus(403);

        //admin can delete groups
        $user->permissions = '{"superAdmin":1}';
        $response = $this->actingAs($user)->call('DELETE', "secure/groups/$group->id");
        $response->assertStatus(204);

        $group = factory(App\Group::class)->create();

        //user with groups.delete permission can delete groups
        $user->permissions = '{"groups.delete":1}';
        $response = $this->actingAs($user)->call('DELETE', "secure/groups/$group->id");
        $response->assertStatus(204);
    }
}
