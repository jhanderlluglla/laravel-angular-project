<?php

use App\Services\Settings;
use App\Services\Files\EmailStore;
use App\Services\Mail\TicketReferenceHash;
use App\Services\Mail\Verifiers\MailWebhookVerifier;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketsEmailWebhookTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp()
    {
        parent::setUp();

        Storage::fake('local'); Storage::fake('public');
        App::make(Settings::class)->set('mail.handler', 'mailgun');

        //mock webhook verification
        $mock = Mockery::mock(MailWebhookVerifier::class);
        $mock->shouldReceive('isValid')->andReturn(true);
        App::instance(MailWebhookVerifier::class, $mock);

        App::make(Settings::class)->set('replies.create_from_emails', true);
    }

    public function test_it_parses_email_data_into_ticket_reply()
    {
        //create a ticket
        $ticket = factory(App\Ticket::class)->create(['updated_at' => Carbon\Carbon::now()->addDays(-2)]);
        $tag = App\Tag::firstOrCreate(['name' => 'closed', 'type' => 'status']);
        $ticket->tags()->attach($tag->id);
        factory(App\Ticket::class)->create();
        $reply = factory(App\Reply::class)->create(['ticket_id' => $ticket->id, 'user_id' => $ticket->user_id]);
        $embed  = $this->app->make(TicketReferenceHash::class)->makeEmbedForEmail($reply);

        $data = [
            'stripped-html'   => "  <h1>foo bar \n baz</h1><br><br/>",
            'body-plain'      => "foo bar $embed",
            'message-headers' => [['In-Reply-To', str_random(30)]],
            'attachments'     => [['name' => 'foo name', 'content-type' => 'foo/mime', 'size' => 999, 'url' => 'http://foo.com']]
        ];

        $mock = Mockery::mock(GuzzleHttp\Client::class);
        $mock->shouldReceive('getBody')->once()->andReturnSelf();
        $mock->shouldReceive('getContents')->once()->andReturn('foo bar');
        $mock->shouldReceive('request')->once()->with(
            'GET',
            $data['attachments'][0]['url'],
            ['auth' => ['api', config('services.mailgun.secret')]]
        )->andReturnSelf();
        $this->app->instance(GuzzleHttp\Client::class, $mock);

        $response = $this->call('POST', "tickets/mail/incoming", $data);
        $response->assertStatus(200);
        $freshTicket = $ticket->fresh();

        //creates reply for ticket
        $this->assertCount(2, $freshTicket->replies);

        //touches ticket "updated_at" timestamp
        $this->assertTrue($ticket->updated_at < $freshTicket->updated_at);

        //formats reply properly
        $this->assertContains('foo bar <br> baz', [$freshTicket->replies[0]['body'], $freshTicket->replies[1]['body']]);
        $this->assertEquals($freshTicket->user_id, $freshTicket->replies[1]['user_id']);
        $this->assertEquals('replies', $freshTicket->replies[1]['type']);

        //attaches upload
        $upload = $freshTicket->replies[1]['uploads'][0];
        $this->assertEquals($data['attachments'][0]['name'], $upload['name']);
        $this->assertEquals($data['attachments'][0]['content-type'], $upload['mime']);
        $this->assertEquals($data['attachments'][0]['size'], $upload['file_size']);
        $this->assertEquals($ticket['user_id'], $upload['user_id']);

        //stores uploads on the disk
        Storage::disk('local')->assertExists("uploads/$upload->file_name");
        $this->assertEquals('foo bar', Storage::get("uploads/$upload->file_name"));

        //changes ticket status to "open"
        $this->assertEquals('open', $freshTicket->status);
    }

    public function test_it_matches_email_to_ticket_by_message_id_header()
    {
        $this->mock(GuzzleHttp\Client::class);

        $ticket = factory(App\Ticket::class)->create();
        $reply = factory(App\Reply::class)->create(['ticket_id' => $ticket->id, 'user_id' => $ticket->user_id]);

        $data = [
            'stripped-html' => 'foo <img src="cid:foo-cid">',
            'body-plain'    => "bar",
            'message-headers' => [['In-Reply-To', $this->app->make(TicketReferenceHash::class)->makeMessageIdForEmail($reply)]],
            'attachments'     => [
                ['name' => 'foo name', 'content-type' => 'foo/jpeg', 'size' => 999, 'url' => 'http://foo.com'],
                ['name' => 'bar name', 'content-type' => 'bar/jpeg', 'size' => 999, 'url' => 'http://bar.com'],
            ],
            'content-id-map'  => ['<foo-cid>' => ['url' => 'http://foo.com']],
        ];

        $response = $this->call('POST', 'tickets/mail/incoming', $data);
        $response->assertStatus(200);
        $freshTicket = $ticket->fresh();

        //creates reply for ticket
        $this->assertCount(2, $freshTicket->replies);

        //stores inline image on disk and replaces CID with image url in reply body
        $files = Storage::disk('public')->files('ticket-images');
        $this->assertCount(1, $files);
        $this->assertContains($files[0], $freshTicket->replies->last()->body);
        $this->assertNotContains('cid:', $freshTicket->replies->last()->body);
    }

    public function test_it_creates_new_ticket_if_email_cant_be_matched_to_existing_ticket()
    {
        App::make(Settings::class)->set('tickets.create_from_emails', true);
        $user = factory(App\User::class)->create();

        $payload = [
            'message-headers' => [
                ['From', "Foo Bar <{$user->email}>"],
                ['Subject', 'foo subject'],
            ],
            'stripped-html' => '<div>foo body</div>',
        ];

        $response = $this->call('POST', "tickets/mail/incoming", $payload);
        $response->assertStatus(200);

        $ticket = \App\Ticket::where('subject', 'foo subject')->first();
        $this->assertEquals('foo subject', $ticket->subject);
        $this->assertEquals('foo body', $ticket->replies->first()->body);
        $this->assertEquals($user->id, $ticket->user_id);
        $this->assertEquals($user->id, $ticket->replies->first()->user_id);
    }

    public function test_it_handles_inline_email_images()
    {
        App::make(Settings::class)->set('tickets.create_from_emails', true);
        $this->mock(GuzzleHttp\Client::class);

        $data = [
            'stripped-html'   => 'foo <img src="cid:foo-cid">',
            'message-headers' => [
                ['From', "foo@bar.com"],
                ['Subject', 'foo subject'],
            ],
            'attachments'     => [
                ['name' => 'foo name', 'content-type' => 'foo/jpeg', 'size' => 999, 'url' => 'http://foo.com'],
                ['name' => 'bar name', 'content-type' => 'bar/jpeg', 'size' => 999, 'url' => 'http://bar.com'],
            ],
            'content-id-map'  => ['<foo-cid>' => ['url' => 'http://foo.com']],
        ];

        $response = $this->call('POST', "tickets/mail/incoming", $data);
        $response->assertStatus(200);

        $ticket = \App\Ticket::where('subject', 'foo subject')->first();
        $files = Storage::disk('public')->files('ticket-images');

        //stores regular files on disk
        $this->assertEquals('bar name', $ticket->replies->first()->uploads->first()->name);
        $this->assertCount(1, Storage::disk('local')->files('uploads'));
        Storage::exists('uploads/'.$ticket->replies->first()->uploads->first()->file_name);

        //stores inline image on disk
        $this->assertCount(1, $files);

        //replaces CID with image url in reply body
        $this->assertContains($files[0], $ticket->replies->first()->body);
        $this->assertNotContains('cid:', $ticket->replies->first()->body);
    }

    public function test_it_stores_original_unmatched_emails_on_the_disk()
    {
        $response = $this->call('POST', "tickets/mail/incoming", ['body-plain' => 'baz', 'message-headers' => [['foo', 'bar']]]);
        $response->assertStatus(200);

        $emails = $this->app->make(EmailStore::class)->getUnmatchedEmails();
        $this->assertCount(1, $emails);
        $this->assertEquals(['headers' => ['foo' => 'bar'], 'body' => ['plain' => 'baz', 'html' => null]], json_decode(Storage::get($emails[0]), true));
        $this->assertContains('emails/unmatched', $emails[0]);
    }

    public function test_it_stores_original_matched_emails_on_the_disk()
    {
        $ticket = factory(App\Ticket::class)->create();
        $reply = factory(App\Reply::class)->create(['ticket_id' => $ticket->id, 'user_id' => $ticket->user_id]);
        $embed  = $this->app->make(TicketReferenceHash::class)->makeEmbedForEmail($reply);

        $data = [
            'stripped-html'   => "foo bar",
            'body-plain'      => "foo bar $embed",
            'message-headers' => [['foo', 'bar']]
        ];

        $response = $this->call('POST', 'tickets/mail/incoming', $data);
        $response->assertStatus(200);

        $expectedOriginal = ['headers' => ['foo' => 'bar'], 'body' => ['plain' => "foo bar $embed", 'html' => null]];

        $emails = Storage::allFiles();
        $this->assertCount(1, $emails);
        $this->assertEquals($expectedOriginal, json_decode(Storage::get($emails[0]), true));
        $this->assertContains('emails/matched', $emails[0]);

        $email = $this->app->make(EmailStore::class)->getEmailForReply($ticket->latest_replies->last());
        $this->assertEquals($expectedOriginal, $email);
    }

    public function test_it_does_not_create_any_replies_if_ticket_reference_cant_be_extracted()
    {
        $this->mock(GuzzleHttp\Client::class);
        App\Reply::truncate();
        App\Upload::truncate();

        //create reply with random uuid to make sure emails are not matched to it
        factory(App\Reply::class)->create(['uuid' => 'foo']);

        $data = [
            'stripped-html' => "foo bar",
            'body-plain'    => "foo bar",
            'attachments'   => [['name' => 'foo name', 'content-type' => 'foo/mime', 'size' => 999, 'url' => 'http://foo.com']]
        ];

        $response = $this->call('POST', "tickets/mail/incoming", $data);
        $response->assertStatus(200);

        //did not create any replies or attachments
        $this->assertCount(1, App\Reply::get());
        $this->assertCount(0, App\Upload::get());
    }

    public function test_it_strips_quoted_text_from_email()
    {
        App::make(Settings::class)->set('tickets.create_from_emails', true);
        App::make(Settings::class)->set('mail.handler', null);
        $user = factory(App\User::class)->create();

        $payload = [
            'headers' => [
                'From' => "Foo Bar <{$user->email}>",
                'Subject' => 'foo subject',
            ],
            'body' => [
                'html' => 'foo body <foo quoted text',
            ]
        ];

        $response = $this->call('POST', "tickets/mail/incoming", $payload);
        $response->assertStatus(200);

        $ticket = \App\Ticket::where('subject', 'foo subject')->first();
        $this->assertEquals('foo body', $ticket->replies->first()->body);
    }

    public function test_it_checks_permissions()
    {
        $this->mock(App\Services\Mail\IncomingMailHandler::class);

        //guests can call tickets mail webhook
        $response = $this->call('POST', "tickets/mail/incoming", ['foo' => 'bar']);
        $response->assertStatus(200);
    }
}
