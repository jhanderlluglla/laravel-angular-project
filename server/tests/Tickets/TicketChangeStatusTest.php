<?php

use App\Tag;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketStatusChangeTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_changes_ticket_status()
    {
        $ticket1  = factory(App\Ticket::class)->create();
        $ticket2  = factory(App\Ticket::class)->create();

        $openTag    = App\Tag::firstOrCreate(['name' => 'open', 'type' => 'status']);
        $closedTag  = App\Tag::firstOrCreate(['name' => 'closed', 'type' => 'status']);
        $pendingTag = App\Tag::firstOrCreate(['name' => 'pending', 'type' => 'status']);

        $ticket1->tags()->attach($openTag->id);
        $this->assertCount(1, $ticket1->tags);
        $ticket2->tags()->attach($pendingTag->id);
        $this->assertCount(1, $ticket2->tags);

        $response = $this->asAdmin()->call('POST', 'secure/tickets/status/change', ['ids' => [$ticket1->id, $ticket2->id], 'status' => 'closed']);
        $response->assertStatus(200);
        $response->assertJsonFragment(['status' => 'success']);

        $this->assertCount(1, $ticket1->load('tags')->tags);
        $this->assertEquals('closed', $ticket1->load('tags')->tags->first()['name']);

        $this->assertCount(1, $ticket2->load('tags')->tags);
        $this->assertEquals('closed', $ticket2->load('tags')->tags->first()['name']);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', 'secure/tickets/status/change', ['ids' => [], 'status' => 5]);
        $response->assertStatus(422);
        $response->assertJsonFragment(['status' => 'error']);

        $this->assertArrayHasKey('ids', $response->json()['messages']);
        $this->assertArrayHasKey('status', $response->json()['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user     = $this->getRegularUser();
        App\Tag::firstOrCreate(['name' => 'open', 'type' => 'status']);

        //guests can't change ticket status
        $response = $this->call('POST', '/secure/tickets/status/change', ['ids' => [1], 'status' => 'open']);
        $response->assertStatus(403);

        //regular users can't change ticket status
        $user->permissions = null;
        $response = $this->actingAs($user)->call('POST', '/secure/tickets/status/change', ['ids' => [1], 'status' => 'open']);
        $response->assertStatus(403);

        //user with permissions can change ticket status
        $user->permissions = '{"tickets.update":1}';
        $response = $this->actingAs($user)->call('POST', '/secure/tickets/status/change', ['ids' => [1], 'status' => 'open']);
        $response->assertStatus(200);
    }
}
