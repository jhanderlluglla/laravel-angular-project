<?php

use App\User;
use App\Services\Settings;
use App\Services\Mail\Verifiers\MailWebhookVerifier;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class FailedTicketsEmailWebhookTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp()
    {
        parent::setUp();
        App::make(Settings::class)->set('mail.handler', 'mailgun');

        //mock webhook verification
        $mock = Mockery::mock(MailWebhookVerifier::class);
        $mock->shouldReceive('isValid')->andReturn(true);
        App::instance(MailWebhookVerifier::class, $mock);
    }

    public function test_it_creates_new_ticket_notifying_agents_of_failed_email_delivery()
    {
        $payload = [
            'message-headers' => [
                ['From', "Foo Bar <foo@bar.com}>"],
                ['Subject', 'foo subject'],
                ['Content-Type', ['multipart/mixed', ['boundary' => '_=_swift_v4_1498392625_3ff7cca0f1938e3927c5bc584173055f_=_']]]
            ],
            'recipient' => 'foo@bar.com',
            'reason' => 'hardfail',
            'description' => 'This message was blocked because its content presents a potential security issue',
        ];

        $response = $this->call('POST', "tickets/mail/failed", $payload);
        $response->assertStatus(200);

        $postMaster = User::where('email', 'like', 'postmaster@%')->first();
        $reply = $postMaster->tickets->last()->replies->last();

        //creates post master user, if doesn't already exist
        $this->assertNotNull($postMaster);

        //creates new ticket
        $this->assertNotNull($reply);

        //formats ticket body properly
        $this->assertContains($payload['recipient'], $reply->body);
        $this->assertContains($payload['reason'], $reply->body);
        $this->assertContains($payload['description'], $reply->body);
        $this->assertContains($payload['message-headers'][1][1], $reply->body);

        //adds custom subject and not the one from headers
        $this->assertNotEquals($postMaster->tickets->last()->subject, $payload['message-headers'][1][1]);
    }

    public function test_it_checks_permissions()
    {
        $this->mock(App\Services\Mail\FailedMailHandler::class);

        //guests can call tickets failed mail webhook
        $response = $this->call('POST', "tickets/mail/failed", ['foo' => 'bar']);
        $response->assertStatus(200);
    }
}
