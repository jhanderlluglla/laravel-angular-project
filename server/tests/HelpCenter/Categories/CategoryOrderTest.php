<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CategoryOrderTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_changes_categories_order()
    {
        $category1 = factory(App\Category::class)->create(['position' => 1]);
        $category2 = factory(App\Category::class)->create(['position' => 2]);
        $category3 = factory(App\Category::class)->create(['position' => 3]);

        $response = $this->asAdmin()->call('POST', "secure/help-center/categories/reorder", ['ids' => [$category3->id, $category1->id, $category2->id]]);
        $response->assertStatus(200);
        $response->assertJsonFragment(['status' => 'success']);

        $this->assertEquals(1, App\Category::find($category3->id)->position);
        $this->assertEquals(2, App\Category::find($category1->id)->position);
        $this->assertEquals(3, App\Category::find($category2->id)->position);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't reorder categories
        $response = $this->call('POST', "secure/help-center/categories/reorder", ['ids' => [1]]);
        $response->assertStatus(403);

        //regular users can't reorder categories
        $user->permissions = null;
        $response = $this->actingAs($user)->call('POST', "secure/help-center/categories/reorder", ['ids' => [1]]);
        $response->assertStatus(403);

        //admin can reorder categories
        $user->permissions = '{"superAdmin":true}';
        $response = $this->actingAs($user)->call('POST', "secure/help-center/categories/reorder", ['ids' => [1]]);
        $response->assertStatus(200);

        //user with categories.update can reorder categories
        $user->permissions = '{"categories.update":true}';
        $response = $this->actingAs($user)->call('POST', "secure/help-center/categories/reorder", ['ids' => [1]]);
        $response->assertStatus(200);
    }
}
