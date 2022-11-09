<?php

use App\Ticket;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class SyncUserTagsTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_syncs_user_tags()
    {
        $user = $this->getRegularUser();
        $tags = factory(App\Tag::class, 3)->create();
        $user->tags()->attach([$tags[0]->id, $tags[1]->id]);
        $this->assertCount(2, $user->tags);

        $response = $this->asAdmin()->call('POST', "/secure/users/{$user->id}/tags/sync", ['tags' => [$tags[2]->name, 'foo']]);
        $response->assertStatus(200);

        //created non existing tag
        $this->assertDatabaseHas('tags', ['name' => 'foo']);

        //did not duplicate tags
        $this->assertEquals(1, DB::table('tags')->where('name', $tags[2]->name)->count());

        //synced user tags
        $this->assertEquals([$tags[2]->name, 'foo'], $user->load('tags')->tags->pluck('name')->toArray());
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', "/secure/users/1/tags/sync", ['tags' => 123]);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertArrayHasKey('tags', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't add tags
        $response = $this->call('POST', '/secure/users/1/tags/sync');
        $response->assertStatus(403);

        //regular users can't add tags
        $this->actingAs($user)->call('POST', '/secure/users/1/tags/sync');
        $response->assertStatus(403);

        //user with permission can add tags
        $user->permissions = '{"users.update":1}';
        $response = $this->actingAs($user)->call('POST', '/secure/users/1/tags/sync');
        $response->assertStatus(200);
    }
}
