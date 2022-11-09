<?php namespace App\Services;

use Cache;
use Carbon\Carbon;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\TransferException;
use Illuminate\Support\Collection;

class SentryApiClient
{
    /**
     * Guzzle Http client.
     *
     * @var Client
     */
    private $http;

    /**
     * Base sentry API url.
     *
     * @var string
     */
    private static $base = 'https://sentry.io/api/0/';

    /**
     * SentryApiClient constructor.
     *
     * @param Client $http
     */
    public function __construct(Client $http)
    {
        $this->http = $http;
    }

    /**
     * Get recent errors from sentry API.
     *
     * @return Collection
     */
    public function getErrors()
    {
        return Cache::remember('sentry.errors', Carbon::now()->addHour(), function() {
            return collect($this->call('projects/vebto/bedrive/issues'))->map(function ($err) {
                return [
                    'id' => $err['id'],
                    'type' => $err['type'],
                    'logger' => $err['logger'],
                    'has_seen' => $err['hasSeen'],
                    'date_ago' => Carbon::parse($err['lastSeen'])->diffForHumans(),
                    'date' => $err['lastSeen'],
                    'title' => $err['title'],
                    'description' => $err['culprit'],
                ];
            });
        });
    }


    /**
     * Call specified sentry API uri.
     *
     * @param string $uri
     * @param array $params
     * @return array
     */
    public function call($uri, $params = [])
    {
        $response = $this->http->get(self::$base . $uri . '/', [
            'headers' => ['Authorization' => 'Bearer ' . config('services.sentry.api_token')],
            'query' => $params,
        ]);

        return json_decode($response->getBody()->getContents(), true) ?: [];
    }
}
