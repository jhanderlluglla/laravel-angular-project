<?php

use App\Reply;
use App\Upload;
use App\Ticket;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RepliesUpdateTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_updates_existing_reply()
    {
        $user    = $this->getAdminUser();
        $ticket  = factory(Ticket::class)->create(['updated_at' => Carbon::now()->addDays(-2)]);
        $reply   = factory(Reply::class)->create(['ticket_id' => $ticket->id]);
        $upload1 = factory(Upload::class)->create();
        $upload2 = factory(Upload::class)->create(['user_id' => $user->id]);
        $upload3 = factory(Upload::class)->create();

        $reply->uploads()->attach($upload1->id);
        $this->assertCount(1, $reply->uploads);
        $this->assertEquals($upload1->id, $reply->uploads[0]['id']);

        $response  = $this->actingAs($user)->call(
            'PUT',
            "secure/replies/$reply->id",
            ['body' => 'foo bar', 'uploads' => [$upload2->file_name, $upload3->file_name]]
        );
        $response->assertStatus(200);
        $data = $response->json()['data'];

        //returns new reply and loads relationships
        $this->assertEquals($reply->id, $data['id']);
        $this->assertArrayHasKey('uploads', $data);
        $this->assertArrayHasKey('user', $data);

        //updates body
        $this->assertEquals('foo bar', $data['body']);

        //syncs uploads
        $this->assertCount(2, $data['uploads']);
        $this->assertContains($upload2->id, [$data['uploads'][0]['id'], $data['uploads'][1]['id']]);
    }

    public function test_it_validates_user_input()
    {
        $reply  = factory(Reply::class)->create();

        $response = $this->asAdmin()->json('PUT', "secure/replies/$reply->id", ['uploads' => ['abc']]);
        $response->assertStatus(422);
        $data = $response->json();

        $this->assertEquals('error', $data['status']);
        $this->assertArrayHasKey('body', $data['messages']);
        $this->assertArrayHasKey('uploads.0', $data['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $ticket = factory(App\Ticket::class)->create();
        $reply1  = factory(Reply::class)->create(['ticket_id' => $ticket->id]);
        $reply2  = factory(Reply::class)->create(['ticket_id' => $ticket->id, 'user_id' => $user->id, 'type' => 'drafts']);
        $reply3  = factory(Reply::class)->create(['ticket_id' => $ticket->id, 'user_id' => $user->id, 'type' => 'replies']);

        //regular users can't update replies
        $user->permissions = null;
        $response = $this->actingAs($user)->call('PUT', "secure/replies/$reply1->id", ['body' => 'foo bar']);
        $response->assertStatus(403);

        //user can update reply if it belongs to him and it is of type "drafts"
        $response = $this->actingAs($user)->call('PUT', "secure/replies/$reply2->id", ['body' => 'foo bar']);
        $response->assertStatus(200);

        //user can't update reply if it belongs to him and it is not of type "drafts"
        $response = $this->actingAs($user)->call('PUT', "secure/replies/$reply3->id", ['body' => 'foo bar']);
        $response->assertStatus(403);

        //users with permissions can update replies
        $user->permissions = '{"replies.update":true}';
        $response = $this->actingAs($user)->call('PUT', "secure/replies/$reply1->id", ['body' => 'foo bar']);
        $response->assertStatus(200);
    }
}
