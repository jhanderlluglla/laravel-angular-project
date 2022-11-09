<?php

use App\Upload;
use App\Services\Files\Response\AudioVideoResponse;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class UploadsDownloadTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_downloads_specified_upload()
    {
        $upload = factory(App\Upload::class)->create();

        $response = $this->asAdmin()->call('GET', "secure/uploads/$upload->id/download");
        $response->assertStatus(200);

        $this->assertEquals('attachment; filename="'.$upload->name.'"', $response->headers->get('content-disposition'));
        $this->assertContains($upload->mime, $response->headers->get('content-type'));
    }

    public function test_it_returns_404_if_upload_does_not_exist()
    {
        $response = $this->asAdmin()->call('GET', "secure/uploads/1");
        $response->assertStatus(404);
    }

    public function test_it_checks_permissions()
    {
        $user   = $this->getRegularUser();
        $upload = factory(App\Upload::class)->create();
        $userUpload = factory(App\Upload::class)->create(['user_id' => $user->id]);

        //guests can't download uploads
        $response = $this->call('GET', "secure/uploads/$upload->id/download");
        $response->assertStatus(403);

        //regular users can't download other user uploads
        $response = $this->actingAs($user)->call('GET', "secure/uploads/$upload->id/download");
        $response->assertStatus(403);

        //regular users can download their own uploads
        $response = $this->actingAs($user)->call('GET', "secure/uploads/$userUpload->id/download");
        $response->assertStatus(200);

        //user with permissions can download all uploads
        $user->permissions = '{"uploads.view":1}';
        $response = $this->actingAs($user)->call('GET', "secure/uploads/$upload->id/download");
        $response->assertStatus(200);
    }
}
