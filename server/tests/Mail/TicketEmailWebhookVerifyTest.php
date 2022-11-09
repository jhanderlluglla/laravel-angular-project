<?php

use App\Services\Settings;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketEmailWebhookVerifyTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp()
    {
        parent::setUp();
        App::make(Settings::class)->set('mail.handler', 'null');
        App::make(Settings::class)->set('mail.webhook_secret_key', 'foo_bar');
    }

    public function test_it_allows_signed_requests()
    {
        $this->mock(App\Services\Mail\IncomingMailHandler::class);

        $response = $this->call('POST', "tickets/mail/incoming", ['webhook_secret_key' => 'foo_bar']);
        $response->assertStatus(200);
    }

    public function test_it_blocks_requests_that_are_not_signed()
    {
        $this->mock(App\Services\Mail\IncomingMailHandler::class);

        $response = $this->call('POST', "tickets/mail/incoming", ['webhook_secret_key' => 'invalid']);
        $response->assertStatus(406);
    }
}
