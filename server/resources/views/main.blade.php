<html>
    <head>
        <title>{{ $settings->get('branding.site_name') }}</title>

        <base href="{{ $htmlBaseUri }}">

        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link href='https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,400italic' rel='stylesheet' type='text/css'>
        <link rel="icon" type="image/x-icon" href="favicon.ico">


        {{--angular styles begin--}}
		<link href="styles.4c481cb4f00b594c74e8.bundle.css" rel="stylesheet" />
		{{--angular styles end--}}

        @if ($settings->has('custom_code.css'))
            <style>{!! $settings->get('custom_code.css') !!}</style>
        @endif
	</head>

    <body>
        <app-root></app-root>

        <script>
            window.bootstrapData = "{!! $bootstrapData !!}";
        </script>

        {{--angular scripts begin--}}
		<script type="text/javascript" src="inline.584f0c9878e0c4b58a54.bundle.js"></script>
        <script type="text/javascript" src="polyfills.8736bd7b7e2705fb4847.bundle.js"></script>
        <script type="text/javascript" src="scripts.af6f73aff26a9815c786.bundle.js"></script>
        <script type="text/javascript" src="vendor.2afcb15b0a74ae78e6de.bundle.js"></script>
        <script type="text/javascript" src="main.345d947aed752e03ebf7.bundle.js"></script>
		{{--angular scripts end--}}

        @if ($settings->has('custom_code.js'))
            <script>{!! $settings->get('custom_code.js') !!}</script>
        @endif
	</body>
</html>