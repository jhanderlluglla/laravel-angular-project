<?php namespace App\Events;

use App\Reply;
use App\Ticket;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class TicketReplyCreated implements ShouldQueue, ShouldBroadcast
{
    use SerializesModels, InteractsWithSockets;

    /**
     * @var Reply
     */
    public $reply;

    /**
     * @var Ticket
     */
    private $ticket;

    /**
     * Create a new event instance.
     *
     * @param Ticket $ticket
     * @param Reply $reply
     * @internal param Reply $reply
     */
    public function __construct(Ticket $ticket, Reply $reply)
    {
        $this->dontBroadcastToCurrentUser();

        $this->ticket = $ticket;
        $this->reply = $reply->load('user', 'uploads');
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return [new PrivateChannel('tickets.global'), new PrivateChannel("App.User.{$this->ticket->user_id}")];
    }

    /**
     * Determine if this event should broadcast.
     *
     * @return bool
     */
    public function broadcastWhen()
    {
        return $this->reply->type !== 'drafts';
    }
}
