<?php

use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketsMergeTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_merges_two_tickets()
    {
        $ticket1  = factory(App\Ticket::class)->create();
        $replies  = factory(App\Reply::class, 2)->create(['ticket_id' => $ticket1->id]);
        $tags1    = $ticket1->tags()->attach(factory(App\Tag::class, 2)->create()->pluck('id'));

        $ticket2  = factory(App\Ticket::class)->create();
        $reply1   = factory(App\Reply::class)->create(['ticket_id' => $ticket2->id, 'created_at' => Carbon::now()->addDays(-1)]);
        $reply2   = factory(App\Reply::class)->create(['ticket_id' => $ticket2->id, 'created_at' => Carbon::now()->addDays(1)]);
        $tags2    = $ticket2->tags()->attach(factory(App\Tag::class, 2)->create()->pluck('id'));

        $response = $this->asAdmin()->call('POST', "secure/tickets/merge/$ticket1->id/$ticket2->id");
        $response->assertStatus(200);

        $merged = App\Ticket::with('replies', 'tags')->find($response->json()['id']);

        //deletes merged ticket
        $this->assertDatabaseMissing('tickets', ['id' => $ticket2->id]);
        $this->assertDatabaseMissing('replies', ['ticket_id' => $ticket2->id]);

        //merges replies in correct order (based on created_at field)
        $this->assertCount(4, $merged->replies);
        $this->assertEquals($reply2->id, $merged->replies[0]->id);
        $this->assertEquals($replies[0]->id, $merged->replies[1]->id);
        $this->assertEquals($replies[1]->id, $merged->replies[2]->id);
        $this->assertEquals($reply1->id, $merged->replies[3]->id);

        //merges tags
        $this->assertCount(4, $merged->tags);

        //deletes old merged ticket rows from taggables table
        $this->assertEquals(4, DB::table('taggables')->where('taggable_id', $ticket1->id)->count());
        $this->assertDatabaseMissing('taggables', ['taggable_id' => $ticket2->id]);
    }

    public function test_it_checks_permissions()
    {
        $ticket1 = factory(App\Ticket::class)->create();
        $ticket2 = factory(App\Ticket::class)->create();
        $user    = $this->getRegularUser();

        //guests can't merge tickets
        $response = $this->actingAs($user)->call('POST', "secure/tickets/merge/$ticket1->id/$ticket2->id");
        $response->assertStatus(403);

        //regular users can't merge tickets
        $user->permissions = null;
        $response = $this->actingAs($user)->call('POST', "secure/tickets/merge/$ticket1->id/$ticket2->id");
        $response->assertStatus(403);

        //user with permissions can merge tickets
        $user->permissions = '{"tickets.update":1}';
        $response = $this->actingAs($user)->call('POST', "secure/tickets/merge/$ticket1->id/$ticket2->id");
        $response->assertStatus(200);
    }
}
