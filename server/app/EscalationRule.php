<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class EscalationRule extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name', 'stage_id', 'tag_id', 'priority_id', 'minutes', 'is_started'];

    protected $dates = ['created_at', 'updated_at'];

    public $timestamps = true;

    /**
     * Get tag.
     */
    public function tag()
    {
        return $this->belongsTo('App\Tag');
    }

    /** 
     * Get all tickets related to Escalation Rules
     */
    public function getTickets() {
        $priorityId = $this->priority_id;
        $tagId = $this->tag->id;
        return \App\Ticket::whereIn('id', function($q) use($tagId){
            return $q->from('taggables')->join('escalation_rules', 'taggables.tag_id', 'escalation_rules.tag_id')->where('taggables.tag_id', $tagId)->select('taggables.taggable_id');
        })->where('priority_id', $priorityId)->get();
    }

    public function supervisors() {
        return $this->hasMany('App\SupervisorRule', 'rule_id')->join('supervisors', 'supervisors.id', '=', 'supervisor_id');
    }

    public function stage() {
        return $this->belongsTo('App\Stage');
    }

    public function priority() {
        return $this->belongsTo('App\Priority');
    }

}