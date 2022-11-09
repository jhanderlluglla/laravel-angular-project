<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">

    <title>{{ $utils->getCategoryTitle($category) }}</title>

    <meta name="google" content="notranslate">
    <link rel="canonical" href="{{ $utils->getCategoryUrl($category) }}">

    <meta itemprop="name" content="{{ $utils->getCategoryTitle($category) }}">

    <!-- Twitter Card data -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{{ $utils->getCategoryTitle($category) }}">
    <meta name="twitter:url" content="{{ $utils->getCategoryUrl($category) }}">

    <!-- Open Graph data -->
    <meta property="og:title" content="{{ $utils->getCategoryTitle($category) }}">
    <meta property="og:url" content="{{ $utils->getCategoryUrl($category) }}">
    <meta property="og:site_name" content="{{ $utils->getSiteName() }}">

    <meta property="og:type" content="website">

    <meta property="og:description" content="{{ $utils->getCategoryDescription($category) }}">
    <meta itemprop="description" content="{{ $utils->getCategoryDescription($category) }}">
    <meta property="description" content="{{ $utils->getCategoryDescription($category) }}">
    <meta name="twitter:description" content="{{ $utils->getCategoryDescription($category) }}">
</head>

<body>
    <h1 class="title">{{$category['name']}}</h1>

    <p>{{$category['description']}}</p>

    <div class="children">
        @foreach($category['children'] as $child)
            <div class="child">
                <h2><a href="{{$utils->getCategoryUrl($child)}}">{{$child['name']}}</a></h2>
            </div>
        @endforeach
    </div>

    <div class="articles">
        @foreach($category['articles'] as $article)
            <div class="article">
                <h2><a href="{{$utils->getArticleUrl($article)}}">{{$article['title']}}</a></h2>
            </div>
        @endforeach
    </div>
</body>
</html>
