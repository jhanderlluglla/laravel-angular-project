<?php

use App\Trigger;
use App\Operator;
use App\Condition;
use App\Services\Triggers\Conditions\Conditions;

abstract class BaseConditionTestCase extends TestCase
{
    protected function assertOperatorWorks($data)
    {
        if ( ! isset($data['pass_test_old_ticket_value'])) $data['pass_test_old_ticket_value'] = null;
        if ( ! isset($data['fail_test_old_ticket_value'])) $data['fail_test_old_ticket_value'] = null;
        if ( ! isset($data['pass_test_ticket_value'])) $data['pass_test_ticket_value'] = null;
        if ( ! isset($data['fail_test_ticket_value'])) $data['fail_test_ticket_value'] = null;
        if ( ! isset($data['condition_value'])) $data['condition_value'] = null;

        $trigger = $this->getTriggerModel($data['condition_name'], $data['operator_name'], $data['condition_value']);

        $conditions = $this->getConditionsService();

        $this->assertTrue(
            $conditions->areMet($trigger, $this->getTicketModel($data['pass_test_ticket_value']), $this->getOldTicketModel($data['pass_test_old_ticket_value'])),
            "should pass: {$data['condition_value']} {$trigger['conditions'][0]['selected_operator']['name']} {$data['pass_test_ticket_value']}"
        );

        $this->assertFalse(
            $conditions->areMet($trigger, $this->getTicketModel($data['fail_test_ticket_value']), $this->getOldTicketModel($data['fail_test_old_ticket_value'])),
            "should fail: {$data['condition_value']} {$trigger['conditions'][0]['selected_operator']['name']} {$data['fail_test_ticket_value']}"
        );

        //there should be no errors when ticket has no relationships or data
        $conditions->areMet($trigger, $this->getTicketModel(), $this->getOldTicketModel());
    }

    abstract protected function getTicketModel($data = null);

    protected function getOldTicketModel($data = null) {
        return null;
    }

    protected function getTriggerModel($condition, $operatorName, $value)
    {
        $trigger = new Trigger(['name' => 'foo bar']);

        $trigger->setRelation('conditions', collect([$this->getConditionModel($condition, $operatorName, $value)]));

        return $trigger;
    }

    protected function getConditionModel($conditionName, $operatorName, $value)
    {
        $seeder = App::make(TriggersTableSeeder::class);

        $operator = new Operator(array_first($seeder->operators, function($operator) use($operatorName) {
            return $operator['name'] === $operatorName;
        }));

        return new Condition(array_merge($seeder->conditions[$conditionName], [
            'pivot' => [
                'condition_value' => $value,
                'match_type' => 'any'
            ],
            'selected_operator' => $operator,
        ]));
    }

    /**
     * @return Conditions
     */
    protected function getConditionsService()
    {
        return App::make(Conditions::class);
    }
}
