<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ArticleDestroyTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_articles()
    {
        $category   = factory(App\Category::class)->create();
        $articles = factory(App\Article::class, 2)->create();
        $ids      = [$articles[0]->id, $articles[1]->id];
        $tag      = factory(App\Tag::class)->create();

        $category->articles()->attach($ids);
        $this->assertCount(2, $category->articles()->get());
        $tag->articles()->attach($ids);
        $this->assertCount(2, $tag->articles()->get());

        $response = $this->asAdmin()->call('DELETE', "secure/help-center/articles", ['ids' => $ids]);
        $response->assertStatus(202);
        $response->assertJsonFragment(['data' => count($ids)]);

        //deletes article
        $this->assertEquals(0, DB::table('articles')->whereIn('id', $ids)->count());

        //detaches deleted article from category
        $this->assertCount(0, $category->articles()->get());
        $this->assertEquals(0, DB::table('category_article')->whereIn('article_id', $ids)->count());

        //detaches tags from deleted article
        $this->assertCount(0, $tag->articles()->get());
        $this->assertEquals(0, DB::table('taggables')->whereIn('article_id', $ids)->count());
    }

    public function test_it_checks_user_permissions()
    {
        $article = factory(App\Article::class)->create();
        $user    = $this->getRegularUser();

        //guests can't delete articles
        $response = $this->call('DELETE', "secure/help-center/articles", ['ids' => [$article->id]]);
        $response->assertStatus(403);

        //regular user can't delete articles
        $user->permissions = null;
        $response = $this->actingAs($user)->call('DELETE', "secure/help-center/articles", ['ids' => [$article->id]]);
        $response->assertStatus(403);

        //user with articles.delete can delete articles
        $article = factory(App\Article::class)->create();
        $user->permissions = '{"articles.delete":true}';
        $response = $this->actingAs($user)->call('DELETE', "secure/help-center/articles", ['ids' => [$article->id]]);
        $response->assertStatus(202);
    }
}
