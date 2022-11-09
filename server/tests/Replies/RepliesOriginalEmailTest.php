<?php

use App\Services\Mail\ParsedEmail;
use App\Services\Files\EmailStore;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RepliesOriginalEmailTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_shows_orginal_email_from_which_reply_was_created()
    {
        Storage::fake('local');
        $reply = factory(App\Reply::class)->create();

        $mock = Mockery::mock(ParsedEmail::class);
        $mock->shouldReceive('toJson')->andReturn('{"foo":"bar"}');
        $this->app->make(EmailStore::class)->storeEmail($mock, $reply);

        $response = $this->asAdmin()->call('GET', "secure/replies/{$reply->id}/original");
        $response->assertStatus(200);

        $this->assertEquals(['foo' => 'bar'], $response->json()['data']);
    }

    public function test_it_checks_user_permissions()
    {
        $mock = Mockery::mock(EmailStore::class);
        $mock->shouldReceive('getEmailForReply')->andReturn(true);
        App::instance(EmailStore::class, $mock);

        $user  = $this->getRegularUser();
        $user2 = $this->getRegularUser();
        $reply = factory(App\Reply::class)->create(['user_id' => $user2->id]);

        //guests can't view original emails
        $response = $this->call('GET', "secure/replies/{$reply->id}/original");
        $response->assertStatus(403);

        //regular users can't view other user original emails
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', "secure/replies/{$reply->id}/original");
        $response->assertStatus(403);

        //regular users can view their own original emails
        $response = $this->actingAs($user2)->call('GET', "secure/replies/{$reply->id}/original");
        $response->assertStatus(200);

        //user with permissions can view original replies
        $user->permissions = '{"replies.view":1}';
        $response = $this->actingAs($user)->call('GET', "secure/replies/{$reply->id}/original");
        $response->assertStatus(200);
    }
}
