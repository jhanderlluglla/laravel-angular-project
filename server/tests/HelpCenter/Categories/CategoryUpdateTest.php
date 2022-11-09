<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CategoryUpdateTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_updates_existing_category()
    {
        $category = factory(App\Category::class)->create(['position' => 999]);
        $payload = ['name' => 'foo', 'description' => 'bar', 'parent_id' => 22];

        $response = $this->asAdmin()->callUrl('PUT', "secure/help-center/categories/$category->id", $payload);
        $response->assertStatus(200);
        $data = $response->json();

        $this->assertEquals('foo', $data['name']);
        $this->assertEquals('bar', $data['description']);
        $this->assertEquals(22, $data['parent_id']);
        $this->assertEquals(999, $data['position']);
    }

    public function test_it_validates_user_input()
    {
        $categories = factory(App\Category::class, 2)->create();

        $response = $this->asAdmin()->json('PUT', "secure/help-center/categories/{$categories[0]->id}", ['parent_id' => 'abc']);
        $response->assertStatus(422);
        $data = $response->json();

        $this->assertEquals('error', $data['status']);
        $this->assertArrayHasKey('parent_id', $data['messages']);
    }

    public function test_it_checks_permissions() {
        $user = $this->getRegularUser();
        $category = factory(App\Category::class)->create();

        //guests can't create categories
        $response = $this->call('PUT', "secure/help-center/categories/$category->id", ['name' => 'foo']);
        $response->assertStatus(403);

        //regular users can't create categories
        $user->permissions = null;
        $response = $this->actingAs($user)->call('PUT', "secure/help-center/categories/$category->id", ['name' => 'foo']);
        $response->assertStatus(403);

        //regular users can't create categories
        $user->permissions = null;
        $response = $this->actingAs($user)->call('PUT', "secure/help-center/categories/$category->id", ['name' => 'foo']);
        $response->assertStatus(403);

        //admin can create categories
        $user->permissions = '{"superAdmin":true}';
        $response = $this->actingAs($user)->call('PUT', "secure/help-center/categories/$category->id", ['name' => 'foo']);
        $response->assertStatus(200);
    }

    public function test_it_checks_admin_permissions() {
        $user = $this->getRegularUser();
        $user->permissions = '{"categories.update":true}';
        $category = factory(App\Category::class)->create();

        $response = $this->actingAs($user)->call('PUT', "secure/help-center/categories/$category->id", ['name' => 'bar']);
        $response->assertStatus(200);
    }
}
