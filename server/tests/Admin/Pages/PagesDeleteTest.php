<?php

use App\Tag;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class PagesDeleteTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_multiple_pages()
    {
        $pages = factory(App\Page::class, 2)->create();

        $response = $this->asAdmin()->call('DELETE', "secure/pages", ['ids' => $pages->pluck('id')->toArray()]);
        $response->assertStatus(204);

        //deletes pages
        $this->assertDatabaseMissing('pages', ['id' => $pages[0]->id]);
        $this->assertDatabaseMissing('pages', ['id' => $pages[1]->id]);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('DELETE', "secure/pages");
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('ids', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $page = factory(App\Page::class)->create();
        $user = $this->getRegularUser();

        //guests can't delete pages
        $response = $this->call('DELETE', "secure/pages", ['ids' => [$page->id]]);
        $response->assertStatus(403);

        //regular users can't delete pages
        $response = $this->asRegularUser()->call('DELETE', "secure/pages", ['ids' => [$page->id]]);
        $response->assertStatus(403);

        //user with permission can delete pages
        $user->permissions = '{"pages.delete":1}';
        $response = $this->actingAs($user)->call('DELETE', "secure/pages", ['ids' => [$page->id]]);
        $response->assertStatus(204);
    }
}
