<?php

use App\Article;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ArticleUpdateTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_updates_existing_article()
    {
        $categories  = factory(App\Category::class, 3)->create();
        $article     = factory(App\Article::class)->create();
        $tags        = factory(App\Tag::class, 3)->create();
        $article->categories()->attach($categories[0]->id);
        $article->tags()->attach($tags[0]->id);

        $payload = ['title' => 'test title', 'body' => 'test body', 'categories' => [$categories[1]->id, $categories[2]->id], 'tags' => [$tags[1]->name, $tags[2]->name]];

        $response = $this->asAdmin()->call('PUT', "secure/help-center/articles/$article->id", $payload);
        $response->assertStatus(200);
        $response->assertJsonFragment(['status' => 'success']);
        $data = $response->json()['data'];

        $this->assertEquals('test body', $data['body']);
        $this->assertEquals('test title', $data['title']);
        $this->assertDatabaseMissing('articles', ['title' => $article->title]);

        //assert categories were synced (initial category was detached)
        $this->assertCount(2, $article->categories);
        $this->assertNotContains($categories[0]->id, $article->categories->pluck('id'));

        //assert tags were synced
        $this->assertCount(2, $article->tags);
        $this->assertArrayNotHasKey($tags[0]->name, $article->tags->pluck('name')->toArray());
    }

    public function test_it_validates_user_input()
    {
        $article  = factory(App\Article::class)->create();

        $response = $this->asAdmin()->json('PUT', "secure/help-center/articles/$article->id");
        $response->assertStatus(422);
        $data = $response->json();

        $this->assertEquals('error', $data['status']);
        $this->assertArrayHasKey('messages', $data);
        $this->assertNotEmpty($data['messages']);
        $this->assertArrayHasKey('title', $data['messages']);
        $this->assertArrayHasKey('body', $data['messages']);
        $this->assertArrayNotHasKey('categories', $data['messages']);
    }

    public function test_it_checks_permissions()
    {
        $article = factory(App\Article::class)->create();
        $user    = $this->getRegularUser();

        $payload = ['title' => 'test title', 'body' => 'body', 'categories' => [1]];

        //user without permissions can't update new help center articles
        $user->permissions = null;
        $response = $this->actingAs($user)->call('PUT', "secure/help-center/articles/$article->id", $payload);
        $response->assertStatus(403);

        //admin can update articles
        $user->permissions = '{"superAdmin":true}';
        $response = $this->actingAs($user)->call('PUT', "secure/help-center/articles/$article->id", $payload);
        $response->assertStatus(200);

        //user with articles.update can update help center articles
        $user->permissions = '{"articles.update":true}';
        $response = $this->actingAs($user)->call('PUT', "secure/help-center/articles/$article->id", $payload);
        $response->assertStatus(200);
    }
}
