<?php namespace App\Http\Controllers;

use App\Reply;
use App\Ticket;
use Illuminate\Http\Request;
use App\Http\Requests\ModifyReplies;
use App\Services\Ticketing\ReplyRepository;
use App\Services\Ticketing\TicketRepository;
use App\Services\Ticketing\TicketReplyCreator;

class TicketRepliesController extends Controller {

    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * RepliesRepository instance.
     *
     * @var ReplyRepository
     */
    private $replyRepository;

    /**
     * TicketRepository instance.
     *
     * @var TicketRepository
     */
    private $ticketRepository;

    /**
     * TicketRepliesController constructor.
     *
     * @param Request $request
     * @param ReplyRepository $replyRepository
     * @param TicketRepository $ticketRepository
     */
    public function __construct(Request $request, ReplyRepository $replyRepository, TicketRepository $ticketRepository)
    {
        $this->request = $request;
        $this->replyRepository = $replyRepository;
        $this->ticketRepository = $ticketRepository;
    }

    /**
     * Paginate specified ticket replies.
     *
     * @param int $ticketId
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function index($ticketId)
    {
        $ticket = Ticket::findOrFail($ticketId);

        $this->authorize([Reply::class, $ticket]);

        $params = $this->request->all();
        $params['ticket_id'] = $ticketId;

        return $this->replyRepository->paginate($params);
    }

    /**
     * Create a new reply for specified ticket.
     *
     * @param integer $ticketId
     * @param string $type
     * @param ModifyReplies $request
     * @param TicketReplyCreator $replyCreator
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store($ticketId, $type, ModifyReplies $request, TicketReplyCreator $replyCreator)
    {
        $ticket = $this->ticketRepository->find($ticketId);

        $this->authorize('store', [Reply::class, $ticket]);

        $reply = $replyCreator->create($ticket, $request->all(), $type, $request->user());

        return $this->success(['data' => $reply->toArray()], 201);
    }
}
