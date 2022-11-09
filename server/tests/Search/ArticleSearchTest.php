<?php

use App\Services\Settings;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ArticleSearchTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp()
    {
        parent::setUp();
        Config::set('scout.driver', 'mysql');
    }

    public function test_it_searches_for_articles()
    {
        $parent   = factory(App\Category::class)->create();
        $child    = factory(App\Category::class)->create(['parent_id' => $parent->id]);
        $tag      = App\Tag::firstOrCreate(['name' => 'foo bar']);
        $article1 = factory(App\Article::class)->create(['title' => 'foo bar', 'body' => '<div></div>'.str_repeat('foo', 150)]);
        $article1->categories()->attach($child);
        $article2 = factory(App\Article::class)->create(['body'  => 'foo bar']);
        $article3 = factory(App\Article::class)->create();
        $article3->tags()->attach($tag->id);
        $article4 = factory(App\Article::class)->create();

        $response = $this->asAdmin()->call('GET', 'secure/search/articles/foo', ['body_limit' => 205]);
        $response->assertStatus(200);
        $data = $response->json()['data'];

        //returns paginator
        $this->assertArrayHasKey('total', $response->json());
        $this->assertArrayHasKey('current_page', $response->json());

        //finds correct articles
        $this->assertTrue(collect($data)->contains('id', $article1->id));
        $this->assertTrue(collect($data)->contains('id', $article2->id));
        $this->assertTrue(collect($data)->contains('id', $article3->id));
        $this->assertFalse(collect($data)->contains('id', $article4->id));

        //loads article categories
        $this->assertEquals($child->id, $data[0]['categories'][0]['id']);
        $this->assertEquals($parent->id, $data[0]['categories'][0]['parent']['id']);

        //limits article body and strips html tags
        $this->assertEquals($article1->id, $data[0]['id']);
        $this->assertFalse(str_contains('<div></div>', $data[0]['body']));
        $this->assertTrue(208 === strlen($data[0]['body']));

        //maps all needed properties
        $props = ['id', 'title', 'body', 'description', 'categories'];

        foreach ($props as $prop) {
            $this->assertArrayHasKey($prop, $data[0]);
            $this->assertTrue($data[0][$prop] > false);
        }
    }

    public function test_it_limits_results()
    {
        factory(App\Article::class, 7)->create(['title' => 'foo bar']);

        $response = $this->asAdmin()->call('GET', 'secure/search/articles/foo', ['per_page' => 6]);
        $this->assertCount(6, $response->json()['data']);
    }

    public function test_it_filters_results_by_user_purchase_codes()
    {
        $this->app->make(Settings::class)->set('envato.filter_search', 1);

        $article1 = factory(App\Article::class)->create(['body' => 'foo']);
        $article2 = factory(App\Article::class)->create(['body' => 'foo']);
        $category = factory(App\Category::class)->create(['name' => 'baz']);
        $article2->categories()->attach($category->id);

        $user = $this->getRegularUser(['permissions' => ['articles.view' => 1]]);
        $user->purchase_codes()->create(['item_name' => 'baz', 'code' => 'baz', 'item_id' => 1]);

        $response = $this->actingAs($user)->call('GET', 'secure/search/articles/foo');
        $data = $response->json()['data'];

        $this->assertCount(1, $data);
        $this->assertEquals($article2->id, $data[0]['id']);
    }

    public function test_it_filters_results_by_specified_category()
    {
        $article1 = factory(App\Article::class)->create(['body' => 'foo']);
        $article2 = factory(App\Article::class)->create(['body' => 'foo']);
        $category = factory(App\Category::class)->create(['name' => 'baz']);
        $article2->categories()->attach($category->id);

        $response = $this->asAdmin()->call('GET', 'secure/search/articles/foo', ['category' => 'baz']);
        $data = $response->json()['data'];

        $this->assertCount(1, $data);
        $this->assertEquals($article2->id, $data[0]['id']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //user without permissions can't search articles
        $response = $this->actingAs($user)->call('GET', 'secure/search/articles/foo');
        $response->assertStatus(403);

        //user with permissions can search articles
        $user->permissions = '{"articles.view": 1}';
        $response = $this->actingAs($user)->call('GET', 'secure/search/articles/foo');
        $response->assertStatus(200);
    }
}
