<?php

use App\Tag;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TagsStoreTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_new_tag()
    {
        $payload = ['name' => str_random(10), 'display_name' => 'long_name', 'type' => 'category'];

        $response = $this->asAdmin()->call('POST', "secure/tags", $payload);
        $response->assertStatus(201);

        //test tag was created
        $tag = Tag::where('name', $payload['name'])->first();

        //test if newly created tag was returned
        $this->assertEquals($response->json()['data']['id'], $tag->id);
    }

    public function test_it_validates_user_input()
    {
        Tag::create(['name' => 'exists', 'display_name' => 'exists2']);

        $response = $this->asAdmin()->json('POST', "secure/tags", ['name' => 'exists', 'display_name' => 'exists2', 'type' => 'none']);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);

        //check unique names are validated
        $this->assertArrayHasKey('name', $response['messages']);

        //check invalid types are rejected
        $this->assertArrayHasKey('type', $response['messages']);

        //check unique display names are validated
        $this->assertArrayHasKey('display_name', $response['messages']);
    }

    public function test_guests_cant_create_new_tags() {
        $response = $this->call('POST', "secure/tags");
        $response->assertStatus(403);
    }

    public function test_regulars_users_cant_create_new_tags() {
        $response = $this->asRegularUser()->call('POST', "secure/tags");
        $response->assertStatus(403);
    }

    public function test_users_with_permissions_can_create_tags()
    {
        $user = $this->getRegularUser();
        $user->permissions = '{"tags.create":1}';
        $response = $this->actingAs($user)->call('POST', "secure/tags", ['name' => str_random(10), 'type' => 'category']);
        $response->assertStatus(201);
    }
}
