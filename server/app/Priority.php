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
class Priority extends Model
{
    protected $fillable = ['name'];
    
    /**
     * Get all of the tickets that are assigned this tag.
     */
    public function tickets()
    {
        return $this->hasMany('App\Ticket');
    }
}