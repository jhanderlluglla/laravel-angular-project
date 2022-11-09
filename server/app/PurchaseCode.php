<?php namespace App;

use Illuminate\Database\Eloquent\Model;

/**
 * App\EnvatoPurchaseCode
 *
 * @property int $id
 * @property string $code
 * @property int $user_id
 * @property string $item_name
 * @property string $item_id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property-read \App\User $user
 * @method static \Illuminate\Database\Query\Builder|\App\PurchaseCode whereId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\PurchaseCode whereCode($value)
 * @method static \Illuminate\Database\Query\Builder|\App\PurchaseCode whereUserId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\PurchaseCode whereItemName($value)
 * @method static \Illuminate\Database\Query\Builder|\App\PurchaseCode whereItemId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\PurchaseCode whereCreatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\PurchaseCode whereUpdatedAt($value)
 * @mixin \Eloquent
 * @property string $url
 * @property string $image
 * @property string $supported_until
 * @method static \Illuminate\Database\Query\Builder|\App\PurchaseCode whereImage($value)
 * @method static \Illuminate\Database\Query\Builder|\App\PurchaseCode whereSupportedUntil($value)
 * @method static \Illuminate\Database\Query\Builder|\App\PurchaseCode whereUrl($value)
 */
class PurchaseCode extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['id' => 'integer', 'user_id' => 'integer'];

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
