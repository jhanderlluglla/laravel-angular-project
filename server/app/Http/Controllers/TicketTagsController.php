<?php namespace App\Http\Controllers;

use App\Ticket;
use App\User;
use Auth;
use Mail;
use Illuminate\Http\Request;
use App\Services\TagRepository;
use App\Services\Ticketing\TicketRepository;
use App\Services\Settings;

class TicketTagsController extends Controller
{
    /**
     * TicketRepository model instance.
     *
     * @var TicketRepository
     */
    private $tickets;

    /**
     * TicketRepository model instance.
     *
     * @var User
     */
    private $user;

    /**
     * Settings service.
     *
     * @var Settings
     */
    private $settings;

    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * @var TagRepository
     */
    private $tags;

    /**
     * TicketTagsController constructor.
     *
     * @param TicketRepository $tickets
     * @param Request $request
     * @param TagRepository $tags
     */
    public function __construct(TicketRepository $tickets, Request $request, TagRepository $tags, Settings $settings, User $user)
    {
        $this->tags    = $tags;
        $this->tickets = $tickets;
        $this->request = $request;
        $this->settings = $settings;
        $this->user = $user;
    }

    /**
     * Attach tag to specified tickets
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function add()
    {
        $this->authorize('update', Ticket::class);

        $this->validate($this->request, [
            'ids' => 'required|array',
            'tag' => 'required|string|max:255'
        ]);

        $tag = $this->tags->getByNamesOrCreate([$this->request->get('tag')])[0];

        $this->tickets->addTagToTickets(
            $this->request->input('ids'),
            $tag->id
        );

        // send email to user when group is assigned with new categories
        if ($this->settings->get('tickets.assigned_notification_email')) {

            $group_ids = $tag->groups->pluck('id')->toArray();

            $users = $this->user->whereHas('groups', function($q) use ($group_ids){
                $q->whereIn('group_id', $group_ids);
            })->get();

            $ticket_ids = array_map(function($ticket) {
                return 'AP'.$ticket;
            }, $this->request->input('ids'));
            $ticket_str = join(', ', $ticket_ids);
            foreach ($users as $key => $user) {
                Mail::raw("Tickets ". $ticket_str . ' ' . Auth::user()->first_name . " ". Auth::user()->last_name, function ($message) use($user){
                    $message->to($user->email, $user->name);
                });
            }
        }

        return $this->success(['data' => $tag]);
    }

    /**
     * Remove tag from specified tickets.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function remove()
    {
        $this->authorize('update', Ticket::class);

        $this->validate($this->request, [
            'ids' => 'required|array',
            'tag' => 'required|integer'
        ]);

        $this->tickets->removeTagFromTickets(
            $this->request->input('ids'),
            $this->request->input('tag')
        );

        return $this->success();
    }
}
