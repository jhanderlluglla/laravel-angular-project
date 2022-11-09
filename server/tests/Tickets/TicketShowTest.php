<?php

use App\Reply;
use App\Ticket;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketShowTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_loads_conversation_for_agent()
    {
        $user = $this->getAdminUser();
        $ticket = factory(App\Ticket::class)->create();
        $userDraft  = factory(App\Reply::class)->create(['type' => 'drafts', 'ticket_id' => $ticket->id, 'user_id' => $user->id]);
        $otherDraft = factory(App\Reply::class)->create(['type' => 'drafts', 'ticket_id' => $ticket->id]);
        $note       = factory(App\Reply::class)->create(['type' => 'notes', 'ticket_id' => $ticket->id]);
        $reply1     = factory(App\Reply::class)->create(['type' => 'replies', 'ticket_id' => $ticket->id, 'created_at' => Carbon::now()->addDays(-10)]);
        $reply2     = factory(App\Reply::class)->create(['type' => 'replies', 'ticket_id' => $ticket->id, 'created_at' => Carbon::now()->addDays(10)]);
        $otherReply = factory(App\Reply::class)->create(['type' => 'replies']);

        $response = $this->actingAs($user)->call('GET', "secure/tickets/$ticket->id");
        $response->assertStatus(200);
        $data = $response->json();
        $replyIds = array_map(function($r) { return $r['id']; }, $data['replies']);

        //loads "tags" and "user"
        $this->assertArrayHasKey('user', $data);
        $this->assertArrayHasKey('tags', $data);

        //loads "user" and "uploads" for replies
        $this->assertArrayHasKey('user', $data['replies'][0]);
        $this->assertArrayHasKey('uploads', $data['replies'][0]);

        //sets "created_at_formatted" and "created_at_month" on ticket
        $this->assertArrayHasKey('created_at_formatted', $data);
        $this->assertArrayHasKey('created_at_month', $data);

        //loads correct number of replies
        $this->assertCount(4, $replyIds);

        //does not load reply from another ticket
        $this->assertFalse(in_array($otherReply->id, $replyIds));

        //loads only current user drafts
        $this->assertTrue(in_array($userDraft->id, $replyIds));
        $this->assertFalse(in_array($otherDraft->id, $replyIds));

        //loads note
        $this->assertTrue(in_array($note->id, $replyIds));

        //loads both replies
        $this->assertTrue(in_array($reply1->id, $replyIds));
        $this->assertTrue(in_array($reply2->id, $replyIds));

        //orders replies by "created_at" date
        $this->assertEquals(head($replyIds), $reply2->id);
        $this->assertEquals(last($replyIds), $reply1->id);
    }

    public function test_it_loads_conversation_for_customer()
    {
        $user   = $this->getRegularUser();
        $ticket = factory(App\Ticket::class)->create(['user_id' => $user->id]);
        $userDraft  = factory(App\Reply::class)->create(['type' => 'drafts', 'user_id' => $user->id, 'ticket_id' => $ticket->id]);
        $otherDraft = factory(App\Reply::class)->create(['type' => 'drafts', 'ticket_id' => $ticket->id]);
        $note       = factory(App\Reply::class)->create(['type' => 'notes', 'user_id' => $user->id, 'ticket_id' => $ticket->id]);
        $replies    = factory(App\Reply::class, 2)->create(['type' => 'replies', 'user_id' => $user->id, 'ticket_id' => $ticket->id]);

        $response = $this->actingAs($user)->call('GET', "secure/tickets/$ticket->id");
        $response->assertStatus(200);
        $replies = $response->json()['replies'];

        $ids = array_map(function($r) { return $r['id']; }, $replies);

        //loads correct amount of replies
        $this->assertCount(3, $ids);

        //does not load notes
        $this->assertFalse(in_array($note->id, $ids));

        //loads only current users drafts
        $this->assertTrue(in_array($userDraft->id, $ids));
        $this->assertFalse(in_array($otherDraft->id, $ids));
    }

    public function test_it_checks_permissions()
    {
        $user   = $this->getRegularUser();
        $ticket = factory(App\Ticket::class)->create();
        $customerTicket = factory(App\Ticket::class)->create(['user_id' => $user->id]);

        //guests can't view tickets
        $response = $this->call('GET', "secure/tickets/{$ticket->id}");
        $response->assertStatus(403);

        //users can't view tickets other users created
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', "secure/tickets/{$ticket->id}");
        $response->assertStatus(403);

        //users can view tickets they created
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', "secure/tickets/{$customerTicket->id}");
        $response->assertStatus(200);

        //users with permissions can view tickets
        $user->permissions = '{"tickets.view":1}';
        $response = $this->actingAs($user)->call('GET', "secure/tickets/{$ticket->id}");
        $response->assertStatus(200);
    }
}
