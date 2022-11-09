<?php

use App\Tag;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TagsUpdateTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_updates_existing_tag()
    {
        $payload = ['name' => 'short_name', 'display_name' => 'long_name', 'type' => 'category'];
        $tag = factory(Tag::class)->create();

        $response = $this->asAdmin()->call('PUT', "secure/tags/{$tag->id}", $payload);
        $response->assertStatus(200);

        //check if tag was updated
        $updatedTag = Tag::where('name', $payload['name'])->first();
        $this->assertDatabaseMissing('tags', ['name' => $tag->name]);

        //check if updated tag was returned
        $this->assertEquals($response->json()['data']['id'], $updatedTag['id']);
    }

    public function test_it_validates_user_input()
    {
        $tag = factory(Tag::class)->create();

        $response = $this->asAdmin()->json('PUT', "secure/tags/{$tag->id}", ['name' => $tag->name, 'display_name' => $tag->name, 'type' => 'xx']);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);

        //test validation passes if we send the same name tag name
        $this->assertArrayNotHasKey('name', $response['messages']);
        $this->assertArrayNotHasKey('display_name', $response['messages']);

        //test it rejects invalid tag types
        $this->assertArrayHasKey('type', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $tag  = factory(Tag::class)->create();
        $user = $this->getRegularUser();

        //guests can't update tags
        $response = $this->call('PUT', "secure/tags/{$tag->id}");
        $response->assertStatus(403);

        //regular users can't update tags
        $response = $this->asRegularUser()->call('PUT', "secure/tags/{$tag->id}");
        $response->assertStatus(403);

        //user with permission can update tags
        $user->permissions = '{"tags.update":1}';
        $response = $this->actingAs($user)->call('PUT', "secure/tags/{$tag->id}", ['name' => 'test', 'type' => 'category']);
        $response->assertStatus(200);
    }
}
