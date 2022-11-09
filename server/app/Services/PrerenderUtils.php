<?php namespace App\Services;

use App\Article;
use App\Category;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Symfony\Component\DomCrawler\Crawler;

class PrerenderUtils
{
    /**
     * @var Request
     */
    private $request;

    /**
     * @var Settings
     */
    private $settings;

    /**
     * PrerenderUtils constructor.
     *
     * @param Request $request
     * @param Settings $settings
     */
    public function __construct(Request $request, Settings $settings)
    {
        $this->request = $request;
        $this->settings = $settings;
    }

    /**
     * Get site name setting.
     *
     * @return string
     */
    public function getSiteName()
    {
        return $this->settings->get('branding.site_name');
    }

    /**
     * Get article seo title.
     *
     * @param Article $article
     * @return string
     */
    public function getArticleTitle($article)
    {
        $title = $this->settings->get("seo.article_title");
        return $this->replacePlaceholder('ARTICLE_TITLE', $article['title'], $title);
    }

    /**
     * Get article seo description.
     *
     * @param Article $article
     * @return string
     */
    public function getArticleDescription($article)
    {
        $description = $this->settings->get("seo.article_description");
        $stripped = str_limit($article['description'], 160);
        return $this->replacePlaceholder('ARTICLE_DESCRIPTION', $stripped, $description);
    }

    /**
     * Get category seo title.
     *
     * @param Category $category
     * @return string
     */
    public function getCategoryTitle($category)
    {
        $title = $this->settings->get("seo.category_title");
        return $this->replacePlaceholder('CATEGORY_NAME', $category['name'], $title);
    }

    /**
     * Get category seo description.
     *
     * @param Category $category
     * @return string
     */
    public function getCategoryDescription($category)
    {
        $description = $this->settings->get("seo.category_description");
        $default = "List of articles for {$category['name']}";
        $replace = $category->description ? $category['description'] : $default;
        return $this->replacePlaceholder('CATEGORY_NAME', $replace, $description);
    }

    /**
     * Get search page seo title.
     *
     * @param string $query
     * @return string
     */
    public function getSearchTitle($query)
    {
        $title = $this->settings->get("seo.search_title");
        return $this->replacePlaceholder('QUERY', $query, $title);
    }

    /**
     * Get search page seo description.
     *
     * @param string $query
     * @return string
     */
    public function getSearchDescription($query)
    {
        $description = $this->settings->get("seo.search_description");
        return $this->replacePlaceholder('QUERY', $query, $description);
    }

    /**
     * Get help center homepage seo title.
     *
     * @return string
     */
    public function getHomeTitle()
    {
        return $this->settings->get("seo.home_title");
    }

    /**
     * Get help center homepage seo description.
     *
     * @return string
     */
    public function getHomeDescription()
    {
        return $this->settings->get("seo.home_description");
    }

    /**
     * Format timestamp into format valid for meta tags.
     *
     * @param string $timestamp
     * @return string
     */
    public function formatTimestamp($timestamp)
    {
        return $timestamp;
    }

    /**
     * Extract url of first image in specified html.
     *
     * @param string $html
     * @return string|null
     */
    public function extractImageSrc($html)
    {
        $crawler = new Crawler();
        $crawler->addHtmlContent($html);
        $img = $crawler->filter('img')->getNode(0);

        return $img ? $img->getAttribute('src') : null;
    }

    /**
     * Get absolute url for specified article.
     *
     * @param array $article
     * @return string
     */
    public function getArticleUrl($article)
    {
        $slug = (isset($article['slug']) && $article['slug']) ? $article['slug'] : Str::slug($article['title']);
        return url("help-center/articles/{$article['id']}/{$slug}");
    }

    /**
     * Get absolute url for specified category.
     *
     * @param array $category
     * @return string
     */
    public function getCategoryUrl($category)
    {
        $slug = Str::slug($category['name']);
        return url("help-center/categories/{$category['id']}/{$slug}");
    }

    /**
     * Get absolute url for specified search query.
     *
     * @param string $query
     * @return string
     */
    public function getSearchUrl($query)
    {
        return url("help-center/search/".Str::slug($query));
    }

    /**
     * Get absolute url for help center homepage.
     *
     * @return string
     */
    public function getHomeUrl()
    {
        return url('help-center');
    }

    /**
     * Replace placeholder with actual value in specified string.
     *
     * @param string $key
     * @param string $value
     * @param string $subject
     * @return string
     */
    private function replacePlaceholder($key, $value, $subject) {
        return str_replace('{{'.$key.'}}', $value, $subject);
    }
}