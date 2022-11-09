<?php

use App\Category;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CategoryDetachParentTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_detaches_child_category_from_parent()
    {
        $category = factory(App\Category::class)->create();
        $children = factory(App\Category::class, 2)->create(['parent_id' => $category->id]);

        $response = $this->asAdmin()->call('POST', "secure/help-center/categories/{$children[0]->id}/detach-parent");
        $response->assertStatus(200);
        $response->assertJsonFragment(['status' => 'success']);

        $this->assertCount(1, $category->children);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $category = factory(App\Category::class)->create();

        //guests can't detach
        $response = $this->call('POST', "secure/help-center/categories/{$category->id}/detach-parent");
        $response->assertStatus(403);

        //regular user can't detach
        $user->permissions = null;
        $response = $this->actingAs($user)->call('POST', "secure/help-center/categories/{$category->id}/detach-parent");
        $response->assertStatus(403);

        //admin can detach
        $user->permissions = '{"superAdmin":true}';
        $response = $this->actingAs($user)->call('POST', "secure/help-center/categories/{$category->id}/detach-parent");
        $response->assertStatus(200);

        //user with categories.update permissions can detach
        $user->permissions = '{"categories.update":true}';
        $response = $this->actingAs($user)->call('POST', "secure/help-center/categories/{$category->id}/detach-parent");
        $response->assertStatus(200);
    }
}
