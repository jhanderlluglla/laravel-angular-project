<?php

use App\Tag;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TriggersCreateTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_new_trigger()
    {
        $payload = $this->getPayload();

        $response = $this->asAdmin()->call('POST', "secure/triggers", $payload);
        $response->assertStatus(201);

        $trigger = App\Trigger::where('name', $payload['name'])->first();

        //creates new trigger
        $this->assertNotNull($trigger);

        //attaches conditions
        $this->assertCount(2, $trigger->conditions);

        //attaches condition of type "all"
        $this->assertEquals('ticket:subject', $trigger->conditions[0]['type']);
        $this->assertEquals('foo', $trigger->conditions[0]->pivot->condition_value);
        $this->assertEquals('all', $trigger->conditions[0]->pivot->match_type);
        $this->assertEquals(1, $trigger->conditions[0]->pivot->operator_id);

        //attaches condition of type "any"
        $this->assertEquals('ticket:body', $trigger->conditions[1]['type']);
        $this->assertEquals('bar', $trigger->conditions[1]->pivot->condition_value);
        $this->assertEquals('any', $trigger->conditions[1]->pivot->match_type);
        $this->assertEquals(1, $trigger->conditions[1]->pivot->operator_id);

        //attaches actions
        $this->assertCount(1, $trigger->actions);
        $this->assertEquals('add_note_to_ticket', $trigger->actions[0]->name);
        $this->assertEquals('baz', json_decode($trigger->actions[0]->pivot->action_value)->note_text);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', "secure/triggers");
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('name', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $payload = $this->getPayload();
        $user = $this->getRegularUser();

        //guests can't create triggers
        $response = $this->call('POST', "secure/triggers", $payload);
        $response->assertStatus(403);

        //regular users can't create triggers
        $response = $this->asRegularUser()->call('POST', "secure/triggers", $payload);
        $response->assertStatus(403);

        //user with permissions can create triggers
        $user->permissions = '{"triggers.create":1}';
        $response = $this->actingAs($user)->call('POST', "secure/triggers", $payload);
        $response->assertStatus(201);
    }

    /**
     * Get payload for creating a new trigger.
     *
     * @return array
     */
    private function getPayload() {
        return json_decode(file_get_contents(base_path('tests/Admin/Triggers/trigger-payload.json')), true);
    }
}
