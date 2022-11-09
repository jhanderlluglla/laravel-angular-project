<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

        <style type="text/css">
            table td {
                border-collapse: collapse;
            }

            body[dir=rtl] {
                direction: rtl;
                unicode-bidi: embed;
            }

            @font-face {
                font-family: 'Century Gothic';
                src: 
                    url({{ public_path('assets/fonts/Century Gothic.ttf') }}), 
                    url({{ public_path('assets/fonts/CenturyGothic.ttf') }}),  
                    url({{ public_path('assets/fonts/GOTHIC.ttf')}}),
                    url({{ public_path('assets/fonts/GOTHICB.ttf')}}),
                    url({{ public_path('assets/fonts/GOTHICB0.ttf')}}),
                    url({{ public_path('assets/fonts/GOTHICBI.ttf')}}),
                    url({{ public_path('assets/fonts/GOTHICI.ttf')}});
            }

            body {
                font-family: 'Century Gothic';
                font-size: 12px;
            }
        </style>
    </head>

    <body style="width: 100%!important; margin: 0; padding: 0;">
        @yield('content')
    </body>
</html>
