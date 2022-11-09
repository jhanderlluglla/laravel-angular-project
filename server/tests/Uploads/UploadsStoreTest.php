<?php

use App\Upload;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;

class UploadsStoreTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_uploads_files()
    {
        Storage::fake('local');

        $files = [
            UploadedFile::fake()->create('foo.jpg'),
            UploadedFile::fake()->create('foo.txt'),
        ];
        $user = $this->getAdminUser();

        $response = $this->actingAs($user)->json('POST', "secure/uploads", ['files' => $files]);
        $response->assertStatus(201);

        $upload1 = Upload::where('name', $files[0]->name)->first();
        $upload2 = Upload::where('name', $files[1]->name)->first();

        //stores reference to files in database
        $this->assertNotNull($upload1);
        $this->assertNotNull($upload2);

        //stores files on the disk
        Storage::disk('local')->assertExists("uploads/$upload1->file_name");
        Storage::disk('local')->assertExists("uploads/$upload2->file_name");

        //stores all needed data on upload file model
        $this->assertEquals($upload1->name, $files[0]->name);
        $this->assertEquals($upload1->mime, $files[0]->getMimeType());
        $this->assertEquals($upload1->file_size, $files[0]->getClientSize());
        $this->assertEquals($upload1->extension, $files[0]->guessExtension());
        $this->assertEquals($upload1->user_id, $user->id);
    }

    public function test_it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', "secure/uploads");
        $response->assertStatus(422);
        $response->assertJsonFragment(['status' => 'error']);

        $this->assertArrayHasKey('files', $response->json()['messages']);
    }

    public function test_guests_cant_upload_files()
    {
        $this->mock(App\Services\Files\Uploads::class);

        $response = $this->call('POST', "secure/uploads");
        $response->assertStatus(403);
    }

    public function test_user_with_permissions_can_upload_files()
    {
        $this->mock(App\Services\Files\Uploads::class);

        $user = $this->getRegularUser();
        $user->permissions = '{"uploads.create":1}';
        $response = $this->actingAs($user)->call('POST', "secure/uploads", ['files' => [UploadedFile::fake()->create('foo.bar')]]);
        $response->assertStatus(201);
    }
}
