<?php namespace App\Services\HelpCenter;

use DB;
use App\Tag;
use Artisan;
use Storage;
use Exception;
use ZipArchive;
use App\Upload;
use App\Article;
use App\Category;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Symfony\Component\DomCrawler\Crawler;

class HelpCenterActions {

    /**
     * @var Article
     */
    private $article;

    /**
     * @var Category
     */
    private $category;

    /**
     * @var Tag
     */
    private $tag;

    /**
     * ArticleActions constructor.
     *
     * @param Article $article
     * @param Category $category
     * @param Tag $tag
     */
    public function __construct(Article $article, Category $category, Tag $tag)
    {
        $this->tag = $tag;
        $this->article = $article;
        $this->category = $category;
    }

    /**
     * Delete help center images that are not attached to any articles.
     *
     * @return bool
     */
    public function deleteUnusedImages()
    {
        $names = $this->getAllHelpCenterImages();

        $files = Storage::disk('public')->files('article-images');
        $toDelete = array_diff($files, $names->toArray());

        return Storage::disk('public')->delete($toDelete);
    }

    /**
     * Export help center content and images in a .zip file.
     *
     * @return string
     */
    public function export()
    {
        $filename = storage_path('app/hc-export.zip');
        @unlink($filename);

        $zip = new ZipArchive();
        if ($zip->open($filename, ZipArchive::CREATE) !== TRUE) return null;

        //export help center images
        $this->exportImages($zip);

        //export base url
        $zip->addFromString('base-url.txt', config('app.url'));

        //export help center content
        $categories = $this->category->rootOnly()->with('children.articles.tags')->get();

        $zip->addFromString('help-center.json', json_encode($categories));

        $zip->close();

        return $filename;
    }

    /**
     * Import help center content and images from .zip file.
     *
     * @param string $path
     */
    public function import($path) {
        $zip = new ZipArchive();
        $zip->open($path);

        //store help center images
        for ($i = 0; $i < $zip->numFiles; $i++){
            $stat = $zip->statIndex( $i );
            if (str_contains(dirname($stat['name']), 'images')) {
                Storage::disk('public')->put('article-images/'.last(explode('/', $stat['name'])), $zip->getFromIndex($stat['index']));
            }
        }

        $helpCenter = json_decode($zip->getFromName('help-center.json'), true);
        $oldBaseUri = $zip->getFromName('base-url.txt');
        $zip->close();

        //truncate old help center data
        DB::table('categories')->truncate();
        DB::table('articles')->truncate();
        DB::table('category_article')->truncate();

        //unguard models and clear old relations
        Category::unguard(); Article::unguard(); Tag::unguard(); Upload::unguard();
        DB::table('taggables')->where('taggable_type', Article::class)->delete();

        collect($helpCenter)->each(function($parentData) use($oldBaseUri) {

            //create parent categories
            $parent = $this->category->create(Arr::except($parentData, ['children', 'id']));

            //create child categories
            collect($parentData['children'])->each(function($childData) use($parent, $oldBaseUri) {
                $childData['parent_id'] = $parent->id;
                $child = $this->category->create(Arr::except($childData, ['articles', 'id']));

                //create articles
                collect($childData['articles'])->each(function($articleData) use($child, $parent, $oldBaseUri) {
                    $articleData['body'] = $this->transformArticleBody($articleData['body'], $oldBaseUri);

                    $article = $this->article->firstOrCreate(Arr::except($articleData, ['tags', 'id']));
                    $article->categories()->attach([$child->id, $parent->id]);

                    //create tags
                    collect($articleData['tags'])->each(function($tagData) use($article) {
                        $attrs = ['name' => $tagData['name'], 'type' => $tagData['type'], 'display_name' => $tagData['display_name']];
                        $tag = $this->tag->where('name', $tagData['name'])->first();
                        if ( ! $tag) $tag = $this->tag->create($attrs);

                        try {
                            $article->tags()->attach($tag->id);
                        } catch(Exception $e) {}
                    });
                });
            });
        });

        Artisan::call('cache:clear', ['--force']);
    }

    /**
     * Make any needed transformations to specified article body.
     *
     * @param string $body
     * @param string $oldBaseUri
     *
     * @return string
     */
    private function transformArticleBody($body, $oldBaseUri)
    {
        $crawler = new Crawler();
        $crawler->addHtmlContent($body);

        $crawler->filter('img')->each(function (Crawler $node) use($oldBaseUri) {
            $oldSrc  = $node->attr('src');
            $needles = [$oldBaseUri, 'http://localhost:4200'];

            if (str_contains($oldSrc, $needles)) {
                $newSrc = str_replace($needles, config('app.url'), $oldSrc);
                $node->getNode(0)->setAttribute('src', $newSrc);
            }
        });

        return $crawler->filter('body')->html();
    }

    /**
     * Export help center images into a specified .zip file.
     *
     * @param ZipArchive $zip
     */
    private function exportImages(ZipArchive $zip)
    {
        $names = $this->getAllHelpCenterImages();

        $names->each(function($name) use ($zip) {
            $contents = Storage::disk('public')->get($name);
            $zip->addFromString("images/$name", $contents);
        });
    }

    /**
     * Get all non external help center article images.
     *
     * @return Collection
     */
    private function getAllHelpCenterImages()
    {
        $host = parse_url(config('app.url'))['host'];
        $names = collect();

        $this->article->get()->each(function (Article $article) use ($host, $names) {
            $crawler = new Crawler();
            $crawler->addHtmlContent($article->body);

            $crawler->filter('img')->each(function (Crawler $node) use ($host, $names) {
                if (str_contains($node->attr('src'), $host)) {
                    preg_match('/(article-images\/.+)$/', $node->attr('src'), $matches);
                    $names->push($matches[1]);
                }
            });
        });

        return $names;
    }
}