<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Stage extends Model
{
    
    protected $fillable = ['name'];

    public function escalation_rule() {
    	return $this->hasMany('App\EscalationRule');
    }

}