<?php

use App\Article;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;

class StaticImagesUploadTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_uploads_static_images()
    {
        Storage::fake('public');

        $files = [
            UploadedFile::fake()->image('foo.jpeg'),
            UploadedFile::fake()->create('bar.jpeg'),
        ];

        $response = $this->asAdmin()->json('POST', "secure/images/static/upload", ['files' => $files, 'type' => 'article']);
        $response->assertStatus(201);
        $data = $response->json()['data'];

        //stores files on the disk
        Storage::disk('public')->assertExists(str_replace('storage', '', $data[0]['url']));
        Storage::disk('public')->assertExists(str_replace('storage', '', $data[1]['url']));
    }

    public function test_it_validates_user_input()
    {
        $files = [
            UploadedFile::fake()->create('foo.txt'),
            UploadedFile::fake()->create('bar.zip'),
        ];

        $response = $this->asAdmin()->json('POST', "secure/images/static/upload", ['files' => $files, 'type' => 'foo']);
        $response->assertStatus(422);
        $response->assertJsonFragment(['status' => 'error']);

        $this->assertArrayHasKey('files.0', $response->json()['messages']);
        $this->assertArrayHasKey('files.1', $response->json()['messages']);
        $this->assertArrayHasKey('type', $response->json()['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();
        $payload = ['files' => [UploadedFile::fake()->create('foo.jpg')], 'type' => 'article'];

        //user without permissions can't upload static images
        $user->permissions = null;
        $response = $this->actingAs($user)->json('POST', "secure/images/static/upload", $payload);
        $response->assertStatus(403);

        //user with permissions can upload static images
        $user->permissions = '{"uploads.create":1}';
        $response = $this->actingAs($user)->json('POST', "secure/images/static/upload", $payload);
        $response->assertStatus(201);
    }
}
