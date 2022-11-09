<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">

    <title>{{ $utils->getHomeTitle() }}</title>

    <meta name="google" content="notranslate">
    <link rel="canonical" href="{{ $utils->getHomeUrl() }}">

    <meta itemprop="name" content="{{ $utils->getHomeTitle() }}">

    <!-- Twitter Card data -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{{ $utils->getHomeTitle() }}">
    <meta name="twitter:url" content="{{ $utils->getHomeUrl() }}">

    <!-- Open Graph data -->
    <meta property="og:title" content="{{ $utils->getHomeTitle() }}">
    <meta property="og:url" content="{{ $utils->getHomeUrl() }}">
    <meta property="og:site_name" content="{{ $utils->getSiteName() }}">
    <meta property="og:type" content="website">

    <meta property="og:description" content="{{ $utils->getHomeDescription() }}">
    <meta itemprop="description" content="{{ $utils->getHomeDescription() }}">
    <meta property="description" content="{{ $utils->getHomeDescription() }}">
    <meta name="twitter:description" content="{{ $utils->getHomeDescription() }}">
</head>

<body>
    <h1>{{ $utils->getHomeTitle() }}</h1>

    @foreach($categories as $category)
        @if( ! $category['hidden'])
            <section class="category">
                <div class="category-info">
                    <h2 class="category-name"><a class="text" href="{{$utils->getCategoryUrl($category)}}">{{$category['name']}}</a></h2>

                    @if($category['description'])
                        <p class="category-description">{{$category['description']}}</p>
                    @endif
                </div>

                @if(isset($category['articles']))
                    <div class="articles-list">
                        @foreach($category['articles'] as $article)
                            <a class="article" href="{{$utils->getArticleUrl($article)}}">
                                <span class="text">{{$article['title']}}</span>
                            </a>
                        @endforeach
                    </div>
                @endif

                <div class="child-categories">
                    @foreach($category['children'] as $child)
                        @if( ! $child['hidden'])
                            <div class="child-category">

                                <div class="title">
                                    <h3 class="child-category-name">
                                        <a href="{{$utils->getCategoryUrl($child)}}">{{$child['name']}} ({{$child['articles_count']}})</a>
                                    </h3>
                                </div>

                                <div class="articles-list">
                                    @foreach($child['articles'] as $article)
                                        <a class="article" href="{{$utils->getArticleUrl($article)}}">
                                            <span class="text">{{$article['title']}}</span>
                                        </a>
                                    @endforeach
                                </div>
                            </div>
                        @endif
                    @endforeach
                </div>
            </section>
        @endif
    @endforeach
</body>
</html>
