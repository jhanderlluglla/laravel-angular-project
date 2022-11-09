<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">

    <title>{{ $utils->getArticleTitle($article) }}</title>

    <meta name="google" content="notranslate">
    <link rel="canonical" href="{{ $utils->getArticleUrl($article) }}">

    <meta itemprop="name" content="{{ $utils->getArticleTitle($article) }}">

    <!-- Twitter Card data -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{{ $utils->getArticleTitle($article) }}">
    <meta name="twitter:url" content="{{ $utils->getArticleUrl($article) }}">

    <!-- Open Graph data -->
    <meta property="og:title" content="{{ $utils->getArticleTitle($article) }}">
    <meta property="og:url" content="{{ $utils->getArticleUrl($article) }}">
    <meta property="og:site_name" content="{{ $utils->getSiteName() }}">

    <meta property="og:type" content="article">
    <meta property="article:published_time" content="{{$utils->formatTimestamp($article['created_at'])}}">
    <meta property="article:modified_time" content="{{$utils->formatTimestamp($article['updated_at'])}}">

    @foreach($article['tags'] as $tag)
        <meta property="article:tag" content="{{$tag['name']}}">
    @endforeach

    <meta property="og:description" content="{{ $utils->getArticleDescription($article) }}">
    <meta itemprop="description" content="{{ $utils->getArticleDescription($article) }}">
    <meta property="description" content="{{ $utils->getArticleDescription($article) }}">
    <meta name="twitter:description" content="{{ $utils->getArticleDescription($article) }}">

    @if($imgUrl = $utils->extractImageSrc($article['body']))
        <meta itemprop="image" content="{{ $imgUrl }}">
        <meta property="og:image" content="{{ $imgUrl }}">
        <meta name="twitter:image" content="{{ $imgUrl }}">
    @endif
</head>

<body>
    <h1 class="title">{{$article['title']}}</h1>

    {!! $article['body'] !!}

    <div class="tags">
        @foreach($article['tags'] as $tag)
            <span>{{$tag['name']}}</span>
        @endforeach
    </div>
</body>
</html>
