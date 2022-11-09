<?php

use App\Services\Settings;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ArticleIndexTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_paginates_all_articles_if_no_filters_are_provided()
    {
        factory(App\Article::class, 2)->create();

        $response = $this->asAdmin()->call('GET', "secure/help-center/articles");
        $response->assertStatus(200);
        $response->assertJsonFragment(['status' => 'success']);

        $this->assertTrue(count($response->json()['data']) >= 2);
    }

    public function test_it_filters_articles_by_category()
    {
        $articles  = factory(App\Article::class, 2)->create();
        $category  = factory(App\Category::class)->create();
        $articles[0]->categories()->attach($category->id);

        $response = $this->asAdmin()->call('GET', "secure/help-center/articles", ['categories' => [$category->id]]);
        $response->assertStatus(200);
        $response->assertJsonFragment(['status' => 'success']);

        $this->assertCount(1, $response->json()['data']);
        $this->assertEquals($category->id, $response->json()['data'][0]['categories'][0]['id']);
    }

    public function test_it_orders_articles_by_user_feedback()
    {
        $articles = factory(App\Article::class, 3)->create();
        factory(App\ArticleFeedback::class, 1)->create(['article_id' => $articles[1]->id]);
        factory(App\ArticleFeedback::class, 2)->create(['article_id' => $articles[2]->id]);

        $response = $this->callUrl('GET', "secure/help-center/articles", ['orderBy' => 'was_helpful|desc'], $this->getAdminUser());
        $response->assertStatus(200);

        $ordered = $response->json()['data'];
        $this->assertTrue($ordered[0]['was_helpful'] >= $ordered[1]['was_helpful']);
        $this->assertTrue($ordered[1]['was_helpful'] >= $ordered[2]['was_helpful']);
    }

    public function test_it_does_not_allow_user_without_permissions_to_view_articles()
    {
        $user = $this->getRegularUser();
        $response = $this->actingAs($user)->call('GET', "secure/help-center/articles");
        $response->assertStatus(403);
    }

    public function test_it_allows_user_with_permissions_to_view_articles()
    {
        $user = factory(App\User::class)->create(['permissions' => '{"articles.view":1}']);
        $response = $this->actingAs($user)->call('GET', "secure/help-center/articles");
        $response->assertStatus(200);
    }
}
