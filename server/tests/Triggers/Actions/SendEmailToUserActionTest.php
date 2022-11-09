<?php

use App\User;
use App\Action;
use App\Ticket;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Services\Triggers\Actions\SendEmailToUserAction;

class SendEmailToUserActionTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp() {
        parent::setUp();

        Config::set('mail.driver', 'log');
        (new Illuminate\Mail\MailServiceProvider(app()))->register();
    }

    public function test_it_sends_email_to_specified_user()
    {
        User::firstOrCreate(['id' => 1], ['email' => 'foo@bar.com']);

        $action = App::make(SendEmailToUserAction::class);

        $ticket = $this->getTicketModel();

        $response = $action->perform($ticket, $this->getActionModel());

        $this->assertEquals($ticket, $response);
    }

    private function getTicketModel()
    {
        return factory(Ticket::class)->create(['assigned_to' => 1]);
    }

    private function getActionModel()
    {
        $data = [
            'agent_id'  => 1,
            'subject' => 'foo bar',
            'body'    => 'foo bar baz qux'
        ];

        return new Action([
            'name'  => 'send_email_to_user',
            'pivot' => [
                'action_value' => json_encode($data)
            ]
        ]);
    }
}
