<?php namespace App\Events;

use App\EscalationRule;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class EscalationRuleEvent implements ShouldQueue
{
    use SerializesModels;

    /**
     * Updated ticket model instance.
     *
     * @var EscalationRule
     */
    public $escalationRule;

    /**
     * Create a new event instance.
     *
     * @param Ticket $updatedTicket
     * @param Ticket $originalTicket
     */
    public function __construct(EscalationRule $escalationRule)
    {
        $this->escalationRule = $escalationRule;
    }
}
