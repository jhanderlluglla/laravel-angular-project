<?php

use App\Tag;
use App\Action;
use App\Ticket;
use App\Services\Triggers\Actions\ChangeTicketStatusAction;

class ChangeTicketStatusActionTest extends TestCase
{
    public function test_it_changes_ticket_status()
    {
        $action = App::make(ChangeTicketStatusAction::class);

        $ticket = $this->getTicketModel();
        $this->assertEquals('open', $ticket->status);

        $response = $action->perform($ticket, $this->getActionModel());

        $this->assertEquals('closed', $ticket->load('tags')->status);
        $this->assertEquals('closed', $response->status);
    }

    private function getTicketModel()
    {
        $ticket = factory(Ticket::class)->create();

        $status = Tag::updateOrCreate(['name' => 'open'], ['type' => 'status']);
        Tag::updateOrCreate(['name' => 'closed'], ['type' => 'status']);

        $ticket->tags()->attach($status->id);

        return $ticket;
    }

    private function getActionModel()
    {
        return new Action([
            'name'  => 'change_ticket_status',
            'pivot' => [
                'action_value' => json_encode(['status_name' => 'closed']),
            ]
        ]);
    }
}
