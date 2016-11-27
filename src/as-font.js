import linkPreload from './core';
import maxIntervalTimer from './utils/timer';

const COMPARE_FONT = 'Comic Sans MS';

let id = Date.now();

const loadFont = (window.FontFace && !window.preloadPolyfillNoFontFaceLoader) ?
    (iframeData, name, src, onLoad, onError) => {
        const {iframeWindow} = iframeData;
        const font = new iframeWindow.FontFace(name, src, {});

        font.load().then(onLoad)['catch'](onError);

        // if font.status == 'error' it is probably not supported type and no network error
    } :
    (iframeData, name, src, onLoad, onError) => {
        let spans, stopTimer;
        const {iframeDocument} = iframeData;
        const div = iframeDocument.createElement('div');
        let markup = '<span style="float:left;font-weight:400;font-style:normal;font-size:99px;">QW@HhsXJ</span>';

        const cleanup = (status)=>{
            stopTimer();

            if(status == 'load'){
                onLoad();
            } else {
                onError();
            }

            iframeDocument.documentElement.removeChild(div);
        };

        markup += markup;

        markup = `x<style>@font-face {
            font-family: "${name}";
            src: ${src};
            font-weight: 400;
            font-style: normal;
        </style> ${markup}`
        ;
        div.innerHTML = markup;

        spans = div.querySelectorAll('span');

        spans[0].style.fontFamily = name + ', '+ COMPARE_FONT;
        spans[1].style.fontFamily = COMPARE_FONT;

        iframeDocument.documentElement.appendChild(div);

        stopTimer = maxIntervalTimer(function(){
            if(spans[0].offsetWidth != spans[1].offsetWidth){
                cleanup('load');
            }
        }, cleanup);
    }
;

linkPreload.add('font', function(link, callback, getIframeData){
    const fontName = 'font' + id;
    const iframeData = getIframeData();
    const src = `url("${link.href}") ${(link.type ? ' format("'+ (link.type.split('/')[1] || link.type) +'")' : '')}`;

    loadFont(iframeData, fontName, src,
        ()=> {
            callback('load');
        },
        ()=> {
            callback('timeoutNotSupportNetworkError');
        }
    );

    id++;
});
