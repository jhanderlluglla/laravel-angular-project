<?php

use App\Reply;
use App\Ticket;

class TicketBodyConditionTest extends BaseConditionTestCase
{
    public function test_it_checks_if_condition_is_met_using_contains_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:body',
            'operator_name'   => 'contains',
            'condition_value' => 'qux',
            'pass_test_ticket_value'  => 'foo bar baz qux',
            'fail_test_ticket_value'  => 'foo bar baz',
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_does_not_contain_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:body',
            'operator_name'   => 'not_contains',
            'condition_value' => 'qux',
            'pass_test_ticket_value'  => 'foo bar baz',
            'fail_test_ticket_value'  => 'foo bar baz qux',
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_starts_with_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:body',
            'operator_name'   => 'starts_with',
            'condition_value' => 'foo',
            'pass_test_ticket_value'  => 'foo bar baz',
            'fail_test_ticket_value'  => 'bar baz',
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_ends_with_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:body',
            'operator_name'   => 'ends_with',
            'condition_value' => 'baz',
            'pass_test_ticket_value'  => 'foo bar baz',
            'fail_test_ticket_value'  => 'foo bar',
        ]);
    }

    protected function getTicketModel($data = null)
    {
        $ticketMock = Mockery::mock('App\Ticket[getAttribute]');
        $ticketMock->shouldReceive('getAttribute')->with('latest_reply')->andReturn(
            new Reply(['body' => $data])
        );

        return $ticketMock;
    }
}
