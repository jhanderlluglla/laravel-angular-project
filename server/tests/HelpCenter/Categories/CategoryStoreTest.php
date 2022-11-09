<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CategoryStoreTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_new_category()
    {
        factory(App\Category::class)->create(['position' => 999]);

        $response = $this->asAdmin()->call('POST', "secure/help-center/categories", ['name' => 'test name', 'description' => 'test description', 'parent_id' => 999]);
        $response->assertStatus(201);
        $data = $response->json();

        $this->assertEquals('test description', $data['description']);
        $this->assertEquals('test name', $data['name']);
        $this->assertEquals(1000, $data['position']);
        $this->assertEquals(999, $data['parent_id']);
        $this->assertDatabaseHas('categories', ['name' => 'test name']);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', "secure/help-center/categories", ['parent_id' => 'abc']);
        $response->assertStatus(422);
        $data = $response->json();

        $this->assertEquals('error', $data['status']);
        $this->assertArrayHasKey('parent_id', $data['messages']);
    }

    public function test_it_checks_permissions() {
        $user = $this->getRegularUser();

        //guests can't create categories
        $response = $this->call('POST', "secure/help-center/categories", ['name' => 'foo']);
        $response->assertStatus(403);

        //regular users can't create categories
        $user->permissions = null;
        $response = $this->actingAs($user)->call('POST', "secure/help-center/categories", ['name' => 'foo']);
        $response->assertStatus(403);

        //user with permissions can create categories
        $user->permissions = '{"categories.create":1}';
        $response = $this->actingAs($user)->call('POST', "secure/help-center/categories", ['name' => 'foo']);
        $response->assertStatus(201);
    }
}
