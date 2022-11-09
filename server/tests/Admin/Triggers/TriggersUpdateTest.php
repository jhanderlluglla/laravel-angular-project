<?php

use App\Tag;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TriggersUpdateTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_updates_existing_trigger()
    {
        $trigger = factory(App\Trigger::class)->create();
        $payload = $this->getPayload();

        $response = $this->asAdmin()->call('PUT', "secure/triggers/$trigger->id", $payload);
        $response->assertStatus(200);

        //updates trigger
        $this->assertEquals($payload['name'], $response->json()['name']);
    }

    public function test_it_validates_user_input()
    {
        $trigger = factory(App\Trigger::class)->create();

        $response = $this->asAdmin()->json('PUT', "secure/triggers/$trigger->id");
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('name', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $trigger = factory(App\Trigger::class)->create();
        $payload = $this->getPayload();
        $user = $this->getRegularUser();

        //guests can't update triggers
        $response = $this->call('PUT', "secure/triggers/$trigger->id", $payload);
        $response->assertStatus(403);

        //regular users can't update triggers
        $response = $this->asRegularUser()->call('PUT', "secure/triggers/$trigger->id", $payload);
        $response->assertStatus(403);

        //user with permissions can update triggers
        $user->permissions = '{"triggers.update":1}';
        $response = $this->actingAs($user)->call('PUT', "secure/triggers/$trigger->id", $payload);
        $response->assertStatus(200);
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
