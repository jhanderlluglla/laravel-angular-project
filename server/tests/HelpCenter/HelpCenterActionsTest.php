<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class HelpCenterActionsTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_unused_article_images_from_disk()
    {
        Storage::fake('public');

        Storage::disk('public')->put('article-images/foo.png', 'foo');
        Storage::disk('public')->put('article-images/bar.png', 'foo');
        Storage::disk('public')->put('article-images/baz.png', 'foo');

        factory(App\Article::class)->create(['body' => '<img src="'.url('article-images/foo.png').'">']);
        factory(App\Article::class)->create(['body' => '<img src="'.url('article-images/bar.png').'">']);

        $response = $this->asAdmin()->call('POST', 'secure/help-center/actions/delete-unused-images');
        $response->assertStatus(200);

        //deletes only the image that does not exist in any article body
        Storage::disk('public')->assertExists('article-images/foo.png');
        Storage::disk('public')->assertExists('article-images/bar.png');
        Storage::disk('public')->assertMissing('article-images/baz.png');
    }

    public function test_it_checks_user_permissions()
    {
        //user without permissions can't trigger help center actions
        $response = $this->asRegularUser()->call('POST', "secure/help-center/actions/delete-unused-images");
        $response->assertStatus(403);

        //admin can trigger help center actions
        $response = $this->asAdmin()->call('POST', "secure/help-center/actions/delete-unused-images");
        $response->assertStatus(200);
    }
}
