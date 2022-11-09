<?php

use App\Action;
use App\Ticket;
use App\Services\Triggers\Actions\AddNoteToTicketAction;

class AddNoteToTicketActionTest extends TestCase
{
    public function test_it_adds_note_to_ticket()
    {
        Auth::setUser((new App\User())->forceFill(['id' => 999]));

        $action = App::make(AddNoteToTicketAction::class);

        $ticket = $this->getTicketModel();

        $response = $action->perform($ticket, $this->getActionModel());

        $this->assertCount(1, $ticket->notes);
        $this->assertEquals('foo bar baz', $ticket->notes->first()->body);

        //test it returns updated ticket
        $this->assertEquals($ticket, $response);
        $this->assertEquals($response->replies->first()->body, 'foo bar baz');
        $this->assertEquals($response->replies->first()->type, 'notes');
    }

    private function getTicketModel()
    {
        return factory(Ticket::class)->create();
    }

    private function getActionModel()
    {
        return new Action([
            'name'  => 'add_note_to_ticket',
            'pivot' => [
                'action_value' => json_encode(['note_text' => 'foo bar baz']),
            ]
        ]);
    }
}
