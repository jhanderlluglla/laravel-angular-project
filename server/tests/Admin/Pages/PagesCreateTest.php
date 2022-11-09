<?php

use App\Tag;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class PagesCreateTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_new_page()
    {
        $response = $this->asAdmin()->call('POST', "secure/pages", ['slug' => 'foo', 'body' => 'bar']);
        $response->assertStatus(201);

        $page = App\Page::where('slug', 'foo')->first();

        //creates page
        $this->assertNotNull($page);

        //returns page
        $this->assertEquals($page->id, $response->json()['id']);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', "secure/pages");
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('slug', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $payload = ['slug' => 'foo', 'body' => 'bar'];

        //guests can't create pages
        $response = $this->call('POST', "secure/pages", $payload);
        $response->assertStatus(403);

        //regular users can't create pages
        $response = $this->asRegularUser()->call('POST', "secure/pages", $payload);
        $response->assertStatus(403);

        //user with permissions can create pages
        $user->permissions = '{"pages.create":1}';
        $response = $this->actingAs($user)->call('POST', "secure/pages", $payload);
        $response->assertStatus(201);
    }
}
