<?php

use App\Group;
use App\Action;
use App\Trigger;
use App\Operator;
use App\Condition;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TriggersStoreTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_new_trigger()
    {
        $payload = $this->getNewTriggerPayload();

        $response = $this->asAdmin()->json('POST', "secure/triggers", $payload);
        $response->assertStatus(201);
        $response = $response->json();

        $trigger = Trigger::with(['conditions', 'actions'])->find($response['id']);

        //test trigger was created successfully
        $this->assertEquals($trigger['name'], $payload['name']);

        //test conditions were attached to trigger
        $this->assertCount(2, $trigger['conditions']);
        $this->assertEquals($payload['conditions'][0]['condition_id'], $trigger['conditions'][0]['id']);
        $this->assertEquals($payload['conditions'][1]['condition_id'], $trigger['conditions'][1]['id']);

        //test operator was attached to condition
        $this->assertEquals($payload['conditions'][0]['operator_id'], $trigger['conditions'][0]['pivot']['operator_id']);

        //test condition value was attached to condition
        $this->assertEquals($payload['conditions'][0]['value'], $trigger['conditions'][0]['pivot']['condition_value']);

        //test match type was attached to condition
        $this->assertEquals($payload['conditions'][0]['matchType'], $trigger['conditions'][0]['pivot']['match_type']);

        //test actions were attached to trigger
        $this->assertCount(2, $trigger['actions']);
        $this->assertEquals($payload['actions'][0]['action_id'], $trigger['actions'][0]['id']);
        $this->assertEquals($payload['actions'][1]['action_id'], $trigger['actions'][1]['id']);

        //test action value was attached to action
        $this->assertEquals(json_encode($payload['actions'][0]['value']), $trigger['actions'][0]['pivot']['action_value']);
    }

    public function test_not_logged_in_users_cant_create_triggers()
    {
        $response = $this->call('POST', "secure/triggers", $this->getNewTriggerPayload());
        $response->assertStatus(403);
    }

    public function test_users_with_proper_permissions_can_create_triggers()
    {
        $user = $this->getRegularUser();
        $user->permissions = '{"triggers.create":1}';
        $response = $this->actingAs($user)->call('POST', "secure/triggers", $this->getNewTriggerPayload());
        $response->assertStatus(201);
    }

    private function getNewTriggerPayload()
    {

        $conditions = factory(Condition::class, 2)->create();
        $actions    = factory(Action::class, 2)->create();

        $operator = factory(Operator::class)->create();
        $conditions[0]->operators()->attach($operator->id);
        $conditions[1]->operators()->attach($operator->id);

        return [
            'name' => str_random(),
            'description' => str_random(),
            'conditions' => [
                [
                    'condition_id' => $conditions[0]['id'],
                    'matchType'    => 'all',
                    'operator_id'  => $conditions[0]->operators->first()['id'],
                    'value'        => 'test_condition_value_0',
                ],
                [
                    'condition_id' => $conditions[1]['id'],
                    'matchType'    => 'all',
                    'operator_id'  => $conditions[1]->operators->first()['id'],
                    'value'        => 'test_condition_value_1',
                ]
            ],
            'actions' => [
                [
                    'action_id' => $actions[0]['id'],
                    'value'     => ['value' => 'test_action_value_0']
                ],
                [
                    'action_id' => $actions[1]['id'],
                    'value'     => ['value' => 'test_action_value_1']
                ]
            ]
        ];
    }
}
