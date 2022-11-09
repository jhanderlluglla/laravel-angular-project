<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class AllSearchTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp()
    {
        parent::setUp();
        Config::set('scout.driver', 'mysql');
    }

    public function test_it_searches_for_everything()
    {
        $user1    = factory(\App\User::class)->create(['email' => 'foo_'.$this->faker()->email]);
        $user2    = factory(\App\User::class)->create();
        $ticket1  = factory(\App\Ticket::class)->create(['subject' => 'foo bar']);
        $ticket2  = factory(\App\Ticket::class)->create();
        $article1 = factory(\App\Article::class)->create(['title' => 'foo bar']);
        $article2 = factory(\App\Article::class)->create();

        $response = $this->asAdmin()->call('GET', 'secure/search/all/foo');
        $response->assertStatus(200);
        $data = $response->json()['data'];

        //returns paginator
        $this->assertArrayHasKey('total', $data['users']);
        $this->assertArrayHasKey('total', $data['tickets']);
        $this->assertArrayHasKey('total', $data['articles']);

        //finds correct items
        foreach ($data['users']['data'] as $user) {
            $this->assertContains('foo', $user['email']);
        }

        $this->assertCount(1, $data['tickets']['data']);
        $this->assertEquals($ticket1->id, $data['tickets']['data'][0]['id']);

        $this->assertCount(1, $data['articles']['data']);
        $this->assertEquals($article1->id, $data['articles']['data'][0]['id']);
    }

    public function test_it_limits_results()
    {
        factory(\App\User::class, 7)->create(['first_name' => 'foo bar']);

        $response = $this->asAdmin()->call('GET', 'secure/search/all/foo', ['per_page' => 6]);
        $this->assertCount(6, $response->json()['data']['users']['data']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't search
        $response = $this->call('GET', "secure/search/all/foo");
        $response->assertStatus(403);

        //regular user can't search
        $response = $this->actingAs($user)->call('GET', "secure/search/all/foo");
        $response->assertStatus(403);

        //user only with some permissions can't search users
        $user->permissions = '{"users.view": 1}';
        $response = $this->actingAs($user)->call('GET', "secure/search/all/foo");
        $response->assertStatus(403);

        //user with all permissions can search
        $user->permissions = '{"users.view": 1, "tickets.view": 1, "articles.view": 1}';
        $response = $this->actingAs($user)->json('GET', "secure/search/all/bar");
        $response->assertStatus(200);
    }
}
