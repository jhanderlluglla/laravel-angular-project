<?php

use App\Tag;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TriggersDeleteTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_multiple_triggers()
    {
        $triggers = factory(App\Trigger::class, 2)->create();
        $conditions = factory(App\Condition::class, 2)->make();
        $actions = factory(App\Action::class, 2)->make();

        $triggers->each(function(App\Trigger $trigger) use($conditions, $actions) {
            $trigger->conditions()->save($conditions[0], ['operator_id' => 1, 'condition_value' => 1, 'match_type' => 1]);
            $trigger->conditions()->save($conditions[1], ['operator_id' => 1, 'condition_value' => 1, 'match_type' => 1]);
            $trigger->actions()->save($actions[0]);
            $trigger->actions()->save($actions[1]);
        });

        $response = $this->asAdmin()->call('DELETE', "secure/triggers", ['ids' => $triggers->pluck('id')->toArray()]);
        $response->assertStatus(204);

        //deletes tags
        $this->assertDatabaseMissing('triggers', ['id' => $triggers[0]->id]);
        $this->assertDatabaseMissing('triggers', ['id' => $triggers[1]->id]);

        //detaches conditions from triggers, but does not deletes conditions
        $this->assertDatabaseMissing('trigger_condition', ['condition_id' => $conditions[0]->id]);
        $this->assertDatabaseMissing('trigger_condition', ['condition_id' => $conditions[1]->id]);
        $this->assertDatabaseHas('conditions', ['id' => $conditions[0]->id]);
        $this->assertDatabaseHas('conditions', ['id' => $conditions[1]->id]);

        //detaches actions from triggers, but does not deletes actions
        $this->assertDatabaseMissing('trigger_action', ['action_id' => $actions[0]->id]);
        $this->assertDatabaseMissing('trigger_action', ['action_id' => $actions[1]->id]);
        $this->assertDatabaseHas('actions', ['id' => $actions[0]->id]);
        $this->assertDatabaseHas('actions', ['id' => $actions[1]->id]);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('DELETE', "secure/triggers");
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('ids', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $trigger = factory(App\Trigger::class)->create();
        $user = $this->getRegularUser();

        //guests can't delete triggers
        $response = $this->call('DELETE', "secure/triggers", ['ids' => [$trigger->id]]);
        $response->assertStatus(403);

        //regular users can't delete triggers
        $response = $this->asRegularUser()->call('DELETE', "secure/triggers", ['ids' => [$trigger->id]]);
        $response->assertStatus(403);

        //user with permission can delete triggers
        $user->permissions = '{"triggers.delete":1}';
        $response = $this->actingAs($user)->call('DELETE', "secure/triggers", ['ids' => [$trigger->id]]);
        $response->assertStatus(204);
    }
}
