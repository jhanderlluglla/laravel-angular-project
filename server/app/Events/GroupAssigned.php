<?php namespace App\Events;

use App\Group;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class GroupAssigned implements ShouldQueue, ShouldBroadcast
{
    use SerializesModels, InteractsWithSockets;

    /**
     * New ticket model instance.
     *
     * @var Group
     */

    public $group;

    /**
     * Create a new event instance.
     *
     * @param Group $group
     * @param Tag $category
     */
    public function __construct(Group $group)
    {
        $this->group = $group;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        $events = [new PrivateChannel('tickets.global')];
        foreach ($this->group->users->toArray() as $key => $user) {
            $events[] = new PrivateChannel("App.User.{$user['id']}");
        }
        return $events;
    }
}
