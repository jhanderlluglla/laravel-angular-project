<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class PagesIndexTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_paginates_all_pages_matching_supplied_params()
    {
        factory(App\Page::class, 5)->create();

        $response = $this->asAdmin()->call('GET', "secure/pages", ['per_page' => 4]);
        $response->assertStatus(200);
        $response = $response->json();

        //loads pages
        $this->assertCount(4, $response['data']);
    }

    public function test_it_filters_pages_by_specified_search_term()
    {
        $pages = factory(App\Page::class, 2)->create();

        $response = $this->asAdmin()->call('GET', "secure/pages", ['query' => $pages->first()->slug]);
        $response = $response->json();

        $this->assertCount(1, $response['data']);
        $this->assertEquals($pages->first()->slug, $response['data'][0]['slug']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't view pages list
        $response = $this->call('GET', "secure/pages");
        $response->assertStatus(403);

        //regular users can't view pages list
        $response = $this->asRegularUser()->call('GET', "secure/pages");
        $response->assertStatus(403);

        //user with permissions can view pages list
        $user->permissions = '{"pages.view":true}';
        $response = $this->actingAs($user)->call('GET', "secure/pages");
        $response->assertStatus(200);
    }
}
