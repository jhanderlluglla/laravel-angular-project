<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketSearchTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp()
    {
        parent::setUp();
        Config::set('scout.driver', 'mysql');
    }

    public function test_it_searches_for_tickets()
    {
        $user = $this->getRegularUser();
        $tag  = factory(\App\Tag::class)->create();
        $ticket1 = factory(\App\Ticket::class)->create(['subject' => 'foo bar']);
        $ticket2 = factory(\App\Ticket::class)->create(['user_id' => $user->id]);
        $ticket3 = factory(\App\Ticket::class)->create();
        $reply   = factory(\App\Reply::class)->create(['ticket_id' => $ticket2->id, 'body' => str_repeat('foo', 300)]);
        $ticket2->tags()->attach($tag->id);

        $response = $this->asAdmin()->call('GET', 'secure/search/tickets/foo', ['detailed' => true]);
        $response->assertStatus(200);
        $data = $response->json()['data'];

        //returns paginator
        $response->assertJson(['total' => 2]);
        $response->assertJson(['current_page' => 1]);

        //finds correct tickets
        $this->assertTrue(collect($data)->contains('id', $ticket1->id));
        $this->assertTrue(collect($data)->contains('id', $ticket2->id));
        $this->assertFalse(collect($data)->contains('id', $ticket3->id));

        //loads latest_reply, user and tags, replies_count
        $this->assertEquals($reply->id, $data[1]['latest_reply']['id']);
        $this->assertEquals($user->id, $data[1]['user']['id']);
        $this->assertEquals($tag->id, $data[1]['tags'][0]['id']);
        $this->assertEquals(1, $data[1]['replies_count']);

        //limits replies body length
        $this->assertEquals(200, strlen($data[1]['latest_reply']['body']));
    }

    public function test_it_limits_results_and_does_not_return_detailed_data()
    {
        factory(\App\Ticket::class, 7)->create(['subject' => 'foo bar']);

        $response = $this->asAdmin()->call('GET', 'secure/search/tickets/foo', ['per_page' => 6]);
        $data = $response->json()['data'];

        //limits results
        $this->assertCount(6, $data);

        //does not return user or tags
        $this->assertArrayNotHasKey('user', $data[0]);
        $this->assertArrayNotHasKey('tags', $data[0]);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't search tickets
        $response = $this->call('GET', "secure/search/tickets/foo");
        $response->assertStatus(403);

        //regular user can't search tickets
        $response = $this->actingAs($user)->call('GET', "secure/search/tickets/foo");
        $response->assertStatus(403);

        //user with permissions can search tickets
        $user->permissions = '{"tickets.view": 1}';
        $response = $this->actingAs($user)->call('GET', "secure/search/tickets/foo");
        $response->assertStatus(200);
    }
}
