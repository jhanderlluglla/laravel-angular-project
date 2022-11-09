<?php

use App\Ticket;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketAddTagTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_adds_tag_to_multiple_tickets()
    {
        $tickets = factory(App\Ticket::class, 3)->create();
        $tags = factory(App\Tag::class, 2)->create(['type' => 'custom']);

        $tickets[0]->tags()->attach($tags[0]->id);
        $tickets[1]->tags()->attach($tags[1]->id);

        $response = $this->asAdmin()->call('POST', '/secure/tickets/tags/add', ['ids' => $tickets->pluck('id')->toArray(), 'tag' => $tags[1]->name]);
        $response->assertStatus(200);

        $tickets->load('tags');

        //check that tag was attached to all tickets and there are no duplicate tags
        $this->assertCount(2, $tickets[0]->tags);
        $this->assertCount(1, $tickets[1]->tags);
        $this->assertCount(1, $tickets[2]->tags);

        //check that correct tag was attached
        $this->assertEquals($tags[1]['name'], $tickets[1]->tags[0]->name, 'tag added to ticket');
        $this->assertEquals($tags[1]['name'], $tickets[2]->tags[0]->name, 'tag added to ticket');

        foreach($tickets[0]->tags as $tag) {
            $this->assertTrue($tag['name'] === $tags[1]['name'] || $tag['name'] === $tags[0]['name']);
        }
    }

    public function test_it_creates_and_adds_tag_if_it_does_not_exist()
    {
        $ticket  = factory(App\Ticket::class)->create();
        $tagName = str_random(10);

        $response = $this->asAdmin()->json('POST', '/secure/tickets/tags/add', ['ids' => [$ticket->id], 'tag' => $tagName]);
        $response->assertStatus(200);

        $this->assertEquals($tagName, $ticket->tags->first()->name);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', '/secure/tickets/tags/add', ['ids' => 'test', 'tag' => 55]);
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
        $tag = factory(App\Tag::class)->create();

        //guests can't add tags
        $response = $this->call('POST', '/secure/tickets/tags/add', ['ids' => [$ticket->id], 'tag' => $tag->name]);
        $response->assertStatus(403);

        //regular users can't add tags
        $this->actingAs($user)->call('POST', '/secure/tickets/tags/add', ['ids' => [$ticket->id], 'tag' => $tag->name]);
        $response->assertStatus(403);

        //user with permission can add tags
        $user->permissions = '{"tickets.update":1}';
        $response = $this->actingAs($user)->call('POST', '/secure/tickets/tags/add', ['ids' => [$ticket->id], 'tag' => $tag->name]);
        $response->assertStatus(200);
    }
}
