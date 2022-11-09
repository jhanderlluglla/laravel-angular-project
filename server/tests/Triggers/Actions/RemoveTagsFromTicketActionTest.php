<?php

use App\Tag;
use App\Action;
use App\Ticket;
use App\Services\Triggers\Actions\RemoveTagsFromTicketAction;

class RemoveTagsFromTicketActionTest extends TestCase
{
    public function test_it_adds_tags_to_ticket()
    {
        $action = App::make(RemoveTagsFromTicketAction::class);

        $ticket = $this->getTicketModel();

        $response = $action->perform($ticket, $this->getActionModel());

        //2 tags should have been detached and one left
        $this->assertCount(1, $ticket->tags);
        $this->assertCount(1, $response->tags);
    }

    private function getTicketModel()
    {
        $ticket = factory(Ticket::class)->create();

        $tags = collect();
        $tags[] = Tag::firstOrCreate(['name' => 'foo']);
        $tags[] = Tag::firstOrCreate(['name' => 'bar']);
        $tags[] = Tag::firstOrCreate(['name' => 'baz']);

        $ticket->tags()->attach($tags->pluck('id')->toArray());

        return $ticket;
    }

    private function getActionModel()
    {
        return new Action([
            'name'  => 'remove_tags_from_ticket',
            'pivot' => [
                'action_value' => json_encode(['tags_to_remove' => 'foo,bar'])
            ]
        ]);
    }
}
