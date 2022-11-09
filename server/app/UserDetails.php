<?php namespace App;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Profile
 *
 * @property integer $id
 * @property string $name
 * @property string $value
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @method static \Illuminate\Database\Query\Builder|\App\Setting whereId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Setting whereName($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Setting whereValue($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Setting whereCreatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Setting whereUpdatedAt($value)
 * @mixin \Eloquent
 * @property string $details
 * @property string $notes
 * @property int $user_id
 * @property-read \App\User $user
 * @method static \Illuminate\Database\Query\Builder|\App\Profile whereDetails($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Profile whereNotes($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Profile whereUserId($value)
 */
class UserDetails extends Model {

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['details', 'notes'];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * User profile belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
