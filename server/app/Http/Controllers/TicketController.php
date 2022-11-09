<?php namespace App\Http\Controllers;

use Auth;
use Mail;
use App\Ticket;
use App\Tag;
use Illuminate\Http\Request;
use App\Services\Ticketing\TicketRepository;
use App\Events\TicketCreated;
use Carbon\Carbon;

class TicketController extends Controller
{
    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * TicketsRepository Instance.
     *
     * @var TicketRepository
     */
    private $ticketRepository;

    /**
     * Tag Instance.
     *
     * @var Tag
     */
    private $tag;

    /**
     * TicketController constructor.
     *
     * @param Request $request
     * @param TicketRepository $ticketRepository
     */
    public function __construct(Request $request, TicketRepository $ticketRepository, Tag $tag)
    {
        $this->request = $request;
        $this->ticketRepository = $ticketRepository;
        $this->tag = $tag;
    }

    /**
     * Return a list of tickets.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function index()
    {
        $this->authorize('index', Ticket::class);

        $this->validate($this->request, [
            'tags'        => 'string|min:1',
            'assigned_to' => 'integer',
        ]);

        $tickets = $this->ticketRepository->paginateTickets($this->request->all());

        return $tickets;
    }

    /**
     * Return specified ticket.
     *
     * @param int $id
     * @return Ticket
     */
    public function show($id)
    {
        $ticket = $this->ticketRepository->findOrFail($id);

        $this->authorize('show', $ticket);

        $ticket = $this->ticketRepository->loadConversation($ticket);

        return $ticket;
    }

    /**
     * Create a new ticket.
     *
     * @return Ticket
     */
    public function store()
    {
        $this->authorize('store', Ticket::class);

        $this->validate($this->request, [
            'subject'       => 'required|min:3|max:255',
            'category'      => 'required|integer|min:1',
            'body'          => 'required|min:3',
            'uploads'       => 'array|max:5',
            'uploads.*'     => 'string|min:1',
            'tags'          => 'array|min:1|max:10',
            'tags.*'        => 'integer|min:1',
        ]);

        $ticket = $this->ticketRepository->create($this->request->all());

        $users = $this->ticketRepository->getUsersForCatId($this->request->get('category'));
        foreach ($users as $key => $user) {
            Mail::raw("New ticket(AP".$ticket->id.") is assigned to your group by ". Auth::user()->first_name . " ". Auth::user()->last_name, function ($message) use($user){
                    $message->to($user->email, $user->name);
                });
        }

        event(new TicketCreated($ticket));

        return response($ticket, 201);
    }

    /**
     * Delete tickets matching given ids.
     */
    public function destroy()
    {
        $this->authorize('destroy', Ticket::class);

        $this->validate($this->request, [
            'ids'    => 'required|array',
            'ids.*'  => 'required|integer',
        ]);

        $this->ticketRepository->deleteTickets($this->request->get('ids'));

        return $this->success([], 204);
    }
}
