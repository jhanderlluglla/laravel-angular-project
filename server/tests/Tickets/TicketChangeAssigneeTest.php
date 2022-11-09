<?php

use App\Ticket;
use App\Events\TicketUpdated;
use App\Listeners\TicketEventSubscriber;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketChangeAssigneeTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_changes_ticket_assignee()
    {
        $tickets = factory(App\Ticket::class, 2)->create(['user_id' => 2, 'assigned_to' => 2]);
        $agent   = factory(App\User::class)->create();

        //fires "TicketUpdated" event with original and updated ticket
        $mock = Mockery::mock(TicketEventSubscriber::class);
        $mock->shouldReceive('onTicketUpdated')->twice()->withArgs(function($event) use($agent) {
            return $event->updatedTicket->assigned_to === $agent->id && $event->originalTicket['assigned_to'] === 2;
        });
        $mock->shouldNotReceive('onTicketCreated');
        App::instance(TicketEventSubscriber::class, $mock);

        $response = $this->asAdmin()->call('POST', "secure/tickets/assign", ['user_id' => $agent->id, 'tickets' => $tickets->pluck('id')->toArray()]);
        $response->assertStatus(200);

        //changed ticket assignee
        $tickets = Ticket::whereIn('id', $tickets->pluck('id'))->get();
        $this->assertEquals($agent->id, $tickets[0]->assigned_to);
        $this->assertEquals($agent->id, $tickets[1]->assigned_to);
    }

    public function test_it_unassigns_ticket_if_no_agent_id_given()
    {
        $this->expectsEvents(TicketUpdated::class);

        $ticket = factory(App\Ticket::class)->create(['assigned_to' => 2]);

        $response = $this->asAdmin()->call('POST', "secure/tickets/assign", ['tickets' => [$ticket->id]]);
        $response->assertStatus(200);

        $this->assertNull($ticket->fresh()->assigned_to);
    }

    public function test_it_validates_user_input()
    {
        $this->doesntExpectEvents(TicketUpdated::class);

        $response = $this->asAdmin()->json('POST', "secure/tickets/assign", ['tickets' => 'string']);
        $response->assertStatus(422);
        $response->assertJsonFragment(['status' => 'error']);

        $this->assertArrayHasKey('tickets', $response->json()['messages']);
    }

    public function test_it_checks_permissions()
    {
        $this->expectsEvents(TicketUpdated::class);

        $ticket = factory(Ticket::class)->create();
        $user   = $this->getRegularUser();

        //guests can't re-assign tickets
        $response = $this->actingAs($user)->call('POST', "secure/tickets/assign", ['tickets' => [$ticket->id]]);
        $response->assertStatus(403);

        //regular users can't re-assign tickets
        $user->permissions = null;
        $response = $this->actingAs($user)->call('POST', "secure/tickets/assign", ['tickets' => [$ticket->id]]);
        $response->assertStatus(403);

        //user with permissions can re-assign tickets
        $user->permissions = '{"tickets.update":1}';
        $response = $this->actingAs($user)->call('POST', "secure/tickets/assign", ['tickets' => [$ticket->id]]);
        $response->assertStatus(200);
    }
}
