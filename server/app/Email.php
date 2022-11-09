<?php namespace App;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Setting
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
 * @property string $address
 * @property int $user_id
 * @property-read \App\User $user
 * @method static \Illuminate\Database\Query\Builder|\App\Email whereAddress($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Email whereUserId($value)
 */
class Email extends Model {

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['address'];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * User this email belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
