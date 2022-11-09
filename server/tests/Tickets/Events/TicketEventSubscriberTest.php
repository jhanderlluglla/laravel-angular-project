<?php

use App\Ticket;
use App\Services\Settings;
use App\Events\TicketCreated;
use App\Events\TicketUpdated;
use App\Listeners\TicketEventSubscriber;
use App\Services\Triggers\TriggersCycle;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketEventSubscriberTest extends TestCase
{
    use DatabaseTransactions;

    public function test_ticket_created_listener_works()
    {
        $ticket = new Ticket(['subject' => 'foo']);
        $user = $this->getAdminUser();
        $ticket->user()->associate($user);

        $mock = Mockery::mock(TriggersCycle::class);
        $mock->shouldReceive('runAgainstTicket')->once()->with($ticket);
        App::instance(TriggersCycle::class, $mock);

        $this->app->make(Settings::class)->set('tickets.send_ticket_created_notification', 1);
        $mock = Mockery::mock(\Illuminate\Mail\Mailer::class);
        $mock->shouldReceive('queue')->once()->with(\App\Mail\TicketCreatedNotification::class);
        App::instance(\Illuminate\Mail\Mailer::class, $mock);

        $event = new TicketCreated($ticket);

        $subscriber = App::make(TicketEventSubscriber::class);

        $subscriber->onTicketCreated($event);
    }

    public function test_ticket_updated_listener_works()
    {
        $updatedTicket = new Ticket(['subject' => 'foo']);
        $originalTicket = new Ticket(['subject' => 'bar']);

        $mock = Mockery::mock(TriggersCycle::class);
        $mock->shouldReceive('runAgainstTicket')->once()->with($updatedTicket, $originalTicket->toArray());
        App::instance(TriggersCycle::class, $mock);

        $event = new TicketUpdated($updatedTicket, $originalTicket);

        $subscriber = App::make(TicketEventSubscriber::class);

        $subscriber->onTicketUpdated($event);

        //test that original ticket is converted to array
        $this->assertTrue(is_array($event->originalTicket));
    }
}
