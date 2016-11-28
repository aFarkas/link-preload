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

_core2.default.add('', function (linkData) {
    var deferred = _core2.default.deferred();

    try {
        (function () {
            var request = new XMLHttpRequest();

            request.addEventListener('load', function () {
                var status = request.status;
                var isSuccess = status >= 200 && status < 300 || status == 304;

                deferred.resolve(isSuccess ? 'load' : 'error');
                request = null;
            });

            request.addEventListener('error', function () {
                deferred.resolve('error');
                request = null;
            });

            request.open('GET', linkData.href, true);

            request.send(null);
        })();
    } catch (er) {
        deferred.resolve(er);
    }

    return deferred;
});

},{"./core":6}],3:[function(require,module,exports){
'use strict';

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var _timer = require('./utils/timer');

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var COMPARE_FONT = 'Comic Sans MS';

var id = Date.now();

var supportsFontFace = window.FontFace && !window.preloadPolyfillNoFontFaceLoader;

var loadFont = supportsFontFace ? function (iframeData, name, src, deferred) {
    var iframeWindow = iframeData.iframeWindow;

    var font = new iframeWindow.FontFace(name, src, {});

    font.load().then(function () {
        deferred.resolve('load');
    })['catch'](function () {
        deferred.resolve('error');
    });

    if (font.status == 'error') {
        deferred.resolve('notsupported');
    }
} : function (iframeData, name, src, deferred, _text) {
    var spans = void 0,
        stopTimer = void 0;
    var iframeDocument = iframeData.iframeDocument;

    var div = iframeDocument.createElement('div');
    var markup = '<div style="min-width:1000px;width:100%;"><span style="float:left;font-weight:400;font-style:normal;font-size:99px;">' + _text + '</span></div>';

    var cleanup = function cleanup(status) {
        stopTimer();

        if (status == 'load') {
            deferred.resolve('load');
        } else {
            deferred.resolve('timeout');
        }

        iframeDocument.documentElement.removeChild(div);
    };

    markup += markup;

    markup = 'x<style>@font-face {\n            font-family: "' + name + '";\n            src: ' + src + ';\n            font-weight: 400;\n            font-style: normal;\n        </style> ' + markup;
    div.innerHTML = markup;

    spans = div.querySelectorAll('span');

    spans[0].style.fontFamily = name + ', ' + COMPARE_FONT;
    spans[1].style.fontFamily = COMPARE_FONT;

    iframeDocument.documentElement.appendChild(div);

    stopTimer = (0, _timer2.default)(function () {
        if (spans[0].offsetWidth != spans[1].offsetWidth) {
            cleanup('load');
        }
    }, cleanup);
};

_core2.default.add('font', function (linkData, getIframeData, linkElement) {
    var fontName = 'font' + id;
    var iframeData = getIframeData();
    var deferred = _core2.default.deferred();
    var text = linkElement.getAttribute('data-text') || 'QW@HhsXJ';
    var src = 'url("' + linkData.href + '") ' + (linkData.type ? ' format("' + (linkData.type.split('/')[1] || linkData.type) + '")' : '');

    loadFont(iframeData, fontName, src, deferred, text);

    id++;

    return deferred;
});

_core2.default.add('font-fetch', function (linkData, getIframeData, linkElement) {
    return supportsFontFace || !_core2.default.as[''] ? _core2.default.as.font(linkData, getIframeData, linkElement) : _core2.default.as[''](linkData, getIframeData, linkElement);
});

},{"./core":6,"./utils/timer":7}],4:[function(require,module,exports){
'use strict';

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.add('script', function (linkData, getIframeData) {
    var _getIframeData = getIframeData(),
        iframeDocument = _getIframeData.iframeDocument;

    var script = iframeDocument.createElement('script');
    var deferred = _core2.default.deferred();

    var stop = function stop(status) {
        deferred.resolve(status);
        iframeDocument.documentElement.removeChild(script);
    };

    script.src = linkData.href;

    iframeDocument.documentElement.appendChild(script);

    script.onreadystatechange = function () {
        if (script.readyState == 'complete') {
            stop('load');
        }
    };

    script.onload = function () {
        stop('load');
    };
    script.onerror = function () {
        stop('error');
    };

    return deferred;
});

},{"./core":6}],5:[function(require,module,exports){
'use strict';

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var _timer = require('./utils/timer');

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.add('style', function (link, getIframeData) {
    var stopTimer = void 0;

    var deferred = _core2.default.deferred();

    var _getIframeData = getIframeData(),
        iframeDocument = _getIframeData.iframeDocument;

    var sheets = iframeDocument.styleSheets;
    var preload = iframeDocument.createElement('link');

    var clear = function clear() {
        stopTimer();
        preload.onload = null;
        preload.onerror = null;
        iframeDocument.documentElement.removeChild(preload);
    };

    var onload = function onload() {
        clear();
        deferred.resolve('load');
    };

    var onerror = function onerror() {
        clear();
        deferred.resolve('error');
    };

    var detectCssChange = function detectCssChange() {
        var resolvedHref = preload.href;

        var i = sheets.length;

        while (i--) {
            if (sheets[i].href == resolvedHref) {
                onload();
                break;
            }
        }
    };

    preload.href = link.href;
    preload.rel = 'stylesheet';

    iframeDocument.documentElement.appendChild(preload);

    stopTimer = (0, _timer2.default)(detectCssChange, function () {
        clear();
        deferred.resolve('timeout');
    });

    preload.onload = detectCssChange;

    preload.onerror = onerror;

    return deferred;
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

var PRELOAD_ATTRIBUTE = window.preloadPolyfillAttribute || 'preload';
var elemSymbol = window.Symbol ? Symbol('_preload') : '_preload' + Date.now();
var logged = {};
var as = {};
var deferreds = {};
var async = window.Promise ? Promise.resolve() : {
    then: function then(fn) {
        setTimeout(fn);
    }
};

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
    var dataAsAttribute = link.getAttribute('data-as');
    var asAttribute = dataAsAttribute == null ? link.getAttribute('as') || '' : dataAsAttribute;
    var href = link.href;

    if (as[asAttribute] && href) {
        var _data = {
            as: asAttribute,
            href: href,
            type: link.getAttribute('type'),
            media: link.media,
            link: link
        };

        if (!link.media || matchMedia(link.media).matches) {
            var id = asAttribute + ' ' + href;
            link[elemSymbol] = true;

            if (!deferreds[id]) {
                deferreds[id] = as[asAttribute](_data, getIframeData, link);
            }

            deferreds[id].then(function (status) {
                triggerEvent(link, status);
            });
        } else {
            installResizeHandler();
        }
    } else if (window.console && !logged[data.as]) {
        link[elemSymbol] = true;
        logged[data.as] = true;
        console.log("don't know as: " + data.as);
    }
}

function run(preloadAttribute) {
    var i = void 0;

    if (!preloadAttribute) {
        preloadAttribute = PRELOAD_ATTRIBUTE;
    }

    if (supportsPreload && preloadAttribute == 'preload') {
        return;
    }

    var preloads = document.querySelectorAll('link[rel="' + preloadAttribute + '"]');

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
        run();
    };

    window.addEventListener('resize', function () {
        if (runs) {
            return;
        }
        runs = setTimeout(runFind, 99);
    }, false);
}

if (window.HTMLLinkElement && Object.defineProperty) {
    (function () {
        var linkProto = window.HTMLLinkElement.prototype;

        ['as', 'type'].forEach(function (prop) {
            if (!(prop in linkProto)) {
                Object.defineProperty(linkProto, prop, {
                    enumerable: true,
                    configurable: true,
                    get: function get() {
                        return this.getAttribute(prop) || '';
                    },
                    set: function set(value) {
                        this.setAttribute(prop, value);
                    }
                });
            }
        });
    })();
}

if (!supportsPreload || PRELOAD_ATTRIBUTE != 'preload') {
    if (window.MutationObserver) {
        new MutationObserver(function () {
            run();
        }).observe(document.documentElement, { childList: true, subtree: true });
    } else {
        searchIntervall = setInterval(function () {
            if (document.readyState == 'complete') {
                clearInterval(searchIntervall);
            }

            run();
        }, 99);
    }

    setTimeout(run);
}

function deferred() {
    var result = void 0;
    var fns = [];
    var promiseLike = {
        resolve: function resolve(_result) {
            if (fns) {
                (function () {
                    var runFns = fns;
                    result = _result;
                    fns = null;
                    async.then(function () {
                        runFns.forEach(function (fn) {
                            fn(result);
                        });
                    });
                })();
            }
            return promiseLike;
        },
        then: function then(fn) {
            if (fns) {
                fns.push(fn);
            } else {
                async.then(function () {
                    fn(result);
                });
            }
            return promiseLike;
        }
    };

    return promiseLike;
}

exports.default = {
    add: add,
    run: run,
    supportsPreload: supportsPreload,
    deferred: deferred,
    as: as
};

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (run, onTimeout) {
    var intervall = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 33;
    var clearTimeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : window.preloadPolyfillClearTimeout || 9999;

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