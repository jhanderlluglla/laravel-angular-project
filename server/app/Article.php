<?php namespace App;

use DB;
use Laravel\Scout\Searchable;
use App\Traits\OrdersByPosition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

/**
 * App\Article
 *
 * @property integer $id
 * @property string $title
 * @property string $body
 * @property string $extra_data
 * @property boolean $draft
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property string $visibility
 * @property integer $views
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Tag[] $tags
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\ArticleFeedback[] $feedback
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereTitle($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereBody($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereExtraData($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereDraft($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereCreatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereViews($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Article filterByCategories($ids)
 * @method static \Illuminate\Database\Query\Builder|\App\Article filterByFoldersAndCategories($folderIds, $categoryIds)
 * @method static \Illuminate\Database\Query\Builder|\App\Article orderByFeedback($direction = 'desc')
 * @mixin \Eloquent
 * @property string $slug
 * @property string $description
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereSlug($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereDescription($value)
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Category[] $categories
 * @method static \Illuminate\Database\Query\Builder|\App\Article whereVisibility($value)
 * @property int $position
 * @method static \Illuminate\Database\Query\Builder|\App\Article filterByTags($names)
 * @method static \Illuminate\Database\Query\Builder|\App\Article orderByPosition()
 * @method static \Illuminate\Database\Query\Builder|\App\Article wherePosition($value)
 */
class Article extends Model
{
    use Searchable, OrdersByPosition;

    /**
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => strip_tags($this->body),
            'description' => $this->description,
        ];
    }

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = ['id'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = ['pivot'];

    /**
     * Fields articles can be ordered on. For validating user input against.
     *
     * @var array
     */
    public $orderFields = ['title', 'draft', 'visibility', 'views', 'was_helpful', 'created_at', 'updated_at', 'position'];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = ['id' => 'integer', 'was_helpful' => 'integer', 'position' => 'integer'];

    /**
     * Help center categories that this article is attached to.
     */
    public function categories()
    {
        return $this->belongsToMany('App\Category', 'category_article', 'article_id', 'category_id')->orderBy('parent_id', 'desc');
    }

    /**
     * Tags attached to this article.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function tags()
    {
        return $this->morphToMany('App\Tag', 'taggable');
    }

    /**
     * User feedback attach to this article.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function feedback()
    {
        return $this->hasMany(ArticleFeedback::class);
    }

    /**
     * Search articles using basic mysql LIKE query.
     *
     * @param $query
     * @return Builder
     */
    public function basicSearch($query)
    {
        return $this->where('title', 'like', "%$query%")
            ->orWhere('body', 'like', "%$query%")
            ->orWhereHas('tags', function($q) use ($query) {
                return $q->where('name', 'like', "%$query%")
                    ->orWhere('display_name', 'like', "%$query%");
            });
    }

    /**
     * Filter articles by specified categories.
     *
     * @param Builder $query
     * @param mixed $ids
     * @return mixed
     */
    public function scopeFilterByCategories($query, $ids)
    {
        if ( ! is_array($ids)) $ids = explode(',', $ids);

        return $query->whereHas('categories', function($q) use($ids) {
            $q->whereIn('categories.id', $ids);
        });
    }

    /**
     * Filter articles by specified tags.
     *
     * @param Builder $query
     * @param mixed $names
     * @return mixed
     */
    public function scopeFilterByTags($query, $names)
    {
        if ( ! is_array($names)) $names = explode(',', $names);

        return $query->whereHas('tags', function($q) use($names) {
            $q->whereIn('tags.name', $names);
        });
    }

    /**
     * Order articles by the amount of 'was helpful' user
     * feedback they have in hc_article_feedback table.
     *
     * @param Builder $query
     * @param string  $direction
     * @return mixed
     */
    public function scopeOrderByFeedback($query, $direction = 'desc')
    {
        $subQuery= '(SELECT count(*) FROM article_feedback WHERE was_helpful = 1 AND article_id = articles.id) as was_helpful';

        return $query->select('*', DB::raw($subQuery))->orderBy('was_helpful', $direction);
    }
}
