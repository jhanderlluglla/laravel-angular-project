<?php

use App\Ticket;
use App\Trigger;
use App\Condition;
use App\Services\Triggers\Conditions\Conditions;

class ConditionsTest extends TestCase
{
    /*
    |--------------------------------------------------------------------------
    | Tests for when trigger has conditions with match type 'ANY
    |--------------------------------------------------------------------------
    */

    public function test_it_should_pass_if_there_is_only_one_any_condition_and_it_is_met()
    {
        $trigger = $this->getTrigger(['all' => 'none', 'any' => [0 => 'pass']]);

        $this->assertTrue($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_fail_if_there_is_only_one_any_condition_and_it_is_not_met()
    {
        $trigger = $this->getTrigger(['all' => 'none', 'any' => [0 => 'fail']]);

        $this->assertFalse($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_fail_if_there_are_multiple_any_conditions_and_none_are_met()
    {
        $trigger = $this->getTrigger(['all' => 'none', 'any' => [0 => 'fail', 1 => 'fail']]);

        $this->assertFalse($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_pass_if_there_are_multiple_any_conditions_and_one_of_them_is_met()
    {
        $trigger = $this->getTrigger(['all' => 'none', 'any' => [0 => 'fail', 1 => 'pass']]);

        $this->assertTrue($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_pass_if_there_are_multiple_any_conditions_and_all_of_them_are_met()
    {
        $trigger = $this->getTrigger(['all' => 'none', 'any' => [0 => 'pass', 1 => 'pass']]);

        $this->assertTrue($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    /*
    |--------------------------------------------------------------------------
    | Tests for when trigger has conditions with match type 'ALL'
    |--------------------------------------------------------------------------
    */

    public function test_it_should_pass_if_there_is_only_one_all_condition_and_it_is_met()
    {
        $trigger = $this->getTrigger(['all' => [0 => 'pass'], 'any' => 'none']);
        ;
        $this->assertTrue($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_pass_if_there_are_multiple_all_conditions_and_all_are_met()
    {
        $trigger = $this->getTrigger(['all' => [0 => 'pass', 1 => 'pass'], 'any' => 'none']);

        $this->assertTrue($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_fail_if_there_are_multiple_all_conditions_and_only_one_is_met()
    {
        $trigger = $this->getTrigger(['all' => [0 => 'pass', 1 => 'fail'], 'any' => 'none']);

        $this->assertFalse($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_fail_if_there_are_multiple_all_conditions_and_none_are_met()
    {
        $trigger = $this->getTrigger(['all' => [0 => 'fail', 1 => 'fail'], 'any' => 'none']);

        $this->assertFalse($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    /*
    |--------------------------------------------------------------------------
    | Tests for when trigger has conditions with match type 'ANY' and 'ALL'
    |--------------------------------------------------------------------------
    */

    public function test_it_should_fail_if_trigger_has_no_conditions()
    {
        $trigger = $this->getTrigger(['all' => 'none', 'any' => 'none']);

        $this->assertFalse($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_fail_if_one_any_condition_is_met_and_one_all_condition_is_not_met()
    {
        $trigger = $this->getTrigger(['all' => [0 => 'fail', 1 => 'pass'], 'any' => [0 => 'fail', 1 => 'pass']]);

        $this->assertFalse($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_fail_if_all_any_conditions_are_met_and_one_all_condition_is_not_met()
    {
        $trigger = $this->getTrigger(['all' => [0 => 'fail', 1 => 'pass'], 'any' => [0 => 'pass', 1 => 'pass']]);

        $this->assertFalse($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_pass_if_every_all_condition_is_met_and_only_one_any_condition_is_met()
    {
        $trigger = $this->getTrigger(['all' => [0 => 'pass', 1 => 'pass'], 'any' => [0 => 'fail', 1 => 'pass']]);

        $this->assertTrue($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    public function test_it_should_pass_if_every_condition_is_met()
    {
        $trigger = $this->getTrigger(['all' => [0 => 'pass', 1 => 'pass'], 'any' => [0 => 'pass', 1 => 'pass']]);

        $this->assertTrue($this->getConditionsService()->areMet($trigger, new Ticket));
    }

    private function getTrigger($params)
    {
        $trigger = new Trigger;

        $trigger->setRelation(
            'conditions',
            collect(array_merge(
                $this->getConditionsArray('all', $params['all']),
                $this->getConditionsArray('any', $params['any'])
            ))
        );

        return $trigger;
    }

    private function getConditionsArray($matchType, $count)
    {
        $conditions = [];

        if ($count === 'none') return $conditions;

        foreach($count as $returnType) {
            $conditions[] =  new Condition([
                'name'  => $returnType,
                'pivot' => [
                    'match_type' => $matchType
                ]
            ]);
        }

        return $conditions;
    }

    /**
     * @return Conditions
     */
    private function getConditionsService()
    {
        return Mockery::mock(Conditions::class)
            ->makePartial()
            ->shouldReceive('conditionIsMet')
            ->andReturnUsing(function($updatedTicket, $originalTicket, $condition) {
                return $condition['name'] === 'pass' ? true : false;
            })
            ->getMock();
    }
}
