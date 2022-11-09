<?php

use App\Reply;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketsIndexTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_paginates_tickets()
    {
        $tickets = factory(App\Ticket::class, 3)->create();
        $reply   = factory(App\Reply::class)->create(['ticket_id' => $tickets[0]->id]);
        $tag     = App\Tag::firstOrCreate(['name' => 'open', 'type' => 'status']);
        $tickets[0]->tags()->attach($tag->id);
        $tickets[1]->tags()->attach($tag->id);

        $response = $this->asAdmin()->call('GET', 'secure/tickets', ['tag_id' => $tag->id]);
        $response->assertStatus(200);
        $data = $response->json()['data'];

        //filtered tickets by tag
        $this->assertCount(2, $data);

        //loads tickets latest reply
        $this->assertArrayHasKey('latest_reply', $data[0]);
        $this->assertArrayHasKey('updated_at_formatted', $data[0]);
        $this->assertEquals($reply->id, $data[0]['latest_reply']['id']);

        //loads user
        $this->assertArrayHasKey('user', $data[0]);

        //loads tags
        $this->assertArrayHasKey('tags', $data[0]);

        //loads replies count
        $this->assertArrayHasKey('replies_count', $data[0]);
    }

    public function test_it_filters_tickets_by_asignee()
    {
        $ticket1 = factory(App\Ticket::class)->create(['assigned_to' => 1]);
        $ticket2 = factory(App\Ticket::class)->create();
        $tag     = factory(App\Tag::class)->create();
        $ticket1->tags()->attach($tag->id);

        $response = $this->asAdmin()->call('GET', 'secure/tickets', ['assigned_to' => $ticket1->assigned_to]);
        $response->assertStatus(200);

        $this->assertCount(1, $response->json()['data']);
        $this->assertEquals($ticket1->id, $response->json()['data'][0]['id']);
    }

    public function test_it_filters_tickets_by_requester()
    {
        $ticket1 = factory(App\Ticket::class)->create(['user_id' => 1]);
        $ticket2 = factory(App\Ticket::class)->create();
        $tag     = factory(App\Tag::class)->create();
        $ticket1->tags()->attach($tag->id);

        $response = $this->asAdmin()->call('GET', 'secure/tickets', ['user_id' => $ticket1->user_id]);
        $response->assertStatus(200);

        $this->assertCount(1, $response->json()['data']);
        $this->assertEquals($ticket1->id, $response->json()['data'][0]['id']);
    }

    public function test_it_orders_tickets_by_open_tag_and_then_updated_at_date()
    {
        $open     = App\Tag::firstOrCreate(['name' => 'open', 'type' => 'status']);
        $closed   = App\Tag::firstOrCreate(['name' => 'closed', 'type' => 'status']);
        $tag      = factory(App\Tag::class)->create();
        $ticket1 = factory(App\Ticket::class)->create(['updated_at' => Carbon::now()->addDays(1)]);
        $ticket2 = factory(App\Ticket::class)->create(['updated_at' => Carbon::now()->addDays(2)]);
        $ticket3 = factory(App\Ticket::class)->create(['updated_at' => Carbon::now()->addDays(3)]);
        $ticket4 = factory(App\Ticket::class)->create(['updated_at' => Carbon::now()->addDays(4)]);
        $ticket1->tags()->attach([$tag->id, $closed->id]);
        $ticket2->tags()->attach([$tag->id, $closed->id]);
        $ticket3->tags()->attach([$tag->id, $open->id]);
        $ticket4->tags()->attach([$tag->id, $open->id]);

        $response = $this->asAdmin()->call('GET', 'secure/tickets');
        $response->assertStatus(200);
        $tickets = $response->json()['data'];

        //tickets with 'open' tag should always be first regardless of "updated_at" date
        //afterwards tickets should be ordered by "updated_at" date
        $this->assertEquals($ticket4->id, $tickets[0]['id']);
        $this->assertEquals($ticket3->id, $tickets[1]['id']);
        $this->assertEquals($ticket2->id, $tickets[2]['id']);
        $this->assertEquals($ticket1->id, $tickets[3]['id']);
    }

    public function it_limits_tickets()
    {
        $open     = App\Tag::firstOrCreate(['name' => 'open', 'type' => 'status']);
        $ticket1 = factory(App\Ticket::class)->create();
        $ticket2 = factory(App\Ticket::class)->create();
        $ticket1->tags()->attach($open->id);
        $ticket2->tags()->attach($open->id);

        $response = $this->asAdmin()->call('GET', 'secure/tickets', ['limit' => 1]);
        $response->assertStatus(200);

        $this->assertCount(1, $response->json()['data']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't view tickets
        $response = $this->call('GET', 'secure/tickets');
        $response->assertStatus(403);

        //regular users can't view tickets
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', 'secure/tickets');
        $response->assertStatus(403);

        //users with permissions can view all tickets
        $user->permissions = '{"tickets.view":true}';
        $response = $this->actingAs($user)->call('GET', 'secure/tickets');
        $response->assertStatus(200);
    }
}
