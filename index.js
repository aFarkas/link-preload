(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.linkPreloadPolyfill = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

require('./as-');

require('./as-font');

require('./as-script');

require('./as-style');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.run(document);

exports.default = _core2.default;

},{"./as-":2,"./as-font":3,"./as-script":4,"./as-style":5,"./core":6}],2:[function(require,module,exports){
'use strict';

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.add('', function (link, callback) {
    try {
        var request = new XMLHttpRequest();

        request.addEventListener('load', function () {
            callback('load');
        });

        request.addEventListener('error', function () {
            callback('error');
        });

        request.open('GET', link.href, true);

        request.send(null);
    } catch (er) {
        callback(er);
    }
});

},{"./core":6}],3:[function(require,module,exports){
'use strict';

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var _timer = require('./utils/timer');

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var COMPAREFONT = 'Comic Sans MS';

var id = Date.now();

var loadFont = window.FontFace && !window.preloadPolyfillNoFontFaceLoader ? function (iframeData, name, src, onLoad, onError) {
    var iframeWindow = iframeData.iframeWindow;

    var font = new iframeWindow.FontFace(name, src, {});

    font.load().then(onLoad)['catch'](onError);

    // if font.status == 'error' it is probably not supported type and no network error
} : function (iframeData, name, src, onLoad, onError) {
    var spans = void 0,
        stopTimer = void 0;
    var iframeDocument = iframeData.iframeDocument;

    var div = iframeDocument.createElement('div');
    var markup = '<span style="float:left;font-weight:400;font-style:normal;font-size:99px;">QW@HhsXJ</span>';

    var cleanup = function cleanup(status) {
        stopTimer();

        if (status == 'load') {
            onLoad();
        } else {
            onError();
        }

        iframeDocument.documentElement.removeChild(div);
    };

    markup += markup;

    markup = 'x<style>@font-face {\n            font-family: "' + name + '";\n            src: ' + src + ';\n            font-weight: 400;\n            font-style: normal;\n        </style> ' + markup;
    div.innerHTML = markup;

    spans = div.querySelectorAll('span');

    spans[0].style.fontFamily = name + ', ' + COMPAREFONT;
    spans[1].style.fontFamily = COMPAREFONT;

    iframeDocument.documentElement.appendChild(div);

    stopTimer = (0, _timer2.default)(function () {
        if (spans[0].offsetWidth != spans[1].offsetWidth) {
            cleanup('load');
        }
    }, cleanup);
};

_core2.default.add('font', function (link, callback, getIframeData) {
    var fontName = 'font' + id;
    var iframeData = getIframeData();
    var src = 'url("' + link.href + '") ' + (link.type ? ' format("' + (link.type.split('/')[1] || link.type) + '")' : '');

    loadFont(iframeData, fontName, src, function () {
        callback('load');
    }, function () {
        callback('timeoutNotSupportNetworkError');
    });

    id++;
});

},{"./core":6,"./utils/timer":7}],4:[function(require,module,exports){
'use strict';

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.add('script', function (link, callback, getIframeData) {
    var _getIframeData = getIframeData(),
        iframeDocument = _getIframeData.iframeDocument;

    var script = iframeDocument.createElement('script');
    var stop = function stop(status) {
        callback(status);
        iframeDocument.documentElement.removeChild(script);
    };
    script.src = link.href;
    iframeDocument.documentElement.appendChild(script);
    script.onload = function () {
        stop('load');
    };
    script.onerror = function () {
        stop('error');
    };
});

},{"./core":6}],5:[function(require,module,exports){
'use strict';

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var _timer = require('./utils/timer');

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.add('style', function (link, callback, getIframeData) {
    var stopTimer = void 0;

    var sheets = document.styleSheets;

    var _getIframeData = getIframeData(),
        iframeDocument = _getIframeData.iframeDocument;

    var preload = iframeDocument.createElement('link');

    var clear = function clear() {
        stopTimer();
        preload.onload = null;
        preload.onerror = null;
        iframeDocument.documentElement.removeChild(preload);
    };

    var onload = function onload() {
        clear();
        callback('load');
    };

    preload.href = link.href;
    preload.rel = 'stylesheet';

    iframeDocument.documentElement.appendChild(preload);

    stopTimer = (0, _timer2.default)(function () {
        var resolvedHref = preload.href;

        var i = sheets.length;

        while (i--) {
            if (sheets[i].href == resolvedHref) {
                onload();
                break;
            }
        }
    }, function () {
        clear();
        callback('timeout');
    });

    preload.onload = onload;

    preload.onerror = function () {
        clear();
        callback('error');
    };
});

},{"./core":6,"./utils/timer":7}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var iframe = void 0,
    iframeWindow = void 0,
    iframeDocument = void 0,
    searchIntervall = void 0,
    resizeListenerInstalled = void 0;

var elemSymbol = window.Symbol ? Symbol('_preload') : '_preload' + Date.now();
var logged = {};
var as = {};
var preloadAttr = window.preloadPolyfillAttribute || 'preload';

var supportsPreload = false;

try {
    supportsPreload = document.createElement('link').relList.supports('preload');
} catch (e) {}

function createIframe() {
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.setAttribute('role', 'presentation');
        iframe.tabIndex = -1;
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        iframe.src = 'javascript:false';
        iframe.allowTransparency = true;
        (document.body || document.documentElement).appendChild(iframe);
        iframeWindow = iframe.contentWindow || iframe.contentDocument;
        iframeDocument = iframeWindow.document;
        iframeDocument.write();
        iframeDocument.close();
    }
}

function getIframeData() {
    createIframe();
    return { iframe: iframe, iframeWindow: iframeWindow, iframeDocument: iframeDocument };
}

function triggerEvent(elem, name) {
    var event = document.createEvent('CustomEvent');

    event.initCustomEvent(name != 'load' ? 'error' : name, false, false, {
        from: 'polyfill',
        type: name
    });

    elem.dispatchEvent(event);
    return event;
}

function add(type, fn) {
    as[type] = fn;
}

function processPreload(link) {
    var asAttribute = link.getAttribute('as') || '';

    if (as[asAttribute]) {
        var _data = {
            as: asAttribute,
            href: link.href,
            type: link.getAttribute('type'),
            media: link.media,
            link: link
        };

        if (!link.media || matchMedia(link.media).matches) {
            createIframe();

            link[elemSymbol] = true;

            as[asAttribute](_data, function (status) {
                triggerEvent(link, status);
            }, getIframeData);
        } else {
            installResizeHandler();
        }
    } else if (window.console && !logged[data.as]) {
        logged[data.as] = true;
        console.log("don't know as: " + data.as);
    }
}

function findPreloads() {
    var i = void 0;

    if (supportsPreload && preloadAttr == 'preload') {
        return;
    }

    var preloads = document.querySelectorAll('link[rel="' + preloadAttr + '"]');

    for (i = 0; i < preloads.length; i++) {
        if (!preloads[i][elemSymbol]) {
            processPreload(preloads[i]);
        }
    }
}

function installResizeHandler() {
    if (resizeListenerInstalled) {
        return;
    }
    resizeListenerInstalled = true;

    var runs = void 0;
    var runFind = function runFind() {
        runs = false;
        findPreloads();
    };

    window.addEventListener('resize', function () {
        if (runs) {
            return;
        }
        runs = setTimeout(runFind, 99);
    }, false);
}

if (!supportsPreload || preloadAttr != 'preload') {
    if (window.MutationObserver) {
        new MutationObserver(findPreloads).observe(document.documentElement, { childList: true, subtree: true });
    } else {
        searchIntervall = setInterval(function () {
            if (document.readyState == 'complete') {
                clearInterval(searchIntervall);
            }

            findPreloads();
        }, 99);
    }

    setTimeout(findPreloads);
}

exports.default = {
    add: add,
    run: findPreloads
};

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (run, onTimeout) {
    var intervall = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 33;
    var clearTimeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 9999;

    var aborted = false;
    var now = Date.now();
    var timer = setInterval(function () {
        run();

        if (Date.now() - now > clearTimeout) {
            clearInterval(timer);
            if (!aborted && onTimeout) {
                onTimeout();
            }
        }
    }, intervall);

    return function () {
        aborted = true;
        clearInterval(timer);
    };
};

},{}]},{},[1])(1)
});