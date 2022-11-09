<?php namespace App\Services;

use DB;
use Auth;
use App\Tag;
use App\Ticket;
use App\Group;
use App\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;

class TagRepository {

    /**
     * Tag model instance.
     *
     * @var Tag
     */
    private $tag;

    /**
     * Ticket model instance.
     *
     * @var Ticket
     */
    private $ticket;

    private $user;

    private $group;

    /**
     * Create new TagRepository instance.
     *
     * @param Tag $tag
     * @param Ticket $ticket
     */
    public function __construct(Tag $tag, Ticket $ticket, User $user, Group $group)
    {
        $this->tag = $tag;
        $this->ticket = $ticket;
        $this->group = $group;
        $this->user = $user;
    }

    /**
     * Find tag by id or throw error.
     *
     * @param integer $id
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     *
     * @return Tag
     */
    public function findOrFail($id)
    {
        return $this->tag->findOrFail($id);
    }

    /**
     * Return single or multiple tags matching given name(s).
     *
     * @param $name
     * @return Tag|Collection
     */
    public function findByName($name)
    {
        if (is_array($name)) {
            return $this->tag->whereIn('name', $name)->get();
        } else {
            return $this->tag->where('name', $name)->first();
        }
    }

    /**
     * Get all tags with category/status type and tickets count for each tag.
     *
     * @return Collection
     */
    public function getStatusAndCategoryTags()
    {
        $collection = [];
        if (Auth::check()) {

            $ticketIds = $this->user
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

            // check permission that user can see the spam and closed tags
            $statusQuery = $this->tag->where('type', 'status');

            if (!Auth::user()->hasPermission('tags.spam')) {
                $statusQuery->where('name', '!=', 'spam');
            }

            if (!Auth::user()->hasPermission('tags.closed')) {
                $statusQuery->where('name', '!=', 'closed');
            }

            $statusTags = $statusQuery->withCount(['tickets' => function($q) use($ticketIds) {
                if (!Auth::user()->isSuperAdmin() && !Auth::user()->hasPermission('tickets.all')) {
                    $q->whereIn('id', $ticketIds);
                }
            }])->get();

            //get category ids assigned to groups that contain user
            $catIds = $this->user
                ->join('user_group', 'users.id', '=', 'user_group.user_id')
                ->where('user_group.user_id', '=', Auth::user()->id)
                ->join('taggables', 'taggable_id','=' ,'user_group.group_id')
                ->where('taggable_type', 'App\Group')
                ->distinct()
                ->pluck('taggables.tag_id')
                ->toArray();
            
            $catQuery = $this->tag->where('type', 'category');
            if (!Auth::user()->isSuperAdmin() && !Auth::user()->hasPermission('tickets.all') ) {
                $catQuery = $catQuery->whereIn('id', $catIds);
            }

            //for category tags, only count tickets that are "open" or "pending"
            $categoryTags = $catQuery->withCount(['tickets' => function($q) {
                $q->whereHas('tags', function($q) {
                    $q->where('name', 'open')->orWhere('name', 'pending')->orWhere('name', 'closed');
                });
            }])->get();

            $collection = $statusTags->merge($categoryTags);
            
            $collection = $collection->add($this->getMineTicketsTag());
            $collection = $collection->add($this->getNoAssignedTicketsTag($ticketIds));
            
        }

        return $collection;
    }

    /**
     * Get tag for 'mine' tickets in agents mailbox.
     *
     * @return array
     */
    private function getMineTicketsTag() {
        return [
            'id' => 'mine',
            'name' => 'mine',
            'type' => 'status',
            'display_name' => 'Mine',
            'tickets_count' => $this->ticket->where('assigned_to', Auth::user()->id)->whereHas('tags', function($q) {
                    $q->where('tags.name', 'open')->orWhere('tags.name', 'pending');
            })->count(),
        ];
    }

    /**
     * Get tag for 'no assigned' tickets in agents mailbox.
     *
     * @return array
     */
    private function getNoAssignedTicketsTag($ticketIds) {
        $query = $this->ticket->whereNull('assigned_to');
        if (!Auth::user()->isSuperAdmin()) $query = $query->whereIn('id', $ticketIds);
        return [
            'id' => 'no_assigned',
            'name' => 'No Assigned',
            'type' => 'category',
            'display_name' => 'No Assigned',
            'tickets_count' => $query->count(),
        ];
    }

    /**
     * Paginate all tags using given params.
     *
     * @param array $params
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginateTags($params)
    {
        $orderBy    = isset($params['order_by']) ? $params['order_by'] : 'created_at';
        $orderDir   = isset($params['order_dir']) ? $params['order_dir'] : 'desc';
        $perPage    = isset($params['per_page']) ? $params['per_page'] : 13;
        $searchTerm = isset($params['query']) ? $params['query'] : null;
        $skipStatus = isset($params['skip_status_tags']) ? $params['skip_status_tags'] : null;

        $query = $this->tag->orderBy($orderBy, $orderDir);

        $query->whereNotIn('name', ['Agent Created', 'Email']);

        if (isset($params['type'])) {
            $query->where('type', $params['type']);
        }

        if (isset($params['with_counts'])) {
            $query->withCount('tickets');
        }

        if ($skipStatus) {
            $query->where('type', '!=', 'status');
        }


        if ($searchTerm) {
            $query->where('name', 'LIKE', "$searchTerm%");
        }

        return $query->paginate($perPage);
    }

    /**
     * Find tags of specified type.
     *
     * @param string $type
     * @param Model $taggable
     *
     * @return Collection
     */
    public function getByType($type, $taggable = null)
    {
        if ($taggable) {
            return $taggable->tags()->where('type', $type)->get();
        } else {
            return $this->tag->where('type', $type)->get();
        }
    }

    /**
     * Return tags matching given names. Create any that does not exist yet.
     *
     * @param array  $tagNames
     * @param string $type
     *
     * @return Collection
     */
    public function getByNamesOrCreate($tagNames, $type = 'custom')
    {
        //fetch existing tags
        $existing = $this->findByName($tagNames);

        //if all tags we need already exist, return them
        if (count($existing) === count($tagNames)) return $existing;

        //get tag names that we need to create
        $toCreate = array_diff($tagNames, $existing->pluck('name')->toArray());

        //create tags
        $this->tag->insert(array_map(function($tagName) use($type) {
            return ['name' => $tagName, 'type' => $type];
        }, $toCreate));

        //return all tags
        return $this->findByName($tagNames);
    }

    /**
     * Attach tag matching given name to ticketID.
     * 
     * @param Ticket $ticket
     * @param string $tagName
     */
    public function attachByName(Ticket $ticket, $tagName)
    {
        $tag = $this->findByName($tagName);

        if ( ! $tag) return;

        $this->attachById($ticket, $tag->id);
    }

    /**
     * Attach specified tags to given ticket.
     *
     * @param Ticket $ticket
     * @param array|int $tagIds
     */
    public function attachById(Ticket $ticket, $tagIds)
    {
        if ( ! is_array($tagIds)) $tagIds = [$tagIds];

        $alreadyAttached = $ticket->tags->pluck('id')->toArray();

        $ticket->tags()->attach(
            array_diff($tagIds, $alreadyAttached)
        );
    }

    /**
     * Detach specified tags from all taggables or only specified one.
     *
     * @param array|int $tagIds
     * @param Model|null $taggable
     */
    public function detachById($tagIds, Model $taggable = null)
    {
        if ( ! is_array($tagIds)) $tagIds = [$tagIds];

        $query = DB::table('taggables')->whereIn('tag_id', $tagIds);

        if ($taggable) {
            $query->where('taggable_id', $taggable->id)
                ->where('taggable_type', get_class($taggable));
        }

        $query->delete();
    }

    /**
     * Create a new tag.
     *
     * @param array $data
     * @return Tag
     */
    public function create($data)
    {
        return $this->tag->forceCreate([
            'name' => $data['name'],
            'type' => isset($data['type']) ? $data['type'] : 'custom',
            'display_name' => isset($data['display_name']) ? $data['display_name'] : $data['name'],
        ]);
    }

    /**
     * Update existing tag.
     *
     * @param Tag   $tag
     * @param array $data
     * @return Tag
     */
    public function update(Tag $tag, $data)
    {
        $tag->fill($data)->save();
        return $tag;
    }

    /**
     * Create new tag or update existing one with specified data.
     *
     * @param array $data
     * @return Tag
     */
    public function updateOrCreate($data)
    {
        return $this->tag->updateOrCreate(['name' => $data['name']], [
            'type' => isset($data['type']) ? $data['type'] : 'custom',
            'display_name' => isset($data['display_name']) ? $data['display_name'] : $data['name'],
        ]);
    }

    /**
     * Delete multiple tags and detach them from all taggables.
     */
    public function deleteMultiple($ids)
    {
        $this->tag->whereIn('id', $ids)->delete();
        $this->detachById($ids);
    }

    /**
     * Get validation rules for specified method.
     *
     * @param string $type
     * @param int    $tagId
     * @return array
     */
    public function getValidationRules($type = 'store', $tagId = null)
    {
        $rules = [
            'name' => 'required|string|between:2,80|unique:tags,name',
            'type' => 'required|string|in:default,custom,category',
            'display_name' => 'min:2|max:255|unique:tags,display_name'
        ];

        //make sure validation errors are not thrown if we're trying to update
        //this tags name or display name this the same value as current one
        if ($tagId) {
            $rules['name'].=",$tagId";
            $rules['display_name'].=",$tagId";
        }

        //remove 'required' validation if we're not getting rules for creating new tag
        if ($type !== 'store') {
            $rules = array_map(function($rule) { return str_replace('required|', '', $rule); }, $rules);
        }

        return $rules;
    }
}