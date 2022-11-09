<?php namespace App;

use Illuminate\Database\Eloquent\Model;

/**
 * App\CannedReply
 *
 * @property integer $id
 * @property string $name
 * @property string $body
 * @property integer $user_id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Upload[] $uploads
 * @property-read \App\User $user
 * @method static \Illuminate\Database\Query\Builder|\App\CannedReply whereId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\CannedReply whereName($value)
 * @method static \Illuminate\Database\Query\Builder|\App\CannedReply whereBody($value)
 * @method static \Illuminate\Database\Query\Builder|\App\CannedReply whereUserId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\CannedReply whereCreatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\CannedReply whereUpdatedAt($value)
 * @mixin \Eloquent
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Upload[] $uploads
 */
class CannedReply extends Model
{
    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = ['id' => 'integer', 'user_id' => 'integer'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['body', 'name', 'user_id'];

    /**
     * Many to many relationship with uploads model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\belongsToMany
     */
    public function uploads()
    {
        return $this->morphToMany('App\Upload', 'uploadable');
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
}
