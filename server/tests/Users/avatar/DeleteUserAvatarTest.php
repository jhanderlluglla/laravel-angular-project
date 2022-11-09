<?php

use App\Ticket;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;

class DeleteUserAvatarTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_user_avatar_and_detaches_it_from_user_model()
    {
        $user = factory(App\User::class)->create(['avatar' => 'avatars/foo.png']);

        Storage::fake('public');
        Storage::disk('public')->put($user->getOriginal('avatar'), 'content');
        Storage::disk('public')->assertExists('avatars/foo.png');

        $response = $this->actingAs($user)->call('DELETE', "/secure/users/{$user->id}/avatar");
        $response->assertStatus(200);
        $data = $response->json();

        //returns user model
        $this->assertEquals($user->id, $data['id']);

        //detaches avatar from user
        $this->assertNull($user->fresh()->getOriginal('avatar'));

        //deletes avatar from disk
        Storage::disk('public')->assertMissing('avatars/foo.png');
    }

    public function test_it_deletes_avatar_if_user_did_not_have_avatar_previously()
    {
        $user = factory(App\User::class)->create(['avatar' => 'avatars/foo.png']);

        $response = $this->actingAs($user)->call('DELETE', "/secure/users/{$user->id}/avatar");
        $response->assertStatus(200);
    }

    public function test_it_checks_permissions()
    {
        $user1 = $this->getRegularUser();
        $user2 = $this->getRegularUser();

        //guests can't delete avatars
        $response = $this->call('DELETE', "/secure/users/{$user1->id}/avatar");
        $response->assertStatus(403);

        //regular users can't delete other users avatars
        $response = $this->actingAs($user1)->call('DELETE', "/secure/users/{$user2->id}/avatar");
        $response->assertStatus(403);

        //regular users can delete their own avatars
        $response = $this->actingAs($user1)->call('DELETE', "/secure/users/{$user1->id}/avatar");
        $response->assertStatus(200);

        //user with permission can delete avatars
        $user1->permissions = '{"users.update":1}';
        $response = $this->actingAs($user1)->call('DELETE', "/secure/users/{$user2->id}/avatar");
        $response->assertStatus(200);
    }
}
