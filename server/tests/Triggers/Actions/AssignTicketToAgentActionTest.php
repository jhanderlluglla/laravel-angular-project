<?php

use App\Action;
use App\Ticket;
use App\Services\Triggers\Actions\AssignTicketToAgentAction;

class AssignTicketToAgentActionTest extends TestCase
{
    public function test_it_assigns_ticket_to_agent()
    {
        $action = App::make(AssignTicketToAgentAction::class);

        $ticket = $this->getTicketModel();

        $response = $action->perform($ticket, $this->getActionModel());

        $this->assertEquals(2, $ticket->fresh()->assigned_to);
        $this->assertEquals(2, $response->assigned_to);
    }

    private function getTicketModel()
    {
        return factory(Ticket::class)->create(['assigned_to' => 1]);
    }

    private function getActionModel()
    {
        return new Action([
            'name'  => 'assign_ticket_to_agent',
            'pivot' => [
                'action_value' => json_encode(['agent_id' => 2])
            ]
        ]);
    }
}
