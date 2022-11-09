<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Supervisor extends Model
{
    
    protected $fillable = ['name', 'email'];

    public function rule() {
        $this->hasMany('App\SupervisorRule', 'spervisor_id');
    }
}