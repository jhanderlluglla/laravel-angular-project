<?php

use App\Category;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CategoryDestroyTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_specified_category()
    {
        $category = factory(App\Category::class)->create();
        $child    = factory(App\Category::class)->create(['parent_id' => $category->id]);
        $this->assertCount(1, $category->children);

        $response = $this->asAdmin()->call('DELETE', "secure/help-center/categories/$category->id");
        $response->assertStatus(204);

        //deletes category
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);

        //detaches child categories
        $this->assertDatabaseMissing('categories', ['parent_id' => $category->id]);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $category = factory(App\Category::class)->create();

        //guests can't delete categories
        $response = $this->actingAs($user)->call('DELETE', "secure/help-center/categories/$category->id");
        $response->assertStatus(403);

        //regular user can't delete help center categories
        $user->permissions = null;
        $response = $this->actingAs($user)->call('DELETE', "secure/help-center/categories/$category->id");
        $response->assertStatus(403);

        //admin can delete categories
        $user->permissions = '{"superAdmin":true}';
        $response = $this->actingAs($user)->call('DELETE', "secure/help-center/categories/$category->id");
        $response->assertStatus(204);

        //user with categories.delete can delete help center categories
        $category = factory(App\Category::class)->create();
        $user->permissions = '{"categories.delete":true}';
        $response = $this->actingAs($user)->call('DELETE', "secure/help-center/categories/$category->id");
        $response->assertStatus(204);
    }
}
