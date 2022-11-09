<?php namespace App\Listeners;

use App\Events\EscalationRuleEvent;
use App\Mail\EscalationRuleNotification;
use App\Services\Settings;
use Illuminate\Mail\Mailer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;

class EscalationRuleEventSubscriber implements ShouldQueue
{
    /**
     * @var Mailer
     */
    private $mailer;
    
    /**
     * TicketEventSubscriber constructor.
     *
     * @param TriggersCycle $triggersCycle
     * @param Mailer $mailer
     * @param Settings $settings
     */
    public function __construct(Mailer $mailer)
    {
        $this->mailer = $mailer;
    }

    public function onEscalationRule(EscalationRuleEvent $event) {
        $escalation = $event->escalationRule;
        $this->mailer->queue(new EscalationRuleNotification($escalation));
    }

    /**
     * Register the listeners for the subscriber.
     *
     * @param Dispatcher $events
     */
    public function subscribe($events)
    {
        $events->listen(
            'App\Events\EscalationRuleEvent',
            'App\Listeners\EscalationRuleEventSubscriber@onEscalationRule'
        );
    }

}