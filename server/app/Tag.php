<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Tag
 *
 * @property integer $id
 * @property string $name
 * @property string $type
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property string $display_name
 * @method static \Illuminate\Database\Query\Builder|\App\Tag whereId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Tag whereName($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Tag whereType($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Tag whereCreatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Tag whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Tag whereDisplayName($value)
 * @mixin \Eloquent
 */
class Tag extends Model
{
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = ['created_at', 'updated_at', 'pivot'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name', 'type', 'display_name'];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = ['id' => 'integer', 'tickets_count' => 'integer'];

    /**
     * Get all of the tickets that are assigned this tag.
     */
    public function tickets()
    {
        return $this->morphedByMany('App\Ticket', 'taggable');
    }

    /**
     * Get all of the groups that are assigned this tag.
     */
    public function groups()
    {
        return $this->morphedByMany('App\Group', 'taggable');
    }

    /**
     * Get all of the uploads that are assigned this tag.
     */
    public function uploads()
    {
        return $this->morphedByMany('App\Upload', 'taggable');
    }

    /**
     * Get all of the articles that are assigned this tag.
     */
    public function articles()
    {
        return $this->morphedByMany('App\Article', 'taggable');
    }

    /**
     * Return tag display name if exists, otherwise return tag name.
     *
     * @param string $value
     * @return string
     */
    public function getDisplayNameAttribute($value)
    {
        return $value ? $value : $this->attributes['name'];
    }

    public function escalation_rule() {
        return $this->hasMany('App\EscalationRule');
    }
}