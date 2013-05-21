﻿/*!
 * HeadJS     The only script in your <HEAD>    
 * Author     Tero Piirainen  (tipiirai)
 * Maintainer Robert Hoffmann (itechnology)
 * License    MIT / http://bit.ly/mit-license
 *
 * Version 2.00
 * http://headjs.com
 */
; (function (win, undefined) {
    "use strict";

    // gt, gte, lt, lte, eq breakpoints would have been more simple to write as ['gt','gte','lt','lte','eq']
    // but then we would have had to loop over the collection on each resize() event,
    // a simple object with a direct access to true/false is therefore much more efficient
    var doc   = win.document,
        nav   = win.navigator,
        loc   = win.location,
        html  = doc.documentElement,
        klass = [],
        conf  = {
            widths    : [320, 480, 640, 768, 800, 1024, 1280, 1366, 1440, 1680, 1920],            
            heights   : [480, 600, 768, 800, 900, 1050],   
            widthCss  : { "gt": true, "gte": false, "lt": true, "lte": false, "eq": false },
            heightCss : { "gt": true, "gte": false, "lt": true, "lte": false, "eq": false },
            browsers  : [
                         // { ie     : [6,7,8,9,10] }
                         //,{ chrome : [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24] }
                         //,{ ff     : [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19] }
                         //,{ ios    : [3,4,5,6] }
                         //,{ android: [2,3,4] }
                         //,{ webkit : [9,10,11,12] }
                         //,{ opera  : [9,10,,11,12] }
                        ],
            browserCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": false },
            html5     : false,
            page      : "page",
            section   : "section",            
            hash      : "hash",
            head      : "head"
        };

    if (win.head_conf) {
        for (var item in win.head_conf) {
            if (win.head_conf[item] !== undefined) {
                conf[item] = win.head_conf[item];
            }
        }
    }

    function pushClass(name) {
        klass[klass.length] = name;
    }

    function removeClass(name) {
        var re = new RegExp(" \\b" + name + "\\b");
        html.className = html.className.replace(re, '');
    }

    function each(arr, fn) {
        // Array caching performance: http://bonsaiden.github.com/JavaScript-Garden/#array.general
        for (var i = 0, l = arr.length; i < l; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    // API
    var api = win[conf.head] = function () {
        api.ready.apply(null, arguments);
    };

    api.feature = function (key, enabled, queue) {

        // internal: apply all classes
        if (!key) {
            html.className += ' ' + klass.join(' ');
            klass = [];
            return api;
        }

        if (Object.prototype.toString.call(enabled) === '[object Function]') {
            enabled = enabled.call();
        }

        pushClass(key + "-" + enabled);
        api[key] = !!enabled;

        // apply class to HTML element
        if (!queue) {
            removeClass(key + '-false');
            removeClass(key);
            api.feature();
        }

        return api;
    };

    // no queue here, so we can remove any eventual pre-existing no-js class
    api.feature("js", true);

    // browser type & version
    var ua     = nav.userAgent.toLowerCase(),
        mobile = /mobile|android|kindle|silk|midp|(windows nt 6\.2.+arm|touch)/.test(ua);

    // useful for enabling/disabling feature (we can consider a desktop navigator to have more cpu/gpu power)        
    api.feature("mobile" , mobile , true);
    api.feature("desktop", !mobile, true);
    api.feature("touch"  , "ontouchstart" in win, true);
    
    // used by css router
    api.feature("hashchange", "onhashchange" in win, true);

    // http://www.zytrax.com/tech/web/browser_ids.htm
    // http://www.zytrax.com/tech/web/mobile_ids.html
    ua = /(chrome|firefox)[ \/]([\w.]+)/.exec(ua) || // Chrome & Firefox
         /(iphone|ipad|ipod)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile IOS
         /(android)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile Webkit
         /(webkit|opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Safari & Opera
         /(msie) ([\w.]+)/.exec(ua) || [];


    var browser = ua[1],
        version = parseFloat(ua[2]);    
    
    switch (browser) {
        case 'msie':
            browser = 'ie';
            version = doc.documentMode || version;
            break;

        case 'firefox':
            browser = 'ff';
            break;

        case 'ipod':
        case 'ipad':
        case 'iphone':
            browser = 'ios';
            break;

        case 'webkit':
            browser = 'safari';
            break;
    }

    // Browser vendor and version
    api.browser = {
        name   : browser,
        version: version
    };
    api.browser[browser] = true;
    
    // Array caching performance: http://bonsaiden.github.com/JavaScript-Garden/#array.general
    for (var i = 0, l = conf.browsers.length; i < l; i++) {
        for (var key in conf.browsers[i]) {
            if (browser === key) {
                pushClass(key + "-true");
                
                // Array caching performance: http://bonsaiden.github.com/JavaScript-Garden/#array.general
                for (var ii = 0, ll = conf.browsers[i][key].length; ii < ll; ii++) {
                    var supported = conf.browsers[i][key][ii];
                    if (version > supported) {
                        if (conf.browserCss.gt)
                            pushClass(key + "-gt" + supported);

                        if (conf.browserCss.gte)
                            pushClass(key +"-gte" + supported);
                    }
                    
                    else if (version < supported) {
                        if (conf.browserCss.lt)
                            pushClass(key + "-lt" + supported);

                        if (conf.browserCss.lte)
                            pushClass(key+ "-lte" + supported);
                    }
                    
                    else if (version === supported) {
                        if (conf.browserCss.lte)
                            pushClass(key + "-lte" + supported);

                        if (conf.browserCss.eq)
                            pushClass(key + "-eq" + supported);

                        if (conf.browserCss.gte)
                            pushClass(key + "-gte" + supported);
                    }
                }
            }
            else {
                pushClass(key + "-false");
            }
        }
    }

    pushClass(browser);
    pushClass(browser + parseInt(version, 10));

    // IE lt9 specific
    if (conf.html5 && browser === "ie" && version < 9) {
        // HTML5 support : you still need to add html5 css initialization styles to your site
        // See: assets/html5.css
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|main|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function (el) {
            doc.createElement(el);
        });
    }

    // CSS "router"
    function buildRoute() {
        /// <summary>can be used to emulate hashchange event by subscribing to win/doc onclick and testing if url has changed</summary>
        var routes = [];
        
        each(loc.pathname.split("/"), function (el, i) {
            if (this.length > 2 && this[i + 1] !== undefined) {
                if (i) {
                    pushClass(conf.section + "-" + this.slice(1, i + 1).join("-").toLowerCase().replace(/\./g, "-"));
                }
            } else {
                // pageId
                var id = el || "index", index = id.indexOf(".");
                if (index > 0) {
                    id = id.substring(0, index);
                }

                html.id = conf.page + "-" + id.toLowerCase();

                // on root?
                if (!i) {
                    pushClass(conf.section + "-root");
                }
            }
        });
    }

    buildRoute();

    // basic screen info
    api.screen = {
        height: win.screen.height,
        width : win.screen.width
    };

    // viewport resolutions: w-100, lt-480, lt-1024 ...
    function screenSize() {
        // remove earlier sizes
        html.className = html.className.replace(/ (w-|w-eq|w-gt|w-gte|w-lt|w-lte|h-|h-eq|h-gt|h-gte|h-lt|h-lte)\d+/g, "");
        
        // Viewport width
        var iw = win.innerWidth || html.clientWidth,
            ow = win.outerWidth || win.screen.width;
        
        api.screen.innerWidth = iw;
        api.screen.outerWidth = ow;
        
        // for debugging purposes, not really useful for anything else
        pushClass("w-" + iw);

        each(conf.widths, function (width) {
            if (iw > width) {
                if (conf.widthCss.gt)
                    pushClass("w-gt" + width);
                
                if (conf.widthCss.gte)
                    pushClass("w-gte" + width);
            }

            else if (iw < width) {
                if (conf.widthCss.lt)
                    pushClass("w-lt" + width);
                
                if (conf.widthCss.lte)
                    pushClass("w-lte" + width);
            }

            else if (iw === width) {
                if (conf.widthCss.lte)
                    pushClass("w-lte" + width);

                if (conf.widthCss.eq)
                    pushClass("w-eq" + width);

                if (conf.widthCss.gte)
                    pushClass("w-gte" + width);
            }
        });
        
        // Viewport height
        var ih = win.innerHeight || html.clientHeight,
            oh = win.outerHeight || win.screen.height;

        api.screen.innerHeight = ih;
        api.screen.outerHeight = oh;

        // for debugging purposes, not really useful for anything else
        pushClass("h-" + ih);

        each(conf.heights, function (height) {
            if (iw > height) {
                if (conf.heightCss.gt)
                    pushClass("h-gt" + height);
                
                if (conf.heightCss.gte)
                    pushClass("h-gte" + height);
            }

            else if (iw < width) {
                if (conf.heightCss.lt)
                    pushClass("h-lt" + width);
                
                if (conf.heightCss.lte)
                    pushClass("h-lte" + height);
            }

            else if (iw === width) {
                if (conf.heightCss.lte)
                    pushClass("h-lte" + height);

                if (conf.heightCss.eq)
                    pushClass("h-eq" + height);

                if (conf.heightCss.gte)
                    pushClass("h-gte" + height);
            }
        });
        


             
        // no need for onChange event to detect this
        api.feature("portrait" , (ih > iw));
        api.feature("landscape", (ih < iw));
    }

    screenSize();
    api.feature();

    // Throttle navigators from triggering too many resize events
    var resizeId = 0;
    function onResize() {
        win.clearTimeout(resizeId);
        resizeId = win.setTimeout(screenSize, 50);
    }

    // Manually attach, as to not overwrite existing handler
    if (win.addEventListener) {
        win.addEventListener("resize", onResize, false);

    } else {
        win.attachEvent("onresize", onResize);
    }
})(window);
