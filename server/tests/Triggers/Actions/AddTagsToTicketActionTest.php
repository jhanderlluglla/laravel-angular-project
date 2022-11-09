<?php

use App\Action;
use App\Ticket;
use App\Services\Triggers\Actions\AddTagsToTicketAction;

class AddTagsToTicketActionTest extends TestCase
{
    public function test_it_adds_tags_to_ticket()
    {
        $action = App::make(AddTagsToTicketAction::class);

        $ticket = $this->getTicketModel();

        $response = $action->perform($ticket, $this->getActionModel());

        $this->assertEquals($ticket, $response);

        $this->assertCount(3, $response->tags);

        $names1 = $ticket->tags->pluck('name');
        $this->assertTrue($names1->contains('foo'));
        $this->assertTrue($names1->contains('bar'));
        $this->assertTrue($names1->contains('baz'));

        $names2 = $response->tags->pluck('name');
        $this->assertTrue($names2->contains('foo'));
        $this->assertTrue($names2->contains('bar'));
        $this->assertTrue($names2->contains('baz'));
    }

    private function getTicketModel()
    {
        $ticket = factory(Ticket::class)->create();
        $tag = App\Tag::firstOrCreate(['name' => 'foo']);
        $ticket->tags()->attach($tag->id);
        return $ticket;
    }

    private function getActionModel()
    {
        return new Action([
            'name'  => 'add_tags_to_ticket',
            'pivot' => [
                'action_value' => json_encode(['tags_to_add' => 'foo,bar,baz'])
            ]
        ]);
    }
}
