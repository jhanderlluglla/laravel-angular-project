<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CannedRepliesIndexTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_returns_all_canned_replies()
    {
        factory(App\CannedReply::class, 3)->create();

        $response = $this->asAdmin()->call('GET', "secure/canned-replies");
        $response->assertStatus(200);
        $data = $response->json()['data'];

        $this->assertCount(3, $data);
    }

    public function test_it_returns_specified_user_canned_replies()
    {
        $user = $this->getAdminUser();
        $cannedReplies = factory(App\CannedReply::class, 2)->create(['user_id' => $user->id]);
        factory(App\CannedReply::class)->create();

        $response = $this->actingAs($user)->call('GET', "secure/canned-replies?user_id=$user->id");
        $response->assertStatus(200);
        $data = $response->json()['data'];

        //does not return other users canned replies
        $this->assertCount(2, $data);

        //returns correct canned replies
        $this->assertEquals($cannedReplies[0]->id, $data[0]['id']);
        $this->assertEquals($cannedReplies[1]->id, $data[1]['id']);
    }

    public function test_it_filters_canned_replies_by_search_query()
    {
        $user = $this->getAdminUser();
        $reply1 = factory(App\CannedReply::class)->create(['user_id' => $user->id, 'name' => 'foo bar']);
        $reply2 = factory(App\CannedReply::class)->create(['user_id' => $user->id, 'name' => 'baz qux']);

        $response = $this->actingAs($user)->call('GET', 'secure/canned-replies?query=foo');
        $response->assertStatus(200);
        $data = $response->json()['data'];

        $this->assertCount(1, $data);
        $this->assertEquals($reply1->id, $data[0]['id']);
    }

    public function test_it_checks_permissions()
    {
        //guests can't view canned replies
        $response = $this->call('GET', 'secure/canned-replies');
        $response->assertStatus(403);
    }
}
