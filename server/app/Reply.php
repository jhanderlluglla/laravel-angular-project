<?php namespace App;

use DB;
use App;
use Carbon\Carbon;
use App\Services\Settings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

/**
 * App\Reply
 *
 * @property integer $id
 * @property string $body
 * @property integer $user_id
 * @property integer $ticket_id
 * @property string $type
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Upload[] $uploads
 * @property-read \App\Ticket $ticket
 * @property-read \App\User $user
 * @method static \Illuminate\Database\Query\Builder|\App\Reply whereId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Reply whereBody($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Reply whereUserId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Reply whereTicketId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Reply whereType($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Reply whereCreatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Reply whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Reply compact()
 * @mixin \Eloquent
 * @property string $uuid
 * @method static \Illuminate\Database\Query\Builder|\App\Reply whereUuid($value)
 */
class Reply extends Model
{
    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'ticket_id' => 'integer',
    ];

    /**
     * The attributes that are not mass assignable.
     *
     * @var array
     */
    protected $guarded = ['id', 'animated'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = ['uuid'];

    /**
     * Many to many relationship with uploads model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\belongsToMany
     */
    public function uploads()
    {
        return $this->morphToMany('App\Upload', 'uploadable')->orderBy('created_at', 'desc');
    }

    /**
     * One to many relationship with ticket model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\belongsTo
     */
    public function ticket()
    {
        return $this->belongsTo('App\Ticket');
    }

    /**
     * Many to one relationship with user model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('App\User');
    }

    public function scopeCompact(Builder $q)
    {
        return $q->select('id', 'user_id', DB::raw('SUBSTRING(body, 1, 80) as body'));
    }

    public function getCreatedAtFormattedAttribute()
    {
        $format = App::make(Settings::class)->get('dates.format');
        return (new Carbon($this->attributes['created_at']))->formatLocalized($format);
    }
}
