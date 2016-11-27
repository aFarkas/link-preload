let iframe, iframeWindow, iframeDocument, searchIntervall, resizeListenerInstalled;

const PRELOAD_ATTRIBUTE = window.preloadPolyfillAttribute || 'preload';
const elemSymbol = window.Symbol ? Symbol('_preload') : '_preload' + (Date.now());
const logged = {};
const as = {};

let supportsPreload = false;

try {
    supportsPreload = document.createElement('link').relList.supports('preload');
} catch(e){}

function createIframe() {
    if(!iframe){
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

function getIframeData(){
    createIframe();
    return {iframe, iframeWindow, iframeDocument};
}

function triggerEvent(elem, name){
    const event = document.createEvent('CustomEvent');

    event.initCustomEvent(name != 'load' ? 'error' : name, false, false, {
        from: 'polyfill',
        type: name,
    });

    elem.dispatchEvent(event);
    return event;
}

function add(type, fn){
    as[type] = fn;
}

function processPreload(link){
    const asAttribute = link.getAttribute('as') || '';
    const href = link.href;

    if(as[asAttribute] && href){
        const data = {
            as: asAttribute,
            href: href,
            type: link.getAttribute('type'),
            media: link.media,
            link: link,
        };

        if((!link.media || matchMedia(link.media).matches)){
            createIframe();

            link[elemSymbol] = true;

            as[asAttribute](data, function(status){
                triggerEvent(link, status);
            }, getIframeData, link);
        } else {
            installResizeHandler();
        }
    } else if(window.console && !logged[data.as]){
        link[elemSymbol] = true;
        logged[data.as] = true;
        console.log("don't know as: " + data.as);
    }
}

function run(preloadAttribute){
    let i;

    if(!preloadAttribute){
        preloadAttribute = PRELOAD_ATTRIBUTE;
    }

    if(supportsPreload && preloadAttribute == 'preload'){return;}

    const preloads = document.querySelectorAll('link[rel="'+ preloadAttribute +'"]');

    for(i = 0; i < preloads.length; i++){
        if(!preloads[i][elemSymbol]){
            processPreload(preloads[i]);
        }
    }
}

function installResizeHandler(){
    if(resizeListenerInstalled){return;}
    resizeListenerInstalled = true;

    let runs;
    const runFind = ()=> {
        runs = false;
        run();
    };

    window.addEventListener('resize', function(){
        if(runs){return;}
        runs = setTimeout(runFind, 99);
    }, false);
}

if(window.HTMLLinkElement && Object.defineProperty){
    const linkProto = window.HTMLLinkElement.prototype;

    ['as', 'type'].forEach((prop)=> {
        if(!(prop in linkProto)){
            Object.defineProperty(linkProto, prop, {
                enumerable: true,
                configurable: true,
                get: function () {
                    return this.getAttribute(prop) || '';
                },
                set: function (value) {
                    this.setAttribute(prop, value);
                },
            });
        }
    })
}

if(!supportsPreload || PRELOAD_ATTRIBUTE != 'preload'){
    if(window.MutationObserver){
        new MutationObserver(() => { run() }).observe( document.documentElement, {childList: true, subtree: true} );
    } else {
        searchIntervall = setInterval(function(){
            if(document.readyState == 'complete'){
                clearInterval(searchIntervall);
            }

            run();
        }, 99);
    }

    setTimeout(run);
}

export default {
    add,
    run,
    supportsPreload
};
