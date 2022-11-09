<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class UserSearchTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp()
    {
        parent::setUp();
        Config::set('scout.driver', 'mysql');
    }

    public function test_it_searches_for_users()
    {
        $user1 = factory(\App\User::class)->create(['email' => 'foo_'.$this->faker()->email]);
        $user2 = factory(\App\User::class)->create(['email' => 'foo_'.$this->faker()->email]);
        $user3 = factory(\App\User::class)->create();

        $response = $this->asAdmin()->call('GET', 'secure/search/users/foo');
        $response->assertStatus(200);
        $data = $response->json()['data'];

        //returns paginator
        $this->assertArrayHasKey('total', $response->json());
        $this->assertArrayHasKey('current_page', $response->json());

        //only returns users that match search query
        foreach ($data as $user) {
            $this->assertContains('foo', $user['email']);
        }

        //finds correct users
        $this->assertTrue(collect($data)->contains('id', $user1->id));
        $this->assertTrue(collect($data)->contains('id', $user2->id));
        $this->assertFalse(collect($data)->contains('id', $user3->id));
    }

    public function test_it_limits_results()
    {
        factory(\App\User::class, 7)->create(['first_name' => 'foo bar']);

        $response = $this->asAdmin()->call('GET', 'secure/search/users/foo', ['per_page' => 6]);
        $this->assertCount(6, $response->json()['data']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't search users
        $response = $this->call('GET', "secure/search/users/foo");
        $response->assertStatus(403);

        //regular user can't search users
        $response = $this->actingAs($user)->call('GET', "secure/search/users/foo");
        $response->assertStatus(403);

        //user with permissions can search users
        $user->permissions = '{"users.view": 1}';
        $response = $this->actingAs($user)->call('GET', "secure/search/users/foo");
        $response->assertStatus(200);
    }
}
