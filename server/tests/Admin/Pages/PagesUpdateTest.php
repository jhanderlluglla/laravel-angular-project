<?php

use App\Tag;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class PagesUpdateTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_updates_existing_page()
    {
        $page = factory(App\Page::class)->create();

        $response = $this->asAdmin()->json('PUT', "secure/pages/$page->id", ['body' => 'foo', 'slug' => $page->slug]);
        $response->assertStatus(200);

        //updates page
        $this->assertEquals('foo', $response->json()['body']);
    }

    public function test_it_validates_user_input()
    {
        $page1 = factory(App\Page::class)->create();
        $page2 = factory(App\Page::class)->create();

        $response = $this->asAdmin()->json('PUT', "secure/pages/$page1->id", ['slug' => $page2->slug]);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('slug', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $page = factory(App\Page::class)->create();
        $payload = ['slug' => 'bar'];
        $user = $this->getRegularUser();

        //guests can't update pages
        $response = $this->call('PUT', "secure/pages/$page->id", $payload);
        $response->assertStatus(403);

        //regular users can't update pages
        $response = $this->asRegularUser()->call('PUT', "secure/pages/$page->id", $payload);
        $response->assertStatus(403);

        //user with permissions can update pages
        $user->permissions = '{"pages.update":1}';
        $response = $this->actingAs($user)->call('PUT', "secure/pages/$page->id", $payload);
        $response->assertStatus(200);
    }
}
