(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
'use strict';
var EventModel = require('./src/event'),
    send = require('./src/send'),
    browser = require('./src/browser'),
    mixpanel = require('./src/mixpanel'),
    utils = require('./src/utils'),
    queue = window.metrics ? window.metrics._queue : null;
function Metrics(queue) {
  this.identity = {};
  this._queue = queue || [];
  if (this._queue.length) {
    for (var i = 0; i < this._queue.length; i += 1) {
      var call = this._queue[i];
      if (typeof this[call.method] === 'function') {
        this[call.method].apply(this, call.arguments);
      }
    }
    this._queue.length = 0;
  }
}
Metrics.prototype.init = function() {
  var options = arguments[0] !== (void 0) ? arguments[0] : {};
  this.options = options;
  this.url = (this.options.domain || '//gohone.com') + '/api/1.0/';
  require('./src/mixpanel')(options.mixpanel);
};
Metrics.prototype.track = function() {
  var eventName = arguments[0] !== (void 0) ? arguments[0] : 'Unknown';
  var meta = arguments[1] !== (void 0) ? arguments[1] : {};
  var event = new EventModel(eventName, meta, this.identity);
  send(this.url + 'Events', event.toObject());
  if (window.mixpanel) {
    window.mixpanel.track(eventName, meta);
  }
};
Metrics.prototype.identify = function() {
  var identity = arguments[0] !== (void 0) ? arguments[0] : {};
  this.identity = identity;
  if (window.mixpanel) {
    window.mixpanel.identify(identity.id);
    window.mixpanel.name_tag(identity.email);
  }
};
Metrics.prototype.register = function() {
  var identity = arguments[0] !== (void 0) ? arguments[0] : {};
  if (window.mixpanel) {
    window.mixpanel.register(identity);
  }
};
module.exports = window.metrics = new Metrics(queue);
module.exports.Metrics = Metrics;
module.exports.Event = EventModel;
module.exports._send = send;
module.exports._browser = browser;
module.exports._utils = utils;
module.exports.__mixpanel = mixpanel;

//# sourceMappingURL=<compileOutput>


},{"./src/browser":10,"./src/event":11,"./src/mixpanel":12,"./src/send":13,"./src/utils":14}],2:[function(require,module,exports){
/**
 * UAParser.js v0.7.3
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 * 
 * Copyright © 2012-2014 Faisal Salman <fyzlman@gmail.com>
 * Dual licensed under GPLv2 & MIT
 */

(function (window, undefined) {

    'use strict';

    //////////////
    // Constants
    /////////////


    var LIBVERSION  = '0.7.3',
        EMPTY       = '',
        UNKNOWN     = '?',
        FUNC_TYPE   = 'function',
        UNDEF_TYPE  = 'undefined',
        OBJ_TYPE    = 'object',
        MAJOR       = 'major',
        MODEL       = 'model',
        NAME        = 'name',
        TYPE        = 'type',
        VENDOR      = 'vendor',
        VERSION     = 'version',
        ARCHITECTURE= 'architecture',
        CONSOLE     = 'console',
        MOBILE      = 'mobile',
        TABLET      = 'tablet',
        SMARTTV     = 'smarttv',
        WEARABLE    = 'wearable',
        EMBEDDED    = 'embedded';


    ///////////
    // Helper
    //////////


    var util = {
        extend : function (regexes, extensions) {
            for (var i in extensions) {
                if ("browser cpu device engine os".indexOf(i) !== -1 && extensions[i].length % 2 === 0) {
                    regexes[i] = extensions[i].concat(regexes[i]);
                }
            }
            return regexes;
        },
        has : function (str1, str2) {
          if (typeof str1 === "string") {
            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
          }
        },
        lowerize : function (str) {
            return str.toLowerCase();
        }
    };


    ///////////////
    // Map helper
    //////////////


    var mapper = {

        rgx : function () {

            var result, i = 0, j, k, p, q, matches, match, args = arguments;

            // loop through all regexes maps
            while (i < args.length && !matches) {

                var regex = args[i],       // even sequence (0,2,4,..)
                    props = args[i + 1];   // odd sequence (1,3,5,..)

                // construct object barebones
                if (typeof(result) === UNDEF_TYPE) {
                    result = {};
                    for (p in props) {
                        q = props[p];
                        if (typeof(q) === OBJ_TYPE) {
                            result[q[0]] = undefined;
                        } else {
                            result[q] = undefined;
                        }
                    }
                }

                // try matching uastring with regexes
                j = k = 0;
                while (j < regex.length && !matches) {
                    matches = regex[j++].exec(this.getUA());
                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof(q) === OBJ_TYPE && q.length > 0) {
                                if (q.length == 2) {
                                    if (typeof(q[1]) == FUNC_TYPE) {
                                        // assign modified match
                                        result[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        result[q[0]] = q[1];
                                    }
                                } else if (q.length == 3) {
                                    // check whether function or regex
                                    if (typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length == 4) {
                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                result[q] = match ? match : undefined;
                            }
                        }
                    }
                }
                i += 2;
            }
            return result;
        },

        str : function (str, map) {

            for (var i in map) {
                // check if array
                if (typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
                    for (var j = 0; j < map[i].length; j++) {
                        if (util.has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (util.has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return str;
        }
    };


    ///////////////
    // String map
    //////////////


    var maps = {

        browser : {
            oldsafari : {
                major : {
                    '1' : ['/8', '/1', '/3'],
                    '2' : '/4',
                    '?' : '/'
                },
                version : {
                    '1.0'   : '/8',
                    '1.2'   : '/1',
                    '1.3'   : '/3',
                    '2.0'   : '/412',
                    '2.0.2' : '/416',
                    '2.0.3' : '/417',
                    '2.0.4' : '/419',
                    '?'     : '/'
                }
            }
        },

        device : {
            amazon : {
                model : {
                    'Fire Phone' : ['SD', 'KF']
                }
            },
            sprint : {
                model : {
                    'Evo Shift 4G' : '7373KT'
                },
                vendor : {
                    'HTC'       : 'APA',
                    'Sprint'    : 'Sprint'
                }
            }
        },

        os : {
            windows : {
                version : {
                    'ME'        : '4.90',
                    'NT 3.11'   : 'NT3.51',
                    'NT 4.0'    : 'NT4.0',
                    '2000'      : 'NT 5.0',
                    'XP'        : ['NT 5.1', 'NT 5.2'],
                    'Vista'     : 'NT 6.0',
                    '7'         : 'NT 6.1',
                    '8'         : 'NT 6.2',
                    '8.1'       : 'NT 6.3',
                    '10'        : 'NT 6.4',
                    'RT'        : 'ARM'
                }
            }
        }
    };


    //////////////
    // Regex map
    /////////////


    var regexes = {

        browser : [[

            // Presto based
            /(opera\smini)\/((\d+)?[\w\.-]+)/i,                                 // Opera Mini
            /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,                // Opera Mobi/Tablet
            /(opera).+version\/((\d+)?[\w\.]+)/i,                               // Opera > 9.80
            /(opera)[\/\s]+((\d+)?[\w\.]+)/i                                    // Opera < 9.80

            ], [NAME, VERSION, MAJOR], [

            /\s(opr)\/((\d+)?[\w\.]+)/i                                         // Opera Webkit
            ], [[NAME, 'Opera'], VERSION, MAJOR], [

            // Mixed
            /(kindle)\/((\d+)?[\w\.]+)/i,                                       // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,
                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

            // Trident based
            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,
                                                                                // Avant/IEMobile/SlimBrowser/Baidu
            /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,                                  // Internet Explorer

            // Webkit/KHTML based
            /(rekonq)((?:\/)[\w\.]+)*/i,                                        // Rekonq
            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i
                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron
            ], [NAME, VERSION, MAJOR], [

            /(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i                   // IE11
            ], [[NAME, 'IE'], VERSION, MAJOR], [

            /(yabrowser)\/((\d+)?[\w\.]+)/i                                     // Yandex
            ], [[NAME, 'Yandex'], VERSION, MAJOR], [

            /(comodo_dragon)\/((\d+)?[\w\.]+)/i                                 // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION, MAJOR], [ 

            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i,
                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
            /(uc\s?browser|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i
                                                                                //UCBrowser/QQBrowser
            ], [NAME, VERSION, MAJOR], [

            /(dolfin)\/((\d+)?[\w\.]+)/i                                        // Dolphin
            ], [[NAME, 'Dolphin'], VERSION, MAJOR], [

            /((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i                       // Chrome for Android/iOS
            ], [[NAME, 'Chrome'], VERSION, MAJOR], [

            /version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i                 // Mobile Safari
            ], [VERSION, MAJOR, [NAME, 'Mobile Safari']], [

            /version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i              // Safari & Safari Mobile
            ], [VERSION, MAJOR, NAME], [

            /webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i                   // Safari < 3.0
            ], [NAME, [MAJOR, mapper.str, maps.browser.oldsafari.major], [VERSION, mapper.str, maps.browser.oldsafari.version]], [

            /(konqueror)\/((\d+)?[\w\.]+)/i,                                    // Konqueror
            /(webkit|khtml)\/((\d+)?[\w\.]+)/i
            ], [NAME, VERSION, MAJOR], [

            // Gecko based
            /(navigator|netscape)\/((\d+)?[\w\.-]+)/i                           // Netscape
            ], [[NAME, 'Netscape'], VERSION, MAJOR], [
            /(swiftfox)/i,                                                      // Swiftfox
            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,
                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,
                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,                    // Mozilla

            // Other
            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf)[\/\s]?((\d+)?[\w\.]+)/i,
                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf
            /(links)\s\(((\d+)?[\w\.]+)/i,                                      // Links
            /(gobrowser)\/?((\d+)?[\w\.]+)*/i,                                  // GoBrowser
            /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,                             // ICE Browser
            /(mosaic)[\/\s]((\d+)?[\w\.]+)/i                                    // Mosaic
            ], [NAME, VERSION, MAJOR]

            /* /////////////////////
            // Media players BEGIN
            ////////////////////////

            , [

            /(apple(?:coremedia|))\/((\d+)[\w\._]+)/i,                          // Generic Apple CoreMedia
            /(coremedia) v((\d+)[\w\._]+)/i
            ], [NAME, VERSION, MAJOR], [

            /(aqualung|lyssna|bsplayer)\/((\d+)?[\w\.-]+)/i                     // Aqualung/Lyssna/BSPlayer
            ], [NAME, VERSION], [

            /(ares|ossproxy)\s((\d+)[\w\.-]+)/i                                 // Ares/OSSProxy
            ], [NAME, VERSION, MAJOR], [

            /(audacious|audimusicstream|amarok|bass|core|dalvik|gnomemplayer|music on console|nsplayer|psp-internetradioplayer|videos)\/((\d+)[\w\.-]+)/i,
                                                                                // Audacious/AudiMusicStream/Amarok/BASS/OpenCORE/Dalvik/GnomeMplayer/MoC
                                                                                // NSPlayer/PSP-InternetRadioPlayer/Videos
            /(clementine|music player daemon)\s((\d+)[\w\.-]+)/i,               // Clementine/MPD
            /(lg player|nexplayer)\s((\d+)[\d\.]+)/i,
            /player\/(nexplayer|lg player)\s((\d+)[\w\.-]+)/i                   // NexPlayer/LG Player
            ], [NAME, VERSION, MAJOR], [
            /(nexplayer)\s((\d+)[\w\.-]+)/i                                     // Nexplayer
            ], [NAME, VERSION, MAJOR], [

            /(flrp)\/((\d+)[\w\.-]+)/i                                          // Flip Player
            ], [[NAME, 'Flip Player'], VERSION, MAJOR], [

            /(fstream|nativehost|queryseekspider|ia-archiver|facebookexternalhit)/i
                                                                                // FStream/NativeHost/QuerySeekSpider/IA Archiver/facebookexternalhit
            ], [NAME], [

            /(gstreamer) souphttpsrc (?:\([^\)]+\)){0,1} libsoup\/((\d+)[\w\.-]+)/i
                                                                                // Gstreamer
            ], [NAME, VERSION, MAJOR], [

            /(htc streaming player)\s[\w_]+\s\/\s((\d+)[\d\.]+)/i,              // HTC Streaming Player
            /(java|python-urllib|python-requests|wget|libcurl)\/((\d+)[\w\.-_]+)/i,
                                                                                // Java/urllib/requests/wget/cURL
            /(lavf)((\d+)[\d\.]+)/i                                             // Lavf (FFMPEG)
            ], [NAME, VERSION, MAJOR], [

            /(htc_one_s)\/((\d+)[\d\.]+)/i                                      // HTC One S
            ], [[NAME, /_/g, ' '], VERSION, MAJOR], [

            /(mplayer)(?:\s|\/)(?:(?:sherpya-){0,1}svn)(?:-|\s)(r\d+(?:-\d+[\w\.-]+){0,1})/i
                                                                                // MPlayer SVN
            ], [NAME, VERSION], [

            /(mplayer)(?:\s|\/|[unkow-]+)((\d+)[\w\.-]+)/i                      // MPlayer
            ], [NAME, VERSION, MAJOR], [

            /(mplayer)/i,                                                       // MPlayer (no other info)
            /(yourmuze)/i,                                                      // YourMuze
            /(media player classic|nero showtime)/i                             // Media Player Classic/Nero ShowTime
            ], [NAME], [

            /(nero (?:home|scout))\/((\d+)[\w\.-]+)/i                           // Nero Home/Nero Scout
            ], [NAME, VERSION, MAJOR], [

            /(nokia\d+)\/((\d+)[\w\.-]+)/i                                      // Nokia
            ], [NAME, VERSION, MAJOR], [

            /\s(songbird)\/((\d+)[\w\.-]+)/i                                    // Songbird/Philips-Songbird
            ], [NAME, VERSION, MAJOR], [

            /(winamp)3 version ((\d+)[\w\.-]+)/i,                               // Winamp
            /(winamp)\s((\d+)[\w\.-]+)/i,
            /(winamp)mpeg\/((\d+)[\w\.-]+)/i
            ], [NAME, VERSION, MAJOR], [

            /(ocms-bot|tapinradio|tunein radio|unknown|winamp|inlight radio)/i  // OCMS-bot/tap in radio/tunein/unknown/winamp (no other info)
                                                                                // inlight radio
            ], [NAME], [

            /(quicktime|rma|radioapp|radioclientapplication|soundtap|totem|stagefright|streamium)\/((\d+)[\w\.-]+)/i
                                                                                // QuickTime/RealMedia/RadioApp/RadioClientApplication/
                                                                                // SoundTap/Totem/Stagefright/Streamium
            ], [NAME, VERSION, MAJOR], [

            /(smp)((\d+)[\d\.]+)/i                                              // SMP
            ], [NAME, VERSION, MAJOR], [

            /(vlc) media player - version ((\d+)[\w\.]+)/i,                     // VLC Videolan
            /(vlc)\/((\d+)[\w\.-]+)/i,
            /(xbmc|gvfs|xine|xmms|irapp)\/((\d+)[\w\.-]+)/i,                    // XBMC/gvfs/Xine/XMMS/irapp
            /(foobar2000)\/((\d+)[\d\.]+)/i,                                    // Foobar2000
            /(itunes)\/((\d+)[\d\.]+)/i                                         // iTunes
            ], [NAME, VERSION, MAJOR], [

            /(wmplayer)\/((\d+)[\w\.-]+)/i,                                     // Windows Media Player
            /(windows-media-player)\/((\d+)[\w\.-]+)/i
            ], [[NAME, /-/g, ' '], VERSION, MAJOR], [

            /windows\/((\d+)[\w\.-]+) upnp\/[\d\.]+ dlnadoc\/[\d\.]+ (home media server)/i
                                                                                // Windows Media Server
            ], [VERSION, MAJOR, [NAME, 'Windows']], [

            /(com\.riseupradioalarm)\/((\d+)[\d\.]*)/i                          // RiseUP Radio Alarm
            ], [NAME, VERSION, MAJOR], [

            /(rad.io)\s((\d+)[\d\.]+)/i,                                        // Rad.io
            /(radio.(?:de|at|fr))\s((\d+)[\d\.]+)/i
            ], [[NAME, 'rad.io'], VERSION, MAJOR]

            //////////////////////
            // Media players END
            ////////////////////*/

        ],

        cpu : [[

            /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
            ], [[ARCHITECTURE, 'amd64']], [

            /(ia32(?=;))/i                                                      // IA32 (quicktime)
            ], [[ARCHITECTURE, util.lowerize]], [

            /((?:i[346]|x)86)[;\)]/i                                            // IA32
            ], [[ARCHITECTURE, 'ia32']], [

            // PocketPC mistakenly identified as PowerPC
            /windows\s(ce|mobile);\sppc;/i
            ], [[ARCHITECTURE, 'arm']], [

            /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
            ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [

            /(sun4\w)[;\)]/i                                                    // SPARC
            ], [[ARCHITECTURE, 'sparc']], [

            /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
            ], [[ARCHITECTURE, util.lowerize]]
        ],

        device : [[

            /\((ipad|playbook);[\w\s\);-]+(rim|apple)/i                         // iPad/PlayBook
            ], [MODEL, VENDOR, [TYPE, TABLET]], [

            /applecoremedia\/[\w\.]+ \((ipad)/                                  // iPad
            ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [

            /(apple\s{0,1}tv)/i                                                 // Apple TV
            ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple']], [

            /(archos)\s(gamepad2?)/i,                                           // Archos
            /(hp).+(touchpad)/i,                                                // HP TouchPad
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
            /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i                               // Kindle Fire HD
            ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
            /(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i                  // Fire Phone
            ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [

            /\((ip[honed|\s\w*]+);.+(apple)/i                                   // iPod/iPhone
            ], [MODEL, VENDOR, [TYPE, MOBILE]], [
            /\((ip[honed|\s\w*]+);/i                                            // iPod/iPhone
            ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [

            /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,
                                                                                // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Huawei/Meizu/Motorola/Polytron
            /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
            /(asus)-?(\w+)/i                                                    // Asus
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /\(bb10;\s(\w+)/i                                                   // BlackBerry 10
            ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
                                                                                // Asus Tablets
            /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i
            ], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [

            /(sony)\s(tablet\s[ps])/i                                           // Sony Tablets
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /\s(ouya)\s/i,                                                      // Ouya
            /(nintendo)\s([wids3u]+)/i                                          // Nintendo
            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [

            /android.+;\s(shield)\sbuild/i                                      // Nvidia
            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [

            /(playstation\s[3portablevi]+)/i                                    // Playstation
            ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [

            /(sprint\s(\w+))/i                                                  // Sprint Phones
            ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

            /(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i                         // Lenovo tablets
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,                               // HTC
            /(zte)-(\w+)*/i,                                                    // ZTE
            /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i
                                                                                // Alcatel/GeeksPhone/Huawei/Lenovo/Nexian/Panasonic/Sony
            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

            /[\s\(;](xbox(?:\sone)?)[\s\);]/i                                   // Microsoft Xbox
            ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
            ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [

                                                                                // Motorola
            /\s((milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?))[\w\s]+build\//i,
            /(mot)[\s-]?(\w+)*/i
            ], [[VENDOR, 'Motorola'], MODEL, [TYPE, MOBILE]], [
            /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [

            /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i,
            /((SM-T\w+))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
            /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i,
            /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
            /sec-((sgh\w+))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [
            /(samsung);smarttv/i
            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
            /\(dtv[\);].+(aquos)/i                                              // Sharp
            ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [
            /sie-(\w+)*/i                                                       // Siemens
            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [

            /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
            /(nokia)[\s_-]?([\w-]+)*/i
            ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

            /android\s3\.[\s\w-;]{10}(a\d{3})/i                                 // Acer
            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

            /android\s3\.[\s\w-;]{10}(lg?)-([06cv9]{3,4})/i                     // LG Tablet
            ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
            /(lg) netcast\.tv/i                                                 // LG SmartTV
            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
            /(nexus\s[45])/i,                                                   // LG
            /lg[e;\s\/-]+(\w+)*/i
            ], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [
                
            /android.+(ideatab[a-z0-9\-\s]+)/i                                  // Lenovo
            ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [
                
            /linux;.+((jolla));/i                                               // Jolla
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
                
            /((pebble))app\/[\d\.]+\s/i                                         // Pebble
            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
                
            /android.+;\s(glass)\s\d/i                                          // Google Glass
            ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [

            /(mobile|tablet);.+rv\:.+gecko\//i                                  // Unidentifiable
            ], [[TYPE, util.lowerize], VENDOR, MODEL]
        ],

        engine : [[

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
            ], [NAME, VERSION], [

            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows based
            /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
            ], [NAME, VERSION], [
            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

            // Mobile/Embedded OS
            /\((bb)(10);/i                                                      // BlackBerry 10
            ], [[NAME, 'BlackBerry'], VERSION], [
            /(blackberry)\w*\/?([\w\.]+)*/i,                                    // Blackberry
            /(tizen)[\/\s]([\w\.]+)/i,                                          // Tizen
            /(android|webos|palm\os|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
                                                                                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
            /linux;.+(sailfish);/i                                              // Sailfish OS
            ], [NAME, VERSION], [
            /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i                 // Symbian
            ], [[NAME, 'Symbian'], VERSION], [
            /\((series40);/i                                                    // Series 40
            ], [NAME], [
            /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
            ], [[NAME, 'Firefox OS'], VERSION], [

            // Console
            /(nintendo|playstation)\s([wids3portablevu]+)/i,                    // Nintendo/Playstation

            // GNU/Linux based
            /(mint)[\/\s\(]?(\w+)*/i,                                           // Mint
            /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
            /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,
                                                                                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                                                                                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
            /(hurd|linux)\s?([\w\.]+)*/i,                                       // Hurd/Linux
            /(gnu)\s?([\w\.]+)*/i                                               // GNU
            ], [NAME, VERSION], [

            /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
            ], [[NAME, 'Chromium OS'], VERSION],[

            // Solaris
            /(sunos)\s?([\w\.]+\d)*/i                                           // Solaris
            ], [[NAME, 'Solaris'], VERSION], [

            // BSD based
            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i                   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
            ], [NAME, VERSION],[

            /(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i             // iOS
            ], [[NAME, 'iOS'], [VERSION, /_/g, '.']], [

            /(mac\sos\sx)\s?([\w\s\.]+\w)*/i, 
            /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
            ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

            // Other
            /((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,                            // Solaris
            /(haiku)\s(\w+)/i,                                                  // Haiku
            /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,                               // AIX
            /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
                                                                                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
            /(unix)\s?([\w\.]+)*/i                                              // UNIX
            ], [NAME, VERSION]
        ]
    };


    /////////////////
    // Constructor
    ////////////////


    var UAParser = function (uastring, extensions) {

        if (!(this instanceof UAParser)) {
            return new UAParser(uastring, extensions).getResult();
        }

        var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
        var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

        this.getBrowser = function () {
            return mapper.rgx.apply(this, rgxmap.browser);
        };
        this.getCPU = function () {
            return mapper.rgx.apply(this, rgxmap.cpu);
        };
        this.getDevice = function () {
            return mapper.rgx.apply(this, rgxmap.device);
        };
        this.getEngine = function () {
            return mapper.rgx.apply(this, rgxmap.engine);
        };
        this.getOS = function () {
            return mapper.rgx.apply(this, rgxmap.os);
        };
        this.getResult = function() {
            return {
                ua      : this.getUA(),
                browser : this.getBrowser(),
                engine  : this.getEngine(),
                os      : this.getOS(),
                device  : this.getDevice(),
                cpu     : this.getCPU()
            };
        };
        this.getUA = function () {
            return ua;
        };
        this.setUA = function (uastring) {
            ua = uastring;
            return this;
        };
        this.setUA(ua);
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER = {
        NAME    : NAME,
        MAJOR   : MAJOR,
        VERSION : VERSION  
    };
    UAParser.CPU = {
        ARCHITECTURE : ARCHITECTURE
    };
    UAParser.DEVICE = {
        MODEL   : MODEL,
        VENDOR  : VENDOR,
        TYPE    : TYPE,
        CONSOLE : CONSOLE,
        MOBILE  : MOBILE,
        SMARTTV : SMARTTV,
        TABLET  : TABLET,
        WEARABLE: WEARABLE,
        EMBEDDED: EMBEDDED
    };
    UAParser.ENGINE = {
        NAME    : NAME,
        VERSION : VERSION
    };
    UAParser.OS = {
        NAME    : NAME,
        VERSION : VERSION  
    };


    ///////////
    // Export
    //////////


    // check js environment
    if (typeof(exports) !== UNDEF_TYPE) {
        // nodejs env
        if (typeof(module) !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        // browser env
        window.UAParser = UAParser;
        // requirejs env (optional)
        if (typeof(define) === FUNC_TYPE && define.amd) {
            define(function () {
                return UAParser;
            });
        }
        // jQuery/Zepto specific (optional)
        var $ = window.jQuery || window.Zepto;
        if (typeof($) !== UNDEF_TYPE) {
            var parser = new UAParser();
            $.ua = parser.getResult();
            $.ua.get = function() {
                return parser.getUA();
            };
            $.ua.set = function (uastring) {
                parser.setUA(uastring);
                var result = parser.getResult();
                for (var prop in result) {
                    $.ua[prop] = result[prop];
                }
            };
        }
    }

})(this);

},{}],3:[function(require,module,exports){
var window = require("global/window")
var once = require("once")
var parseHeaders = require('parse-headers')

var messages = {
    "0": "Internal XMLHttpRequest Error",
    "4": "4xx Client Error",
    "5": "5xx Server Error"
}

var XHR = window.XMLHttpRequest || noop
var XDR = "withCredentials" in (new XHR()) ? XHR : window.XDomainRequest

module.exports = createXHR

function createXHR(options, callback) {
    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    callback = once(callback)

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new XDR()
        }else{
            xhr = new XHR()
        }
    }

    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var key
    var load = options.response ? loadResponse : loadXhr

    if ("json" in options) {
        isJson = true
        headers["Accept"] = "application/json"
        if (method !== "GET" && method !== "HEAD") {
            headers["Content-Type"] = "application/json"
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = load
    xhr.onerror = error
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    // hate IE
    xhr.ontimeout = noop
    xhr.open(method, uri, !sync)
                                    //backward compatibility
    if (options.withCredentials || (options.cors && options.withCredentials !== false)) {
        xhr.withCredentials = true
    }

    // Cannot set timeout with sync request
    if (!sync) {
        xhr.timeout = "timeout" in options ? options.timeout : 5000
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }
    
    if ("beforeSend" in options && 
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr

    function readystatechange() {
        if (xhr.readyState === 4) {
            load()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = null

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === 'text' || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    function getStatusCode() {
        return xhr.status === 1223 ? 204 : xhr.status
    }

    // if we're getting a none-ok statusCode, build & return an error
    function errorFromStatusCode(status) {
        var error = null
        if (status === 0 || (status >= 400 && status < 600)) {
            var message = (typeof body === "string" ? body : false) ||
                messages[String(status).charAt(0)]
            error = new Error(message)
            error.statusCode = status
        }

        return error
    }

    // will load the data & process the response in a special response object
    function loadResponse() {
        var status = getStatusCode()
        var error = errorFromStatusCode(status)
        var response = {
            body: getBody(),
            statusCode: status,
            statusText: xhr.statusText,
            raw: xhr
        }
        if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
            response.headers = parseHeaders(xhr.getAllResponseHeaders())
        } else {
            response.headers = {}
        }

        callback(error, response, response.body)
    }

    // will load the data and add some response properties to the source xhr
    // and then respond with that
    function loadXhr() {
        var status = getStatusCode()
        var error = errorFromStatusCode(status)

        xhr.status = xhr.statusCode = status
        xhr.body = getBody()
        xhr.headers = parseHeaders(xhr.getAllResponseHeaders())

        callback(error, xhr, xhr.body)
    }

    function error(evt) {
        callback(evt, xhr)
    }
}


function noop() {}

},{"global/window":4,"once":5,"parse-headers":9}],4:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],6:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":7}],7:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],8:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],9:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":6,"trim":8}],10:[function(require,module,exports){
"use strict";
'use strict';
var UAParser = require('ua-parser-js');
module.exports.getInfo = function() {
  var parser = new UAParser();
  parser.setUA(window.navigator.userAgent);
  var browser = parser.getBrowser(),
      os = parser.getOS(),
      device = parser.getDevice();
  return {
    browser: browser.name,
    browserVersion: browser.version,
    os: os.name,
    osVersion: os.version,
    device: device.model,
    referrer: document.referrer
  };
};

//# sourceMappingURL=<compileOutput>


},{"ua-parser-js":2}],11:[function(require,module,exports){
"use strict";
'use strict';
var browser = require('./browser'),
    mixin = require('./utils').mixin;
module.exports = Event;
function Event(eventName) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  var id = arguments[2] !== (void 0) ? arguments[2] : {};
  this.attributes = mixin({eventName: eventName}, options, browser.getInfo(), id);
}
Event.prototype = {toObject: function() {
    return this.attributes;
  }};

//# sourceMappingURL=<compileOutput>


},{"./browser":10,"./utils":14}],12:[function(require,module,exports){
"use strict";
'use strict';
module.exports = function(key) {
  (function(f, b) {
    if (!b.__SV) {
      var a,
          e,
          i,
          g;
      window.mixpanel = b;
      b._i = [];
      b.init = function(a, e, d) {
        function f(b, h) {
          var a = h.split(".");
          2 == a.length && (b = b[a[0]], h = a[1]);
          b[h] = function() {
            b.push([h].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        var c = b;
        "undefined" !== typeof d ? c = b[d] = [] : d = "mixpanel";
        c.people = c.people || [];
        c.toString = function(b) {
          var a = "mixpanel";
          "mixpanel" !== d && (a += "." + d);
          b || (a += " (stub)");
          return a;
        };
        c.people.toString = function() {
          return c.toString(1) + ".people (stub)";
        };
        i = "disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
        for (g = 0; g < i.length; g++)
          f(c, i[g]);
        b._i.push([a, e, d]);
      };
      b.__SV = 1.2;
      a = f.createElement("script");
      a.type = "text/javascript";
      a.async = !0;
      a.src = "//cdn.mxpnl.com/libs/mixpanel-2.2.min.js";
      e = f.getElementsByTagName("script")[0];
      e.parentNode.insertBefore(a, e);
    }
  })(document, window.mixpanel || []);
  window.mixpanel.init(key);
  return window.mixpanel;
};

//# sourceMappingURL=<compileOutput>


},{}],13:[function(require,module,exports){
"use strict";
'use strict';
var xhr = require('xhr');
function noop() {}
module.exports = function(uri) {
  var body = arguments[1] !== (void 0) ? arguments[1] : {};
  var callback = arguments[2] !== (void 0) ? arguments[2] : noop;
  var payload = {eventName: body.eventName};
  delete body.eventName;
  payload.data = body;
  xhr({
    uri: uri,
    body: JSON.stringify(payload),
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  }, callback);
};

//# sourceMappingURL=<compileOutput>


},{"xhr":3}],14:[function(require,module,exports){
"use strict";
'use strict';
var makeArray = module.exports.makeArray = function(arr) {
  return Array.prototype.slice.call(arr, 0);
};
var mixin = module.exports.mixin = function() {
  var args = makeArray(arguments),
      target = args.shift(),
      obj = args.shift();
  for (var key in obj) {
    target[key] = obj[key];
  }
  if (args.length) {
    args.unshift(target);
    mixin.apply(null, args);
  }
  return target;
};

//# sourceMappingURL=<compileOutput>


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phY29iL1Byb2plY3RzL0hvbmUvbWV0cmljcy1zY3JpcHQvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvamFjb2IvUHJvamVjdHMvSG9uZS9tZXRyaWNzLXNjcmlwdC9mYWtlXzQ4OWZkY2I1LmpzIiwiL2hvbWUvamFjb2IvUHJvamVjdHMvSG9uZS9tZXRyaWNzLXNjcmlwdC9ub2RlX21vZHVsZXMvdWEtcGFyc2VyLWpzL3NyYy91YS1wYXJzZXIuanMiLCIvaG9tZS9qYWNvYi9Qcm9qZWN0cy9Ib25lL21ldHJpY3Mtc2NyaXB0L25vZGVfbW9kdWxlcy94aHIvaW5kZXguanMiLCIvaG9tZS9qYWNvYi9Qcm9qZWN0cy9Ib25lL21ldHJpY3Mtc2NyaXB0L25vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCIvaG9tZS9qYWNvYi9Qcm9qZWN0cy9Ib25lL21ldHJpY3Mtc2NyaXB0L25vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL29uY2Uvb25jZS5qcyIsIi9ob21lL2phY29iL1Byb2plY3RzL0hvbmUvbWV0cmljcy1zY3JpcHQvbm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9ub2RlX21vZHVsZXMvZm9yLWVhY2gvaW5kZXguanMiLCIvaG9tZS9qYWNvYi9Qcm9qZWN0cy9Ib25lL21ldHJpY3Mtc2NyaXB0L25vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvbm9kZV9tb2R1bGVzL2Zvci1lYWNoL25vZGVfbW9kdWxlcy9pcy1mdW5jdGlvbi9pbmRleC5qcyIsIi9ob21lL2phY29iL1Byb2plY3RzL0hvbmUvbWV0cmljcy1zY3JpcHQvbm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9ub2RlX21vZHVsZXMvdHJpbS9pbmRleC5qcyIsIi9ob21lL2phY29iL1Byb2plY3RzL0hvbmUvbWV0cmljcy1zY3JpcHQvbm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9wYXJzZS1oZWFkZXJzLmpzIiwiL2hvbWUvamFjb2IvUHJvamVjdHMvSG9uZS9tZXRyaWNzLXNjcmlwdC9zcmMvYnJvd3Nlci5qcyIsIi9ob21lL2phY29iL1Byb2plY3RzL0hvbmUvbWV0cmljcy1zY3JpcHQvc3JjL2V2ZW50LmpzIiwiL2hvbWUvamFjb2IvUHJvamVjdHMvSG9uZS9tZXRyaWNzLXNjcmlwdC9zcmMvbWl4cGFuZWwuanMiLCIvaG9tZS9qYWNvYi9Qcm9qZWN0cy9Ib25lL21ldHJpY3Mtc2NyaXB0L3NyYy9zZW5kLmpzIiwiL2hvbWUvamFjb2IvUHJvamVjdHMvSG9uZS9tZXRyaWNzLXNjcmlwdC9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNDQTtBQUFBLFdBQVcsQ0FBQztBQVNaLEFBQUksRUFBQSxDQUFBLFVBQVMsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFFLGFBQVksQ0FBRTtBQUNwQyxPQUFHLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBRSxZQUFXLENBQUU7QUFDN0IsVUFBTSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUUsZUFBYyxDQUFFO0FBQ25DLFdBQU8sRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFFLGdCQUFlLENBQUU7QUFDckMsUUFBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUUsYUFBWSxDQUFFO0FBQy9CLFFBQUksRUFBSSxDQUFBLE1BQUssUUFBUSxFQUFJLENBQUEsTUFBSyxRQUFRLE9BQU8sRUFBSSxLQUFHLENBQUM7QUFHekQsT0FBUyxRQUFNLENBQUksS0FBSSxDQUFJO0FBQ3ZCLEtBQUcsU0FBUyxFQUFJLEdBQUMsQ0FBQztBQUNsQixLQUFHLE9BQU8sRUFBSSxDQUFBLEtBQUksR0FBSyxHQUFDLENBQUM7QUFDekIsS0FBSyxJQUFH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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2h3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUFBLFdBQVcsQ0FBQztBQUVaLEFBQU0sRUFBQSxDQUFBLFFBQU8sRUFBSSxDQUFBLE9BQU0s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QUNMLGNBQWEsQ0FBRyxtQkFBaUIsQ0FDckM7QUFBQSxFQUNKLENBQUcsU0FBTyxDQUFFLENBQUM7QUFDakIsQ0FBQztBQUFBOzs7OztBQ3RCRDtBQUFBLFdBQVcsQ0FBQztBQUVaLEFBQU0sRUFBQSxDQUFBLFNBQVEsRUFDZCxDQUFBLE1BQUssUUFBUSxVQUFVLEVBQUksVUFBVyxHQUFFLENBQUk7QUFDeEMsT0FBTyxDQUFBLEtBQUksVUFBVSxNQUFNLEtBQUssQUFBQyxDQUFFLEdBQUUsQ0FBRyxFQUFBLENBQUUsQ0FBQztBQUMvQyxDQUFDO0FBRUQsQUFBTSxFQUFBLENBQUEsS0FBSSxFQUNWLENBQUEsTUFBSyxRQUFRLE1BQU0sRUFBSSxVQUFRLEFBQUUsQ0FBRTtBQUUvQixBQUFJLElBQUEsQ0FBQSxJQUFHLEVBQUksQ0FBQSxTQUFRLEFBQUMsQ0FBRSxTQUFRLENBQUU7QUFDNUIsV0FBSyxFQUFJLENBQUEsSUFBRyxNQUFNLEFBQUMsRUFBQztBQUNwQixRQUFFLEVBQUksQ0FBQSxJQUFHLE1BQU0sQUFBQyxFQUFDLENBQUM7QUFFdEIsZ0JBQWlCLElBQUUsQ0FBSTtBQUNuQixTQUFLLENBQUcsR0FBRSxDQUFFLEVBQUksQ0FBQSxHQUFFLENBQUcsR0FBRSxDQUFFLENBQUM7RUFDOUI7QUFBQSxBQUVBLEtBQUssSUFBRyxPQUFPLENBQUk7QUFDZixPQUFHLFFBQVEsQUFBQyxDQUFFLE1BQUssQ0FBRSxDQUFDO0FBQ3RCLFFBQUksTUFBTSxBQUFDLENBQUUsSUFBRyxDQUFHLEtBQUcsQ0FBRSxDQUFDO0VBQzdCO0FBQUEsQUFFQSxPQUFPLE9BQUssQ0FBQztBQUVqQixDQUFDO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4ndXNlIHN0cmljdCc7XG5cbi8qXG4gICAgTWV0cmljcy5qc1xuICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFNpbXBsZSBzY3JpcHQgdG8gbG9nIHNvbWUgYmFzaWMgbWV0cmljIHN0dWZmIHRvIHlvdXIgc2VydmVyLCBpdHMgc3VwcG9zZSB0b1xuICAgIGJlIGxpZ2h0d2VpZ2h0IGFuZCBzaW1wbGUgdG8gdXNlLlxuKi9cblxubGV0IEV2ZW50TW9kZWwgPSByZXF1aXJlKCAnLi9zcmMvZXZlbnQnICksXG4gICAgc2VuZCA9IHJlcXVpcmUoICcuL3NyYy9zZW5kJyApLFxuICAgIGJyb3dzZXIgPSByZXF1aXJlKCAnLi9zcmMvYnJvd3NlcicgKSxcbiAgICBtaXhwYW5lbCA9IHJlcXVpcmUoICcuL3NyYy9taXhwYW5lbCcgKSxcbiAgICB1dGlscyA9IHJlcXVpcmUoICcuL3NyYy91dGlscycgKSxcbiAgICBxdWV1ZSA9IHdpbmRvdy5tZXRyaWNzID8gd2luZG93Lm1ldHJpY3MuX3F1ZXVlIDogbnVsbDtcblxuXG5mdW5jdGlvbiBNZXRyaWNzICggcXVldWUgKSB7IFxuICAgIHRoaXMuaWRlbnRpdHkgPSB7fTtcbiAgICB0aGlzLl9xdWV1ZSA9IHF1ZXVlIHx8IFtdO1xuICAgIGlmICggdGhpcy5fcXVldWUubGVuZ3RoICkge1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9xdWV1ZS5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgIGxldCBjYWxsID0gdGhpcy5fcXVldWVbIGkgXTtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIHRoaXNbIGNhbGwubWV0aG9kIF0gPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgICAgICAgdGhpc1sgY2FsbC5tZXRob2QgXS5hcHBseSggdGhpcywgY2FsbC5hcmd1bWVudHMgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9xdWV1ZS5sZW5ndGggPSAwOyAvLyByZW1vdmUgYWxsIGZyb20gcXVldWVcbiAgICB9XG59XG5cbi8qXG4gICAgTWV0cmljczo6aW5pdCAtIGluaXRpYWxpemVzIG1ldHJpY3Mgd2l0aCBvcHRpb25zIGFib3V0IHdoZXJlIHRvIHB1c2hcbiAgICBkYXRhXG5cbiAgICBwYXJhbXNcbiAgICAgICAgb3B0aW9ucyB7IE9iamVjdCB9IC0gYW4gb2JqZWN0IHRoYXQgaG9sZCBtYW55IGNvbmZpZ3VyYXRpb24gZm9yIG1lcnRpY3MgZmlsZVxuICAgICAgICAgICAgb3B0aW9ucy5taXhwYW5lbCAtIGEgbWl4cGFuZWwgcHVibGljIGFwaSBrZXlcbiAgICAgICAgICAgIG9wdGlvbnMuZG9tYWluIC0gZG9tYWluIHRvIHBvaW50IHRvd2FyZHMgdG8gcmVnaXN0ZXIgaW50ZXJuYWwgY2FsbHNcbiovXG5cblxuTWV0cmljcy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICggb3B0aW9ucyA9IHt9ICkge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy51cmwgPSAoIHRoaXMub3B0aW9ucy5kb21haW4gfHwgJy8vZ29ob25lLmNvbScgKSArICcvYXBpLzEuMC8nO1xuICAgIC8vIHRoaXMgbWl4cGFuZWxzIG9iamVjdCBicmVha3MgcmVmIHdoZW4gaW5pdGlhbGl6aW5nIHNvIGRvbnQgY2FjaGUgaXRcbiAgICByZXF1aXJlKCAnLi9zcmMvbWl4cGFuZWwnICkoIG9wdGlvbnMubWl4cGFuZWwgKTtcbn07XG5cbi8qXG4gICAgTWV0cmljczo6dHJhY2sgLSB0cmFja3MgYW4gZXZlbnRcbiAgICBkYXRhXG5cbiAgICBwYXJhbXNcbiAgICAgICAgZXZlbnROYW1lIHsgU3RyaW5nIH0gLSBldmVudE5hbWUgaW4gYSBzdHJpbmcgZGVmYXVsdHMgdG8gVW5rbm93blxuICAgICAgICBtZXRhIHsgT2JqZWN0IH0gLSBrZXlzIHRvIHN0b3JlIGluIGV2ZW50IGRlZmF1bHRzIHRvIGFuIGVtcHR5IG9iamVjdFxuKi9cblxuTWV0cmljcy5wcm90b3R5cGUudHJhY2sgPSBmdW5jdGlvbiAoIGV2ZW50TmFtZSA9ICdVbmtub3duJywgbWV0YSA9IHt9ICkge1xuICAgIGxldCBldmVudCA9IG5ldyBFdmVudE1vZGVsKCBldmVudE5hbWUsIG1ldGEsIHRoaXMuaWRlbnRpdHkgKTtcbiAgICBzZW5kKCB0aGlzLnVybCArICdFdmVudHMnLCBldmVudC50b09iamVjdCgpICk7XG4gICAgaWYgKCB3aW5kb3cubWl4cGFuZWwgKSB7XG4gICAgICAgIHdpbmRvdy5taXhwYW5lbC50cmFjayggZXZlbnROYW1lLCBtZXRhICk7XG4gICAgfVxufTtcblxuLypcbiAgICBNZXRyaWNzOjppZGVudGlmeSAtIGlkZW50aWZ5cyBhIHVzZXJcblxuICAgIHBhcmFtc1xuICAgICAgICBpZGVudGl0eSB7IE9iamVjdCB9IC0gb2JqZWN0IHdpdGggYSBpZCBhbmQgYSBlbWFpbCBcbiovXG5cbk1ldHJpY3MucHJvdG90eXBlLmlkZW50aWZ5ID0gZnVuY3Rpb24gKCBpZGVudGl0eSA9IHt9ICkge1xuICAgIHRoaXMuaWRlbnRpdHkgPSBpZGVudGl0eTtcbiAgICBpZiAoIHdpbmRvdy5taXhwYW5lbCApIHtcbiAgICAgICAgd2luZG93Lm1peHBhbmVsLmlkZW50aWZ5KCBpZGVudGl0eS5pZCApO1xuICAgICAgICB3aW5kb3cubWl4cGFuZWwubmFtZV90YWcoIGlkZW50aXR5LmVtYWlsICk7XG4gICAgfVxufTtcblxuLypcbiAgICBNZXRyaWNzOjpyZWdpc3RlciAtIHJlZ2lzdGVycyBhIHVzZXJcblxuICAgIHBhcmFtc1xuICAgICAgICBpZGVudGlmaWVyIHsgU3RyaW5nIH0gLSB1c2VyIG9iamVjdCB0byByZWdpc3RlciB3aXRoIHN5c3RlbVxuKi9cblxuTWV0cmljcy5wcm90b3R5cGUucmVnaXN0ZXIgPSBmdW5jdGlvbiAoIGlkZW50aXR5ID0ge30gKSB7XG4gICAgLy8gdGhpcyBpcyBvbmUgd2Ugc2hvdWxkIGp1c3QgcHVzaCB0byBtaXhwYW5lbFxuICAgIGlmICggd2luZG93Lm1peHBhbmVsICkge1xuICAgICAgICB3aW5kb3cubWl4cGFuZWwucmVnaXN0ZXIoIGlkZW50aXR5ICk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cubWV0cmljcyA9IG5ldyBNZXRyaWNzKCBxdWV1ZSApO1xubW9kdWxlLmV4cG9ydHMuTWV0cmljcyA9IE1ldHJpY3M7XG5tb2R1bGUuZXhwb3J0cy5FdmVudCA9IEV2ZW50TW9kZWw7XG5tb2R1bGUuZXhwb3J0cy5fc2VuZCA9IHNlbmQ7XG5tb2R1bGUuZXhwb3J0cy5fYnJvd3NlciA9IGJyb3dzZXI7XG5tb2R1bGUuZXhwb3J0cy5fdXRpbHMgPSB1dGlscztcbm1vZHVsZS5leHBvcnRzLl9fbWl4cGFuZWwgPSBtaXhwYW5lbDtcbiIsIi8qKlxuICogVUFQYXJzZXIuanMgdjAuNy4zXG4gKiBMaWdodHdlaWdodCBKYXZhU2NyaXB0LWJhc2VkIFVzZXItQWdlbnQgc3RyaW5nIHBhcnNlclxuICogaHR0cHM6Ly9naXRodWIuY29tL2ZhaXNhbG1hbi91YS1wYXJzZXItanNcbiAqIFxuICogQ29weXJpZ2h0IMKpIDIwMTItMjAxNCBGYWlzYWwgU2FsbWFuIDxmeXpsbWFuQGdtYWlsLmNvbT5cbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgR1BMdjIgJiBNSVRcbiAqL1xuXG4oZnVuY3Rpb24gKHdpbmRvdywgdW5kZWZpbmVkKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLy8vLy8vLy8vLy8vL1xuICAgIC8vIENvbnN0YW50c1xuICAgIC8vLy8vLy8vLy8vLy9cblxuXG4gICAgdmFyIExJQlZFUlNJT04gID0gJzAuNy4zJyxcbiAgICAgICAgRU1QVFkgICAgICAgPSAnJyxcbiAgICAgICAgVU5LTk9XTiAgICAgPSAnPycsXG4gICAgICAgIEZVTkNfVFlQRSAgID0gJ2Z1bmN0aW9uJyxcbiAgICAgICAgVU5ERUZfVFlQRSAgPSAndW5kZWZpbmVkJyxcbiAgICAgICAgT0JKX1RZUEUgICAgPSAnb2JqZWN0JyxcbiAgICAgICAgTUFKT1IgICAgICAgPSAnbWFqb3InLFxuICAgICAgICBNT0RFTCAgICAgICA9ICdtb2RlbCcsXG4gICAgICAgIE5BTUUgICAgICAgID0gJ25hbWUnLFxuICAgICAgICBUWVBFICAgICAgICA9ICd0eXBlJyxcbiAgICAgICAgVkVORE9SICAgICAgPSAndmVuZG9yJyxcbiAgICAgICAgVkVSU0lPTiAgICAgPSAndmVyc2lvbicsXG4gICAgICAgIEFSQ0hJVEVDVFVSRT0gJ2FyY2hpdGVjdHVyZScsXG4gICAgICAgIENPTlNPTEUgICAgID0gJ2NvbnNvbGUnLFxuICAgICAgICBNT0JJTEUgICAgICA9ICdtb2JpbGUnLFxuICAgICAgICBUQUJMRVQgICAgICA9ICd0YWJsZXQnLFxuICAgICAgICBTTUFSVFRWICAgICA9ICdzbWFydHR2JyxcbiAgICAgICAgV0VBUkFCTEUgICAgPSAnd2VhcmFibGUnLFxuICAgICAgICBFTUJFRERFRCAgICA9ICdlbWJlZGRlZCc7XG5cblxuICAgIC8vLy8vLy8vLy8vXG4gICAgLy8gSGVscGVyXG4gICAgLy8vLy8vLy8vL1xuXG5cbiAgICB2YXIgdXRpbCA9IHtcbiAgICAgICAgZXh0ZW5kIDogZnVuY3Rpb24gKHJlZ2V4ZXMsIGV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgICAgIGlmIChcImJyb3dzZXIgY3B1IGRldmljZSBlbmdpbmUgb3NcIi5pbmRleE9mKGkpICE9PSAtMSAmJiBleHRlbnNpb25zW2ldLmxlbmd0aCAlIDIgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVnZXhlc1tpXSA9IGV4dGVuc2lvbnNbaV0uY29uY2F0KHJlZ2V4ZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWdleGVzO1xuICAgICAgICB9LFxuICAgICAgICBoYXMgOiBmdW5jdGlvbiAoc3RyMSwgc3RyMikge1xuICAgICAgICAgIGlmICh0eXBlb2Ygc3RyMSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIHN0cjIudG9Mb3dlckNhc2UoKS5pbmRleE9mKHN0cjEudG9Mb3dlckNhc2UoKSkgIT09IC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbG93ZXJpemUgOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBNYXAgaGVscGVyXG4gICAgLy8vLy8vLy8vLy8vLy9cblxuXG4gICAgdmFyIG1hcHBlciA9IHtcblxuICAgICAgICByZ3ggOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQsIGkgPSAwLCBqLCBrLCBwLCBxLCBtYXRjaGVzLCBtYXRjaCwgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGFsbCByZWdleGVzIG1hcHNcbiAgICAgICAgICAgIHdoaWxlIChpIDwgYXJncy5sZW5ndGggJiYgIW1hdGNoZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciByZWdleCA9IGFyZ3NbaV0sICAgICAgIC8vIGV2ZW4gc2VxdWVuY2UgKDAsMiw0LC4uKVxuICAgICAgICAgICAgICAgICAgICBwcm9wcyA9IGFyZ3NbaSArIDFdOyAgIC8vIG9kZCBzZXF1ZW5jZSAoMSwzLDUsLi4pXG5cbiAgICAgICAgICAgICAgICAvLyBjb25zdHJ1Y3Qgb2JqZWN0IGJhcmVib25lc1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YocmVzdWx0KSA9PT0gVU5ERUZfVFlQRSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChwIGluIHByb3BzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxID0gcHJvcHNbcF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mKHEpID09PSBPQkpfVFlQRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtxWzBdXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3FdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdHJ5IG1hdGNoaW5nIHVhc3RyaW5nIHdpdGggcmVnZXhlc1xuICAgICAgICAgICAgICAgIGogPSBrID0gMDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoaiA8IHJlZ2V4Lmxlbmd0aCAmJiAhbWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzID0gcmVnZXhbaisrXS5leGVjKHRoaXMuZ2V0VUEoKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghIW1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAocCA9IDA7IHAgPCBwcm9wcy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoID0gbWF0Y2hlc1srK2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHEgPSBwcm9wc1twXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiBnaXZlbiBwcm9wZXJ0eSBpcyBhY3R1YWxseSBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YocSkgPT09IE9CSl9UWVBFICYmIHEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocS5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZihxWzFdKSA9PSBGVU5DX1RZUEUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gbW9kaWZpZWQgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcVswXV0gPSBxWzFdLmNhbGwodGhpcywgbWF0Y2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gZ2l2ZW4gdmFsdWUsIGlnbm9yZSByZWdleCBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtxWzBdXSA9IHFbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocS5sZW5ndGggPT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgd2hldGhlciBmdW5jdGlvbiBvciByZWdleFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZihxWzFdKSA9PT0gRlVOQ19UWVBFICYmICEocVsxXS5leGVjICYmIHFbMV0udGVzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxsIGZ1bmN0aW9uICh1c3VhbGx5IHN0cmluZyBtYXBwZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3FbMF1dID0gbWF0Y2ggPyBxWzFdLmNhbGwodGhpcywgbWF0Y2gsIHFbMl0pIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzYW5pdGl6ZSBtYXRjaCB1c2luZyBnaXZlbiByZWdleFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtxWzBdXSA9IG1hdGNoID8gbWF0Y2gucmVwbGFjZShxWzFdLCBxWzJdKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChxLmxlbmd0aCA9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3FbMF1dID0gbWF0Y2ggPyBxWzNdLmNhbGwodGhpcywgbWF0Y2gucmVwbGFjZShxWzFdLCBxWzJdKSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcV0gPSBtYXRjaCA/IG1hdGNoIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0ciA6IGZ1bmN0aW9uIChzdHIsIG1hcCkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIG1hcCkge1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIGFycmF5XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihtYXBbaV0pID09PSBPQkpfVFlQRSAmJiBtYXBbaV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hcFtpXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHV0aWwuaGFzKG1hcFtpXVtqXSwgc3RyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoaSA9PT0gVU5LTk9XTikgPyB1bmRlZmluZWQgOiBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1dGlsLmhhcyhtYXBbaV0sIHN0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChpID09PSBVTktOT1dOKSA/IHVuZGVmaW5lZCA6IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIFN0cmluZyBtYXBcbiAgICAvLy8vLy8vLy8vLy8vL1xuXG5cbiAgICB2YXIgbWFwcyA9IHtcblxuICAgICAgICBicm93c2VyIDoge1xuICAgICAgICAgICAgb2xkc2FmYXJpIDoge1xuICAgICAgICAgICAgICAgIG1ham9yIDoge1xuICAgICAgICAgICAgICAgICAgICAnMScgOiBbJy84JywgJy8xJywgJy8zJ10sXG4gICAgICAgICAgICAgICAgICAgICcyJyA6ICcvNCcsXG4gICAgICAgICAgICAgICAgICAgICc/JyA6ICcvJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA6IHtcbiAgICAgICAgICAgICAgICAgICAgJzEuMCcgICA6ICcvOCcsXG4gICAgICAgICAgICAgICAgICAgICcxLjInICAgOiAnLzEnLFxuICAgICAgICAgICAgICAgICAgICAnMS4zJyAgIDogJy8zJyxcbiAgICAgICAgICAgICAgICAgICAgJzIuMCcgICA6ICcvNDEyJyxcbiAgICAgICAgICAgICAgICAgICAgJzIuMC4yJyA6ICcvNDE2JyxcbiAgICAgICAgICAgICAgICAgICAgJzIuMC4zJyA6ICcvNDE3JyxcbiAgICAgICAgICAgICAgICAgICAgJzIuMC40JyA6ICcvNDE5JyxcbiAgICAgICAgICAgICAgICAgICAgJz8nICAgICA6ICcvJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZXZpY2UgOiB7XG4gICAgICAgICAgICBhbWF6b24gOiB7XG4gICAgICAgICAgICAgICAgbW9kZWwgOiB7XG4gICAgICAgICAgICAgICAgICAgICdGaXJlIFBob25lJyA6IFsnU0QnLCAnS0YnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzcHJpbnQgOiB7XG4gICAgICAgICAgICAgICAgbW9kZWwgOiB7XG4gICAgICAgICAgICAgICAgICAgICdFdm8gU2hpZnQgNEcnIDogJzczNzNLVCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHZlbmRvciA6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0hUQycgICAgICAgOiAnQVBBJyxcbiAgICAgICAgICAgICAgICAgICAgJ1NwcmludCcgICAgOiAnU3ByaW50J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvcyA6IHtcbiAgICAgICAgICAgIHdpbmRvd3MgOiB7XG4gICAgICAgICAgICAgICAgdmVyc2lvbiA6IHtcbiAgICAgICAgICAgICAgICAgICAgJ01FJyAgICAgICAgOiAnNC45MCcsXG4gICAgICAgICAgICAgICAgICAgICdOVCAzLjExJyAgIDogJ05UMy41MScsXG4gICAgICAgICAgICAgICAgICAgICdOVCA0LjAnICAgIDogJ05UNC4wJyxcbiAgICAgICAgICAgICAgICAgICAgJzIwMDAnICAgICAgOiAnTlQgNS4wJyxcbiAgICAgICAgICAgICAgICAgICAgJ1hQJyAgICAgICAgOiBbJ05UIDUuMScsICdOVCA1LjInXSxcbiAgICAgICAgICAgICAgICAgICAgJ1Zpc3RhJyAgICAgOiAnTlQgNi4wJyxcbiAgICAgICAgICAgICAgICAgICAgJzcnICAgICAgICAgOiAnTlQgNi4xJyxcbiAgICAgICAgICAgICAgICAgICAgJzgnICAgICAgICAgOiAnTlQgNi4yJyxcbiAgICAgICAgICAgICAgICAgICAgJzguMScgICAgICAgOiAnTlQgNi4zJyxcbiAgICAgICAgICAgICAgICAgICAgJzEwJyAgICAgICAgOiAnTlQgNi40JyxcbiAgICAgICAgICAgICAgICAgICAgJ1JUJyAgICAgICAgOiAnQVJNJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8vLy8vLy8vLy8vLy8vXG4gICAgLy8gUmVnZXggbWFwXG4gICAgLy8vLy8vLy8vLy8vL1xuXG5cbiAgICB2YXIgcmVnZXhlcyA9IHtcblxuICAgICAgICBicm93c2VyIDogW1tcblxuICAgICAgICAgICAgLy8gUHJlc3RvIGJhc2VkXG4gICAgICAgICAgICAvKG9wZXJhXFxzbWluaSlcXC8oKFxcZCspP1tcXHdcXC4tXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgTWluaVxuICAgICAgICAgICAgLyhvcGVyYVxcc1ttb2JpbGV0YWJdKykuK3ZlcnNpb25cXC8oKFxcZCspP1tcXHdcXC4tXSspL2ksICAgICAgICAgICAgICAgIC8vIE9wZXJhIE1vYmkvVGFibGV0XG4gICAgICAgICAgICAvKG9wZXJhKS4rdmVyc2lvblxcLygoXFxkKyk/W1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSA+IDkuODBcbiAgICAgICAgICAgIC8ob3BlcmEpW1xcL1xcc10rKChcXGQrKT9bXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSA8IDkuODBcblxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT04sIE1BSk9SXSwgW1xuXG4gICAgICAgICAgICAvXFxzKG9wcilcXC8oKFxcZCspP1tcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgV2Via2l0XG4gICAgICAgICAgICBdLCBbW05BTUUsICdPcGVyYSddLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgLy8gTWl4ZWRcbiAgICAgICAgICAgIC8oa2luZGxlKVxcLygoXFxkKyk/W1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtpbmRsZVxuICAgICAgICAgICAgLyhsdW5hc2NhcGV8bWF4dGhvbnxuZXRmcm9udHxqYXNtaW5lfGJsYXplcilbXFwvXFxzXT8oKFxcZCspP1tcXHdcXC5dKykqL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEx1bmFzY2FwZS9NYXh0aG9uL05ldGZyb250L0phc21pbmUvQmxhemVyXG5cbiAgICAgICAgICAgIC8vIFRyaWRlbnQgYmFzZWRcbiAgICAgICAgICAgIC8oYXZhbnRcXHN8aWVtb2JpbGV8c2xpbXxiYWlkdSkoPzpicm93c2VyKT9bXFwvXFxzXT8oKFxcZCspP1tcXHdcXC5dKikvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXZhbnQvSUVNb2JpbGUvU2xpbUJyb3dzZXIvQmFpZHVcbiAgICAgICAgICAgIC8oPzptc3xcXCgpKGllKVxccygoXFxkKyk/W1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5ldCBFeHBsb3JlclxuXG4gICAgICAgICAgICAvLyBXZWJraXQvS0hUTUwgYmFzZWRcbiAgICAgICAgICAgIC8ocmVrb25xKSgoPzpcXC8pW1xcd1xcLl0rKSovaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVrb25xXG4gICAgICAgICAgICAvKGNocm9taXVtfGZsb2NrfHJvY2ttZWx0fG1pZG9yaXxlcGlwaGFueXxzaWxrfHNreWZpcmV8b3ZpYnJvd3Nlcnxib2x0fGlyb24pXFwvKChcXGQrKT9bXFx3XFwuLV0rKS9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9taXVtL0Zsb2NrL1JvY2tNZWx0L01pZG9yaS9FcGlwaGFueS9TaWxrL1NreWZpcmUvQm9sdC9Jcm9uXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTiwgTUFKT1JdLCBbXG5cbiAgICAgICAgICAgIC8odHJpZGVudCkuK3J2WzpcXHNdKChcXGQrKT9bXFx3XFwuXSspLitsaWtlXFxzZ2Vja28vaSAgICAgICAgICAgICAgICAgICAvLyBJRTExXG4gICAgICAgICAgICBdLCBbW05BTUUsICdJRSddLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgLyh5YWJyb3dzZXIpXFwvKChcXGQrKT9bXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWWFuZGV4XG4gICAgICAgICAgICBdLCBbW05BTUUsICdZYW5kZXgnXSwgVkVSU0lPTiwgTUFKT1JdLCBbXG5cbiAgICAgICAgICAgIC8oY29tb2RvX2RyYWdvbilcXC8oKFxcZCspP1tcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbW9kbyBEcmFnb25cbiAgICAgICAgICAgIF0sIFtbTkFNRSwgL18vZywgJyAnXSwgVkVSU0lPTiwgTUFKT1JdLCBbIFxuXG4gICAgICAgICAgICAvKGNocm9tZXxvbW5pd2VifGFyb3JhfFt0aXplbm9rYV17NX1cXHM/YnJvd3NlcilcXC92PygoXFxkKyk/W1xcd1xcLl0rKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHJvbWUvT21uaVdlYi9Bcm9yYS9UaXplbi9Ob2tpYVxuICAgICAgICAgICAgLyh1Y1xccz9icm93c2VyfHFxYnJvd3NlcilbXFwvXFxzXT8oKFxcZCspP1tcXHdcXC5dKykvaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1VDQnJvd3Nlci9RUUJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgLyhkb2xmaW4pXFwvKChcXGQrKT9bXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG9scGhpblxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnRG9scGhpbiddLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgLygoPzphbmRyb2lkLispY3Jtb3xjcmlvcylcXC8oKFxcZCspP1tcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21lIGZvciBBbmRyb2lkL2lPU1xuICAgICAgICAgICAgXSwgW1tOQU1FLCAnQ2hyb21lJ10sIFZFUlNJT04sIE1BSk9SXSwgW1xuXG4gICAgICAgICAgICAvdmVyc2lvblxcLygoXFxkKyk/W1xcd1xcLl0rKS4rP21vYmlsZVxcL1xcdytcXHMoc2FmYXJpKS9pICAgICAgICAgICAgICAgICAvLyBNb2JpbGUgU2FmYXJpXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgTUFKT1IsIFtOQU1FLCAnTW9iaWxlIFNhZmFyaSddXSwgW1xuXG4gICAgICAgICAgICAvdmVyc2lvblxcLygoXFxkKyk/W1xcd1xcLl0rKS4rPyhtb2JpbGVcXHM/c2FmYXJpfHNhZmFyaSkvaSAgICAgICAgICAgICAgLy8gU2FmYXJpICYgU2FmYXJpIE1vYmlsZVxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIE1BSk9SLCBOQU1FXSwgW1xuXG4gICAgICAgICAgICAvd2Via2l0Lis/KG1vYmlsZVxccz9zYWZhcml8c2FmYXJpKSgoXFwvW1xcd1xcLl0rKSkvaSAgICAgICAgICAgICAgICAgICAvLyBTYWZhcmkgPCAzLjBcbiAgICAgICAgICAgIF0sIFtOQU1FLCBbTUFKT1IsIG1hcHBlci5zdHIsIG1hcHMuYnJvd3Nlci5vbGRzYWZhcmkubWFqb3JdLCBbVkVSU0lPTiwgbWFwcGVyLnN0ciwgbWFwcy5icm93c2VyLm9sZHNhZmFyaS52ZXJzaW9uXV0sIFtcblxuICAgICAgICAgICAgLyhrb25xdWVyb3IpXFwvKChcXGQrKT9bXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS29ucXVlcm9yXG4gICAgICAgICAgICAvKHdlYmtpdHxraHRtbClcXC8oKFxcZCspP1tcXHdcXC5dKykvaVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT04sIE1BSk9SXSwgW1xuXG4gICAgICAgICAgICAvLyBHZWNrbyBiYXNlZFxuICAgICAgICAgICAgLyhuYXZpZ2F0b3J8bmV0c2NhcGUpXFwvKChcXGQrKT9bXFx3XFwuLV0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmV0c2NhcGVcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ05ldHNjYXBlJ10sIFZFUlNJT04sIE1BSk9SXSwgW1xuICAgICAgICAgICAgLyhzd2lmdGZveCkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTd2lmdGZveFxuICAgICAgICAgICAgLyhpY2VkcmFnb258aWNld2Vhc2VsfGNhbWlub3xjaGltZXJhfGZlbm5lY3xtYWVtb1xcc2Jyb3dzZXJ8bWluaW1vfGNvbmtlcm9yKVtcXC9cXHNdPygoXFxkKyk/W1xcd1xcLlxcK10rKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJY2VEcmFnb24vSWNld2Vhc2VsL0NhbWluby9DaGltZXJhL0Zlbm5lYy9NYWVtby9NaW5pbW8vQ29ua2Vyb3JcbiAgICAgICAgICAgIC8oZmlyZWZveHxzZWFtb25rZXl8ay1tZWxlb258aWNlY2F0fGljZWFwZXxmaXJlYmlyZHxwaG9lbml4KVxcLygoXFxkKyk/W1xcd1xcLi1dKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveC9TZWFNb25rZXkvSy1NZWxlb24vSWNlQ2F0L0ljZUFwZS9GaXJlYmlyZC9QaG9lbml4XG4gICAgICAgICAgICAvKG1vemlsbGEpXFwvKChcXGQrKT9bXFx3XFwuXSspLitydlxcOi4rZ2Vja29cXC9cXGQrL2ksICAgICAgICAgICAgICAgICAgICAvLyBNb3ppbGxhXG5cbiAgICAgICAgICAgIC8vIE90aGVyXG4gICAgICAgICAgICAvKHBvbGFyaXN8bHlueHxkaWxsb3xpY2FifGRvcmlzfGFtYXlhfHczbXxuZXRzdXJmKVtcXC9cXHNdPygoXFxkKyk/W1xcd1xcLl0rKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQb2xhcmlzL0x5bngvRGlsbG8vaUNhYi9Eb3Jpcy9BbWF5YS93M20vTmV0U3VyZlxuICAgICAgICAgICAgLyhsaW5rcylcXHNcXCgoKFxcZCspP1tcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbmtzXG4gICAgICAgICAgICAvKGdvYnJvd3NlcilcXC8/KChcXGQrKT9bXFx3XFwuXSspKi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb0Jyb3dzZXJcbiAgICAgICAgICAgIC8oaWNlXFxzP2Jyb3dzZXIpXFwvdj8oKFxcZCspP1tcXHdcXC5fXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJQ0UgQnJvd3NlclxuICAgICAgICAgICAgLyhtb3NhaWMpW1xcL1xcc10oKFxcZCspP1tcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1vc2FpY1xuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT04sIE1BSk9SXVxuXG4gICAgICAgICAgICAvKiAvLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIE1lZGlhIHBsYXllcnMgQkVHSU5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAsIFtcblxuICAgICAgICAgICAgLyhhcHBsZSg/OmNvcmVtZWRpYXwpKVxcLygoXFxkKylbXFx3XFwuX10rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJpYyBBcHBsZSBDb3JlTWVkaWFcbiAgICAgICAgICAgIC8oY29yZW1lZGlhKSB2KChcXGQrKVtcXHdcXC5fXSspL2lcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgLyhhcXVhbHVuZ3xseXNzbmF8YnNwbGF5ZXIpXFwvKChcXGQrKT9bXFx3XFwuLV0rKS9pICAgICAgICAgICAgICAgICAgICAgLy8gQXF1YWx1bmcvTHlzc25hL0JTUGxheWVyXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLyhhcmVzfG9zc3Byb3h5KVxccygoXFxkKylbXFx3XFwuLV0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXJlcy9PU1NQcm94eVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT04sIE1BSk9SXSwgW1xuXG4gICAgICAgICAgICAvKGF1ZGFjaW91c3xhdWRpbXVzaWNzdHJlYW18YW1hcm9rfGJhc3N8Y29yZXxkYWx2aWt8Z25vbWVtcGxheWVyfG11c2ljIG9uIGNvbnNvbGV8bnNwbGF5ZXJ8cHNwLWludGVybmV0cmFkaW9wbGF5ZXJ8dmlkZW9zKVxcLygoXFxkKylbXFx3XFwuLV0rKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBdWRhY2lvdXMvQXVkaU11c2ljU3RyZWFtL0FtYXJvay9CQVNTL09wZW5DT1JFL0RhbHZpay9Hbm9tZU1wbGF5ZXIvTW9DXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5TUGxheWVyL1BTUC1JbnRlcm5ldFJhZGlvUGxheWVyL1ZpZGVvc1xuICAgICAgICAgICAgLyhjbGVtZW50aW5lfG11c2ljIHBsYXllciBkYWVtb24pXFxzKChcXGQrKVtcXHdcXC4tXSspL2ksICAgICAgICAgICAgICAgLy8gQ2xlbWVudGluZS9NUERcbiAgICAgICAgICAgIC8obGcgcGxheWVyfG5leHBsYXllcilcXHMoKFxcZCspW1xcZFxcLl0rKS9pLFxuICAgICAgICAgICAgL3BsYXllclxcLyhuZXhwbGF5ZXJ8bGcgcGxheWVyKVxccygoXFxkKylbXFx3XFwuLV0rKS9pICAgICAgICAgICAgICAgICAgIC8vIE5leFBsYXllci9MRyBQbGF5ZXJcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0sIFtcbiAgICAgICAgICAgIC8obmV4cGxheWVyKVxccygoXFxkKylbXFx3XFwuLV0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5leHBsYXllclxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT04sIE1BSk9SXSwgW1xuXG4gICAgICAgICAgICAvKGZscnApXFwvKChcXGQrKVtcXHdcXC4tXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbGlwIFBsYXllclxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnRmxpcCBQbGF5ZXInXSwgVkVSU0lPTiwgTUFKT1JdLCBbXG5cbiAgICAgICAgICAgIC8oZnN0cmVhbXxuYXRpdmVob3N0fHF1ZXJ5c2Vla3NwaWRlcnxpYS1hcmNoaXZlcnxmYWNlYm9va2V4dGVybmFsaGl0KS9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZTdHJlYW0vTmF0aXZlSG9zdC9RdWVyeVNlZWtTcGlkZXIvSUEgQXJjaGl2ZXIvZmFjZWJvb2tleHRlcm5hbGhpdFxuICAgICAgICAgICAgXSwgW05BTUVdLCBbXG5cbiAgICAgICAgICAgIC8oZ3N0cmVhbWVyKSBzb3VwaHR0cHNyYyAoPzpcXChbXlxcKV0rXFwpKXswLDF9IGxpYnNvdXBcXC8oKFxcZCspW1xcd1xcLi1dKykvaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHc3RyZWFtZXJcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgLyhodGMgc3RyZWFtaW5nIHBsYXllcilcXHNbXFx3X10rXFxzXFwvXFxzKChcXGQrKVtcXGRcXC5dKykvaSwgICAgICAgICAgICAgIC8vIEhUQyBTdHJlYW1pbmcgUGxheWVyXG4gICAgICAgICAgICAvKGphdmF8cHl0aG9uLXVybGxpYnxweXRob24tcmVxdWVzdHN8d2dldHxsaWJjdXJsKVxcLygoXFxkKylbXFx3XFwuLV9dKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSmF2YS91cmxsaWIvcmVxdWVzdHMvd2dldC9jVVJMXG4gICAgICAgICAgICAvKGxhdmYpKChcXGQrKVtcXGRcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExhdmYgKEZGTVBFRylcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgLyhodGNfb25lX3MpXFwvKChcXGQrKVtcXGRcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSFRDIE9uZSBTXG4gICAgICAgICAgICBdLCBbW05BTUUsIC9fL2csICcgJ10sIFZFUlNJT04sIE1BSk9SXSwgW1xuXG4gICAgICAgICAgICAvKG1wbGF5ZXIpKD86XFxzfFxcLykoPzooPzpzaGVycHlhLSl7MCwxfXN2bikoPzotfFxccykoclxcZCsoPzotXFxkK1tcXHdcXC4tXSspezAsMX0pL2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTVBsYXllciBTVk5cbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKG1wbGF5ZXIpKD86XFxzfFxcL3xbdW5rb3ctXSspKChcXGQrKVtcXHdcXC4tXSspL2kgICAgICAgICAgICAgICAgICAgICAgLy8gTVBsYXllclxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT04sIE1BSk9SXSwgW1xuXG4gICAgICAgICAgICAvKG1wbGF5ZXIpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1QbGF5ZXIgKG5vIG90aGVyIGluZm8pXG4gICAgICAgICAgICAvKHlvdXJtdXplKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFlvdXJNdXplXG4gICAgICAgICAgICAvKG1lZGlhIHBsYXllciBjbGFzc2ljfG5lcm8gc2hvd3RpbWUpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1lZGlhIFBsYXllciBDbGFzc2ljL05lcm8gU2hvd1RpbWVcbiAgICAgICAgICAgIF0sIFtOQU1FXSwgW1xuXG4gICAgICAgICAgICAvKG5lcm8gKD86aG9tZXxzY291dCkpXFwvKChcXGQrKVtcXHdcXC4tXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOZXJvIEhvbWUvTmVybyBTY291dFxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT04sIE1BSk9SXSwgW1xuXG4gICAgICAgICAgICAvKG5va2lhXFxkKylcXC8oKFxcZCspW1xcd1xcLi1dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm9raWFcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgL1xccyhzb25nYmlyZClcXC8oKFxcZCspW1xcd1xcLi1dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbmdiaXJkL1BoaWxpcHMtU29uZ2JpcmRcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgLyh3aW5hbXApMyB2ZXJzaW9uICgoXFxkKylbXFx3XFwuLV0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaW5hbXBcbiAgICAgICAgICAgIC8od2luYW1wKVxccygoXFxkKylbXFx3XFwuLV0rKS9pLFxuICAgICAgICAgICAgLyh3aW5hbXApbXBlZ1xcLygoXFxkKylbXFx3XFwuLV0rKS9pXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTiwgTUFKT1JdLCBbXG5cbiAgICAgICAgICAgIC8ob2Ntcy1ib3R8dGFwaW5yYWRpb3x0dW5laW4gcmFkaW98dW5rbm93bnx3aW5hbXB8aW5saWdodCByYWRpbykvaSAgLy8gT0NNUy1ib3QvdGFwIGluIHJhZGlvL3R1bmVpbi91bmtub3duL3dpbmFtcCAobm8gb3RoZXIgaW5mbylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW5saWdodCByYWRpb1xuICAgICAgICAgICAgXSwgW05BTUVdLCBbXG5cbiAgICAgICAgICAgIC8ocXVpY2t0aW1lfHJtYXxyYWRpb2FwcHxyYWRpb2NsaWVudGFwcGxpY2F0aW9ufHNvdW5kdGFwfHRvdGVtfHN0YWdlZnJpZ2h0fHN0cmVhbWl1bSlcXC8oKFxcZCspW1xcd1xcLi1dKykvaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBRdWlja1RpbWUvUmVhbE1lZGlhL1JhZGlvQXBwL1JhZGlvQ2xpZW50QXBwbGljYXRpb24vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvdW5kVGFwL1RvdGVtL1N0YWdlZnJpZ2h0L1N0cmVhbWl1bVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT04sIE1BSk9SXSwgW1xuXG4gICAgICAgICAgICAvKHNtcCkoKFxcZCspW1xcZFxcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNNUFxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT04sIE1BSk9SXSwgW1xuXG4gICAgICAgICAgICAvKHZsYykgbWVkaWEgcGxheWVyIC0gdmVyc2lvbiAoKFxcZCspW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgIC8vIFZMQyBWaWRlb2xhblxuICAgICAgICAgICAgLyh2bGMpXFwvKChcXGQrKVtcXHdcXC4tXSspL2ksXG4gICAgICAgICAgICAvKHhibWN8Z3Zmc3x4aW5lfHhtbXN8aXJhcHApXFwvKChcXGQrKVtcXHdcXC4tXSspL2ksICAgICAgICAgICAgICAgICAgICAvLyBYQk1DL2d2ZnMvWGluZS9YTU1TL2lyYXBwXG4gICAgICAgICAgICAvKGZvb2JhcjIwMDApXFwvKChcXGQrKVtcXGRcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGb29iYXIyMDAwXG4gICAgICAgICAgICAvKGl0dW5lcylcXC8oKFxcZCspW1xcZFxcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpVHVuZXNcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgLyh3bXBsYXllcilcXC8oKFxcZCspW1xcd1xcLi1dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2luZG93cyBNZWRpYSBQbGF5ZXJcbiAgICAgICAgICAgIC8od2luZG93cy1tZWRpYS1wbGF5ZXIpXFwvKChcXGQrKVtcXHdcXC4tXSspL2lcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgLy0vZywgJyAnXSwgVkVSU0lPTiwgTUFKT1JdLCBbXG5cbiAgICAgICAgICAgIC93aW5kb3dzXFwvKChcXGQrKVtcXHdcXC4tXSspIHVwbnBcXC9bXFxkXFwuXSsgZGxuYWRvY1xcL1tcXGRcXC5dKyAoaG9tZSBtZWRpYSBzZXJ2ZXIpL2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2luZG93cyBNZWRpYSBTZXJ2ZXJcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBNQUpPUiwgW05BTUUsICdXaW5kb3dzJ11dLCBbXG5cbiAgICAgICAgICAgIC8oY29tXFwucmlzZXVwcmFkaW9hbGFybSlcXC8oKFxcZCspW1xcZFxcLl0qKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSaXNlVVAgUmFkaW8gQWxhcm1cbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0sIFtcblxuICAgICAgICAgICAgLyhyYWQuaW8pXFxzKChcXGQrKVtcXGRcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmFkLmlvXG4gICAgICAgICAgICAvKHJhZGlvLig/OmRlfGF0fGZyKSlcXHMoKFxcZCspW1xcZFxcLl0rKS9pXG4gICAgICAgICAgICBdLCBbW05BTUUsICdyYWQuaW8nXSwgVkVSU0lPTiwgTUFKT1JdXG5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIE1lZGlhIHBsYXllcnMgRU5EXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLyovXG5cbiAgICAgICAgXSxcblxuICAgICAgICBjcHUgOiBbW1xuXG4gICAgICAgICAgICAvKD86KGFtZHx4KD86KD86ODZ8NjQpW18tXSk/fHdvd3x3aW4pNjQpWztcXCldL2kgICAgICAgICAgICAgICAgICAgICAvLyBBTUQ2NFxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdhbWQ2NCddXSwgW1xuXG4gICAgICAgICAgICAvKGlhMzIoPz07KSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBMzIgKHF1aWNrdGltZSlcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCB1dGlsLmxvd2VyaXplXV0sIFtcblxuICAgICAgICAgICAgLygoPzppWzM0Nl18eCk4NilbO1xcKV0vaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSUEzMlxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdpYTMyJ11dLCBbXG5cbiAgICAgICAgICAgIC8vIFBvY2tldFBDIG1pc3Rha2VubHkgaWRlbnRpZmllZCBhcyBQb3dlclBDXG4gICAgICAgICAgICAvd2luZG93c1xccyhjZXxtb2JpbGUpO1xcc3BwYzsvaVxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdhcm0nXV0sIFtcblxuICAgICAgICAgICAgLygoPzpwcGN8cG93ZXJwYykoPzo2NCk/KSg/Olxcc21hY3w7fFxcKSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBvd2VyUENcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAvb3dlci8sICcnLCB1dGlsLmxvd2VyaXplXV0sIFtcblxuICAgICAgICAgICAgLyhzdW40XFx3KVs7XFwpXS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNQQVJDXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgJ3NwYXJjJ11dLCBbXG5cbiAgICAgICAgICAgIC8oKD86YXZyMzJ8aWE2NCg/PTspKXw2OGsoPz1cXCkpfGFybSg/OjY0fCg/PXZcXGQrOykpfCg/PWF0bWVsXFxzKWF2cnwoPzppcml4fG1pcHN8c3BhcmMpKD86NjQpPyg/PTspfHBhLXJpc2MpL2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSUE2NCwgNjhLLCBBUk0vNjQsIEFWUi8zMiwgSVJJWC82NCwgTUlQUy82NCwgU1BBUkMvNjQsIFBBLVJJU0NcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCB1dGlsLmxvd2VyaXplXV1cbiAgICAgICAgXSxcblxuICAgICAgICBkZXZpY2UgOiBbW1xuXG4gICAgICAgICAgICAvXFwoKGlwYWR8cGxheWJvb2spO1tcXHdcXHNcXCk7LV0rKHJpbXxhcHBsZSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpUGFkL1BsYXlCb29rXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFZFTkRPUiwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC9hcHBsZWNvcmVtZWRpYVxcL1tcXHdcXC5dKyBcXCgoaXBhZCkvICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlQYWRcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0FwcGxlJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvKGFwcGxlXFxzezAsMX10dikvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBcHBsZSBUVlxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgJ0FwcGxlIFRWJ10sIFtWRU5ET1IsICdBcHBsZSddXSwgW1xuXG4gICAgICAgICAgICAvKGFyY2hvcylcXHMoZ2FtZXBhZDI/KS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBcmNob3NcbiAgICAgICAgICAgIC8oaHApLisodG91Y2hwYWQpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSFAgVG91Y2hQYWRcbiAgICAgICAgICAgIC8oa2luZGxlKVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2luZGxlXG4gICAgICAgICAgICAvXFxzKG5vb2spW1xcd1xcc10rYnVpbGRcXC8oXFx3KykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm9va1xuICAgICAgICAgICAgLyhkZWxsKVxccyhzdHJlYVtrcHJcXHNcXGRdKltcXGRrb10pL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVsbCBTdHJlYWtcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgLyhrZltBLXpdKylcXHNidWlsZFxcL1tcXHdcXC5dKy4qc2lsa1xcLy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtpbmRsZSBGaXJlIEhEXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdBbWF6b24nXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKHNkfGtmKVswMzQ5aGlqb3JzdHV3XStcXHNidWlsZFxcL1tcXHdcXC5dKy4qc2lsa1xcLy9pICAgICAgICAgICAgICAgICAgLy8gRmlyZSBQaG9uZVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgbWFwcGVyLnN0ciwgbWFwcy5kZXZpY2UuYW1hem9uLm1vZGVsXSwgW1ZFTkRPUiwgJ0FtYXpvbiddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgL1xcKChpcFtob25lZHxcXHNcXHcqXSspOy4rKGFwcGxlKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpUG9kL2lQaG9uZVxuICAgICAgICAgICAgXSwgW01PREVMLCBWRU5ET1IsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcKChpcFtob25lZHxcXHNcXHcqXSspOy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpUG9kL2lQaG9uZVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnQXBwbGUnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8oYmxhY2tiZXJyeSlbXFxzLV0/KFxcdyspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGFja0JlcnJ5XG4gICAgICAgICAgICAvKGJsYWNrYmVycnl8YmVucXxwYWxtKD89XFwtKXxzb255ZXJpY3Nzb258YWNlcnxhc3VzfGRlbGx8aHVhd2VpfG1laXp1fG1vdG9yb2xhfHBvbHl0cm9uKVtcXHNfLV0/KFtcXHctXSspKi9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCZW5RL1BhbG0vU29ueS1Fcmljc3Nvbi9BY2VyL0FzdXMvRGVsbC9IdWF3ZWkvTWVpenUvTW90b3JvbGEvUG9seXRyb25cbiAgICAgICAgICAgIC8oaHApXFxzKFtcXHdcXHNdK1xcdykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhQIGlQQVFcbiAgICAgICAgICAgIC8oYXN1cyktPyhcXHcrKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFzdXNcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXChiYjEwO1xccyhcXHcrKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmxhY2tCZXJyeSAxMFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnQmxhY2tCZXJyeSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXN1cyBUYWJsZXRzXG4gICAgICAgICAgICAvYW5kcm9pZC4rKHRyYW5zZm9bcHJpbWVcXHNdezQsMTB9XFxzXFx3K3xlZWVwY3xzbGlkZXJcXHNcXHcrfG5leHVzIDcpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0FzdXMnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC8oc29ueSlcXHModGFibGV0XFxzW3BzXSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTb255IFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgL1xccyhvdXlhKVxccy9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE91eWFcbiAgICAgICAgICAgIC8obmludGVuZG8pXFxzKFt3aWRzM3VdKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5pbnRlbmRvXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIENPTlNPTEVdXSwgW1xuXG4gICAgICAgICAgICAvYW5kcm9pZC4rO1xccyhzaGllbGQpXFxzYnVpbGQvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTnZpZGlhXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdOdmlkaWEnXSwgW1RZUEUsIENPTlNPTEVdXSwgW1xuXG4gICAgICAgICAgICAvKHBsYXlzdGF0aW9uXFxzWzNwb3J0YWJsZXZpXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQbGF5c3RhdGlvblxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnU29ueSddLCBbVFlQRSwgQ09OU09MRV1dLCBbXG5cbiAgICAgICAgICAgIC8oc3ByaW50XFxzKFxcdyspKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTcHJpbnQgUGhvbmVzXG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgbWFwcGVyLnN0ciwgbWFwcy5kZXZpY2Uuc3ByaW50LnZlbmRvcl0sIFtNT0RFTCwgbWFwcGVyLnN0ciwgbWFwcy5kZXZpY2Uuc3ByaW50Lm1vZGVsXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8obGVub3ZvKVxccz8oUyg/OjUwMDB8NjAwMCkrKD86Wy1dW1xcdytdKSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMZW5vdm8gdGFibGV0c1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvKGh0YylbO19cXHMtXSsoW1xcd1xcc10rKD89XFwpKXxcXHcrKSovaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSFRDXG4gICAgICAgICAgICAvKHp0ZSktKFxcdyspKi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBaVEVcbiAgICAgICAgICAgIC8oYWxjYXRlbHxnZWVrc3Bob25lfGh1YXdlaXxsZW5vdm98bmV4aWFufHBhbmFzb25pY3woPz07XFxzKXNvbnkpW19cXHMtXT8oW1xcdy1dKykqL2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxjYXRlbC9HZWVrc1Bob25lL0h1YXdlaS9MZW5vdm8vTmV4aWFuL1BhbmFzb25pYy9Tb255XG4gICAgICAgICAgICBdLCBbVkVORE9SLCBbTU9ERUwsIC9fL2csICcgJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvW1xcc1xcKDtdKHhib3goPzpcXHNvbmUpPylbXFxzXFwpO10vaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWljcm9zb2Z0IFhib3hcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ01pY3Jvc29mdCddLCBbVFlQRSwgQ09OU09MRV1dLCBbXG4gICAgICAgICAgICAvKGtpblxcLltvbmV0d117M30pL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaWNyb3NvZnQgS2luXG4gICAgICAgICAgICBdLCBbW01PREVMLCAvXFwuL2csICcgJ10sIFtWRU5ET1IsICdNaWNyb3NvZnQnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTW90b3JvbGFcbiAgICAgICAgICAgIC9cXHMoKG1pbGVzdG9uZXxkcm9pZCg/OlsyLTR4XXxcXHMoPzpiaW9uaWN8eDJ8cHJvfHJhenIpKT8oOj9cXHM0Zyk/KSlbXFx3XFxzXStidWlsZFxcLy9pLFxuICAgICAgICAgICAgLyhtb3QpW1xccy1dPyhcXHcrKSovaVxuICAgICAgICAgICAgXSwgW1tWRU5ET1IsICdNb3Rvcm9sYSddLCBNT0RFTCwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvYW5kcm9pZC4rXFxzKG16NjBcXGR8eG9vbVtcXHMyXXswLDJ9KVxcc2J1aWxkXFwvL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ01vdG9yb2xhJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvYW5kcm9pZC4rKChzY2gtaVs4OV0wXFxkfHNody1tMzgwc3xndC1wXFxkezR9fGd0LW44MDAwfHNnaC10OFs1Nl05fG5leHVzIDEwKSkvaSxcbiAgICAgICAgICAgIC8oKFNNLVRcXHcrKSkvaVxuICAgICAgICAgICAgXSwgW1tWRU5ET1IsICdTYW1zdW5nJ10sIE1PREVMLCBbVFlQRSwgVEFCTEVUXV0sIFsgICAgICAgICAgICAgICAgICAvLyBTYW1zdW5nXG4gICAgICAgICAgICAvKChzW2NncF1oLVxcdyt8Z3QtXFx3K3xnYWxheHlcXHNuZXh1c3xzbS1uOTAwKSkvaSxcbiAgICAgICAgICAgIC8oc2FtW3N1bmddKilbXFxzLV0qKFxcdystP1tcXHctXSopKi9pLFxuICAgICAgICAgICAgL3NlYy0oKHNnaFxcdyspKS9pXG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgJ1NhbXN1bmcnXSwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyhzYW1zdW5nKTtzbWFydHR2L2lcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvXFwoZHR2W1xcKTtdLisoYXF1b3MpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2hhcnBcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1NoYXJwJ10sIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC9zaWUtKFxcdyspKi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpZW1lbnNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1NpZW1lbnMnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8obWFlbW98bm9raWEpLioobjkwMHxsdW1pYVxcc1xcZCspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb2tpYVxuICAgICAgICAgICAgLyhub2tpYSlbXFxzXy1dPyhbXFx3LV0rKSovaVxuICAgICAgICAgICAgXSwgW1tWRU5ET1IsICdOb2tpYSddLCBNT0RFTCwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC9hbmRyb2lkXFxzM1xcLltcXHNcXHctO117MTB9KGFcXGR7M30pL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBY2VyXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdBY2VyJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvYW5kcm9pZFxcczNcXC5bXFxzXFx3LTtdezEwfShsZz8pLShbMDZjdjldezMsNH0pL2kgICAgICAgICAgICAgICAgICAgICAvLyBMRyBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCAnTEcnXSwgTU9ERUwsIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyhsZykgbmV0Y2FzdFxcLnR2L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTEcgU21hcnRUVlxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC8obmV4dXNcXHNbNDVdKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExHXG4gICAgICAgICAgICAvbGdbZTtcXHNcXC8tXSsoXFx3KykqL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0xHJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgL2FuZHJvaWQuKyhpZGVhdGFiW2EtejAtOVxcLVxcc10rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExlbm92b1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTGVub3ZvJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgL2xpbnV4Oy4rKChqb2xsYSkpOy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKb2xsYVxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLygocGViYmxlKSlhcHBcXC9bXFxkXFwuXStcXHMvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGViYmxlXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIFdFQVJBQkxFXV0sIFtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC9hbmRyb2lkLis7XFxzKGdsYXNzKVxcc1xcZC9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR29vZ2xlIEdsYXNzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdHb29nbGUnXSwgW1RZUEUsIFdFQVJBQkxFXV0sIFtcblxuICAgICAgICAgICAgLyhtb2JpbGV8dGFibGV0KTsuK3J2XFw6LitnZWNrb1xcLy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVuaWRlbnRpZmlhYmxlXG4gICAgICAgICAgICBdLCBbW1RZUEUsIHV0aWwubG93ZXJpemVdLCBWRU5ET1IsIE1PREVMXVxuICAgICAgICBdLFxuXG4gICAgICAgIGVuZ2luZSA6IFtbXG5cbiAgICAgICAgICAgIC8ocHJlc3RvKVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJlc3RvXG4gICAgICAgICAgICAvKHdlYmtpdHx0cmlkZW50fG5ldGZyb250fG5ldHN1cmZ8YW1heWF8bHlueHx3M20pXFwvKFtcXHdcXC5dKykvaSwgICAgIC8vIFdlYktpdC9UcmlkZW50L05ldEZyb250L05ldFN1cmYvQW1heWEvTHlueC93M21cbiAgICAgICAgICAgIC8oa2h0bWx8dGFzbWFufGxpbmtzKVtcXC9cXHNdXFwoPyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBLSFRNTC9UYXNtYW4vTGlua3NcbiAgICAgICAgICAgIC8oaWNhYilbXFwvXFxzXShbMjNdXFwuW1xcZFxcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpQ2FiXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgL3J2XFw6KFtcXHdcXC5dKykuKihnZWNrbykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZWNrb1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIE5BTUVdXG4gICAgICAgIF0sXG5cbiAgICAgICAgb3MgOiBbW1xuXG4gICAgICAgICAgICAvLyBXaW5kb3dzIGJhc2VkXG4gICAgICAgICAgICAvbWljcm9zb2Z0XFxzKHdpbmRvd3MpXFxzKHZpc3RhfHhwKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2luZG93cyAoaVR1bmVzKVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKHdpbmRvd3MpXFxzbnRcXHM2XFwuMjtcXHMoYXJtKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaW5kb3dzIFJUXG4gICAgICAgICAgICAvKHdpbmRvd3NcXHNwaG9uZSg/Olxcc29zKSp8d2luZG93c1xcc21vYmlsZXx3aW5kb3dzKVtcXHNcXC9dPyhbbnRjZVxcZFxcLlxcc10rXFx3KS9pXG4gICAgICAgICAgICBdLCBbTkFNRSwgW1ZFUlNJT04sIG1hcHBlci5zdHIsIG1hcHMub3Mud2luZG93cy52ZXJzaW9uXV0sIFtcbiAgICAgICAgICAgIC8od2luKD89M3w5fG4pfHdpblxcczl4XFxzKShbbnRcXGRcXC5dKykvaVxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnV2luZG93cyddLCBbVkVSU0lPTiwgbWFwcGVyLnN0ciwgbWFwcy5vcy53aW5kb3dzLnZlcnNpb25dXSwgW1xuXG4gICAgICAgICAgICAvLyBNb2JpbGUvRW1iZWRkZWQgT1NcbiAgICAgICAgICAgIC9cXCgoYmIpKDEwKTsvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsYWNrQmVycnkgMTBcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ0JsYWNrQmVycnknXSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8oYmxhY2tiZXJyeSlcXHcqXFwvPyhbXFx3XFwuXSspKi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsYWNrYmVycnlcbiAgICAgICAgICAgIC8odGl6ZW4pW1xcL1xcc10oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRpemVuXG4gICAgICAgICAgICAvKGFuZHJvaWR8d2Vib3N8cGFsbVxcb3N8cW54fGJhZGF8cmltXFxzdGFibGV0XFxzb3N8bWVlZ298Y29udGlraSlbXFwvXFxzLV0/KFtcXHdcXC5dKykqL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFuZHJvaWQvV2ViT1MvUGFsbS9RTlgvQmFkYS9SSU0vTWVlR28vQ29udGlraVxuICAgICAgICAgICAgL2xpbnV4Oy4rKHNhaWxmaXNoKTsvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYWlsZmlzaCBPU1xuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKHN5bWJpYW5cXHM/b3N8c3ltYm9zfHM2MCg/PTspKVtcXC9cXHMtXT8oW1xcd1xcLl0rKSovaSAgICAgICAgICAgICAgICAgLy8gU3ltYmlhblxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnU3ltYmlhbiddLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgL1xcKChzZXJpZXM0MCk7L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VyaWVzIDQwXG4gICAgICAgICAgICBdLCBbTkFNRV0sIFtcbiAgICAgICAgICAgIC9tb3ppbGxhLitcXChtb2JpbGU7LitnZWNrby4rZmlyZWZveC9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggT1NcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ0ZpcmVmb3ggT1MnXSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLy8gQ29uc29sZVxuICAgICAgICAgICAgLyhuaW50ZW5kb3xwbGF5c3RhdGlvbilcXHMoW3dpZHMzcG9ydGFibGV2dV0rKS9pLCAgICAgICAgICAgICAgICAgICAgLy8gTmludGVuZG8vUGxheXN0YXRpb25cblxuICAgICAgICAgICAgLy8gR05VL0xpbnV4IGJhc2VkXG4gICAgICAgICAgICAvKG1pbnQpW1xcL1xcc1xcKF0/KFxcdyspKi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaW50XG4gICAgICAgICAgICAvKG1hZ2VpYXx2ZWN0b3JsaW51eClbO1xcc10vaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWdlaWEvVmVjdG9yTGludXhcbiAgICAgICAgICAgIC8oam9saXxba3hsbl0/dWJ1bnR1fGRlYmlhbnxbb3Blbl0qc3VzZXxnZW50b298YXJjaHxzbGFja3dhcmV8ZmVkb3JhfG1hbmRyaXZhfGNlbnRvc3xwY2xpbnV4b3N8cmVkaGF0fHplbndhbGt8bGlucHVzKVtcXC9cXHMtXT8oW1xcd1xcLi1dKykqL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEpvbGkvVWJ1bnR1L0RlYmlhbi9TVVNFL0dlbnRvby9BcmNoL1NsYWNrd2FyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGZWRvcmEvTWFuZHJpdmEvQ2VudE9TL1BDTGludXhPUy9SZWRIYXQvWmVud2Fsay9MaW5wdXNcbiAgICAgICAgICAgIC8oaHVyZHxsaW51eClcXHM/KFtcXHdcXC5dKykqL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSHVyZC9MaW51eFxuICAgICAgICAgICAgLyhnbnUpXFxzPyhbXFx3XFwuXSspKi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHTlVcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvKGNyb3MpXFxzW1xcd10rXFxzKFtcXHdcXC5dK1xcdykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9taXVtIE9TXG4gICAgICAgICAgICBdLCBbW05BTUUsICdDaHJvbWl1bSBPUyddLCBWRVJTSU9OXSxbXG5cbiAgICAgICAgICAgIC8vIFNvbGFyaXNcbiAgICAgICAgICAgIC8oc3Vub3MpXFxzPyhbXFx3XFwuXStcXGQpKi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbGFyaXNcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ1NvbGFyaXMnXSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLy8gQlNEIGJhc2VkXG4gICAgICAgICAgICAvXFxzKFtmcmVudG9wYy1dezAsNH1ic2R8ZHJhZ29uZmx5KVxccz8oW1xcd1xcLl0rKSovaSAgICAgICAgICAgICAgICAgICAvLyBGcmVlQlNEL05ldEJTRC9PcGVuQlNEL1BDLUJTRC9EcmFnb25GbHlcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSxbXG5cbiAgICAgICAgICAgIC8oaXBbaG9uZWFkXSspKD86Lipvc1xccyooW1xcd10rKSpcXHNsaWtlXFxzbWFjfDtcXHNvcGVyYSkvaSAgICAgICAgICAgICAvLyBpT1NcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ2lPUyddLCBbVkVSU0lPTiwgL18vZywgJy4nXV0sIFtcblxuICAgICAgICAgICAgLyhtYWNcXHNvc1xcc3gpXFxzPyhbXFx3XFxzXFwuXStcXHcpKi9pLCBcbiAgICAgICAgICAgIC8obWFjaW50b3NofG1hYyg/PV9wb3dlcnBjKVxccykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hYyBPU1xuICAgICAgICAgICAgXSwgW1tOQU1FLCAnTWFjIE9TJ10sIFtWRVJTSU9OLCAvXy9nLCAnLiddXSwgW1xuXG4gICAgICAgICAgICAvLyBPdGhlclxuICAgICAgICAgICAgLygoPzpvcGVuKT9zb2xhcmlzKVtcXC9cXHMtXT8oW1xcd1xcLl0rKSovaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29sYXJpc1xuICAgICAgICAgICAgLyhoYWlrdSlcXHMoXFx3KykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhhaWt1XG4gICAgICAgICAgICAvKGFpeClcXHMoKFxcZCkoPz1cXC58XFwpfFxccylbXFx3XFwuXSopKi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBSVhcbiAgICAgICAgICAgIC8ocGxhblxcczl8bWluaXh8YmVvc3xvc1xcLzJ8YW1pZ2Fvc3xtb3JwaG9zfHJpc2NcXHNvc3xvcGVudm1zKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQbGFuOS9NaW5peC9CZU9TL09TMi9BbWlnYU9TL01vcnBoT1MvUklTQ09TL09wZW5WTVNcbiAgICAgICAgICAgIC8odW5peClcXHM/KFtcXHdcXC5dKykqL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVU5JWFxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dXG4gICAgICAgIF1cbiAgICB9O1xuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENvbnN0cnVjdG9yXG4gICAgLy8vLy8vLy8vLy8vLy8vL1xuXG5cbiAgICB2YXIgVUFQYXJzZXIgPSBmdW5jdGlvbiAodWFzdHJpbmcsIGV4dGVuc2lvbnMpIHtcblxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVUFQYXJzZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVBUGFyc2VyKHVhc3RyaW5nLCBleHRlbnNpb25zKS5nZXRSZXN1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1YSA9IHVhc3RyaW5nIHx8ICgod2luZG93ICYmIHdpbmRvdy5uYXZpZ2F0b3IgJiYgd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpID8gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgOiBFTVBUWSk7XG4gICAgICAgIHZhciByZ3htYXAgPSBleHRlbnNpb25zID8gdXRpbC5leHRlbmQocmVnZXhlcywgZXh0ZW5zaW9ucykgOiByZWdleGVzO1xuXG4gICAgICAgIHRoaXMuZ2V0QnJvd3NlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBwZXIucmd4LmFwcGx5KHRoaXMsIHJneG1hcC5icm93c2VyKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRDUFUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFwcGVyLnJneC5hcHBseSh0aGlzLCByZ3htYXAuY3B1KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXREZXZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFwcGVyLnJneC5hcHBseSh0aGlzLCByZ3htYXAuZGV2aWNlKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRFbmdpbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFwcGVyLnJneC5hcHBseSh0aGlzLCByZ3htYXAuZW5naW5lKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRPUyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBwZXIucmd4LmFwcGx5KHRoaXMsIHJneG1hcC5vcyk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0UmVzdWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVhICAgICAgOiB0aGlzLmdldFVBKCksXG4gICAgICAgICAgICAgICAgYnJvd3NlciA6IHRoaXMuZ2V0QnJvd3NlcigpLFxuICAgICAgICAgICAgICAgIGVuZ2luZSAgOiB0aGlzLmdldEVuZ2luZSgpLFxuICAgICAgICAgICAgICAgIG9zICAgICAgOiB0aGlzLmdldE9TKCksXG4gICAgICAgICAgICAgICAgZGV2aWNlICA6IHRoaXMuZ2V0RGV2aWNlKCksXG4gICAgICAgICAgICAgICAgY3B1ICAgICA6IHRoaXMuZ2V0Q1BVKClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0VUEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdWE7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0VUEgPSBmdW5jdGlvbiAodWFzdHJpbmcpIHtcbiAgICAgICAgICAgIHVhID0gdWFzdHJpbmc7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZXRVQSh1YSk7XG4gICAgfTtcblxuICAgIFVBUGFyc2VyLlZFUlNJT04gPSBMSUJWRVJTSU9OO1xuICAgIFVBUGFyc2VyLkJST1dTRVIgPSB7XG4gICAgICAgIE5BTUUgICAgOiBOQU1FLFxuICAgICAgICBNQUpPUiAgIDogTUFKT1IsXG4gICAgICAgIFZFUlNJT04gOiBWRVJTSU9OICBcbiAgICB9O1xuICAgIFVBUGFyc2VyLkNQVSA9IHtcbiAgICAgICAgQVJDSElURUNUVVJFIDogQVJDSElURUNUVVJFXG4gICAgfTtcbiAgICBVQVBhcnNlci5ERVZJQ0UgPSB7XG4gICAgICAgIE1PREVMICAgOiBNT0RFTCxcbiAgICAgICAgVkVORE9SICA6IFZFTkRPUixcbiAgICAgICAgVFlQRSAgICA6IFRZUEUsXG4gICAgICAgIENPTlNPTEUgOiBDT05TT0xFLFxuICAgICAgICBNT0JJTEUgIDogTU9CSUxFLFxuICAgICAgICBTTUFSVFRWIDogU01BUlRUVixcbiAgICAgICAgVEFCTEVUICA6IFRBQkxFVCxcbiAgICAgICAgV0VBUkFCTEU6IFdFQVJBQkxFLFxuICAgICAgICBFTUJFRERFRDogRU1CRURERURcbiAgICB9O1xuICAgIFVBUGFyc2VyLkVOR0lORSA9IHtcbiAgICAgICAgTkFNRSAgICA6IE5BTUUsXG4gICAgICAgIFZFUlNJT04gOiBWRVJTSU9OXG4gICAgfTtcbiAgICBVQVBhcnNlci5PUyA9IHtcbiAgICAgICAgTkFNRSAgICA6IE5BTUUsXG4gICAgICAgIFZFUlNJT04gOiBWRVJTSU9OICBcbiAgICB9O1xuXG5cbiAgICAvLy8vLy8vLy8vL1xuICAgIC8vIEV4cG9ydFxuICAgIC8vLy8vLy8vLy9cblxuXG4gICAgLy8gY2hlY2sganMgZW52aXJvbm1lbnRcbiAgICBpZiAodHlwZW9mKGV4cG9ydHMpICE9PSBVTkRFRl9UWVBFKSB7XG4gICAgICAgIC8vIG5vZGVqcyBlbnZcbiAgICAgICAgaWYgKHR5cGVvZihtb2R1bGUpICE9PSBVTkRFRl9UWVBFICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBVQVBhcnNlcjtcbiAgICAgICAgfVxuICAgICAgICBleHBvcnRzLlVBUGFyc2VyID0gVUFQYXJzZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYnJvd3NlciBlbnZcbiAgICAgICAgd2luZG93LlVBUGFyc2VyID0gVUFQYXJzZXI7XG4gICAgICAgIC8vIHJlcXVpcmVqcyBlbnYgKG9wdGlvbmFsKVxuICAgICAgICBpZiAodHlwZW9mKGRlZmluZSkgPT09IEZVTkNfVFlQRSAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBVQVBhcnNlcjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGpRdWVyeS9aZXB0byBzcGVjaWZpYyAob3B0aW9uYWwpXG4gICAgICAgIHZhciAkID0gd2luZG93LmpRdWVyeSB8fCB3aW5kb3cuWmVwdG87XG4gICAgICAgIGlmICh0eXBlb2YoJCkgIT09IFVOREVGX1RZUEUpIHtcbiAgICAgICAgICAgIHZhciBwYXJzZXIgPSBuZXcgVUFQYXJzZXIoKTtcbiAgICAgICAgICAgICQudWEgPSBwYXJzZXIuZ2V0UmVzdWx0KCk7XG4gICAgICAgICAgICAkLnVhLmdldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZXIuZ2V0VUEoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkLnVhLnNldCA9IGZ1bmN0aW9uICh1YXN0cmluZykge1xuICAgICAgICAgICAgICAgIHBhcnNlci5zZXRVQSh1YXN0cmluZyk7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHBhcnNlci5nZXRSZXN1bHQoKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAkLnVhW3Byb3BdID0gcmVzdWx0W3Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbn0pKHRoaXMpO1xuIiwidmFyIHdpbmRvdyA9IHJlcXVpcmUoXCJnbG9iYWwvd2luZG93XCIpXG52YXIgb25jZSA9IHJlcXVpcmUoXCJvbmNlXCIpXG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgncGFyc2UtaGVhZGVycycpXG5cbnZhciBtZXNzYWdlcyA9IHtcbiAgICBcIjBcIjogXCJJbnRlcm5hbCBYTUxIdHRwUmVxdWVzdCBFcnJvclwiLFxuICAgIFwiNFwiOiBcIjR4eCBDbGllbnQgRXJyb3JcIixcbiAgICBcIjVcIjogXCI1eHggU2VydmVyIEVycm9yXCJcbn1cblxudmFyIFhIUiA9IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCB8fCBub29wXG52YXIgWERSID0gXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiAobmV3IFhIUigpKSA/IFhIUiA6IHdpbmRvdy5YRG9tYWluUmVxdWVzdFxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVhIUlxuXG5mdW5jdGlvbiBjcmVhdGVYSFIob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgb3B0aW9ucyA9IHsgdXJpOiBvcHRpb25zIH1cbiAgICB9XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIGNhbGxiYWNrID0gb25jZShjYWxsYmFjaylcblxuICAgIHZhciB4aHIgPSBvcHRpb25zLnhociB8fCBudWxsXG5cbiAgICBpZiAoIXhocikge1xuICAgICAgICBpZiAob3B0aW9ucy5jb3JzIHx8IG9wdGlvbnMudXNlWERSKSB7XG4gICAgICAgICAgICB4aHIgPSBuZXcgWERSKClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB4aHIgPSBuZXcgWEhSKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB1cmkgPSB4aHIudXJsID0gb3B0aW9ucy51cmkgfHwgb3B0aW9ucy51cmxcbiAgICB2YXIgbWV0aG9kID0geGhyLm1ldGhvZCA9IG9wdGlvbnMubWV0aG9kIHx8IFwiR0VUXCJcbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keSB8fCBvcHRpb25zLmRhdGFcbiAgICB2YXIgaGVhZGVycyA9IHhoci5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9XG4gICAgdmFyIHN5bmMgPSAhIW9wdGlvbnMuc3luY1xuICAgIHZhciBpc0pzb24gPSBmYWxzZVxuICAgIHZhciBrZXlcbiAgICB2YXIgbG9hZCA9IG9wdGlvbnMucmVzcG9uc2UgPyBsb2FkUmVzcG9uc2UgOiBsb2FkWGhyXG5cbiAgICBpZiAoXCJqc29uXCIgaW4gb3B0aW9ucykge1xuICAgICAgICBpc0pzb24gPSB0cnVlXG4gICAgICAgIGhlYWRlcnNbXCJBY2NlcHRcIl0gPSBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICBpZiAobWV0aG9kICE9PSBcIkdFVFwiICYmIG1ldGhvZCAhPT0gXCJIRUFEXCIpIHtcbiAgICAgICAgICAgIGhlYWRlcnNbXCJDb250ZW50LVR5cGVcIl0gPSBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuanNvbilcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSByZWFkeXN0YXRlY2hhbmdlXG4gICAgeGhyLm9ubG9hZCA9IGxvYWRcbiAgICB4aHIub25lcnJvciA9IGVycm9yXG4gICAgLy8gSUU5IG11c3QgaGF2ZSBvbnByb2dyZXNzIGJlIHNldCB0byBhIHVuaXF1ZSBmdW5jdGlvbi5cbiAgICB4aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gSUUgbXVzdCBkaWVcbiAgICB9XG4gICAgLy8gaGF0ZSBJRVxuICAgIHhoci5vbnRpbWVvdXQgPSBub29wXG4gICAgeGhyLm9wZW4obWV0aG9kLCB1cmksICFzeW5jKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9iYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAgaWYgKG9wdGlvbnMud2l0aENyZWRlbnRpYWxzIHx8IChvcHRpb25zLmNvcnMgJiYgb3B0aW9ucy53aXRoQ3JlZGVudGlhbHMgIT09IGZhbHNlKSkge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIENhbm5vdCBzZXQgdGltZW91dCB3aXRoIHN5bmMgcmVxdWVzdFxuICAgIGlmICghc3luYykge1xuICAgICAgICB4aHIudGltZW91dCA9IFwidGltZW91dFwiIGluIG9wdGlvbnMgPyBvcHRpb25zLnRpbWVvdXQgOiA1MDAwXG4gICAgfVxuXG4gICAgaWYgKHhoci5zZXRSZXF1ZXN0SGVhZGVyKSB7XG4gICAgICAgIGZvcihrZXkgaW4gaGVhZGVycyl7XG4gICAgICAgICAgICBpZihoZWFkZXJzLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgaGVhZGVyc1trZXldKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSGVhZGVycyBjYW5ub3QgYmUgc2V0IG9uIGFuIFhEb21haW5SZXF1ZXN0IG9iamVjdFwiKVxuICAgIH1cblxuICAgIGlmIChcInJlc3BvbnNlVHlwZVwiIGluIG9wdGlvbnMpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9IG9wdGlvbnMucmVzcG9uc2VUeXBlXG4gICAgfVxuICAgIFxuICAgIGlmIChcImJlZm9yZVNlbmRcIiBpbiBvcHRpb25zICYmIFxuICAgICAgICB0eXBlb2Ygb3B0aW9ucy5iZWZvcmVTZW5kID09PSBcImZ1bmN0aW9uXCJcbiAgICApIHtcbiAgICAgICAgb3B0aW9ucy5iZWZvcmVTZW5kKHhocilcbiAgICB9XG5cbiAgICB4aHIuc2VuZChib2R5KVxuXG4gICAgcmV0dXJuIHhoclxuXG4gICAgZnVuY3Rpb24gcmVhZHlzdGF0ZWNoYW5nZSgpIHtcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBsb2FkKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJvZHkoKSB7XG4gICAgICAgIC8vIENocm9tZSB3aXRoIHJlcXVlc3RUeXBlPWJsb2IgdGhyb3dzIGVycm9ycyBhcnJvdW5kIHdoZW4gZXZlbiB0ZXN0aW5nIGFjY2VzcyB0byByZXNwb25zZVRleHRcbiAgICAgICAgdmFyIGJvZHkgPSBudWxsXG5cbiAgICAgICAgaWYgKHhoci5yZXNwb25zZSkge1xuICAgICAgICAgICAgYm9keSA9IHhoci5yZXNwb25zZVxuICAgICAgICB9IGVsc2UgaWYgKHhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAheGhyLnJlc3BvbnNlVHlwZSkge1xuICAgICAgICAgICAgYm9keSA9IHhoci5yZXNwb25zZVRleHQgfHwgeGhyLnJlc3BvbnNlWE1MXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNKc29uKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKGJvZHkpXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvZHlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTdGF0dXNDb2RlKCkge1xuICAgICAgICByZXR1cm4geGhyLnN0YXR1cyA9PT0gMTIyMyA/IDIwNCA6IHhoci5zdGF0dXNcbiAgICB9XG5cbiAgICAvLyBpZiB3ZSdyZSBnZXR0aW5nIGEgbm9uZS1vayBzdGF0dXNDb2RlLCBidWlsZCAmIHJldHVybiBhbiBlcnJvclxuICAgIGZ1bmN0aW9uIGVycm9yRnJvbVN0YXR1c0NvZGUoc3RhdHVzKSB7XG4gICAgICAgIHZhciBlcnJvciA9IG51bGxcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gMCB8fCAoc3RhdHVzID49IDQwMCAmJiBzdGF0dXMgPCA2MDApKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9ICh0eXBlb2YgYm9keSA9PT0gXCJzdHJpbmdcIiA/IGJvZHkgOiBmYWxzZSkgfHxcbiAgICAgICAgICAgICAgICBtZXNzYWdlc1tTdHJpbmcoc3RhdHVzKS5jaGFyQXQoMCldXG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKVxuICAgICAgICAgICAgZXJyb3Iuc3RhdHVzQ29kZSA9IHN0YXR1c1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVycm9yXG4gICAgfVxuXG4gICAgLy8gd2lsbCBsb2FkIHRoZSBkYXRhICYgcHJvY2VzcyB0aGUgcmVzcG9uc2UgaW4gYSBzcGVjaWFsIHJlc3BvbnNlIG9iamVjdFxuICAgIGZ1bmN0aW9uIGxvYWRSZXNwb25zZSgpIHtcbiAgICAgICAgdmFyIHN0YXR1cyA9IGdldFN0YXR1c0NvZGUoKVxuICAgICAgICB2YXIgZXJyb3IgPSBlcnJvckZyb21TdGF0dXNDb2RlKHN0YXR1cylcbiAgICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgYm9keTogZ2V0Qm9keSgpLFxuICAgICAgICAgICAgc3RhdHVzQ29kZTogc3RhdHVzLFxuICAgICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgICByYXc6IHhoclxuICAgICAgICB9XG4gICAgICAgIGlmKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMpeyAvL3JlbWVtYmVyIHhociBjYW4gaW4gZmFjdCBiZSBYRFIgZm9yIENPUlMgaW4gSUVcbiAgICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMgPSBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2UuaGVhZGVycyA9IHt9XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhlcnJvciwgcmVzcG9uc2UsIHJlc3BvbnNlLmJvZHkpXG4gICAgfVxuXG4gICAgLy8gd2lsbCBsb2FkIHRoZSBkYXRhIGFuZCBhZGQgc29tZSByZXNwb25zZSBwcm9wZXJ0aWVzIHRvIHRoZSBzb3VyY2UgeGhyXG4gICAgLy8gYW5kIHRoZW4gcmVzcG9uZCB3aXRoIHRoYXRcbiAgICBmdW5jdGlvbiBsb2FkWGhyKCkge1xuICAgICAgICB2YXIgc3RhdHVzID0gZ2V0U3RhdHVzQ29kZSgpXG4gICAgICAgIHZhciBlcnJvciA9IGVycm9yRnJvbVN0YXR1c0NvZGUoc3RhdHVzKVxuXG4gICAgICAgIHhoci5zdGF0dXMgPSB4aHIuc3RhdHVzQ29kZSA9IHN0YXR1c1xuICAgICAgICB4aHIuYm9keSA9IGdldEJvZHkoKVxuICAgICAgICB4aHIuaGVhZGVycyA9IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpXG5cbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIHhociwgeGhyLmJvZHkpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXJyb3IoZXZ0KSB7XG4gICAgICAgIGNhbGxiYWNrKGV2dCwgeGhyKVxuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBub29wKCkge31cbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7fTtcbn1cblxufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJtb2R1bGUuZXhwb3J0cyA9IG9uY2Vcblxub25jZS5wcm90byA9IG9uY2UoZnVuY3Rpb24gKCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnVuY3Rpb24ucHJvdG90eXBlLCAnb25jZScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG9uY2UodGhpcylcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxufSlcblxuZnVuY3Rpb24gb25jZSAoZm4pIHtcbiAgdmFyIGNhbGxlZCA9IGZhbHNlXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGNhbGxlZCkgcmV0dXJuXG4gICAgY2FsbGVkID0gdHJ1ZVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIH1cbn1cbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnaXMtZnVuY3Rpb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2hcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuXG5mdW5jdGlvbiBmb3JFYWNoKGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGl0ZXJhdG9yKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpdGVyYXRvciBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgICBjb250ZXh0ID0gdGhpc1xuICAgIH1cbiAgICBcbiAgICBpZiAodG9TdHJpbmcuY2FsbChsaXN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJylcbiAgICAgICAgZm9yRWFjaEFycmF5KGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxuICAgIGVsc2UgaWYgKHR5cGVvZiBsaXN0ID09PSAnc3RyaW5nJylcbiAgICAgICAgZm9yRWFjaFN0cmluZyhsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbiAgICBlbHNlXG4gICAgICAgIGZvckVhY2hPYmplY3QobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG59XG5cbmZ1bmN0aW9uIGZvckVhY2hBcnJheShhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoYXJyYXksIGkpKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZm9yRWFjaFN0cmluZyhzdHJpbmcsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHN0cmluZy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAvLyBubyBzdWNoIHRoaW5nIGFzIGEgc3BhcnNlIHN0cmluZy5cbiAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBzdHJpbmcuY2hhckF0KGkpLCBpLCBzdHJpbmcpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoT2JqZWN0KG9iamVjdCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBrIGluIG9iamVjdCkge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGspKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9iamVjdFtrXSwgaywgb2JqZWN0KVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcblxuZnVuY3Rpb24gaXNGdW5jdGlvbiAoZm4pIHtcbiAgdmFyIHN0cmluZyA9IHRvU3RyaW5nLmNhbGwoZm4pXG4gIHJldHVybiBzdHJpbmcgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXScgfHxcbiAgICAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nICYmIHN0cmluZyAhPT0gJ1tvYmplY3QgUmVnRXhwXScpIHx8XG4gICAgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgIC8vIElFOCBhbmQgYmVsb3dcbiAgICAgKGZuID09PSB3aW5kb3cuc2V0VGltZW91dCB8fFxuICAgICAgZm4gPT09IHdpbmRvdy5hbGVydCB8fFxuICAgICAgZm4gPT09IHdpbmRvdy5jb25maXJtIHx8XG4gICAgICBmbiA9PT0gd2luZG93LnByb21wdCkpXG59O1xuIiwiXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0cmltO1xuXG5mdW5jdGlvbiB0cmltKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyp8XFxzKiQvZywgJycpO1xufVxuXG5leHBvcnRzLmxlZnQgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpO1xufTtcblxuZXhwb3J0cy5yaWdodCA9IGZ1bmN0aW9uKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59O1xuIiwidmFyIHRyaW0gPSByZXF1aXJlKCd0cmltJylcbiAgLCBmb3JFYWNoID0gcmVxdWlyZSgnZm9yLWVhY2gnKVxuICAsIGlzQXJyYXkgPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhlYWRlcnMpIHtcbiAgaWYgKCFoZWFkZXJzKVxuICAgIHJldHVybiB7fVxuXG4gIHZhciByZXN1bHQgPSB7fVxuXG4gIGZvckVhY2goXG4gICAgICB0cmltKGhlYWRlcnMpLnNwbGl0KCdcXG4nKVxuICAgICwgZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgaW5kZXggPSByb3cuaW5kZXhPZignOicpXG4gICAgICAgICAgLCBrZXkgPSB0cmltKHJvdy5zbGljZSgwLCBpbmRleCkpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAsIHZhbHVlID0gdHJpbShyb3cuc2xpY2UoaW5kZXggKyAxKSlcblxuICAgICAgICBpZiAodHlwZW9mKHJlc3VsdFtrZXldKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlXG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShyZXN1bHRba2V5XSkpIHtcbiAgICAgICAgICByZXN1bHRba2V5XS5wdXNoKHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gWyByZXN1bHRba2V5XSwgdmFsdWUgXVxuICAgICAgICB9XG4gICAgICB9XG4gIClcblxuICByZXR1cm4gcmVzdWx0XG59IiwiXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IFVBUGFyc2VyID0gcmVxdWlyZSggJ3VhLXBhcnNlci1qcycgKTsgXG5cbm1vZHVsZS5leHBvcnRzLmdldEluZm8gPSBmdW5jdGlvbiAoICkge1xuXG4gICAgbGV0IHBhcnNlciA9IG5ldyBVQVBhcnNlcigpO1xuXG4gICAgcGFyc2VyLnNldFVBKCB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCApO1xuXG4gICAgbGV0IGJyb3dzZXIgPSBwYXJzZXIuZ2V0QnJvd3NlcigpLFxuICAgICAgICBvcyA9IHBhcnNlci5nZXRPUygpLFxuICAgICAgICBkZXZpY2UgPSBwYXJzZXIuZ2V0RGV2aWNlKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBicm93c2VyOiBicm93c2VyLm5hbWUsXG4gICAgICAgIGJyb3dzZXJWZXJzaW9uOiBicm93c2VyLnZlcnNpb24sXG4gICAgICAgIG9zOiBvcy5uYW1lLFxuICAgICAgICBvc1ZlcnNpb246IG9zLnZlcnNpb24sXG4gICAgICAgIGRldmljZTogZGV2aWNlLm1vZGVsLFxuICAgICAgICByZWZlcnJlcjogZG9jdW1lbnQucmVmZXJyZXJcbiAgICB9O1xufTtcblxuXG5cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG5sZXQgYnJvd3NlciA9IHJlcXVpcmUoICcuL2Jyb3dzZXInICksXG4gICAgbWl4aW4gPSByZXF1aXJlKCAnLi91dGlscycgKS5taXhpbjtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudDtcblxuZnVuY3Rpb24gRXZlbnQgKCBldmVudE5hbWUsIG9wdGlvbnMgPSB7fSwgaWQgPSB7fSApIHtcbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSBtaXhpbigge1xuICAgICAgICBldmVudE5hbWU6IGV2ZW50TmFtZVxuICAgIH0sIG9wdGlvbnMsIGJyb3dzZXIuZ2V0SW5mbygpLCBpZCApO1xufVxuXG5FdmVudC5wcm90b3R5cGUgPSB7XG4gICAgdG9PYmplY3Q6IGZ1bmN0aW9uKCApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlcztcbiAgICB9XG59OyIsIlxuJ3VzZSBzdHJpY3QnO1xuXG4vKlxuICAgIE1peHBhbmVsIC0gTG9hZHMgdGhlIG1peHBhbmVsIHNjcmlwdFxuICAgIFxuICAgIHBhcmFtc1xuICAgICAgICBrZXkgeyBTdHJpbmcgfSAtIG1peHBhbmVscyBhcGkga2V5XG5cbiAgICByZXR1cm5zIFxuICAgICAgICBtaXhwYW5lbCB7IE9iamVjdCB9IC0gbWl4cGFuZWwgb2JqZWN0XG4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBrZXkgKSB7XG4gICAgLy8gdGVsbCBqc2hpbnQgdG8gaWdub3JlIG1peHBhbmVsIHNjcmlwdFxuICAgIC8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cbiAgICAoZnVuY3Rpb24oZixiKXtpZighYi5fX1NWKXt2YXIgYSxlLGksZzt3aW5kb3cubWl4cGFuZWw9YjtiLl9pPVtdO2IuaW5pdD1mdW5jdGlvbihhLGUsZCl7ZnVuY3Rpb24gZihiLGgpe3ZhciBhPWguc3BsaXQoXCIuXCIpOzI9PWEubGVuZ3RoJiYoYj1iW2FbMF1dLGg9YVsxXSk7YltoXT1mdW5jdGlvbigpe2IucHVzaChbaF0uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywwKSkpfX12YXIgYz1iO1widW5kZWZpbmVkXCIhPT10eXBlb2YgZD9jPWJbZF09W106ZD1cIm1peHBhbmVsXCI7Yy5wZW9wbGU9Yy5wZW9wbGV8fFtdO2MudG9TdHJpbmc9ZnVuY3Rpb24oYil7dmFyIGE9XCJtaXhwYW5lbFwiO1wibWl4cGFuZWxcIiE9PWQmJihhKz1cIi5cIitkKTtifHwoYSs9XCIgKHN0dWIpXCIpO3JldHVybiBhfTtjLnBlb3BsZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiBjLnRvU3RyaW5nKDEpK1wiLnBlb3BsZSAoc3R1YilcIn07aT1cImRpc2FibGUgdHJhY2sgdHJhY2tfcGFnZXZpZXcgdHJhY2tfbGlua3MgdHJhY2tfZm9ybXMgcmVnaXN0ZXIgcmVnaXN0ZXJfb25jZSBhbGlhcyB1bnJlZ2lzdGVyIGlkZW50aWZ5IG5hbWVfdGFnIHNldF9jb25maWcgcGVvcGxlLnNldCBwZW9wbGUuc2V0X29uY2UgcGVvcGxlLmluY3JlbWVudCBwZW9wbGUuYXBwZW5kIHBlb3BsZS50cmFja19jaGFyZ2UgcGVvcGxlLmNsZWFyX2NoYXJnZXMgcGVvcGxlLmRlbGV0ZV91c2VyXCIuc3BsaXQoXCIgXCIpO1xuICAgIGZvcihnPTA7ZzxpLmxlbmd0aDtnKyspZihjLGlbZ10pO2IuX2kucHVzaChbYSxlLGRdKX07Yi5fX1NWPTEuMjthPWYuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTthLnR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIjthLmFzeW5jPSEwO2Euc3JjPVwiLy9jZG4ubXhwbmwuY29tL2xpYnMvbWl4cGFuZWwtMi4yLm1pbi5qc1wiO2U9Zi5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKVswXTtlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGEsZSl9fSkoZG9jdW1lbnQsd2luZG93Lm1peHBhbmVsfHxbXSk7XG4gICAgLyoganNoaW50IGlnbm9yZTplbmQgKi9cbiAgICB3aW5kb3cubWl4cGFuZWwuaW5pdCgga2V5ICk7XG4gICAgcmV0dXJuIHdpbmRvdy5taXhwYW5lbDtcbn07IiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciB4aHIgPSByZXF1aXJlKCAneGhyJyApO1xuXG5mdW5jdGlvbiBub29wICggKSB7IH1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggdXJpLCBib2R5ID0ge30sIGNhbGxiYWNrID0gbm9vcCApIHtcbiAgICB2YXIgcGF5bG9hZCA9IHsgXG4gICAgICAgICAgICBldmVudE5hbWU6IGJvZHkuZXZlbnROYW1lIFxuICAgICAgICB9O1xuXG4gICAgZGVsZXRlIGJvZHkuZXZlbnROYW1lO1xuICAgIHBheWxvYWQuZGF0YSA9IGJvZHk7XG5cbiAgICB4aHIoe1xuICAgICAgICB1cmk6IHVyaSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoIHBheWxvYWQgKSxcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgfVxuICAgIH0sIGNhbGxiYWNrICk7XG59OyIsIlxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBtYWtlQXJyYXkgPVxubW9kdWxlLmV4cG9ydHMubWFrZUFycmF5ID0gZnVuY3Rpb24gKCBhcnIgKSB7XG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcnIsIDAgKTtcbn07XG5cbmNvbnN0IG1peGluID1cbm1vZHVsZS5leHBvcnRzLm1peGluID0gZnVuY3Rpb24oICkge1xuXG4gICAgbGV0IGFyZ3MgPSBtYWtlQXJyYXkoIGFyZ3VtZW50cyApLFxuICAgICAgICB0YXJnZXQgPSBhcmdzLnNoaWZ0KCksXG4gICAgICAgIG9iaiA9IGFyZ3Muc2hpZnQoKTsgXG5cbiAgICBmb3IgKCBsZXQga2V5IGluIG9iaiApIHtcbiAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IG9ialsga2V5IF07IC8vIHZlcnkgc2ltcGxlIG1peGluXG4gICAgfVxuXG4gICAgaWYgKCBhcmdzLmxlbmd0aCApIHtcbiAgICAgICAgYXJncy51bnNoaWZ0KCB0YXJnZXQgKTtcbiAgICAgICAgbWl4aW4uYXBwbHkoIG51bGwsIGFyZ3MgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuXG59OyJdfQ==
