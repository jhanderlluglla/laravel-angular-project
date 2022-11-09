<?php

use App\Article;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ArticleStoreTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_new_article()
    {
        $categories  = factory(App\Category::class, 2)->create();
        $tags        = factory(App\Tag::class, 2)->create();

        $payload = [
            'title' => 'test title',
            'body' => 'test body',
            'categories' => [$categories[0]->id, $categories[1]->id],
            'tags' => [$tags[0]->name, $tags[1]->name]
        ];

        $response = $this->asAdmin()->call('POST', "secure/help-center/articles", $payload);
        $response->assertStatus(201);
        $response->assertJsonFragment(['status' => 'success']);
        $data = $response->json()['data'];

        $article = Article::with('tags', 'categories')->find($data['id']);
        $this->assertEquals('test body', $data['body']);
        $this->assertEquals('test title', $data['title']);
        $this->assertCount(2, $article->categories);
        $this->assertCount(2, $article->tags);
        $this->assertTrue($article->tags->contains('name', $tags['0']['name']));
        $this->assertTrue($article->categories->contains('name', $categories['0']['name']));
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', "secure/help-center/articles");
        $response->assertStatus(422);
        $data = $response->json();

        $this->assertEquals('error', $data['status']);
        $this->assertArrayHasKey('messages', $data);
        $this->assertNotEmpty($data['messages']);
        $this->assertArrayHasKey('title', $data['messages']);
        $this->assertArrayHasKey('body', $data['messages']);
        $this->assertArrayHasKey('categories', $data['messages']);
    }

    public function test_it_checks_user_permissions()
    {
        $category  = factory(App\Category::class)->create();
        $payload   = ['title' => 'foo', 'body' => 'bar', 'categories' => [$category->id]];
        $user      = $this->getRegularUser();

        //user without permissions can't create articles
        $user->permissions = null;
        $response = $this->actingAs($user)->call('POST', "secure/help-center/articles", $payload);
        $response->assertStatus(403);

        //admin can create articles
        $user->permissions = '{"superAdmin":true}';
        $response = $this->actingAs($user)->call('POST', "secure/help-center/articles", $payload);
        $response->assertStatus(201);

        //user with articles.create permissions can create articles
        $user->permissions = '{"articles.create":true}';
        $response = $this->actingAs($user)->call('POST', "secure/help-center/articles", $payload);
        $response->assertStatus(201);
    }
}
