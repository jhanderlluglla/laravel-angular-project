<?php

use App\Services\Settings;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ArticleShowTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_fetches_help_center_article_by_id()
    {
        $article = factory(App\Article::class)->create(['body' => '[important]foo[/important]']);
        $parent  = factory(App\Category::class)->create();
        $child  = factory(App\Category::class)->create(['parent_id' => $parent->id]);
        $article->categories()->attach($child->id);

        $response = $this->asAdmin()->call('GET', "secure/help-center/articles/$article->id");
        $response->assertStatus(200);
        $response->assertJsonFragment(['status' => 'success']);
        $data = $response->json()['data'];

        //loads correct article
        $this->assertEquals($article->id, $data['id']);

        //loads tags
        $this->assertArrayHasKey('tags', $data);

        //loads categories
        $this->assertEquals($child->id, $data['categories'][0]['id']);

        //loads parents of categories
        $this->assertEquals($parent->id, $data['categories'][0]['parent']['id']);

        //loads children of categories
        $this->assertEquals($child->id, $data['categories'][0]['parent']['children'][0]['id']);
    }

    public function test_it_does_not_allow_user_without_permissions_to_view_articles()
    {
        $article = factory(App\Article::class)->create();
        $user = $this->getRegularUser();
        $response = $this->actingAs($user)->call('GET', "secure/help-center/articles/$article->id");
        $response->assertStatus(403);
    }

    public function test_it_allows_user_with_permissions_to_view_articles()
    {
        $article = factory(App\Article::class)->create();
        $user = factory(App\User::class)->create(['permissions' => '{"articles.view":1}']);
        $response = $this->actingAs($user)->call('GET', "secure/help-center/articles/$article->id");
        $response->assertStatus(200);
    }
}
