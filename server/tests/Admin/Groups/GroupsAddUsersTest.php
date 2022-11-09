<?php

use App\Group;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class GroupsAddUsersTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_adds_multiple_users_to_group()
    {
        $group = factory(App\Group::class)->create();
        $users = factory(App\User::class, 3)->create();
        $group->users()->attach($users[2]->id);

        $response = $this->asAdmin()->json('POST', "secure/groups/{$group->id}/add-users", ['emails' => [$users[0]->email, $users[1]->email]]);
        $response->assertStatus(200);

        //check if users were attached to group
        $this->assertCount(3, $group->users);
        $this->assertEquals($users->pluck('id'), $group->users->pluck('id'));
    }

    public function test_it_shows_errors_when_users_with_given_emails_dont_exist()
    {
        $group = factory(App\Group::class)->create();

        $response = $this->asAdmin()->call('POST', "secure/groups/{$group->id}/add-users", ['emails' => ['random@random.com', 'xxx@xxx.com']]);
        $response->assertStatus(422);
    }

    public function test_it_validates_user_input()
    {
        $group = factory(App\Group::class)->create();

        $response = $this->asAdmin()->json('POST', "secure/groups/{$group->id}/add-users", ['emails' => ['not-email']]);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('emails.0', $response['messages']);
    }

    public function test_guests_cant_add_users_to_groups()
    {
        $group = factory(App\Group::class)->create();

        $response = $this->call('POST', "secure/groups/{$group->id}/add-users");
        $response->assertStatus(403);
    }

    public function test_regular_users_cant_add_users_to_groups()
    {
        $group = factory(App\Group::class)->create();

        $response = $this->asRegularUser()->call('POST', "secure/groups/{$group->id}/add-users", []);
        $response->assertStatus(403);
    }

    public function test_user_with_permissions_can_add_users_to_groups()
    {
        $group = factory(App\Group::class)->create();
        $users = factory(App\User::class, 2)->create();
        $user = $this->getRegularUser();
        $user->permissions = '{"groups.update":1}';

        $response = $this->asAdmin()->call('POST', "secure/groups/{$group->id}/add-users", ['emails' => $users->pluck('email')->toArray()]);
        $response->assertStatus(200);
    }
}
