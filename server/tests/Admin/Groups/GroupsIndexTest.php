<?php

use App\Group;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class GroupsIndexTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_returns_a_list_of_groups()
    {
        factory(App\Group::class, 2)->create();

        $response = $this->asAdmin()->call('GET', "secure/groups");
        $response->assertStatus(200);
        $this->assertTrue(count($response->json()['data']) >= 2);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't view groups list
        $response = $this->call('GET', "secure/groups");
        $response->assertStatus(403);

        //regular users can't view groups list
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', "secure/groups");
        $response->assertStatus(403);

        //user with permissions can view groups list
        $user->permissions = '{"groups.view":true}';
        $response = $this->actingAs($user)->call('GET', "secure/groups");
        $response->assertStatus(200);
    }
}
