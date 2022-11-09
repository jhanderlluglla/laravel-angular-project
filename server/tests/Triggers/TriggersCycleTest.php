<?php

use App\Ticket;
use App\Action;
use App\Trigger;
use App\Operator;
use App\Condition;
use App\Services\Triggers\TriggersCycle;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TriggersCycleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_works_end_to_end()
    {
        $ticket = factory(Ticket::class)->create(['assigned_to' => 1]);

        $triggers = $this->createTriggers();

        $info = $this->getTriggersCycle()->runAgainstTicket($ticket, new Ticket);

        //triggers fired and performed their actions as expected and in correct order
        $this->assertEquals(3, $ticket->assigned_to);

        //fired triggers 3 times means cycle does not fire same triggers more then once
        $this->assertEquals(3, $info['timesFired']);

        //looped 8 times, means cycle aborts and restarts as expected
        $this->assertEquals(8, $info['timesLooped']);

        //trigger 'times fired' field was incremented properly
        $this->assertDatabaseHas('triggers', ['id' => $triggers[0]['id'], 'times_fired' => 1]);
        $this->assertDatabaseHas('triggers', ['id' => $triggers[1]['id'], 'times_fired' => 0]);

    }

    private function getTriggersCycle()
    {
        return App::make(TriggersCycle::class);
    }

    private function createTriggers()
    {
        //trigger1, should fire once
        $trigger1 = Trigger::firstOrCreate(['name' => 'trigger1']);

        //shared 'is' operator
        $operator = Operator::firstOrCreate(['name' => 'is', 'display_name' => 'is']);

        //shared 'ticket:assignee' condition
        $condition = Condition::firstOrCreate([
            'name' => 'Ticket Assignee',
            'type' => 'ticket:assignee'
        ]);

        //shared 'assign_ticket_to_agent'
        $action1 = Action::firstOrCreate([
            'name' => 'assign_ticket_to_agent',
            'display_name' => 'Assign to Agent',
            'aborts_cycle' => 0,
        ]);

        //attach condition to trigger1
        $trigger1->conditions()->sync([$condition->id => [
            'operator_id' => $operator->id,
            'condition_value' => 1,
            'match_type' => 'any'
        ]]);

        //attach action to trigger1
        $trigger1->actions()->attach($action1->id, [
            'action_value' => json_encode(['agent_id' => 2])
        ]);

        //trigger2, should not fire
        $trigger2 = Trigger::updateOrCreate(['name' => 'trigger2']);

        //trigger3, should fire once
        $trigger3 = Trigger::updateOrCreate(['name' => 'trigger3']);

        //attach condition to trigger3
        $trigger3->conditions()->sync([$condition->id => [
            'operator_id' => $operator->id,
            'condition_value' => 2,
            'match_type' => 'any'
        ]]);

        //assign action to trigger3
        $trigger3->actions()->attach($action1->id, [
            'action_value' => json_encode(['agent_id' => 3])
        ]);

        //trigger4, should fire once
        $trigger4 = Trigger::updateOrCreate(['name' => 'trigger4']);

        //attach condition to trigger4
        $trigger4->conditions()->sync([$condition->id => [
            'operator_id' => $operator->id,
            'condition_value' => 3,
            'match_type' => 'any'
        ]]);

        //create action for trigger4
        $action2 = Action::firstOrCreate([
            'name' => 'delete_ticket',
            'display_name' => 'Delete',
            'aborts_cycle' => 1,
        ]);

        //attach action to trigger4
        $trigger4->actions()->attach($action2->id);

        //triggers5, should not fire
        $trigger5 = Trigger::updateOrCreate(['name' => 'trigger5']);

        return [$trigger1, $trigger2, $trigger3, $trigger4, $trigger5];
    }
}
