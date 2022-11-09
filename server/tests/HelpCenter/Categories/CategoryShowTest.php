<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CategoryShowTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_returns_specified_category_with_children()
    {
        $category  = factory(App\Category::class)->create();
        $child     = factory(App\Category::class)->create(['parent_id' => $category->id]);
        $child2    = factory(App\Category::class)->create(['parent_id' => $child->id]);

        $response = $this->asAdmin()->call('GET', "secure/help-center/categories/$child->id");
        $response->assertStatus(200);
        $response->assertJsonFragment(['status' => 'success']);
        $data = $response->json()['data'];

        //loads correct category
        $this->assertEquals($child->id, $data['id']);

        //loads child categories
        $this->assertArrayHasKey('children', $data);
        $this->assertEquals($child2->id, $data['children'][0]['id']);

        //loads parent category
        $this->assertArrayHasKey('parent', $data);
        $this->assertEquals($category->id, $data['parent']['id']);

        //loads parent children
        $this->assertArrayHasKey('children', $data['parent']);
        $this->assertEquals($child->id, $data['parent']['children'][0]['id']);
    }

    public function test_it_checks_permissions()
    {
        $category = factory(App\Category::class)->create();
        $user = $this->getRegularUser();

        //users without permissions can't view categories
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', "secure/help-center/categories/$category->id");
        $response->assertStatus(403);

        //users with permissions can view categories
        $user->permissions = '{"categories.view":true}';
        $response = $this->actingAs($user)->call('GET', "secure/help-center/categories/$category->id");
        $response->assertStatus(200);
    }
}
