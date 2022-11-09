<?php

class TicketSubjectConditionTest extends BaseConditionTestCase
{
    public function test_it_checks_if_condition_is_met_using_contains_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:subject',
            'operator_name'   => 'contains',
            'condition_value' => 'qux',
            'pass_test_ticket_value'  => 'foo bar baz qux',
            'fail_test_ticket_value'  => 'foo bar baz',
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_does_not_contain_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:subject',
            'operator_name'   => 'not_contains',
            'condition_value' => 'qux',
            'pass_test_ticket_value'  => 'foo bar baz',
            'fail_test_ticket_value'  => 'foo bar baz qux',
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_starts_with_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:subject',
            'operator_name'   => 'starts_with',
            'condition_value' => 'foo',
            'pass_test_ticket_value'  => 'foo bar baz',
            'fail_test_ticket_value'  => 'bar baz',
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_ends_with_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:subject',
            'operator_name'   => 'ends_with',
            'condition_value' => 'baz',
            'pass_test_ticket_value'  => 'foo bar baz',
            'fail_test_ticket_value'  => 'foo bar',
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_equals_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:subject',
            'operator_name'   => 'equals',
            'condition_value' => 'foo bar',
            'pass_test_ticket_value'  => 'foo bar',
            'fail_test_ticket_value'  => 'foo bar baz',
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_not_equals_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:subject',
            'operator_name'   => 'not_equals',
            'condition_value' => 'foo bar',
            'pass_test_ticket_value'  => 'foo bar baz',
            'fail_test_ticket_value'  => 'foo bar',
        ]);
    }

    public function test_it_checks_if_condition_is_met_using_matches_regex_operator()
    {
        $this->assertOperatorWorks([
            'condition_name'  => 'ticket:subject',
            'operator_name'   => 'matches_regex',
            'condition_value' => 'foo.+?',
            'pass_test_ticket_value'  => 'foo bar',
            'fail_test_ticket_value'  => 'bar baz',
        ]);
    }

    protected function getTicketModel($subject = null)
    {
        return new App\Ticket(['subject' => $subject]);
    }
}
