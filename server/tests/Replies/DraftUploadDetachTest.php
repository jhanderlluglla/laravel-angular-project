<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class DraftUploadDetachTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_detaches_upload_from_draft()
    {
        $draft  = factory(App\Reply::class)->create(['type' => 'drafts']);
        $upload = factory(App\Upload::class)->create();
        $draft->uploads()->attach($upload->id);
        $this->assertCount(1, $draft->uploads);

        $response = $this->asAdmin()->call('POST', "secure/drafts/$draft->id/uploads/$upload->id/detach");
        $response->assertStatus(200);

        $this->assertCount(0, $draft->load('uploads')->uploads);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $draft1  = factory(App\Reply::class)->create(['type' => 'drafts']);
        $draft2  = factory(App\Reply::class)->create(['type' => 'drafts', 'user_id' => $user->id]);
        $reply   = factory(App\Reply::class)->create(['type' => 'replies', 'user_id' => $user->id]);

        //guests can't detach uploads from any drafts
        $response = $this->call('POST', "secure/drafts/$draft1->id/uploads/1/detach");
        $response->assertStatus(403);

        //regular users can't detach uploads from other user drafts
        $response = $this->actingAs($user)->call('POST', "secure/drafts/$draft1->id/uploads/1/detach");
        $response->assertStatus(403);

        //regular users can detach uploads from their own draft
        $response = $this->actingAs($user)->call('POST', "secure/drafts/$draft2->id/uploads/1/detach");
        $response->assertStatus(200);

        //uploads can't be detached from replies that are not of type "draft" via this API method
        $response = $this->actingAs($user)->call('POST', "secure/drafts/$reply->id/uploads/1/detach");
        $response->assertStatus(403);

        //user with permissions can detach uploads from all drafts
        $user->permissions = '{"replies.delete":1}';
        $response = $this->actingAs($user)->call('POST', "secure/drafts/$draft1->id/uploads/1/detach");
        $response->assertStatus(200);
    }
}
