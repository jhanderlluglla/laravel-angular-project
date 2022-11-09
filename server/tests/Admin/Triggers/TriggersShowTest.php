<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class TriggersShowTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_shows_specified_trigger()
    {
        $trigger = factory(App\Trigger::class)->create();

        $response = $this->asAdmin()->call('GET', "secure/triggers/$trigger->id");
        $response->assertStatus(200);

        $this->assertEquals($trigger->id, $response->json()['data']['id']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $trigger = factory(App\Trigger::class)->create();

        //guests can't view triggers
        $response = $this->call('GET', "secure/triggers/$trigger->id");
        $response->assertStatus(403);

        //regular users can't view triggers
        $response = $this->asRegularUser()->call('GET', "secure/triggers/$trigger->id");
        $response->assertStatus(403);

        //user with permissions can view triggers
        $user->permissions = '{"triggers.view":true}';
        $response = $this->actingAs($user)->call('GET', "secure/triggers/$trigger->id");
        $response->assertStatus(200);
    }
}
