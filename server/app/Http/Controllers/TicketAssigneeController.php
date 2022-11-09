<?php namespace App\Http\Controllers;


use Mail;
use App\Ticket;
use Illuminate\Http\Request;
use App\Events\TicketUpdated;
use App\Services\Ticketing\TicketRepository;
use App\User;
use App\Services\Settings;


class TicketAssigneeController extends Controller
{
    /**
     * TicketRepository instance.
     *
     * @var TicketRepository
     */
    private $tickets;

    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * Settings Service.
     *
     * @var Settings
     */
    private $settings;

    /**
     * TicketAssigneeController constructor.
     *
     * @param TicketRepository $tickets
     * @param Request $request
     */
    public function __construct(TicketRepository $tickets, Request $request, Settings $settings)
    {
        $this->tickets = $tickets;
        $this->request   = $request;
        $this->settings = $settings;
    }

    /**
     * Assign ticket(s) to specified agent.
     */
    public function change()
    {
        $originalTickets = $this->tickets->find($this->request->get('tickets'));

        $this->authorize('update', Ticket::class);

        $this->validate($this->request, [
            'tickets'   => 'required|array|min:1',
            'tickets.*' => 'required|integer',
        ]);

        $this->tickets->assignToAgent(
            $this->request->get('tickets'),
            $this->request->get('user_id')
        );

        $user = User::find($this->request->get('user_id'));
        
        if ($this->settings->get('tickets.assigned_notification_email')) {
            Mail::raw('Tickets are assigned to you', function ($message) use($user){
                $message->to($user->email, $user->name);
            });
        }

        $updatedTickets = $this->tickets->find($this->request->get('tickets'));

        //fire ticket updated event for each updated ticket
        foreach($originalTickets as $k => $ticket) {

            event(new TicketUpdated($updatedTickets[$k], $originalTickets[$k]));
        }
    }

    /**
     * Assign ticket(s) to specified agent.
     */
    public function changePriority()
    {
        $originalTickets = $this->tickets->find($this->request->get('tickets'));

        $this->authorize('update', Ticket::class);

        $this->validate($this->request, [
            'tickets'   => 'required|array|min:1',
            'tickets.*' => 'required|integer',
        ]);

        $this->tickets->assignPriorityToTicket(
            $this->request->get('tickets'),
            $this->request->get('priority_id')
        );

        $updatedTickets = $this->tickets->find($this->request->get('tickets'));

        //fire ticket updated event for each updated ticket
        foreach($originalTickets as $k => $ticket) {

            event(new TicketUpdated($updatedTickets[$k], $originalTickets[$k]));
        }
    }

    private function getActionModel($data)
    {
        return new Action([
            'name'  => 'send_email_to_user',
            'pivot' => [
                'action_value' => json_encode($data)
            ]
        ]);
    }

}
