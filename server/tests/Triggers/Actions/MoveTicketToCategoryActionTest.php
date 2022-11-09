<?php

use App\Action;
use App\Ticket;
use App\Services\Triggers\Actions\MoveTicketToCategoryAction;

class CopyTicketToFolderActionTest extends TestCase
{
    public function test_it_copies_ticket_to_category()
    {
        $action = App::make(MoveTicketToCategoryAction::class);

        $ticket = $this->getTicketModel();

        $response = $action->perform($ticket, $this->getActionModel());

        $this->assertCount(2, $ticket->categories);
        $this->assertTrue($ticket->categories->pluck('name')->contains('foo'));
        $this->assertTrue($ticket->categories->pluck('name')->contains('bar'));

        $this->assertCount(2, $response->categories);
        $this->assertTrue($response->categories->pluck('name')->contains('foo'));
        $this->assertTrue($response->categories->pluck('name')->contains('bar'));
    }

    private function getTicketModel()
    {
        $ticket = factory(Ticket::class)->create();

        $category = App\Tag::updateOrCreate(['name' => 'foo'], ['type' => 'category']);

        $ticket->tags()->attach($category->id);

        return $ticket;
    }

    private function getActionModel()
    {
        return new Action([
            'name'  => 'move_ticket_to_category',
            'pivot' => [
                'action_value' => json_encode(['category_name' => 'bar']),
            ]
        ]);
    }
}
