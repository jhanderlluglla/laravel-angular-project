<?php namespace App;

use DB;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Tag;
use App\TicketPriority;
/**
 * App\Ticket
 *
 * @property integer $id
 * @property string $subject
 * @property integer $user_id
 * @property \Carbon\Carbon $closed_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property integer $closed_by
 * @property integer $assigned_to
 * @property-read \App\User $user
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Tag[] $tags
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Reply[] $replies
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket whereId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket whereSubject($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket whereUserId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket whereClosedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket whereCreatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket whereClosedBy($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket whereAssignedTo($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket filterByTag($tag = null)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket filterByAssignee($agentId)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket filterByRequester($userId)
 * @method static \Illuminate\Database\Query\Builder|\App\Ticket compact()
 * @mixin \Eloquent
 * @property-read mixed $status
 * @property-read mixed $uploads_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Tag[] $categories
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Reply[] $latest_replies
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Reply[] $notes
 * @property-read \App\Reply $latest_reply
 * @property-read mixed $updated_at_formatted
 * @property-read int $attachments_count
 * @property-read \App\Reply $latest_creator_reply
 * @property-read \App\Reply $repliesCount
 */
class Ticket extends Model
{
    use Searchable;

    /**
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        $array = $this->toArray();

        $array['replies'] = $this->replies->pluck('body');
        $array['user'] = $this->user ? $this->user->toSearchableArray() : [];

        if (config('scout.driver') === 'tntsearch') {
            $array['replies'] = $array['replies']->implode(',');
            $array['user'] = Arr::get($array, 'user.email');
        }

        return $array;
    }

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = ['id', 'animated'];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = ['id' => 'integer', 'user_id' => 'integer', 'assigned_to' => 'integer'];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['created_at', 'updated_at', 'deleted_at', 'closed_at'];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['updated_at_formatted'];

    /**
     * Many to one relationship with user model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('App\User');
    }

    /**
     * Tags that are attached to ticket.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function tags()
    {
        return $this->morphToMany('App\Tag', 'taggable');
    }

    /**
     * Folders ticket is attached to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function categories()
    {
        return $this->morphToMany('App\Tag', 'taggable')->where('tags.type', 'category');
    }

    /**
     * One to many relationship with Reply model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function replies()
    {
        return $this->hasMany('App\Reply')->orderBy('created_at', 'desc');
    }

    /**
     * Get count of ticket replies without loading all replies.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne;
     */
    public function repliesCount()
    {
        return $this->hasOne(Reply::class)
            ->selectRaw('ticket_id, count(*) as aggregate')
            ->groupBy('ticket_id');
    }

    /**
     * One to many relationship with Reply model. Returns only 5 latest replies.
     *
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function latest_replies()
    {
        return $this->hasMany('App\Reply')->where('type', 'replies')->orderBy('created_at', 'desc')->limit(5);
    }

    /**
     * Many to one relationship with group model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\hasOne
     */
    public function assigned_group() {
        return $this->morphToMany('App\Tag', 'taggable')->where('tags.type', 'category')->join('taggables as a', 'a.tag_id', '=', 'tags.id')->where('a.taggable_type', 'App\Group')->join('groups', 'groups.id', '=', 'a.taggable_id')->select('groups.name', 'groups.color');
    }


    /**
     * Many to one relationship with user Modal.
     *
     * @return \Illuminate\Database\Eloquent\Relations\hasOne
     */
    public function assigned_user() {
        return $this->belongsTo('App\User', 'assigned_to');
    }

    /**
     * Get latest reply for ticket.
     *
     * @return \Illuminate\Database\Eloquent\Relations\hasOne
     */
    public function latest_reply()
    {
        return $this->hasOne('App\Reply')->where('type', 'replies')->orderBy('created_at', 'desc');
    }

    /**
     * One to many relationship with Reply model (filtered to notes only).
     *
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function notes()
    {
        return $this->hasMany('App\Reply')->orderBy('created_at', 'desc')->where('type', 'notes');
    }

    public function getUpdatedAtFormattedAttribute()
    {
        if (isset($this->attributes['updated_at'])) {
            return (new Carbon($this->attributes['updated_at']))->diffForHumans();
        }
    }

    /**
     * Search tickets using basic mysql LIKE query.
     *
     * @param $query
     * @return Builder|Ticket
     */
    public function basicSearch($query)
    {
        return $this->where('subject', 'LIKE', "%$query%")
            ->orWhereHas('replies', function(Builder $q) use ($query) {
                return $q->where('type', 'replies')->where('body', 'LIKE', "%$query%");
            });
    }

    /**
     * Get ticket status.
     *
     * @return string|null
     */
    public function getStatusAttribute()
    {
        //if tags are already loaded, use those records to avoid extra db query
        if ($this->relationLoaded('tags')) {
            $tag = array_first($this->tags, function($tag) {
                return $tag['type'] === 'status';
            });

            //otherwise fetch status tag from db
        } else {
            $tag = $this->load('tags');
            return $this->getStatusAttribute();
        }

        return $tag ? $tag['name'] : null;
    }

    public function getCategoryNames() {
        //if tags are already loaded, use those records to avoid extra db query
        if ($this->relationLoaded('categories')) {
            $names = [];
            foreach ($this->categories as $cat) {
                $names[] = $cat->name;
            }
            return join(',', $names);
            //otherwise fetch status tag from db
        } else {
            $tag = $this->load('categories');
            return $this->getCategoryNames();
        }
    }

    /**
     * Get number of uploads that are attached to this ticket.
     *
     * @param mixed $value
     * @return int
     */
    public function getUploadsCountAttribute($value)
    {
        if (is_numeric($value)) return (integer) $value;

        return DB::table('uploadables')->whereIn('uploadable_id', function (Builder $query)
            {
                return $query
                    ->from('replies')
                    ->where('replies.ticket_id', $this->id)
                    ->select('id');
            })
            ->where('uploadable_type', Reply::class)
            ->count();
    }

    /**
     * Apply given filter to query.
     *
     * @param Builder $q
     * @param string|integer $tag
     * @return Builder
     */
    public function scopeFilterByTag($q, $tag)
    {
        return $q->whereHas('tags', function(Builder $query) use($tag) {
            $query->where('tag_id', (int) $tag);
        });
    }

    /**
     * Filter tickets by given agent ID.
     *
     * @param Builder $q
     * @param string|int $agentId
     * @return Builder
     */
    public function scopeFilterByAssignee($q, $agentId)
    {
        if ( ! $agentId) return $q;

        return $q->where('assigned_to', (int) $agentId);
    }

    /**
     * Filter tickets by given user ID.
     *
     * @param Builder $q
     * @param int|string $userId
     * @return Builder
     */
    public function scopeFilterByRequester($q, $userId)
    {
        if ( ! $userId) return $q;

        return $q->where('user_id', (int) $userId);
    }

    /**
     * Return only minimal data for each model.
     *
     * @param Builder $query
     * @param int $length
     * @return mixed
     */
    public function scopeCompact($query, $length = 200)
    {
        return $query->with(['latest_reply' => function($q) use($length) {
            return $q->select('id', 'ticket_id', DB::raw("SUBSTR(body, 1, $length) as body"));
        }]);
    }

    public function priority() {
        return $this->belongsTo('App\Priority');
    }
}
