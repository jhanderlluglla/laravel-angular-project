<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;

class RepliesDestroyTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_reply_with_any_type()
    {
        $ticket  = factory(App\Ticket::class)->create();
        $replies = factory(App\Reply::class, 2)->create(['ticket_id' => $ticket->id]);


        $uploads = factory(App\Upload::class, 2)->create();
        $replies[0]->uploads()->attach([$uploads[0]->id, $uploads[1]->id]);
        $replies[1]->uploads()->attach([$uploads[1]->id]);

        $response = $this->asAdmin()->call('DELETE', "secure/replies/{$replies[0]->id}");
        $response->assertStatus(204);

        //detaches attachment from reply
        $this->assertDatabaseMissing('uploadables', ['upload_id' => $uploads[0]->id]);

        //does not detach upload from other reply
        $this->assertDatabaseHas('uploadables', ['upload_id' => $uploads[1]->id]);

        //deletes reply
        $this->assertDatabaseMissing('replies', ['id' => $replies[0]->id]);
    }

    public function test_it_throws_404_if_reply_not_found()
    {
        $response = $this->asAdmin()->call('DELETE', "secure/replies/5555");
        $response->assertStatus(404);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $ticket = factory(App\Ticket::class)->create();
        $reply = factory(App\Reply::class)->create(['ticket_id' => $ticket->id]);

        //regular users can't delete replies
        $response = $this->actingAs($user)->call('DELETE', "secure/replies/$reply->id");
        $response->assertStatus(403);

        //user with permissions can delete replies
        $user->permissions = '{"replies.delete":1}';
        $response = $this->actingAs($user)->call('DELETE', "secure/replies/$reply->id");
        $response->assertStatus(204);
    }
}
