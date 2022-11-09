<?php

use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ArticleIncrementViewsTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_increments_article_views()
    {
        $article = factory(App\Article::class)->create(['views' => 1]);

        $response = $this->asAdmin()->call('GET', "secure/help-center/articles/$article->id");
        $response->assertStatus(200);

        //test increments views properly
        $this->assertEquals('success', $response->json()['status']);
        $this->assertDatabaseHas('articles', ['id' => $article->id, 'views' => 2]);

        //test views are not incremented again from same user if 10 hours did not pass
        $this->asAdmin()->call('GET', "secure/help-center/articles/$article->id");
        $this->assertDatabaseHas('articles', ['id' => $article->id, 'views' => 2]);

        //test views are incremented again from same user if 10 hours have passed
        Session::put("articleViews.$article->id", Carbon::now()->addDays(-1)->timestamp);
        $this->asAdmin()->call('GET', "secure/help-center/articles/$article->id");
        $this->assertDatabaseHas('articles', ['id' => $article->id, 'views' => 3]);
    }
}
