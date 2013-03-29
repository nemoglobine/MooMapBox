/*
---
name: MooMapBox
description: MapBox with Mootools

license: MIT-style

authors:
- nemoglobine

requires:
- Core/Class
- MapBox.api.js

provides: [MooMapBox]

*/
var MooMapBox = new Class({
    
    Implements: [Options, Events],
    
    options: {
        zoom: {
            start: 2,
            min: 2,
            max: 6
        },
        center: {
            lat: 27,
            lon: 15
        },
        pan: {
            on: true,
            limits: [
                { lat: 85, lon: -177 }, 
                { lat: -85, lon: 202 }
            ]
        },
        ui: {
            smooth:     true,
            zoomer:     true,
            fullscreen: false,
            drag:       true,
            wheel:      true,
            dbclick:    true,
            touch:      false
        },
        markers: {
            showSpeed: 0,
            toggleLayer: {
                fxOnFilter: true,
                fxOptions: {
                    // short | normal | long
                    duration:   'normal', 
                    // linear | quad[: in | out ] | sine[: in | out ] ...
                    transition: 'linear', 
                    // chain | cancel | ignore
                    link:       'chain' 
                }
            }
        },
        hackEvent: {
            mousedown:  100,
            click:      100
        }
    },
    
    initialize: function (container, id_map, options) {
        this.setOptions(options);
        
        this.container  = container ;
        this.id_map     = id_map ;
        
        this.initMap();
    },
    initMap: function () {
        var handlers = [];
        if (this.options.ui.drag) {
            handlers.push(easey_handlers.DragHandler());
        }
        if (this.options.ui.wheel) {
            handlers.push(easey_handlers.MouseWheelHandler());
        }
        if (this.options.ui.dbclick) {
            handlers.push(easey_handlers.DoubleClickHandler());
        }
        if (this.options.ui.touch) {
            handlers.push(easey_handlers.TouchHandler());
        }
        this.marker_layer = mapbox.markers.layer();
        this.map = mapbox.map(
            this.container, 
            [
                mapbox.layer().id(this.id_map), 
                this.marker_layer
            ], 
            null, 
            handlers
        );
        if (this.options.pan.on) {
            this.setPanLimits(this.options.pan.limits);
        }
        mapbox.markers.interaction(this.marker_layer);
        this
            .setZoom(this.options.zoom.start)
            .setZoomRange(this.options.zoom.min, this.options.zoom.max)
            .setCenter(this.options.center)
            .setSmooth(this.options.ui.smooth)
        ;
        if (this.options.ui.zoomer) {
            this.map.ui.zoomer.add();
        }
        if (this.options.ui.fullscreen) {
            this.map.ui.fullscreen.add();
        }
        this.initClickEvent();
        this.map.addCallback('drawn', function (map) {
            this.fireEvent('drawn');
        }.bind(this));
        this.map.addCallback('extentset', function (map, extent) {
            this.fireEvent('extentset');
        }.bind(this));
        this.map.addCallback('panned', function (map, panOffset) {
            this.fireEvent('panned');
        }.bind(this));
        this.map.addCallback('resized', function (map, dimensions) {
            this.fireEvent('resized');
        }.bind(this));
        this.map.addCallback('zoomed', function (map, zoomOffset) {
            this.fireEvent('zoomed');
        }.bind(this));
        this.fireEvent('ready');
    },
    initClickEvent: function () {
        this.timerEvent = null;
        this.drag       = false;
        MM.addEvent(this.map.parent, 'mousedown', function(e) {
            if (e.buttons == 1) {
                //if (e) e.stopImmediatePropagation();
                clearTimeout(this.timerEvent);
                this.timerEvent = (function(){
                    this.drag = true;
                    //console.log('drag');
                }).delay(this.options.hackEvent.mousedown, this);
            }
        }.bind(this));
        MM.addEvent(this.map.parent, 'dblclick', function(e) {
            clearTimeout(this.timerEvent);
            //console.log('dblclick');
        }.bind(this));
        MM.addEvent(this.map.parent, 'click', function(e) {
            if (!this.drag) {
                //if (e) e.stopImmediatePropagation();
                clearTimeout(this.timerEvent);
                this.timerEvent = (function(){
                    //console.log('click');
                    var px  = MM.getMousePoint(e, this.map);
                    var pt  = this.map.pointLocation(px);
                    this.fireEvent('click', [px, pt]);
                }).delay(this.options.hackEvent.click, this);
            } else {
                this.drag = false ;
            }
        }.bind(this));
    },
    /* ## MAP ############################################################### */
    getZoom: function () {
        return this.map.zoom();
    },
    setZoom: function (value) {
        this.map.zoom(value, true);
        return this ;
    },
    setZoomRange: function (min, max) {
        this.map.setZoomRange(min, max);
        return this ;
    },
    getExtent: function () {
        return this.map.getExtent();
    },
    setExtent: function (ext) {
        this.map.setExtent(ext);
        return this ;
    },
    setPanLimits: function (ext) {
        this.map.setPanLimits(ext);
        return this ;
    },
    setCenter: function (coord) {
        this.map.center(coord);
        return this ;
    },
    getCenter: function () {
        return this.map.coordinate ;
    },
    setSmooth: function (bool) {
        this.map.smooth(bool);
        return this ;
    },
    setSize: function (size) {
        this.map.setSize(size);
        return this ;
    },
    getSize: function () {
        return this.map.dimensions ;
    },
    goTo: function (coord, zoom, bool_animate) {
        this.map.centerzoom(coord, zoom, bool_animate);
        //this.map.ease.location(coord).zoom(zoom).optimal();
        return this ;
    },
    /* ## CONVERT ########################################################### */
    pointToLocation: function (point) {
        return this.map.pointLocation(point) ;
    },
    locationToPoint: function (location) {
        return this.map.locationPoint(location) ;
    },
    /* ## UI ################################################################ */
    setAttribution: function (content) {
        this.map.ui.attribution.add().content(content);
        return this ;
    },
    delAttribution: function () {
        this.map.ui.attribution.remove();
        return this ;
    },
    setLegend: function (content) {
        this.map.ui.legend.add().content(content);
        return this ;
    },
    delLegend: function () {
        this.map.ui.legend.remove();
        return this ;
    },
    /* ## MARKERS ########################################################### */
    loadMarkersGeoJson: function (url) {
        this.marker_layer.url(url);
        return this ;
    },
    addMarker: function (features) {
        this.marker_layer.add_feature(features);
        return this ;
    },
    setMarkers: function (markers_features) {
        this.markers_features = markers_features;
        this.nb_maker = markers_features.length;
        return this ;
    },
    showMarkers: function () {
        if (this.options.markers.showSpeed > 0) {
            this.curMakerAdd = 0;
            this.timerShowMarker = this.showMarkerPeriodical.periodical(
                this.options.markers.showSpeed, this
            );
        } else {
            this.marker_layer.features(this.markers_features);
            //this.markers_features.each(this.addMarker.bind(this));
        }
        return this ;
    },
    showMarkerPeriodical: function () {
        if (this.curMakerAdd < this.nb_maker) {
            this.addMarker(this.markers_features[this.curMakerAdd++]);
        } else {
            clearTimeout(this.timerShowMarker);
        }
    },
    addFilters: function (container, func) {
        var callback = func || function(f) {
            if (this.hasClass('all')) {
                return true ;
            }
            var rel = this.get('rel');
            if (rel) {
                var tmp = rel.split(':');
                if (tmp.length === 2) {
                    return f[tmp[0]][tmp[1]] === this.get('href');
                }
            }
            return false;
        };
        var self = this ;
        var filters = container.getElements('a');
        filters.addEvent('click', function (e) {
            if (e) e.stop();
            var linkFilter = this ;
            filters.removeClass('active');
            this.addClass('active');
            if (self.options.markers.toggleLayer.fxOnFilter) {
                var myFx = self.getLayerMarkersFx();
                myFx.start(1, 0).chain(function () {
                    self.marker_layer.filter(callback.bind(linkFilter));
                    this.start(0, 1);
                });
            } else {
                self.marker_layer.filter(callback.bind(linkFilter));
            }
        });
    },
    getLayerMarkersFx: function () {
        if (!this.LayerMarkersFx) {
            this.LayerMarkersFx = new Fx.Tween(
                this.marker_layer.parent, 
                Object.merge(
                    this.options.markers.toggleLayer.fxOptions, 
                    { property: 'opacity' }
                )
            );
        }
        return this.LayerMarkersFx ;
    },
    hideLayerMarkers: function (fx) {
        if (fx) {
            this.getLayerMarkersFx().start(1, 0);
        } else {
            this.marker_layer.parent.setStyle('opacity', 0);
        }
        return this ;
    },
    showLayerMarkers: function (fx) {
        if (fx) {
            this.getLayerMarkersFx().start(0, 1);
        } else {
            this.marker_layer.parent.setStyle('opacity', 1);
        }
        return this ;
    }
});