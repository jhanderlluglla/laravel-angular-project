<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class UploadsIndexTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_paginates_all_available_uploads()
    {
        $uploads = factory(App\Upload::class, 3)->create();

        $response = $this->asAdmin()->call('GET', "secure/uploads?per_page=2");
        $response->assertStatus(200);
        $data = $response->json()['data'];

        //returns paginated
        $this->assertArrayHasKey('per_page', $response->json());

        //returns only specified number of uploads
        $this->assertCount(2, $data);

        //uploads are formatted correctly
        $this->assertEquals($uploads[0]['id'], $data[0]['id']);
        $this->assertEquals($uploads[1]['id'], $data[1]['id']);
        $this->assertArrayHasKey('tags', $data[0]);
    }

    public function test_it_filters_uploads_by_search_query()
    {
        $upload1 = factory(App\Upload::class)->create(['name' => 'foo bar']);
        $upload2 = factory(App\Upload::class)->create(['name' => 'foo baz']);
        $upload3 = factory(App\Upload::class)->create(['name' => 'bar qux']);

        $response = $this->asAdmin()->call('GET', "secure/uploads?query=foo");
        $response->assertStatus(200);
        $data = $response->json()['data'];

        $this->assertCount(2, $data);
        $this->assertEquals($upload1['id'], $data[0]['id']);
        $this->assertEquals($upload2['id'], $data[1]['id']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't view uploads
        $response = $this->call('GET', 'secure/uploads');
        $response->assertStatus(403);

        //regular users can't view uploads
        $user->permissions = null;
        $response = $this->actingAs($user)->call('GET', 'secure/uploads');
        $response->assertStatus(403);

        //user with permissions can view uploads
        $user->permissions = '{"uploads.view":1}';
        $response = $this->actingAs($user)->call('GET', 'secure/uploads');
        $response->assertStatus(200);
    }
}
