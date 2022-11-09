<?php

use App\Action;
use App\Ticket;
use App\Trigger;
use App\Services\Triggers\Actions\Actions;
use App\Services\Triggers\Actions\AddNoteToTicketAction;

class ActionsTest extends TestCase
{
    public function test_it_checks_if_specified_actions_update_ticket()
    {
        $actionsService = App::make(Actions::class);

        $actions1 = [['updates_ticket' => 1], ['updates_ticket' => 0]];
        $this->assertTrue($actionsService->updatesTicket($actions1));

        $actions2 = [['updates_ticket' => 0], ['updates_ticket' => 0]];
        $this->assertFalse($actionsService->updatesTicket($actions2));
    }

    public function test_it_checks_if_specified_actions_aborts_cycle()
    {
        $actionsService = App::make(Actions::class);

        $actions1 = [['aborts_cycle' => 1], ['aborts_cycle' => 0]];
        $this->assertTrue($actionsService->abortsCycle($actions1));

        $actions2 = [['aborts_cycle' => 0], ['aborts_cycle' => 0]];
        $this->assertFalse($actionsService->abortsCycle($actions2));
    }

    public function test_it_breaks_actions_cycle_if_action_model_is_set_to_abort_cycle()
    {
        //if perform and getAction methods are called only once
        //then actions cycle was aborted and test passes

        $action = Mockery::mock(AddNoteToTicketAction::class);
        $action->shouldReceive('perform')->withAnyArgs()->once();

        $actionsService = Mockery::mock(Actions::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods()
            ->shouldReceive('getAction')->once()->andReturn($action)->getMock();

        $trigger = new Trigger;
        $trigger->setRelation('actions', [
            new Action(['name' => 'foo', 'aborts_cycle' => 1]),
            new Action(['name' => 'bar', 'aborts_cycle' => 0]),
        ]);

        $actionsService->perform(new Ticket, $trigger);
    }
}