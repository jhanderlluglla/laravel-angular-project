<?php

use App\User;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ViewUsersTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_orders_results_in_asc_order()
    {
        $user1 = factory(User::class)->create(['email' => '2@2.com']);
        $user2 = factory(User::class)->create(['email' => '1@1.com']);

        $response = $this->asAdmin()->call('GET', "secure/users", ['per_page' => 4, 'order_by' => 'email', 'order_dir' => 'asc']);
        $response->assertStatus(200);
        $response = $response->json();

        //loads groups
        $this->assertArrayHasKey('groups', $response['data'][0]);

        //sets per page properly
        $this->assertEquals(4, $response['per_page']);

        //orders users ascending
        $this->assertEquals($user2->email, $response['data'][0]['email']);
    }

    public function test_it_orders_results_in_desc_order()
    {
        $user1 = factory(User::class)->create(['email' => '2@2.com']);
        $user2 = factory(User::class)->create(['email' => '1@1.com']);

        $response = $this->asAdmin()->call('GET', "secure/users", ['per_page' => 25, 'order_by' => 'email', 'order_dir' => 'desc']);
        $this->assertEquals($user2->email, last($response->json()['data'])['email']);
    }

    public function test_it_filters_results_by_query()
    {
        $user1 = factory(User::class)->create(['email' => '2@2.com']);
        $user2 = factory(User::class)->create(['email' => '1@1.com']);

        $response = $this->asAdmin()->call('GET', "secure/users", ['query' => $user1->email]);
        $response = $response->json();

        $this->assertCount(1, $response['data']);
        $this->assertEquals($user1->email, $response['data'][0]['email']);
    }

    public function test_it_filters_results_by_group_id()
    {
        $user1 = factory(User::class)->create(['email' => '2@2.com']);
        $user2 = factory(User::class)->create(['email' => '1@1.com']);
        $group = factory(App\Group::class)->create();
        $user1->groups()->attach([$group->id]);

        $response = $this->asAdmin()->call('GET', "secure/users", ['group_id' => $group->id]);
        $response = $response->json();

        $this->assertCount(1, $response['data']);
        $this->assertEquals($user1->email, $response['data'][0]['email']);
    }

    public function test_it_filters_results_by_group_name()
    {
        $user1 = factory(User::class)->create(['email' => '2@2.com']);
        $user2 = factory(User::class)->create(['email' => '1@1.com']);
        $group = factory(App\Group::class)->create();
        $user1->groups()->attach([$group->id]);

        $response = $this->asAdmin()->call('GET', "secure/users", ['group_name' => $group->name]);
        $response = $response->json();

        $this->assertCount(1, $response['data']);
        $this->assertEquals($user1->email, $response['data'][0]['email']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't view users list
        $response = $this->call('GET', "secure/users");
        $response->assertStatus(403);

        //regular users can't view users list
        $response = $this->actingAs($user)->call('GET', "secure/users");
        $response->assertStatus(403);

        //user with permissions can view users list
        $user->permissions = '{"users.view":true}';
        $response = $this->actingAs($user)->call('GET', "secure/users");
        $response->assertStatus(200);
    }
}
