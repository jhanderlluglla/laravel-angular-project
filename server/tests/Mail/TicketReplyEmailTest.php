<?php

use App\Mail\TicketReply;
use App\Services\Files\EmailStore;
use App\Services\Mail\TicketReferenceHash;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketReplyEmailTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp() {
        parent::setUp();

        Config::set('mail.driver', 'log');
        (new Illuminate\Mail\MailServiceProvider(app()))->register();
    }

    public function test_it_sends_ticket_reply_via_email()
    {
        $user       = $this->getRegularUser(); $user2 = $this->getRegularUser();
        $ticket     = factory(App\Ticket::class)->create(['user_id' => $user->id]);
        $replies    = factory(App\Reply::class, 4)->create(['ticket_id' => $ticket->id, 'user_id' => $user->id]);
        $replies2   = factory(App\Reply::class, 2)->create(['ticket_id' => $ticket->id, 'user_id' => $user2->id, 'created_at' => \Carbon\Carbon::now()->addDays(2)]);
        $uploads    = factory(App\Upload::class, 2)->create(['user_id' => $user->id]);
        $replies[0]->uploads()->attach($uploads->pluck('id'));

        Storage::fake('local');
        Storage::put('uploads/'.$uploads[0]->file_name, 'first upload');
        Storage::put('uploads/'.$uploads[1]->file_name, 'second upload');
        $parsedEmail = $this->app->make(App\Services\Mail\ParsedEmail::class)->setEmailData(['headers' => ['Message-ID: foo']]);
        $this->app->make(EmailStore::class)->storeEmail($parsedEmail, $replies[0]);

        Log::listen(function($data) use($replies, $ticket, $uploads) {

            //composes email successfully
            $this->assertTrue(is_string($data->message));

            //adds reply reference uuid to email body
            $uuid = $this->app->make(TicketReferenceHash::class)->extractFromString($data->message);
            $this->assertEquals($replies[0]->uuid, $uuid);

            //adds replies history (limited to 5) to email body
            $this->assertContains($replies[0]['body'], $data->message);
            $this->assertNotContains($replies[3]['body'], $data->message);

            //attaches reply uploads to email
            $this->assertContains($uploads[0]->mime, $data->message);
            $this->assertContains('first upload', $data->message);
            $this->assertContains($uploads[1]->mime, $data->message);
            $this->assertContains('second upload', $data->message);

            //adds reply reference uuid to email Message-ID
            $headers = imap_rfc822_parse_headers($data->message);
            $this->assertEquals("<{$replies[0]->uuid}@localhost>", $headers->message_id);

            //adds correct subject
            $this->assertEquals("RE: $ticket->subject", $headers->subject);
        });

        Mail::send(new TicketReply($ticket, $replies[0]));
    }
}
