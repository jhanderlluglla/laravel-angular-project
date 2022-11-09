<?php

use App\Ticket;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketRemoveTagTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_removes_tag_from_multiple_tickets()
    {
        $tickets = factory(App\Ticket::class, 2)->create();
        $tagToRemove = factory(App\Tag::class)->create(['type' => 'custom']);
        $tagToKeep = factory(App\Tag::class)->create(['type' => 'custom']);

        $tickets[0]->tags()->attach($tagToRemove->id);
        $tickets[1]->tags()->attach($tagToRemove->id);
        $tickets[1]->tags()->attach($tagToKeep->id);

        $response = $this->asAdmin()->call('POST', '/secure/tickets/tags/remove', ['ids' => $tickets->pluck('id')->toArray(), 'tag' => $tagToRemove->id]);
        $response->assertStatus(200);

        $tickets->load('tags');

        //check that tag was removed from first ticket
        $this->assertEmpty($tickets[0]->tags);

        //check that only given tag was removed from second ticket
        $this->assertCount(1, $tickets[1]->tags);
        $this->assertEquals($tagToKeep->id, $tickets[1]->tags->first()->id);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', '/secure/tickets/tags/remove', ['ids' => 'test', 'tag' => []]);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertArrayHasKey('ids', $response['messages']);
        $this->assertArrayHasKey('tag', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        $ticket = factory(App\Ticket::class)->create();
        $tag    = factory(App\Tag::class)->create(['type' => 'custom']);

        //guests can't remove tags
        $response = $this->call('POST', '/secure/tickets/tags/remove', ['ids' => [$ticket->id], 'tag' => $tag->id]);
        $response->assertStatus(403);

        //regular users can't remove tags
        $response = $this->actingAs($user)->call('POST', '/secure/tickets/tags/remove', ['ids' => [$ticket->id], 'tag' => $tag->id]);
        $response->assertStatus(403);

        //user with permissions can remove tags
        $user->permissions = '{"tickets.update":1}';
        $response = $this->actingAs($user)->call('POST', '/secure/tickets/tags/remove', ['ids' => [$ticket->id], 'tag' => $tag->id]);
        $response->assertStatus(200);
    }
}
