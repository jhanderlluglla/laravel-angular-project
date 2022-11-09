<?php

use App\Reply;
use App\Ticket;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketsDestroyTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_tickets_with_specified_ids()
    {
        $tickets = factory(App\Ticket::class, 2)->create();
        $replies = factory(App\Reply::class, 2)->create(['ticket_id' => $tickets[0]->id]);
        $tags    = factory(App\Tag::class, 2)->create();
        $uploads = factory(App\Upload::class, 2)->create();

        $tickets[0]->tags()->attach($tags->pluck('id'));
        $replies[0]->uploads()->attach($uploads->pluck('id'));
        $this->assertCount(2, $replies[0]->uploads);
        $this->assertCount(2, $tickets[0]->tags);

        $response = $this->asAdmin()->call('DELETE', 'secure/tickets', ['ids' => $tickets->pluck('id')->toArray()]);
        $response->assertStatus(204);

        //detaches uploads from ticket
        $this->assertDatabaseMissing('uploadables', ['uploadable_id' => $replies[0]->id, 'uploadable_type' => Reply::class]);

        //detaches tags from ticket
        $this->assertDatabaseMissing('taggables', ['taggable_id' => $tickets[0]->id, 'taggable_type' => Ticket::class]);
        $this->assertDatabaseMissing('taggables', ['taggable_id' => $tickets[1]->id, 'taggable_type' => Ticket::class]);

        //deletes ticket replies
        $this->assertDatabaseMissing('replies', ['id' => $replies[0]->id]);
        $this->assertDatabaseMissing('replies', ['id' => $replies[1]->id]);

        //deletes tickets
        $this->assertDatabaseMissing('tickets', ['id' => $tickets[0]->id]);
        $this->assertDatabaseMissing('tickets', ['id' => $tickets[1]->id]);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('DELETE', 'secure/tickets', ['ids' => null]);
        $response->assertStatus(422);
        $response->assertJsonFragment(['status' => 'error']);

        $this->assertArrayHasKey('ids', $response->json()['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $ticket = factory(App\Ticket::class)->create();

        //guests can't delete tickets
        $response = $this->call('DELETE', "secure/tickets", ['ids' => [$ticket->id]]);
        $response->assertStatus(403);

        //regular users can't delete tickets
        $user->permissions = null;
        $response = $this->actingAs($user)->call('DELETE', "secure/tickets", ['ids' => [$ticket->id]]);
        $response->assertStatus(403);

        //user with  permissions can delete tickets
        $ticket = factory(App\Ticket::class)->create();
        $user->permissions = '{"tickets.delete":true}';
        $response = $this->actingAs($user)->call('DELETE', "secure/tickets", ['ids' => [$ticket->id]]);
        $response->assertStatus(204);
    }
}
