<?php

use App\Upload;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;

class UploadsDestroyTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_uploads()
    {
        Storage::fake('local');

        $file1 = UploadedFile::fake()->create('foo.txt');
        $file2 = UploadedFile::fake()->create('bar.txt');
        $file3 = UploadedFile::fake()->create('baz.txt');

        $upload1 = factory(Upload::class)->create(['file_name' => $file1->name]);
        $upload2 = factory(Upload::class)->create(['file_name' => $file2->name]);
        $upload3 = factory(Upload::class)->create(['file_name' => $file3->name]);

        Storage::disk('local')->put("uploads/$upload1->file_name", 'foo');
        Storage::disk('local')->put("uploads/$upload2->file_name", 'foo');
        Storage::disk('local')->put("uploads/$upload3->file_name", 'foo');

        $reply = factory(App\Reply::class)->create();
        $reply->uploads()->attach($upload1->id);
        $reply->uploads()->attach($upload3->id);

        $tag = factory(App\Tag::class)->create();
        $tag->uploads()->attach($upload1->id);
        $tag->uploads()->attach($upload3->id);

        $response = $this->asAdmin()->call('DELETE', "secure/uploads", ['ids' => [$upload1->id, $upload2->id]]);
        $response->assertStatus(204);

        //detaches only specified uploads from replies
        $this->assertCount(1, $reply->uploads);
        $this->assertEquals($upload3->id, $reply->uploads[0]->id);

        //detaches only specified uploads from tags
        $this->assertCount(1, $tag->uploads);
        $this->assertEquals($upload3->id, $tag->uploads[0]->id);

        //deletes uploads from database
        $this->assertDatabaseMissing('uploads', ['id' => $upload1->id]);
        $this->assertDatabaseMissing('uploads', ['id' => $upload2->id]);
        $this->assertDatabaseHas('uploads', ['id' => $upload3->id]);

        //deletes uploads from disk
        Storage::disk('local')->assertMissing("uploads/$upload1->file_name");
        Storage::disk('local')->assertMissing("uploads/$upload2->file_name");
        Storage::disk('local')->assertExists("uploads/$upload3->file_name");
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('DELETE', "secure/uploads", ['ids' => ['x']]);
        $response->assertStatus(422);
    }

    public function test_guests_cant_delete_uploads()
    {
        $this->mock(App\Services\Files\UploadsRepository::class);
        $response = $this->json('DELETE', "secure/uploads");
        $response->assertStatus(403);
    }

    public function users_with_permissions_can_delete_uploads()
    {
        $user = $this->getRegularUser();
        $user->permissions = '{"uploads.delete":1}';
        $response = $this->actingAs($user)->json('DELETE', "secure/uploads", ['ids' => [1,2,3]]);
        $response->assertStatus(204);
    }
}
