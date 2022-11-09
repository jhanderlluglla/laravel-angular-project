<?php

use App\Tag;
use App\Ticket;
use App\Events\TicketCreated;
use App\Listeners\TicketEventSubscriber;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketCreateTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_new_ticket()
    {
        $user = $this->getAdminUser();

        //fires "TicketCreated" event
        $mock = Mockery::mock(TicketEventSubscriber::class);
        $mock->shouldReceive('onTicketCreated')->once()->with(TicketCreated::class);
        $mock->shouldNotReceive('onTicketUpdated');
        App::instance(TicketEventSubscriber::class, $mock);

        $category  = factory(App\Tag::class)->create(['type' => 'category']);
        $openTag = Tag::firstOrCreate(['name' => 'open', 'type' => 'status']);

        $payload = ['subject' => 'foo', 'body' => 'bar', 'category' => $category->id];

        $response = $this->actingAs($user)->call('POST', 'secure/tickets', $payload);
        $response->assertStatus(201);
        $data = $response->json();

        //assigns new ticket to correct user
        $this->assertEquals($user->id, $data['user_id']);

        //sets subject for new ticket
        $this->assertEquals('foo', $data['subject']);

        $ticket = Ticket::with('replies', 'tags')->find($data['id']);

        //assigns "open" status tag to new ticket
        $this->assertTrue($ticket->tags->contains('name' , 'open'));

        //assigns new ticket to specified category tag
        $this->assertTrue($ticket->tags->contains('name' , $category->name));

        //creates initial reply for new ticket
        $this->assertCount(1, $ticket->replies);
        $this->assertEquals('bar', $ticket->replies->first()->body);
    }

    public function test_it_validates_user_input()
    {
        $this->doesntExpectEvents(TicketCreated::class);

        $response = $this->asAdmin()->json('POST', 'secure/tickets', []);
        $response->assertStatus(422);
        $response->assertJsonFragment(['status' => 'error']);

        $this->assertArrayHasKey('subject', $response->json()['messages']);
        $this->assertArrayHasKey('body', $response->json()['messages']);
        $this->assertArrayHasKey('category', $response->json()['messages']);
    }

    public function test_it_checks_permissions()
    {
        $this->expectsEvents(TicketCreated::class);

        $user = $this->getRegularUser();
        $f    = factory(App\Tag::class)->create(['type' => 'category']);

        //guests can't create tickets
        $response = $this->call('POST', 'secure/tickets', ['subject' => 'foo', 'body' => 'bar', 'category' => $f->id]);
        $response->assertStatus(403);

        //regular users can't create tickets
        $user->permissions = null;
        $response = $this->actingAs($user)->call('POST', 'secure/tickets', ['subject' => 'foo', 'body' => 'bar', 'category' => $f->id]);
        $response->assertStatus(403);

        //user with permissions can create tickets
        $user->permissions = '{"tickets.create":1}';
        $response = $this->actingAs($user)->call('POST', 'secure/tickets', ['subject' => 'foo', 'body' => 'bar', 'category' => $f->id]);
        $response->assertStatus(201);
    }
}
