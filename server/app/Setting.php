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
 */
class Setting extends Model {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'settings';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name', 'value'];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = ['private' => 'integer'];

    /**
     * Cast setting value to int, if it's a boolean number.
     *
     * @param string $value
     * @return int|string
     */
    public function getValueAttribute($value)
    {
        if ($value === '0' || $value === '1') {
            return (int) $value;
        }

        return $value;
    }
}
