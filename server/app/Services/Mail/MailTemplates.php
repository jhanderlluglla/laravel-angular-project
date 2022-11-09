<?php namespace App\Services\Mail;

use App\MailTemplate;
use App\Services\Settings;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Filesystem\Filesystem;

class MailTemplates
{
    /**
     * @var Filesystem
     */
    private $fs;

    /**
     * @var MailTemplate
     */
    private $template;

    /**
     * Path to mail templates views directory.
     *
     * @var string
     */
    private $templatesPath;

    /**
     * @var Settings
     */
    private $settings;

    /**
     * SettingsTableSeeder constructor.
     *
     * @param Filesystem $fs
     * @param MailTemplate $template
     * @param Settings $settings
     */
    public function __construct(Filesystem $fs, MailTemplate $template, Settings $settings)
    {
        $this->fs = $fs;
        $this->settings = $settings;
        $this->template = $template;
        $this->templatesPath = resource_path('views/emails');
    }

    /**
     * Find mail template by specified id.
     *
     * @param integer $id
     * @return MailTemplate
     */
    public function findOrFail($id)
    {
        return $this->template->findOrFail($id);
    }

    /**
     * Get template by specified action.
     *
     * @param string $action
     * @param array $vars
     * @return array
     */
    public function getByAction($action, $vars = [])
    {
        $template = $this->template->where('action', $action)->first();
        $subject = $template->subject;

        //replace subject placeholders with specified values
        foreach($vars as $name => $value) {
            $subject = str_replace('{{'.strtoupper($name).'}}', $value, $subject);
        }

        //prefix view file name with folder name
        $type = $this->settings->get('mail.use_default_templates') ? 'default' : 'custom';
        $view = "emails/$type/" . basename($template->file_name, '.blade.php');

        return [
            'subject' => $subject,
            'html_view' => $view,
            'plain_view' => "{$view}-plain",
        ];
    }

    /**
     * Update specified mail template with data.
     *
     * @param integer|MailTemplate $idOrModel
     * @param array $data
     * @return array
     */
    public function update($idOrModel, $data)
    {
        $template = is_a($idOrModel, MailTemplate::class) ? $idOrModel : $this->findOrFail($idOrModel);

        $this->saveToDisk($template->file_name, $data['contents']);

        if (isset($data['subject'])) {
            $template->fill(['subject' => $data['subject']])->save();
        }

        return array_merge(['model' => $template], $this->getContents($template->file_name));
    }

    /**
     * Restore mail template contents to defaults.
     *
     * @param int $id
     * @return array
     */
    public function restoreDefault($id)
    {
        $template = $this->findOrFail($id);

        $defaults = $this->getContents($template->file_name, 'custom');

        return $this->update($template, ['contents' => $defaults]);
    }

    /**
     * Get all mail templates.
     *
     * @return Collection
     */
    public function getAll()
    {
        $templates = $this->template->all();

        return $templates->map(function(MailTemplate $template) {
            return array_merge(['model' => $template], $this->getContents($template->file_name));
        });
    }

    /**
     * Create a new custom mail template.
     *
     * @param array $config
     * @param bool $skipModel
     * @return MailTemplate|null
     */
    public function create($config, $skipModel = false)
    {
        $this->saveToDisk($config['file_name'], ['html' => $config['contents']]);

        if ($skipModel) return null;

        return $this->template->create(Arr::except($config, 'contents'));
    }

    /**
     * Return paths of all default templates.
     *
     * @return Collection
     */
    public function getDefault()
    {
        return collect($this->fs->files("$this->templatesPath/default"))->map(function($path) {
            return ['file_name' => basename($path), 'contents' => $this->fs->get($path)];
        });
    }

    /**
     * Update or create specified filename with contents.
     *
     * @param string $fileName
     * @param array $contents
     */
    private function saveToDisk($fileName, $contents)
    {
        $html = Arr::get($contents, 'html');
        $plain = Arr::get($contents, 'plain');

        $this->fs->put("$this->templatesPath/custom/$fileName", $html);

        if ($plain) {
            $name = $this->getPlainFileName($fileName);
            $this->fs->put("$this->templatesPath/custom/$name", $plain);
        }
    }

    /**
     * Get contents of specified mail template.
     *
     * @param string $fileName
     * @param string $type
     * @return array
     */
    public function getContents($fileName, $type = 'custom')
    {
        $contents = [
            'html'  => $this->fs->get("$this->templatesPath/$type/$fileName"),
        ];

        $plainFileName = $this->getPlainFileName($fileName);
        $plainPath = "$this->templatesPath/$type/$plainFileName";

        if ( $this->fs->exists($plainPath)) {
            $contents['plain'] = $this->fs->get($plainPath);
        }

        return $contents;
    }

    /**
     * Make plain template file name from base template file name.
     *
     * @param string $fileName
     * @return string
     */
    private function getPlainFileName($fileName)
    {
        return str_replace('.blade.php', '-plain.blade.php', $fileName);
    }

}