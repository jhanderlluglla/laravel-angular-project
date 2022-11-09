<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SupervisorRule extends Model
{
    
    protected $fillable = ['supervisor_id', 'rule_id'];

    public function escalation_rule() {
        return $this->belongsTo('App\EscalationRule');
    }

    public function supervisor() {
        return $this->belongsTo('App\Supervisor');
    }
}