<?php namespace App\Services\Ticketing;

use DB;
use Auth;
use App\Tag;
use App\Reply;
use App\Ticket;
use App\User;
use App\Group;
use App\Services\Settings;
use App\Services\Auth\UserRepository;
use Illuminate\Support\Arr;
use App\Services\TagRepository;
use App\Services\Files\UploadsRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TicketRepository {

    /**
     * Reply model instance.
     *
     * @var Reply
     */
    private $reply;

    /**
     * Ticket model instance.
     *
     * @var Ticket
     */
    private $ticket;

    /**
     * Tag model instance.
     *
     * @var Tag
     */
    private $tag;

    private $user;
    private $group;
    private $userRepository;

    /**
     * TagRepository instance.
     *
     * @var TagRepository
     */
    private $tagRepository;

    /**
     * ReplyRepository instance.
     *
     * @var ReplyRepository
     */
    private $replyRepository;

    /**
     * UploadsRepository instance.
     *
     * @var UploadsRepository
     */
    private $uploadsRepository;

    /**
     * @var Settings
     */
    private $settings;

    /**
     * TicketRepository constructor.
     *
     * @param Tag $tag
     * @param Reply $reply
     * @param Ticket $ticket
     * @param Settings $settings
     * @param TagRepository $tagRepository
     * @param ReplyRepository $replyRepository
     * @param UploadsRepository $uploadsRepository
     */
    public function __construct(
        Tag $tag,
        Reply $reply,
        Ticket $ticket,
        Settings $settings,
        TagRepository $tagRepository,
        ReplyRepository $replyRepository,
        UploadsRepository $uploadsRepository,
        UserRepository $userRepository,
        Group $group,
        User $user
    )
    {
        $this->tag = $tag;
        $this->reply = $reply;
        $this->ticket = $ticket;
        $this->settings = $settings;
        $this->tagRepository = $tagRepository;
        $this->replyRepository = $replyRepository;
        $this->uploadsRepository = $uploadsRepository;
        $this->userRepository = $userRepository;
        $this->user = $user;
        $this->group = $group;
    }

    /**
     * Find ticket by id.
     *
     * @param $id
     * @return Ticket
     */
    public function find($id)
    {
        return $this->ticket->find($id);
    }

    /**
     * Find ticket by id or fail.
     *
     * @throws ModelNotFoundException
     *
     * @param $id
     * @return Ticket
     */
    public function findOrFail($id)
    {
        return $this->ticket->findOrFail($id);
    }

    /**
     * Update tickets timestamps.
     *
     * @param Ticket $ticket
     * @return bool
     */
    public function touch(Ticket $ticket)
    {
        return $ticket->touch();
    }

    /**
     * Create a new ticket from specified data.
     *
     * @param array $data
     * @param bool  $markAsOpen
     *
     * @return Ticket
     */
    public function create($data, $markAsOpen = true)
    {
        $user = Auth::user();
        if ( Arr::has($data, 'user_id')) $user = $this->user->find($data['user_id']);
        else $data['user_id'] = $user->id;

        // when user is agent
        if ($user->isAgent() && !isset($data['is_customer'])) {
            // customer is existing.
            if (isset($data['customer']) && isset($data['customer']['id'])) {
                $data['user_id'] = $data['customer']['id'];
            }
            // customer is new.
            else if  (isset($data['customer']) && !isset($data['customer']['id'])) {
                $customer = $this->userRepository->create($data['customer']);
                $data['user_id'] = $customer['id'];
            }

        }

        /** @var Ticket $ticket */
        $ticket = $this->ticket->create(['user_id' => $data['user_id'], 'subject' => $data['subject']]);

        if ($markAsOpen) $this->tagRepository->attachByName($ticket, 'open');

        if (isset($data['category'])) {
            $this->tagRepository->attachById($ticket, $data['category']);
        }

        $tag_id = [];
        $tag_name = $user->isAgent() && !isset($data['is_customer']) ? 'Agent Created' : 'Email';
        
        $tag_id = $this->tag->where('name', $tag_name)->pluck('id')->toArray();
        if (count($tag_id) == 0) {
            $tag = $this->tag->create([
                'name' => $tag_name,
                'display_name' => $tag_name,
                'type' => 'default'
            ]);
            $tag_id = $tag['id'];
        }

        $this->tagRepository->attachById($ticket, $tag_id);

        $reply = $this->replyRepository->create(Arr::only($data, ['body', 'user_id']), $ticket);

        if (isset($data['uploads'])) {
            $this->uploadsRepository->attachUploadsToReply($reply, $data['uploads']);
        }

        return $ticket;
    }

    /**
     * Assign tickets to given agent or unassign if no agent id given.
     *
     * @param array    $ticketsIds
     * @param int|null $agentId
     */
    public function assignToAgent($ticketsIds, $agentId = null)
    {
        $this->ticket
             ->whereIn('id', $ticketsIds)
             ->update(['assigned_to' => $agentId]);
    }

    /**
     * Assign tickets to given agent or unassign if no agent id given.
     *
     * @param array    $ticketsIds
     * @param int|null $agentId
     */
    public function assignPriorityToTicket($ticketsIds, $priorityId = null)
    {
        $this->ticket
             ->whereIn('id', $ticketsIds)
             ->update(['priority_id' => $priorityId]);
    }

    /**
     * Load ticket matching given ID, as well as replies
     * and other relationships needed to display conversation.
     *
     * @param Ticket $ticket
     * @return Ticket
     */
    public function loadConversation(Ticket $ticket)
    {
        $ticket->load('tags', 'user', 'priority');

        $ticket->setRelation('replies', $this->replyRepository->getRepliesForTicket($ticket->id, 10));

        $ticket->replies->load('user', 'uploads')->each(function(Reply $reply) {
            $reply->created_at_formatted = $reply->created_at->diffForHumans();
        });

        $ticket->created_at_formatted = $ticket->created_at->diffForHumans();
        $ticket->created_at_month     = $ticket->created_at->formatLocalized('%B %d');

        return $ticket;
    }

    /**
     * Load ticket matching given ID, as well as replies
     * and other relationships needed to display conversation.
     *
     * @return TicketIds
     */
    public function getTicketIdsForUser() {
        return $this->user
                ->join('user_group', 'users.id', '=', 'user_group.user_id')
                ->where('user_group.user_id', '=', Auth::user()->id)
                ->join('taggables as a', 'a.taggable_id','=' ,'user_group.group_id')
                ->where('a.taggable_type', 'App\Group')
                ->select('a.*')
                ->join('taggables', 'taggables.tag_id', '=', 'a.tag_id')
                ->where('taggables.taggable_type', 'App\Ticket')
                ->join('tickets', function($q) {
                     $q->on('tickets.id', '=','taggables.taggable_id')->orWhere('tickets.assigned_to', Auth::user()->id);
                })
                ->select('tickets.*')
                ->distinct()
                ->pluck('tickets.id')
                ->toArray();
    }


    /**
     * Load ticket matching given ID, as well as replies
     * and other relationships needed to display conversation.
     *
     * @param integer $catid
     * @return users
     */
    public function getUsersForCatId($catId) {
        return $this->user->whereHas('groups', function($q) use($catId) {
            $q->join('taggables', 'taggable_id', '=', 'group_id')->join('tags', 'tag_id', '=', 'tags.id')->where('tags.id', $catId);
        })->get();
    }

    /**
     * Get a list of tickets filtered by current user permissions and optionally by tags.
     *
     * @param array $params
     * @return mixed
     */
    public function paginateTickets($params)
    {
        
        $query = $this->ticket->join('taggables', 'taggables.taggable_id', '=', 'tickets.id')
            ->where('taggables.taggable_type', 'App\Ticket')
            ->join('tags', 'tags.id', '=', 'taggables.tag_id')
            ->where('tags.type', '=', 'status')
            ->select('tickets.*', 'tags.name as status')
            ->with([
                'user',
                'tags', 
                'latest_reply', 
                'assigned_group',
                'assigned_user',
                'priority'
            ])
            ->withCount('replies');

        //  tickets asigned to user or his group when user is not SuperAdmin and has no tickets.all permission
        if (!Auth::user()->isSuperAdmin() && !Auth::user()->hasPermission('tickets.all')) {
            $ticketIds = $this->getTicketIdsForUser();
            $query->whereIn('tickets.id', $ticketIds);
        }

        $tagId     = isset($params['tag_id']) ? $params['tag_id'] : null;
        $priorityId= isset($params['priority_id']) ? $params['priority_id'] : null;
        $assignee  = isset($params['assigned_to']) ? $params['assigned_to'] : null;
        $requester = isset($params['user_id']) ? $params['user_id'] : null;
        $perPage   = isset($params['per_page']) ? (int) $params['per_page'] : 15;
        $page      = isset($params['page']) ? (int) $params['page'] : 1;

        //if tag id is "mine" we need to get tickets assigned to current user
        if ($tagId === 'mine' && !$assignee) $assignee = Auth::user()->id;

        //if tag id is "no_assigned" we need to get tickets not assigned;
        if ($tagId === 'no_assigned') $query->whereNull('assigned_to');

        //filter by tag
        if ($tagId && $tagId !== 'mine' && $tagId !== 'no_assigned') $query->filterByTag($tagId);

        // filter by priority
        if ($priorityId) $query->where('ticket_priority_id', $priorityId);

        //filter by assignee
        if ($assignee) $query->filterByAssignee($assignee);

        //get only tickets that specified user has created
        if ($requester) $query->filterByRequester($requester);

        $total = $query->newQuery()->count('tickets.id');

        $prefix = DB::getTablePrefix();
        $items = $query->orderByRaw("{$prefix}tags.name = 'open' desc, {$prefix}tickets.updated_at desc")->forPage($page, $perPage)->get();

        //remove html tags from replies and limit to 1 reply
        $group = $this->group;
        $items->each(function($ticket) use($group) {
            if ($ticket->latest_reply) {
                $ticket->latest_reply->body = str_limit(strip_tags($ticket->latest_reply->body), 300);
            }
            if ($ticket->assigned_to && count($ticket->assigned_group) == 0) {
                $userId = $ticket->assigned_to;
                foreach ($group->whereHas('users', function($q) use($userId){
                    $q->where('user_id', '=', $userId);
                })->get(['name', 'color'])->toArray() as $key => $group) {
                    $ticket->assigned_group[] = $group;
                }
            }
            
        });
        $cat_list = [];
        if ($tagId === 'mine') {
            $cat_info = [];
            foreach ($items as $key => $ticket) {
                $status = $ticket->getStatusAttribute();
                foreach ($ticket->categories as $key1 => $cat) {
                    $key = $cat->name;                                        
                    if (!array_key_exists($key, $cat_info)) {
                        $cat_info[$key] = [];
                        
                    }
                    if (array_key_exists($key, $cat_info)) {
                        
                        if (array_key_exists($status, $cat_info[$key])) {
                            $cat_info[$key][$status] += 1;
                        }
                        else $cat_info[$key][$status] = 1;
                    }
                }
            }
            foreach ($cat_info as $key => $cat) {
                $temp = ['category' => $key, 'status' => []];
                foreach ($cat as $key => $status) {
                    $temp['status'][] = ['name' => $key, 'count' => $status];
                }
                $cat_list[] = $temp;
            }
        }

        $result =  new LengthAwarePaginator($items, $total, $perPage);
        $result = $result->toArray();
        $result['categories_info'] = $cat_list;
        return $result;
    }

    /**
     * Attach a tag to specified tickets.
     *
     * @param array $ticketIds
     * @param string|int $tagId
     */
    public function addTagToTickets($ticketIds, $tagId)
    {
        $rows = DB::table('taggables')->whereIn('taggable_id', $ticketIds)->where('tag_id', $tagId)->where('taggable_type', Ticket::class)->get();

        //remove ticket ids that already have specified tag attached
        foreach($rows as $existingRel) {
            $key = array_search($existingRel->taggable_id, $ticketIds);
            if ($key !== false) unset($ticketIds[$key]);
        }

        $data = array_map(function($id) use($tagId) {
            return ['tag_id' => $tagId, 'taggable_id' => $id, 'taggable_type' => Ticket::class];
        }, $ticketIds);

        DB::table('taggables')->insert($data);
    }

    /**
     * Remove given tag from tickets matching specified ids.
     *
     * @param int[] $ticketsIds
     * @param int $tagId
     * @return int
     */
    public function removeTagFromTickets($ticketsIds, $tagId)
    {
        return DB::table('taggables')
            ->whereIn('taggable_id', $ticketsIds)
            ->where('tag_id', $tagId)
            ->where('taggable_type', Ticket::class)
            ->delete();
    }

    /**
     * Change status of multiple tickets to given one.
     *
     * @param array $ticketIds
     * @param string $statusName
     */
    public function changeStatus($ticketIds, $statusName)
    {
        $tags = $this->tagRepository->getByType('status');
        $existing = $tags->pluck('id')->toArray();

        //find tag of status we should put ticket in
        $statusTag = $tags->first(function($tag) use($statusName)  {
            return $tag->name === $statusName;
        });

        if ( ! $statusTag) return;

        //remove existing status tags from tickets
        DB::table('taggables')
            ->whereIn('taggable_id', $ticketIds)
            ->whereIn('tag_id', $existing)
            ->where('taggable_type', Ticket::class)
            ->delete();

        //add new status tag to tickets
        $insert = collect($ticketIds)->map(function($id) use($statusTag) {
            return ['tag_id' => $statusTag->id, 'taggable_id' => $id, 'taggable_type' => Ticket::class];
        });

        DB::table('taggables')->insert($insert->toArray());

        //touch "update_at" timestamp for all tickets
        $this->ticket->whereIn('id', $ticketIds)->update(['updated_at' => $this->ticket->freshTimestamp()]);
    }


    /**
     * Change status of specified ticket to 'open'.
     *
     * @param Ticket $ticket
     * @return Tag|boolean
     */
    public function open(Ticket $ticket)
    {
        $newTag = $this->tagRepository->findByName('open');

        if ( ! $newTag) return false;

        $currentTag = $this->tagRepository->getByType('status', $ticket)->first();

        if ($currentTag) {

            //pending tickets are already 'open' so no need to replace pending tags for them
            if ($currentTag->name == 'pending' && $newTag->name == 'open') {
                return $currentTag;
            }

            $ticket->tags()->detach($currentTag->id);
        }

        $ticket->tags()->attach($newTag->id);

        return $newTag;
    }

    /**
     * Delete tickets matching given ids.
     *
     * @param array $ids
     */
    public function deleteTickets($ids)
    {
        $replyIds = $this->reply->whereIn('ticket_id', $ids)->get(['id', 'ticket_id'])->pluck('id');

        //detach uploads from replies
        DB::table('uploadables')->whereIn('uploadable_id', $replyIds)->where('uploadable_type', Reply::class)->delete();

        //detach tags from tickets
        DB::table('taggables')->whereIn('taggable_id', $ids)->where('taggable_type', Ticket::class)->delete();

        //delete tickets replies
        $this->reply->whereIn('id', $replyIds)->delete();

        //delete tickets
        $this->ticket->whereIn('id', $ids)->delete();
    }

    public function merge($ticket1, $ticket2)
    {
        $ticket = $this->findOrFail($ticket1);
        $mergee = $this->findOrFail($ticket2);

        //merge replies (without touching timestamps)
        DB::table('replies')->where('ticket_id', $mergee->id)->update(['ticket_id' => $ticket->id]);

        //merge tags and delete mergee ticket
        $tagIds = $ticket->tags->pluck('id')->merge($mergee->tags->pluck('id'));
        $this->deleteTickets([$mergee->id]);
        $ticket->tags()->sync($tagIds);

        return $this->loadConversation($ticket);
    }
}