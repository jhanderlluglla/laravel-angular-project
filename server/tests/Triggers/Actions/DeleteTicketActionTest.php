<?php

use App\Action;
use App\Ticket;
use App\Services\Triggers\Actions\DeleteTicketAction;

class DeleteTicketActionTest extends TestCase
{
    public function test_it_deletes_ticket()
    {
        $action = App::make(DeleteTicketAction::class);

        $ticket = $this->getTicketModel();

        $response = $action->perform($ticket, $this->getActionModel());

        $this->assertDatabaseMissing('tickets', ['id' => $ticket->id]);

        $this->assertEquals($ticket, $response);
    }

    private function getTicketModel()
    {
        return factory(Ticket::class)->create();
    }

    private function getActionModel()
    {
        return new Action([
            'name'  => 'delete_ticket',
        ]);
    }
}
