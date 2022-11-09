<?php

class TicketStatusConditionTest extends BaseConditionTestCase
{
    public function test_it_checks_if_conditions_is_met_using_is_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:status',
            'operator_name'   => 'is',
            'condition_value' => 'open',
            'pass_test_ticket_value'  => 'open',
            'fail_test_ticket_value'  => 'closed',
        ]);
    }

    public function test_it_checks_if_conditions_is_met_using_not_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:status',
            'operator_name'   => 'not',
            'condition_value' => 'open',
            'pass_test_ticket_value'  => 'closed',
            'fail_test_ticket_value'  => 'open',
        ]);
    }

    protected function getTicketModel($data = null)
    {
        $ticketMock = Mockery::mock('App\Ticket[getStatusAttribute]');
        $ticketMock->shouldReceive('getStatusAttribute')->andReturn($data);

        return $ticketMock;
    }
}
