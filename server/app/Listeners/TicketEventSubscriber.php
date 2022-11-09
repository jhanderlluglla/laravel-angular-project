<?php namespace App\Listeners;

use App\Events\TicketCreated;
use App\Events\TicketUpdated;
use App\Events\GroupAssigned;
use App\Mail\TicketCreatedNotification;
use App\Services\Settings;
use App\Services\Triggers\TriggersCycle;
use Illuminate\Mail\Mailer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Carbon\Carbon;

class TicketEventSubscriber implements ShouldQueue
{
    /**
     * TriggersCycle instance.
     *
     * @var TriggersCycle
     */
    private $triggersCycle;
    public $tries = 5;

    /**
     * @var Mailer
     */
    private $mailer;
    /**
     * @var Settings
     */
    private $settings;

    /**
     * TicketEventSubscriber constructor.
     *
     * @param TriggersCycle $triggersCycle
     * @param Mailer $mailer
     * @param Settings $settings
     */
    public function __construct(TriggersCycle $triggersCycle, Mailer $mailer, Settings $settings)
    {
        $this->mailer = $mailer;
        $this->settings = $settings;
        $this->triggersCycle = $triggersCycle;
    }

    /**
     * Handle ticket created event.
     *
     * @param TicketCreated $event
     */
    public function onTicketCreated(TicketCreated $event)
    {
        $this->triggersCycle->runAgainstTicket($event->ticket);
        $now = Carbon::now();
        $dt = Carbon::now()->addMinutes(30);

        if ($this->settings->get('tickets.send_ticket_created_notification')) {
            // if ($this->settings->get('tickets.send_ticket_in_weekends')) {
            //     if ($dt->isWeekday()) {
            //         $dt = Carbon::parse('this saturday');
            //     }
            // }
            // else if ($this->settings->get('tickets.send_ticket_in_office_hours')) {
            //     if ($dt->isWeekend()) {
            //         $dt = Carbon::parse('next monday')->addHours(10);
            //     }
            //     else if ($dt->hour > 18) {
            //         if ($dt->dayOfWeek == 4) {
            //             $dt = Carbon::parse('next monday')->addHours(10);
            //         }
            //         else {
            //             $dt = Carbon::parse('tomorrow')->addHours(10);
            //         }    
            //     }
            // }
            // else if ($this->settings->get('tickets.send_ticket_after_office_hours')) {
            //     if ($dt->hour > 18) {
            //         $dt = Carbon::parse('tomorrow')->addHours(10);
            //     }
            // }
            $diff = $dt->diffInSeconds($now);
            $this->mailer->later(100, new TicketCreatedNotification($event->ticket));
        }
    }

    /**
     * Handle ticket updated event.
     *
     * @param TicketUpdated $event
     */
    public function onTicketUpdated(TicketUpdated $event)
    {
        $this->triggersCycle->runAgainstTicket($event->updatedTicket, $event->originalTicket);
    }


    /**
     * Handle group assigned event.
     *
     * @param GroupAssigned $event
     */
    public function onGroupAssigned(GroupAssigned $event)
    {
    }

    /**
     * Register the listeners for the subscriber.
     *
     * @param Dispatcher $events
     */
    public function subscribe($events)
    {
        $events->listen(
            'App\Events\TicketCreated',
            'App\Listeners\TicketEventSubscriber@onTicketCreated'
        );

        $events->listen(
            'App\Events\TicketUpdated',
            'App\Listeners\TicketEventSubscriber@onTicketUpdated'
        );

        $events->listen(
            'App\Events\GroupAssigned',
            'App\Listeners\TicketEventSubscriber@onGroupAssigned'
        );
    }

}