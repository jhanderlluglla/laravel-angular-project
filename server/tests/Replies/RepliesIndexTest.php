<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RepliesIndexTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_returns_all_replies()
    {
        $user = $this->getAdminUser();
        $ticket  = factory(App\Ticket::class)->create();
        factory(App\Reply::class)->create(['ticket_id' => $ticket->id]);
        factory(App\Reply::class)->create(['type' => 'drafts', 'ticket_id' => $ticket->id, 'user_id' => $user->id]);
        factory(App\Reply::class)->create(['type' => 'drafts', 'ticket_id' => $ticket->id, 'user_id' => 999]);
        factory(App\Reply::class)->create(['type' => 'notes',  'ticket_id' => $ticket->id]);
        factory(App\Reply::class)->create(['ticket_id' => 999]);

        $response = $this->actingAs($user)->call('GET', "secure/tickets/{$ticket->id}/replies", ['per_page' => 1]);
        $response->assertStatus(200);
        $json = $response->json();

        //only loads specified ticket reply, current user draft and note
        $this->assertEquals(3, $json['total']);

        //limits replies to specified per_page value
        $this->assertCount(1, $json['data']);

        //loads user that created reply
        $this->assertArrayHasKey('user', $json['data'][0]);

        //loads reply uploads
        $this->assertArrayHasKey('uploads', $json['data'][0]);
    }

    public function test_it_does_not_return_notes_for_regular_users()
    {
        $user = $this->getAdminUser();
        $ticket  = factory(App\Ticket::class)->create();
        $userDraft = factory(App\Reply::class)->create(['type' => 'drafts', 'ticket_id' => $ticket->id, 'user_id' => $user->id]);
        factory(App\Reply::class)->create(['type' => 'drafts', 'ticket_id' => $ticket->id, 'user_id' => 999]);

        $response = $this->actingAs($user)->call('GET', "secure/tickets/{$ticket->id}/replies", ['per_page' => 1]);
        $response->assertStatus(200);

        $this->assertEquals(1, $response->json()['total']);
        $this->assertEquals($userDraft->id, $response->json()['data'][0]['id']);
    }

    public function test_it_checks_user_permissions()
    {
        $user  = $this->getRegularUser();
        $user2 = $this->getRegularUser();
        $ticket = factory(App\Ticket::class)->create(['user_id' => $user2->id]);

        //guests can't view replies
        $response = $this->call('GET', "secure/tickets/{$ticket->id}/replies");
        $response->assertStatus(403);

        //regular users can't view other user replies
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', "secure/tickets/{$ticket->id}/replies");
        $response->assertStatus(403);

        //regular users can view their own ticket replies
        $response = $this->actingAs($user2)->call('GET', "secure/tickets/{$ticket->id}/replies");
        $response->assertStatus(200);

        //user with permissions can view ticket replies
        $user->permissions = '{"replies.view":true}';
        $response = $this->actingAs($user)->call('GET', "secure/tickets/{$ticket->id}/replies");
        $response->assertStatus(200);
    }
}
