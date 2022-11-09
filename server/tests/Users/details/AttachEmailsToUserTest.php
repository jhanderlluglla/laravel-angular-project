<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class AttachEmailsToUserTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_attaches_emails_to_user()
    {
        $user = $this->getRegularUser();

        $faker = Faker\Factory::create();
        $email1 = $faker->email;
        $email2 = $faker->email;

        $response = $this->asAdmin()->json('POST', "/secure/users/{$user->id}/emails/attach", ['emails' => [$email1, $email2]]);
        $response->assertStatus(200);

        $this->assertEquals([$email1, $email2], $user->secondary_emails()->pluck('address')->toArray());
    }

    public function test_it_validates_user_input()
    {
        $email = factory(App\Email::class)->create();

        $response = $this->asAdmin()->json('POST', "/secure/users/1/emails/attach", ['emails' => [$email->address]]);
        $response->assertStatus(422);
        $response = $response->json();

        //email must not exist yet in emails table
        $this->assertArrayHasKey('emails.0', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user  = $this->getRegularUser();

        //guests can't attach emails
        $response = $this->call('POST', '/secure/users/1/emails/attach', ['emails' => [Faker\Factory::create()->email]]);
        $response->assertStatus(403);

        //regular users can't attach emails
        $this->actingAs($user)->call('POST', '/secure/users/1/emails/attach', ['emails' => [Faker\Factory::create()->email]]);
        $response->assertStatus(403);

        //user with permission can attach emails
        $user->permissions = '{"users.update":1}';
        $response = $this->actingAs($user)->json('POST', '/secure/users/1/emails/attach', ['emails' => [Faker\Factory::create()->email]]);
        $response->assertStatus(200);
    }
}
