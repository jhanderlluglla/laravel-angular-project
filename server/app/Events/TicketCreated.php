<?php namespace App\Events;

use App\Ticket;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class TicketCreated implements ShouldQueue, ShouldBroadcast
{
    use SerializesModels, InteractsWithSockets;

    /**
     * New ticket model instance.
     *
     * @var Ticket
     */
    public $ticket;

    /**
     * Create a new event instance.
     *
     * @param Ticket $ticket
     */
    public function __construct(Ticket $ticket)
    {
        $this->dontBroadcastToCurrentUser();

        $this->ticket = $ticket;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('tickets.global');
    }
}
