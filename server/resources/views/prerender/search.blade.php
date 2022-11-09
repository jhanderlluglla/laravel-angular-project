<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">

    <title>{{ $utils->getSearchTitle($query) }}</title>

    <meta name="google" content="notranslate">
    <link rel="canonical" href="{{ $utils->getSearchUrl($query) }}">

    <meta itemprop="name" content="{{ $utils->getSearchTitle($query) }}">

    <!-- Twitter Card data -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{{ $utils->getSearchTitle($query) }}">
    <meta name="twitter:url" content="{{ $utils->getSearchUrl($query) }}">

    <!-- Open Graph data -->
    <meta property="og:title" content="{{ $utils->getSearchTitle($query) }}">
    <meta property="og:url" content="{{ $utils->getSearchUrl($query) }}">
    <meta property="og:site_name" content="{{ $utils->getSiteName() }}">
    <meta property="og:type" content="website">

    <meta property="og:description" content="{{ $utils->getSearchDescription($query) }}">
    <meta itemprop="description" content="{{ $utils->getSearchDescription($query) }}">
    <meta property="description" content="{{ $utils->getSearchDescription($query) }}">
    <meta name="twitter:description" content="{{ $utils->getSearchDescription($query) }}">
</head>

<body>
    <h1>{{ $utils->getSearchTitle($query) }}</h1>

    <div class="articles">
        @foreach($articles as $article)
            <div class="article">
                <a class="title" href="{{$utils->getArticleUrl($article)}}">{{$article['title']}}</a>
                <div class="body">{{$article['body']}}</div>

                @if( ! empty($article['categories']))
                    @if ($article['categories'][0] && $article['categories'][0]->parent)
                        <div class="parent-category">
                            <a class="parent" href="{{$utils->getCategoryUrl($article['categories'][0]->parent)}}">{{$article['categories'][0]['parent']['name']}}</a>
                        </div>
                    @endif

                    <div class="child-category">
                        <a class="child" href="{{$utils->getCategoryUrl($article['categories'][0])}}">{{$article['categories'][0]['name']}}</a>
                    </div>
                @endif
            </div>
        @endforeach
    </div>
</body>
</html>
