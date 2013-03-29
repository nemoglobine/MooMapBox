MooMapBox
=========

MapBox for Mootools 1.4

How to use
----------

First, you need to create an account on this site https://tiles.mapbox.com/
to create your Map and use it in your site.

After, edit Html page of your site like this :

    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
            <link href='http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.css' rel='stylesheet' />
            <script src='http://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.js'></script>
            <script type="text/javascript" src="mootools-core-1.4.5.js"></script>
            <script type="text/javascript" src="MooMapBox.js"></script>
        </head>
        <body>
            <div id='map'></div>
            <script>
                var MyMapBox = null;
                window.addEvent('domready', function () {
                    MyMapBox = new MooMapBox($('map'), 'id_of_your_mapbox');
                });
            </script>
        </body>
    </html>
