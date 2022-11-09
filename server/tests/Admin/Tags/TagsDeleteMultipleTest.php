<?php

use App\Tag;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TagsDeleteMultipleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_multiple_tags()
    {
        $tags = factory(App\Tag::class, 2)->create();

        $response = $this->asAdmin()->call('DELETE', "secure/tags/delete-multiple", ['ids' => $tags->pluck('id')->toArray()]);
        $response->assertStatus(204);

        //test tags where deleted
        $this->assertCount(0, Tag::whereIn('id', $tags->pluck('id')->toArray())->get());

        //test tags were detached from taggables
        $this->assertCount(0, DB::table('taggables')->whereIn('tag_id', $tags->pluck('id')->toArray())->get());
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('DELETE', "secure/tags/delete-multiple");
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('ids', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $tag = factory(App\Tag::class)->create();
        $user = $this->getRegularUser();

        //guests can't delete tags
        $response = $this->call('DELETE', "secure/tags/delete-multiple", ['ids' => [$tag->id]]);
        $response->assertStatus(403);

        //regular users can't delete tags
        $response = $this->asRegularUser()->call('DELETE', "secure/tags/delete-multiple", ['ids' => [$tag->id]]);
        $response->assertStatus(403);

        //user with permission can delete tags
        $user->permissions = '{"tags.delete":1}';
        $response = $this->actingAs($user)->call('DELETE', "secure/tags/delete-multiple", ['ids' => [$tag->id]]);
        $response->assertStatus(204);
    }
}
