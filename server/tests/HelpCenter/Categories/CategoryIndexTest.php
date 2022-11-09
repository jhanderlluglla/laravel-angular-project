<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CategoryIndexTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_returns_categories_matching_specified_filters()
    {
        $category1 = factory(App\Category::class)->create(['position' => 1]);
        $category2 = factory(App\Category::class)->create(['position' => 2]);
        $category3 = factory(App\Category::class)->create();
        $category4 = factory(App\Category::class)->create(['parent_id' => $category1->id]);
        $articles  = factory(App\Article::class, 2)->create();

        $category1->articles()->attach($articles->pluck('id')->toArray());

        $response = $this->asAdmin()->call('GET', "secure/help-center/categories");
        $response->assertStatus(200);
        $data = $response->json();

        foreach ($data as $k => $category) {
            //only loads root (parent) categories
            $this->assertNull($category['parent_id']);

            //orders categories by position
            if ($category['position'] !== 0) {
                $this->assertEquals($k+1, $category['position']);

            //categories with position=0 are last so
            //there should be some category before them
            } else {
                $this->assertArrayHasKey($k-1, $data);
            }
        }

        //loads parent article count
        $this->assertArrayHasKey('articles_count', $data[0]);

        //loads children categories
        $this->assertArrayHasKey('children', $data[0]);
        $this->assertEquals($data[0]['children'][0]['id'], $category4->id);

        //loads child article count
        $this->assertArrayHasKey('articles_count', $data[0]['children'][0]);

        //loads children parents
        $this->assertArrayHasKey('parent', $data[0]['children'][0]);

        //does not load articles
        $this->assertArrayNotHasKey('articles', $data[0]);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //users without permissions can't view help center categories
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', "secure/help-center/categories");
        $response->assertStatus(403);

        //user with permissions can view categories
        $user->permissions = '{"categories.view":true}';
        $response = $this->actingAs($user)->call('GET', "secure/help-center/categories");
        $response->assertStatus(200);
    }
}
