<?php

use App\Ticket;
use Carbon\Carbon;
use App\Services\Settings;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RepliesStoreTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_new_reply()
    {
        $this->app->make(Settings::class)->set('replies.send_email', 1);

        $user = $this->getAdminUser();
        $ticket = factory(Ticket::class)->create(['updated_at' => Carbon::now()->addDays(-2), 'closed_at' => Carbon::now(), 'closed_by' => 1]);
        $tag = App\Tag::firstOrCreate(['name' => 'closed', 'type' => 'status']);
        App\Tag::firstOrCreate(['name' => 'open', 'type' => 'status']);
        $uploads = factory(\App\Upload::class, 2)->create();

        $ticket->tags()->attach($tag->id);
        $this->assertCount(1, $ticket->tags);
        $this->assertEquals('closed',$ticket->tags[0]['name']);

        //sends reply via email
        Mail::shouldReceive('send')->times(1);

        $response  = $this->actingAs($user)->call(
            'POST',
            "secure/tickets/{$ticket->id}/replies",
            ['body' => 'foo bar', 'uploads' => $uploads->pluck('file_name')->toArray()]
        );
        $response->assertStatus(201);
        $data = $response->json()['data'];
        $freshTicket = $ticket->fresh();

        //returns new reply and loads relationships
        $this->assertEquals('foo bar', $data['body']);
        $this->assertArrayHasKey('uploads', $data);
        $this->assertArrayHasKey('user', $data);

        //attaches reply to current user
        $this->assertEquals($user->id, $data['user_id']);

        //touches ticket (updates 'updated_at' property)
        $this->assertTrue($ticket->updated_at < $freshTicket->updated_at);

        //sets ticket status to open
        $this->assertCount(1, $freshTicket->tags);
        $this->assertEquals('open', $freshTicket->tags[0]['name']);

        //clears closed_at and closed_by properties
        $this->assertNull($freshTicket->closed_at);
        $this->assertNull($freshTicket->closed_by);

        //attaches uploads
        $this->assertCount(2, $data['uploads']);
        $this->assertTrue(collect($data['uploads'])->contains('id', $uploads[0]->id));
        $this->assertTrue(collect($data['uploads'])->contains('id', $uploads[1]->id));

        //creates UUID field
        $this->assertTrue(strlen(App\Reply::find($data['id'])->uuid) === 30);

        //hides UUID field from frontend
        $this->assertArrayNotHasKey('uuid', $data);
    }

    public function test_it_sets_closed_at_and_closed_by_ticket_properties_when_ticket_is_closed()
    {
        $user = $this->getAdminUser();
        $ticket = factory(Ticket::class)->create(['closed_at' => null, 'closed_by' => null]);
        $tag = App\Tag::firstOrCreate(['name' => 'closed', 'type' => 'status']);

        $response  = $this->actingAs($user)->call('POST', "secure/tickets/{$ticket->id}/replies", ['body' => 'foo bar', 'status' => $tag]);
        $response->assertStatus(201);
        $freshTicket = $ticket->fresh();

        $this->assertEquals($freshTicket->closed_at, Carbon::now());
        $this->assertEquals($freshTicket->closed_by, $user->id);
    }

    public function test_it_does_not_send_emails_when_current_user_is_not_agent()
    {
        $user = $this->getRegularUser();
        $ticket = factory(App\Ticket::class)->create(['user_id' => $user->id]);

        Mail::shouldReceive('send')->times(0);

        $response = $this->actingAs($user)->json('POST', "secure/tickets/$ticket->id/replies", ['body' => 'foo']);
        $response->assertStatus(201);
        $response->assertJsonFragment(['status' => 'success']);
    }

    public function test_it_does_not_require_body_when_draft_uploads_field_is_present()
    {
        $ticket = factory(App\Ticket::class)->create();

        $response = $this->asAdmin()->json('POST', "secure/tickets/$ticket->id/drafts", ['uploads' => [str_random(10)]]);
        $response->assertStatus(201);
        $response->assertJsonFragment(['status' => 'success']);
    }

    public function test_it_validates_user_input()
    {
        $ticket = factory(App\Ticket::class)->create();

        $response = $this->asAdmin()->json('POST', "secure/tickets/$ticket->id/replies");
        $response->assertStatus(422);
        $response->assertJsonFragment(['status' => 'error']);

        $this->assertArrayHasKey('body', $response->json()['messages']);
        $this->assertArrayNotHasKey('uploads', $response->json()['messages']);
    }

    public function test_it_checks_permissions()
    {
        Mail::shouldReceive('send');

        $customer = factory(App\User::class)->create();
        $user = $this->getRegularUser();
        $ticket = factory(App\Ticket::class)->create(['user_id' => $customer->id]);

        //guests can't reply to tickets
        $response = $this->call('POST', "secure/tickets/{$ticket->id}/replies", ['body' => 'foo']);
        $response->assertStatus(403);

        //customers can't reply to tickets that they did not create
        $user->permissions = null;
        $response = $this->actingAs($user)->call('POST', "secure/tickets/$ticket->id/replies", ['body' => 'foo']);
        $response->assertStatus(403);

        //customers can reply to tickets they created
        $response = $this->actingAs($customer)->call('POST', "secure/tickets/$ticket->id/replies", ['body' => 'foo']);
        $response->assertStatus(201);

        //users with permissions can reply to all tickets
        $user->permissions = '{"replies.create":true}';
        $response = $this->actingAs($user)->call('POST', "secure/tickets/$ticket->id/replies", ['body' => 'foo']);
        $response->assertStatus(201);
    }
}
