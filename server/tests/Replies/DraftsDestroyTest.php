<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class DraftsDestroyTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_draft()
    {
        $ticket = factory(App\Ticket::class)->create();
        $draft  = factory(App\Reply::class)->create(['type' => 'drafts', 'ticket_id' => $ticket->id]);

        $response = $this->asAdmin()->call('DELETE', "secure/drafts/$draft->id");
        $response->assertStatus(204);

        $this->assertDatabaseMissing('replies', ['id' => $draft->id]);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $ticket = factory(App\Ticket::class)->create();
        $draft1 = factory(App\Reply::class)->create(['type' => 'drafts', 'ticket_id' => $ticket->id]);
        $draft2 = factory(App\Reply::class)->create(['type' => 'drafts', 'ticket_id' => $ticket->id, 'user_id' => $user->id]);
        $reply  = factory(App\Reply::class)->create(['type' => 'replies','ticket_id' => $ticket->id, 'user_id' => $user->id]);

        //guests can't delete drafts
        $response = $this->call('DELETE', "secure/drafts/$draft1->id");
        $response->assertStatus(403);

        //regular users can't delete other users drafts
        $response = $this->actingAs($user)->call('DELETE', "secure/drafts/$draft1->id");
        $response->assertStatus(403);

        //regular users can delete their own drafts
        $response = $this->actingAs($user)->call('DELETE', "secure/drafts/$draft2->id");
        $response->assertStatus(204);

        //replies that are not of type "drafts" can't be deleted
        $response = $this->actingAs($user)->call('DELETE', "secure/drafts/$reply->id");
        $response->assertStatus(403);

        //user with permissions can delete drafts
        $user->permissions = '{"replies.delete":1}';
        $response = $this->actingAs($user)->call('DELETE', "secure/drafts/$draft1->id");
        $response->assertStatus(204);
    }
}
