<?php

use App\Upload;
use App\Services\Files\Response\AudioVideoResponse;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class UploadsShowTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_returns_image_content()
    {
        $upload = factory(App\Upload::class)->create(['mime' => 'image/png']);
        Storage::shouldReceive('exists')->with($upload->path)->once()->andReturn(true);
        Storage::shouldReceive('get')->with($upload->path)->once()->andReturn('foo bar');

        $response = $this->asAdmin()->call('GET', "secure/uploads/$upload->id");
        $response->assertStatus(200);

        $this->assertEquals('foo bar', $response->getContent());
        $this->assertEquals($upload->mime, $response->headers->get('Content-Type'));
    }

    public function test_it_returns_basic_file_contents()
    {
        $upload = factory(App\Upload::class)->create(['mime' => 'text/plain']);
        Storage::shouldReceive('exists')->with($upload->path)->once()->andReturn(true);
        Storage::shouldReceive('get')->with($upload->path)->once()->andReturn('foo bar');

        $response = $this->asAdmin()->call('GET', "secure/uploads/$upload->id");
        $response->assertStatus(200);

        $this->assertEquals('foo bar', $response->getContent());
        $this->assertContains($upload->mime, $response->headers->get('Content-Type'));
    }

    public function test_it_streams_audio_or_video_file()
    {
        $upload = factory(App\Upload::class)->create(['mime' => 'audio/mpeg3']);
        Storage::shouldReceive('exists')->with($upload->path)->once()->andReturn(true);
        $mock = Mockery::mock(AudioVideoResponse::class);
        $mock->shouldReceive('create')->with(App\Upload::class)->once()->andReturn('foo bar');
        App::instance(AudioVideoResponse::class, $mock);

        $response = $this->asAdmin()->call('GET', "secure/uploads/$upload->id");
        $response->assertStatus(200);

        $this->assertEquals('foo bar', $response->getContent());
    }

    public function test_it_returns_404_if_upload_does_not_exist_in_filesystem()
    {
        $upload = factory(App\Upload::class)->create();

        $response = $this->asAdmin()->call('GET', "secure/uploads/$upload->id");
        $response->assertStatus(404);
    }

    public function test_it_checks_permissions()
    {
        $this->mock(App\Services\Files\Response\FileContentResponseCreator::class);

        $user   = $this->getRegularUser();
        $upload = factory(App\Upload::class)->create();
        $userUpload = factory(App\Upload::class)->create(['user_id' => $user->id]);

        //guests can't view uploads
        $response = $this->call('GET', "secure/uploads/$upload->id");
        $response->assertStatus(403);

        //regular users can't view other user uploads
        $response = $this->actingAs($user)->call('GET', "secure/uploads/$upload->id");
        $response->assertStatus(403);

        //regular users can view their own uploads
        $response = $this->actingAs($user)->call('GET', "secure/uploads/$userUpload->id");
        $response->assertStatus(200);

        //user with permissions can view all uploads
        $user->permissions = '{"uploads.view":1}';
        $response = $this->actingAs($user)->call('GET', "secure/uploads/$upload->id");
        $response->assertStatus(200);
    }
}
