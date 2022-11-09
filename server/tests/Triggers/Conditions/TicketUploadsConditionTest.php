<?php

class TicketUploadsConditionTest extends BaseConditionTestCase
{
    public function test_it_checks_if_condition_is_met_using_equals_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:uploads',
            'operator_name'   => 'equals',
            'condition_value' => 2,
            'pass_test_ticket_value'  => 2,
            'fail_test_ticket_value'  => 1,
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_not_equals_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:uploads',
            'operator_name'   => 'not_equals',
            'condition_value' => 2,
            'pass_test_ticket_value'  => 1,
            'fail_test_ticket_value'  => 2,
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_more_then_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:uploads',
            'operator_name'   => 'more',
            'condition_value' => 2,
            'pass_test_ticket_value'  => 3,
            'fail_test_ticket_value'  => 1,
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_less_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:uploads',
            'operator_name'   => 'less',
            'condition_value' => 2,
            'pass_test_ticket_value'  => 1,
            'fail_test_ticket_value'  => 2,
        ]);
    }

    protected function getTicketModel($number = null)
    {
        $ticketMock = Mockery::mock('App\Ticket[getUploadsCountAttribute]');
        $ticketMock->shouldReceive('getUploadsCountAttribute')->andReturn($number);

        return $ticketMock;
    }
}
