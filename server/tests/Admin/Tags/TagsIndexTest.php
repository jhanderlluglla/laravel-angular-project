<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class TagsIndexTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_paginates_all_tags_matching_supplied_params()
    {
        factory(App\Tag::class, 5)->create(['type' => 'default']);

        $response = $this->asAdmin()->call('GET', "secure/tags", ['per_page' => 4, 'order_by' => 'name', 'order_dir' => 'asc', 'with_counts' => true]);
        $response->assertStatus(200);
        $response = $response->json();

        //test ticket counts are loaded
        $this->assertArrayHasKey('tickets_count', $response['data'][0]);

        //test per page is set
        $this->assertEquals(4, $response['per_page']);
    }

    public function test_it_filters_tags_by_given_search_term()
    {
        $tags = factory(App\Tag::class, 2)->create(['type' => 'default']);

        $response = $this->asAdmin()->call('GET', "secure/tags", ['query' => $tags->first()->name]);
        $response = $response->json();

        $this->assertCount(1, $response['data']);
        $this->assertEquals($tags->first()->name, $response['data'][0]['name']);
    }

    public function test_it_filters_out_status_tags_if_requested()
    {
        factory(App\Tag::class, 2)->create(['type' => 'status']);

        $response = $this->asAdmin()->call('GET', "secure/tags", ['skip_status_tags' => true]);

        foreach ($response->json()['data'] as $tag) {
            $this->assertNotEquals('status', $tag['type']);
        }
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //user without permissions can't view tags list
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', "secure/tags");
        $response->assertStatus(403);

        //user with permissions can view tags list
        $user->permissions = '{"tags.view":true}';
        $response = $this->actingAs($user)->call('GET', "secure/tags");
        $response->assertStatus(200);
    }
}
