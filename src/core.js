let iframe, iframeWindow, iframeDocument, searchIntervall, resizeListenerInstalled;

const PRELOAD_ATTRIBUTE = window.preloadPolyfillAttribute || 'preload';
const elemSymbol = window.Symbol ? Symbol('_preload') : '_preload' + (Date.now());
const logged = {};
const as = {};
const deferreds = {};
const async = window.Promise ?
    Promise.resolve() :
    {
        then: (fn) => {
            setTimeout(fn);
        },
    }
;

let supportsPreload = false;

try {
    supportsPreload = document.createElement('link').relList.supports('preload');
} catch(e){
    //false
}

function createIframe() {
    if(!iframe){
        iframe = document.createElement('iframe');
        iframe.setAttribute('role', 'presentation');
        iframe.tabIndex = -1;
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        iframe.src = 'javascript:false'; //eslint-disable-line no-script-url
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
    const dataAsAttribute = link.getAttribute('data-as');
    const asAttribute = dataAsAttribute == null ?
        link.getAttribute('as') || '' :
        dataAsAttribute
    ;
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
            const id = `${asAttribute} ${href}`;
            link[elemSymbol] = true;

            if(!deferreds[id]){
                deferreds[id] = as[asAttribute](data, getIframeData, link);
            }

            deferreds[id].then((status)=>{
                triggerEvent(link, status);
            });
        } else {
            installResizeHandler();
        }
    } else if(window.console && !logged[asAttribute]){
        link[elemSymbol] = true;
        logged[asAttribute] = true;
        console.log(`don't know as: ${asAttribute}`); //eslint-disable-line no-console
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
    });
}

if(!supportsPreload || PRELOAD_ATTRIBUTE != 'preload'){
    if(window.MutationObserver){
        new MutationObserver(() => { run(); })
            .observe( document.documentElement, {childList: true, subtree: true} )
        ;
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

function deferred(){
    let result;
    let fns = [];
    const promiseLike = {
        resolve: (_result) => {
            if(fns){
                let runFns = fns;
                result = _result;
                fns = null;
                async.then(()=>{
                    runFns.forEach((fn)=>{
                        fn(result);
                    });
                });
            }
            return promiseLike;
        },
        then: (fn)=> {
            if(fns){
                fns.push(fn);
            } else {
                async.then(()=>{
                    fn(result);
                });
            }
            return promiseLike;
        },
    };

    return promiseLike;

}

export default {
    add,
    run,
    supportsPreload,
    deferred,
    as,
};
