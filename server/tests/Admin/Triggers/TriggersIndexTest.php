<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class TriggersIndexTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_paginates_all_triggers_matching_supplied_params()
    {
        factory(App\Trigger::class, 5)->create();

        $response = $this->asAdmin()->call('GET', "secure/triggers", ['per_page' => 4]);
        $response->assertStatus(200);
        $response = $response->json();

        //loads triggers
        $this->assertCount(4, $response['data']);
    }

    public function test_it_filters_triggers_by_given_search_term()
    {
        $triggers = factory(App\Trigger::class, 2)->create();

        $response = $this->asAdmin()->call('GET', "secure/triggers", ['query' => $triggers->first()->name]);
        $response = $response->json();

        $this->assertCount(1, $response['data']);
        $this->assertEquals($triggers->first()->name, $response['data'][0]['name']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't view triggers list
        $response = $this->call('GET', "secure/triggers");
        $response->assertStatus(403);

        //regular users can't view triggers list
        $response = $this->asRegularUser()->call('GET', "secure/triggers");
        $response->assertStatus(403);

        //user with permissions can view triggers list
        $user->permissions = '{"triggers.view":true}';
        $response = $this->actingAs($user)->call('GET', "secure/triggers");
        $response->assertStatus(200);
    }
}
