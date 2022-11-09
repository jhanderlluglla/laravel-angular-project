<?php

use App\Tag;
use App\User;
use App\Group;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ValueOptionsTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_gets_agent_id_value_options()
    {
        $group = Group::firstOrCreate(['name' => 'agents'], ['permissions' => []]);
        $users  = factory(User::class, 2)->create();
        $users[0]->groups()->attach($group->id);
        $users[1]->permissions = '{"superAdmin":true}';

        $response = $this->actingAs($users[1])->call('GET', "secure/triggers/value-options/agent:id");
        $response->assertJsonFragment(['status' => 'success']);
        $response = $response->json();

        $this->assertTrue(count($response['data']) >= 2);

        $this->assertTrue( ! empty(array_first($response['data'], function($item) use($users) {
            return $item['value'] == $users[0]['id'];
        })));

        $this->assertTrue( ! empty(array_first($response['data'], function($item) use($users) {
            return $item['value'] == $users[1]['id'] && $item['name'] === '(current user)';
        })));
    }

    public function test_it_gets_ticket_status_value_options()
    {
        $tag = Tag::firstOrCreate(['name' => 'open'], ['type' => 'status']);

        $response = $this->asAdmin()->call('GET', "secure/triggers/value-options/ticket:status");
        $response->assertJsonFragment(['status' => 'success']);
        $response = $response->json();

        $this->assertTrue(count($response['data']) >= 1);

        $this->assertTrue(collect($response['data'])->pluck('name')->contains($tag['name']));
    }

    public function test_it_gets_category_tags_value_options()
    {
        $tag = Tag::firstOrCreate(['name' => 'foo', 'type' => 'category']);

        $response = $this->asAdmin()->call('GET', "secure/triggers/value-options/category:tags");
        $response->assertJsonFragment(['status' => 'success']);
        $response = $response->json();

        $this->assertTrue(count($response['data']) >= 1);

        $this->assertTrue(collect($response['data'])->pluck('name')->contains($tag['name']));
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't get value options
        $response = $this->call('GET', "secure/triggers/value-options/agent:id");
        $response->assertStatus(403);

        //regular users can't get value options
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', "secure/triggers/value-options/agent:id");
        $response->assertStatus(403);

        //user with permissions can get value options
        $user->permissions = '{"triggers.create":1}';
        $response = $this->actingAs($user)->callUrl('GET', "secure/triggers/value-options/agent:id");
        $response->assertStatus(200);
    }
}
