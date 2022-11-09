<?php

use App\ArticleFeedback;
use App\Services\Settings;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ArticleSubmitFeedbackTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_allows_guest_with_permissions_to_submit_article_feedback()
    {
        $this->app->make(Settings::class)->set('permissions.guest', json_encode(['articles.view' => 1]));

        $article = factory(App\Article::class)->create();
        $response = $this->json('POST', "secure/help-center/articles/{$article->id}/feedback", ['was_helpful' => 1]);
        $response->assertStatus(200);
    }

    public function test_it_does_not_allow_guest_without_permissions_to_submit_article_feedback()
    {
        $article = factory(App\Article::class)->create();
        $response = $this->asRegularUser()->json('POST', "secure/help-center/articles/{$article->id}/feedback", ['was_helpful' => 1]);
        $response->assertStatus(403);
    }

    public function test_it_does_not_allow_regular_users_without_permissions_to_submit_article_feedback()
    {
        $article = factory(App\Article::class)->create();
        $user = $this->getRegularUser();
        $response = $this->actingAs($user)->json('POST', "secure/help-center/articles/{$article->id}/feedback", ['was_helpful' => 1]);
        $response->assertStatus(403);
    }

    public function test_it_allows_regular_users_with_permissions_to_submit_article_feedback()
    {
        $article = factory(App\Article::class)->create();
        $user = factory(App\User::class)->create(['permissions' => '{"articles.view":1}']);
        $response = $this->actingAs($user)->json('POST', "secure/help-center/articles/{$article->id}/feedback", ['was_helpful' => 1]);
        $response->assertStatus(200);
    }

    public function test_it_submits_feedback_from_logged_in_user()
    {
        $article  = factory(App\Article::class)->create();
        $feedback = ['was_helpful' => 1, 'comment' => 'test comment'];

        $response = $this->asAdmin()->call('POST', "secure/help-center/articles/{$article->id}/feedback", $feedback);
        $response->assertStatus(200);

        $this->assertCount(1, $article->feedback);
    }

    public function test_it_submits_feedback_from_guest()
    {
        $this->app->make(Settings::class)->set('permissions.guest', json_encode(['articles.view' => 1]));

        $article  = factory(App\Article::class)->create();
        $feedback = ['was_helpful' => 1, 'comment' => 'test comment'];

        $response = $this->call('POST', "secure/help-center/articles/{$article->id}/feedback", $feedback);
        $response->assertStatus(200);

        $this->assertCount(1, $article->feedback);
    }

    public function test_it_overrides_old_guest_feedback()
    {
        $this->app->make(Settings::class)->set('permissions.guest', json_encode(['articles.view' => 1]));

        $article  = factory(App\Article::class)->create();
        $feedback = ['was_helpful' => 0, 'comment' => 'new comment'];
        $this->createNewArticleFeedback(['ip' => Request::getClientIp()], $article->id);

        $this->call('POST', "secure/help-center/articles/{$article->id}/feedback", $feedback);

        $this->assertOldFeedbackWasOverwritten($article);
    }

    public function test_it_overrides_old_logged_in_user_feedback()
    {
        $article  = factory(App\Article::class)->create();
        $feedback = ['was_helpful' => 0, 'comment' => 'new comment'];
        $user     = factory(App\User::class)->create(['permissions' => '{"articles.view":1}']);
        $this->createNewArticleFeedback(['user_id' => $user->id], $article->id);

        $this->actingAs($user)->call('POST', "secure/help-center/articles/{$article->id}/feedback", $feedback);

        $this->assertOldFeedbackWasOverwritten($article);
    }

    public function test_it_overrides_old_feedback_from_guest_if_logged_in_user_submits_new_feedback_with_same_ip_as_guest()
    {
        $article  = factory(App\Article::class)->create();
        $feedback = ['was_helpful' => 0, 'comment' => 'new comment'];
        $this->createNewArticleFeedback(['ip' => Request::getClientIp()], $article->id);

        $this->asAdmin()->call('POST', "secure/help-center/articles/{$article->id}/feedback", $feedback);

        $this->assertOldFeedbackWasOverwritten($article);
    }

    public function test_it_overrides_old_feedback_from_logged_in_user_if_guest_submits_feedback_with_same_ip_as_logged_in_user()
    {
        $article  = factory(App\Article::class)->create();
        $feedback = ['was_helpful' => 0, 'comment' => 'new comment'];
        $this->createNewArticleFeedback([
            'ip'      => Request::getClientIp(),
            'user_id' => $this->getRegularUser()->id
        ], $article->id);

        $this->asAdmin()->call('POST', "secure/help-center/articles/{$article->id}/feedback", $feedback);

        $this->assertOldFeedbackWasOverwritten($article);
    }

    public function test_it_validates_user_input()
    {
        $article  = factory(App\Article::class)->create();
        $feedback = ['was_helpful' => 'foo', 'comment' => 'bar'];

        $response = $this->asAdmin()->json('POST', "secure/help-center/articles/{$article->id}/feedback", $feedback);
        $response->assertStatus(422);
        $data = $response->json();

        $this->assertEquals('error', $data['status']);
        $this->assertArrayHasKey('messages', $data);
        $this->assertArrayHasKey('was_helpful', $data['messages']);
    }

    private function createNewArticleFeedback($params = [], $articleId)
    {
        $default = [
            'article_id' => $articleId,
            'was_helpful'   => 1,
            'comment'       => 'old comment',
        ];

        return ArticleFeedback::create(array_merge($default, $params));
    }

    private function assertOldFeedbackWasOverwritten($article)
    {
        $this->assertCount(1, $article->feedback);
        $this->assertEquals(0, $article->feedback->first()->was_helpful);
        $this->assertEquals('new comment', $article->feedback->first()->comment);
    }
}
