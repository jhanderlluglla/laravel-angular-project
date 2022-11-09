<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class DetachEmailsFromUserTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_detaches_emails_from_user()
    {
        $user = $this->getRegularUser();
        $user->secondary_emails()->create(['address' => 'foo@foo.com']);
        $user->secondary_emails()->create(['address' => 'bar@foo.com']);
        $user->secondary_emails()->create(['address' => 'baz@foo.com']);

        $response = $this->asAdmin()->call('POST', "/secure/users/{$user->id}/emails/detach", ['emails' => ['foo@foo.com', 'bar@foo.com']]);
        $response->assertStatus(200);

        $this->assertEquals(['baz@foo.com'], $user->secondary_emails()->pluck('address')->toArray());
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', "/secure/users/1/emails/detach", ['emails' => ['foo@bar.com']]);
        $response->assertStatus(422);
        $response = $response->json();

        //email must exist in emails table
        $this->assertArrayHasKey('emails.0', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $email = factory(App\Email::class)->create();

        //guests can't detach emails
        $response = $this->call('POST', '/secure/users/1/emails/detach', ['emails' => [$email->address]]);
        $response->assertStatus(403);

        //regular users can't detach emails
        $this->actingAs($user)->call('POST', '/secure/users/1/emails/detach', ['emails' => [$email->address]]);
        $response->assertStatus(403);

        //user with permission can detach emails
        $user->permissions = '{"users.update":1}';
        $response = $this->actingAs($user)->call('POST', '/secure/users/1/emails/detach', ['emails' => [$email->address]]);
        $response->assertStatus(200);
    }
}
