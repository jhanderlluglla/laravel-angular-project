<?php

use App\Services\Triggers\Conditions\PrimitiveValuesComparator;
use App\Services\Triggers\Conditions\Ticket\TicketAssigneeCondition;

class TicketAssigneeConditionTest extends BaseConditionTestCase
{
    public function test_it_works_with_is_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:assignee',
            'operator_name'   => 'is',
            'condition_value' => 2,
            'pass_test_ticket_value' => 2,
            'fail_test_ticket_value' => 1,
        ]);
    }

    public function test_it_works_with_not_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:assignee',
            'operator_name'   => 'not',
            'condition_value' => 2,
            'pass_test_ticket_value' => 1,
            'fail_test_ticket_value' => 2,
        ]);
    }

    public function test_it_works_with_changed_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:assignee',
            'operator_name'   => 'changed',
            'pass_test_ticket_value' => 1,
            'fail_test_ticket_value' => 2,
            'pass_test_old_ticket_value' => 2,
            'fail_test_old_ticket_value' => 2,
        ]);

        $this->assertFailsIfAssigneeDidNotChange('changed');
    }

    public function test_it_works_with_changed_to_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:assignee',
            'operator_name'   => 'changed_to',
            'condition_value' => 2,
            'pass_test_ticket_value' => 2,
            'fail_test_ticket_value' => 1,
        ]);

        $this->assertFailsIfAssigneeDidNotChange('changed_to');
    }

    public function test_it_works_with_changed_from_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:assignee',
            'operator_name'   => 'changed_from',
            'condition_value' => 2,
            'pass_test_old_ticket_value' => 2,
            'fail_test_old_ticket_value' => 1,
        ]);

        $this->assertFailsIfAssigneeDidNotChange('changed_from');
    }

    public function test_it_works_with_not_changed_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:assignee',
            'operator_name'   => 'not_changed',
            'pass_test_ticket_value'  => 1,
            'fail_test_ticket_value'  => 1,
            'pass_test_old_ticket_value' => 1,
            'fail_test_old_ticket_value' => 2,
        ]);
    }

    public function test_it_works_with_not_changed_to_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:assignee',
            'operator_name'   => 'not_changed_to',
            'condition_value' => 2,
            'pass_test_ticket_value'  => 1,
            'fail_test_ticket_value'  => 2,
        ]);

        $this->assertFailsIfAssigneeDidNotChange('not_changed_to');
    }

    public function test_it_works_with_not_changed_from_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:assignee',
            'operator_name'   => 'not_changed_from',
            'condition_value' => 2,
            'pass_test_ticket_value'  => 4,
            'fail_test_ticket_value'  => 2,
            'pass_test_old_ticket_value' => 3,
            'fail_test_old_ticket_value' => 2,
        ]);

        $this->assertFailsIfAssigneeDidNotChange('not_changed_from');
    }

    private function assertFailsIfAssigneeDidNotChange($operatorName)
    {
        //always succeed primitive values comparison
        $comparator = Mockery::mock(PrimitiveValuesComparator::class);
        $comparator->shouldReceive('compareNumericValues')->andReturn(true);

        //always fail assignedChanged comparison method
        $condition = Mockery::mock(TicketAssigneeCondition::class, [$comparator])
            ->shouldAllowMockingProtectedMethods()
            ->makePartial()
            ->shouldReceive('assigneeChanged')
            ->andReturn(false)
            ->getMock();

        //condition should not be met if assignee did not change
        //even if other checks all return true (from comparator mock)
        $this->assertFalse(
            $condition->isMet($this->getTicketModel(2), $this->getOldTicketModel(2), $operatorName, 2),
            'Condition should not be met'
        );
    }

    protected function getTicketModel($id = null)
    {
        return new App\Ticket(['assigned_to' => $id]);
    }

    protected function getOldTicketModel($id = null) {
        return (new App\Ticket(['assigned_to' => $id]))->toArray();
    }
}
