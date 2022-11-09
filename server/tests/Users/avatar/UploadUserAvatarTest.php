<?php

use App\Ticket;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;

class UploadUserAvatarTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp() {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_it_uploads_avatar_and_attaches_it_to_user()
    {
        $user = factory(App\User::class)->create(['avatar' => 'avatars/foo.png']);

        Storage::disk('public')->put($user->getOriginal('avatar'), 'content');
        Storage::disk('public')->assertExists('avatars/foo.png');

        $file = UploadedFile::fake()->create('foo.jpg');

        $response = $this->actingAs($user)->call('POST', "/secure/users/{$user->id}/avatar", ['avatar' => $file]);
        $response->assertStatus(200);
        $data = $response->json();

        //returns user model
        $this->assertEquals($user->id, $data['id']);

        //attaches avatar to user
        $this->assertTrue(is_string($data['avatar']));
        $this->assertNotEquals($user->getOriginal('avatar'), $user->fresh()->getOriginal('avatar'));

        //stores avatar on the disk
        Storage::disk('public')->assertExists($user->fresh()->getOriginal('avatar'));

        //deletes old user avatar from disk
        Storage::disk('public')->assertMissing('avatars/foo.png');
    }

    public function test_it_validates_user_input()
    {
        $user = $this->getRegularUser();

        $response = $this->asAdmin()->json('POST', "/secure/users/{$user->id}/avatar", ['avatar' => 123]);
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertArrayHasKey('avatar', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user1 = $this->getRegularUser();
        $user2 = $this->getRegularUser();
        $file  = UploadedFile::fake()->create('foo.jpg');

        //guests can't update avatars
        $response = $this->call('POST', "/secure/users/{$user1->id}/avatar", ['avatar' => $file]);
        $response->assertStatus(403);

        //regular users can't update other users avatars
        $response = $this->actingAs($user1)->call('POST', "/secure/users/{$user2->id}/avatar", ['avatar' => $file]);
        $response->assertStatus(403);

        //regular users can update their own avatars
        $response = $this->actingAs($user1)->call('POST', "/secure/users/{$user1->id}/avatar", ['avatar' => $file]);
        $response->assertStatus(200);

        //user with permission can update avatars
        $user1->permissions = '{"users.update":1}';
        $response = $this->actingAs($user1)->call('POST', "/secure/users/{$user2->id}/avatar", ['avatar' => $file]);
        $response->assertStatus(200);
    }
}
