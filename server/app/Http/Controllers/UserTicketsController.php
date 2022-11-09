<?php namespace App\Http\Controllers;

use App\Ticket;
use App\Services\Auth\UserRepository;
use Illuminate\Database\Eloquent\Collection;

class UserTicketsController extends Controller
{
    /**
     * UserRepository instance.
     *
     * @var UserRepository
     */
    private $users;

    /**
     * UserTicketsController constructor.
     *
     * @param UserRepository $users
     */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    /**
     * Paginate all users tickets.
     *
     * @param int $userId
     * @return Collection
     */
    public function index($userId)
    {
        $this->authorize('index', [Ticket::class, $userId]);

        $items = $this->users->findOrFail($userId)
            ->tickets()
            ->with('tags', 'latest_reply')
            ->withCount('replies')
            ->paginate(15);

        //remove html tags from replies
        $items->each(function($ticket) {
            if ($ticket->latest_reply) {
                $ticket->latest_reply->body = str_limit(strip_tags($ticket->latest_reply->body), 335);
            }
        });

        return $items;
    }
}
