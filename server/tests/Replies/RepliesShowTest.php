<?php

use App\Reply;
use App\Upload;
use App\Ticket;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RepliesShowTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_shows_specified_reply()
    {
        $user = $this->getRegularUser();
        $upload = factory(Upload::class)->create();
        $reply  = factory(Reply::class)->create(['user_id' => $user->id]);
        $reply->uploads()->attach($upload->id);

        $response  = $this->asAdmin()->call('GET', "secure/replies/$reply->id");
        $response->assertStatus(200);
        $data = $response->json();

        $this->assertEquals($reply->id, $data['id']);
        $this->assertEquals($upload->id, $data['uploads'][0]['id']);
        $this->assertEquals($user->id, $data['user']['id']);
    }

    public function test_it_checks_permissions()
    {
        $user1 = $this->getRegularUser();
        $user2 = $this->getRegularUser();
        $reply1  = factory(Reply::class)->create(['user_id' => $user2->id]);
        $ticket  = factory(Ticket::class)->create(['user_id' => $user2->id]);
        $reply2  = factory(Reply::class)->create(['ticket_id' => $ticket->id, 'user_id' => $user1->id]);
        $reply3  = factory(Reply::class)->create(['ticket_id' => $ticket->id, 'user_id' => $user1->id, 'type' => 'drafts']);

        //regular users can't view other user replies
        $response = $this->actingAs($user1)->call('GET', "secure/replies/$reply1->id");
        $response->assertStatus(403);

        //regular users can view their own replies
        $response = $this->actingAs($user2)->call('GET', "secure/replies/$reply1->id");
        $response->assertStatus(200);

        //regular users can view reply if it belongs to their ticket and it is of type "replies"
        $response = $this->actingAs($user2)->call('GET', "secure/replies/$reply2->id");
        $response->assertStatus(200);

        //regular users can't view reply if it belongs to their ticket and it is not of type "replies"
        $response = $this->actingAs($user2)->call('GET', "secure/replies/$reply3->id");
        $response->assertStatus(403);

        //users with permissions can view all replies
        $user1->permissions = '{"replies.view":1}';
        $response = $this->actingAs($user1)->call('GET', "secure/replies/$reply1->id");
        $response->assertStatus(200);
    }
}
