<?php

use App\Services\Settings;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class AppearanceSaveTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_saves_user_modifications_to_site_appearance()
    {
        Storage::fake('public'); Storage::fake('local');
        $settings = App::make(Settings::class);

        //store old and new logo on disk
        $oldLogoPath = 'branding-images/old-logo.png';
        $newLogoPath = 'branding-images/logo.png';
        Storage::disk('public')->put($oldLogoPath, 'foo');
        Storage::disk('public')->put($newLogoPath, 'bar');
        Storage::disk('public')->assertExists($oldLogoPath);
        $settings->set('logo', $oldLogoPath);

        $payload = [
            'foo.bar' => 'baz',
            'logo' => $newLogoPath,
            'colors' => ['theme' => 'foo-theme', 'themeValues' => ['foo' => 'bar']]
        ];

        $response = $this->asAdmin()->call('POST', "secure/admin/appearance", $payload);
        $response->assertStatus(200);

        //deletes old logo and stores new one in database
        Storage::disk('public')->assertMissing($oldLogoPath);
        Storage::disk('public')->assertExists($newLogoPath);
        $this->assertEquals('bar', Storage::disk('public')->get($newLogoPath));
        $this->assertEquals($newLogoPath, $settings->get('logo'));

        //saves basic setting
        $this->assertEquals('baz', $settings->get('foo.bar'));

        //saves CSS theme and user defined theme values
        $this->assertEquals('foo-theme', Storage::disk('public')->get('appearance/theme.css'));
        $this->assertEquals('{"foo":"bar"}', Storage::disk('public')->get('appearance/theme-values.json'));
    }

    public function test_it_checks_permissions()
    {
        //regular user can't save appearance
        $response = $this->asRegularUser()->call('POST', "secure/admin/appearance");
        $response->assertStatus(403);

        //admin can save appearance
        $response = $this->asAdmin()->call('POST', "secure/admin/appearance");
        $response->assertStatus(200);
    }
}
