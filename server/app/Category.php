<?php namespace App;

use App\Traits\OrdersByPosition;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Category
 *
 * @property integer $id
 * @property string $name
 * @property string $description
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property integer $position
 * @method static \Illuminate\Database\Query\Builder|\App\Category whereId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Category whereName($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Category whereDescription($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Category whereCreatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Category whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Category wherePosition($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Category withCompactArticles()
 * @method static \Illuminate\Database\Query\Builder|\App\Category orderByPosition()
 * @mixin \Eloquent
 * @property bool $default
 * @method static \Illuminate\Database\Query\Builder|\App\Category whereDefault($value)
 * @property int $parent_id
 * @property bool $hidden
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Article[] $articles
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Category[] $children
 * @property-read \App\Category $parent
 * @method static \Illuminate\Database\Query\Builder|\App\Category rootOnly()
 * @method static \Illuminate\Database\Query\Builder|\App\Category whereHidden($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Category whereParentId($value)
 */
class Category extends Model
{
    use OrdersByPosition;

    protected $guarded = ['id'];

    protected $casts = [
        'id'        => 'integer',
        'default'   => 'boolean',
        'parent_id' => 'integer',
        'position'  => 'integer',
        'hidden'    => 'integer',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = ['pivot'];

    /**
     * Child categories.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function children()
    {
        return $this->hasMany('App\Category', 'parent_id');
    }

    /**
     * Parent category.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function parent()
    {
        return $this->belongsTo('App\Category', 'parent_id');
    }

    /**
     * Help center articles attached to this category.
     */
    public function articles()
    {
        return $this->belongsToMany('App\Article', 'category_article')->where('draft', 0);
    }

    /**
     * Filter out child categories and only return root ones.
     *
     * @param $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRootOnly($query) {
        return $query->whereNull('parent_id');
    }
}
