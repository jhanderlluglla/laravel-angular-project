<?php namespace App\Console\Commands;

use DB;
use App\EscalationRule;
use Illuminate\Console\Command;
use App\Events\EscalationRuleEvent;
use Carbon\Carbon;

class TicketEscalation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ticket:escalation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check Ticket Escalation';

    protected $escalation ;

    /**
     * Create a new command instance.
     */
    public function __construct(EscalationRule $escalationRule)
    {
        parent::__construct();
        $this->escalation = $escalationRule;
    }

    /**
     * Execute the console command.
     *
     * @param Ticket $ticket
     */
    public function handle()
    {
        $rules = $this->escalation
                ->where('is_started', '1')
                ->get();
        foreach ($rules as $key => $rule) {
            $minutes = (int)$rule->minutes;
            if (Carbon::now()->diffInMinutes($rule->updated_at) < $minutes) {
                $rule['is_started'] = 0;
                $rule->save();
                event(new EscalationRuleEvent($rule));
            }
        }
    }
}
