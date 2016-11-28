import linkPreload from './core';
import maxIntervalTimer from './utils/timer';

const COMPARE_FONT = 'Comic Sans MS';

let id = Date.now();

const supportsFontFace = (window.FontFace && !window.preloadPolyfillNoFontFaceLoader);

const loadFont = supportsFontFace ?
    (iframeData, name, src, deferred) => {
        const {iframeWindow} = iframeData;
        const font = new iframeWindow.FontFace(name, src, {});

        font.load()
            .then(()=>{
                deferred.resolve('load');
            })['catch'](()=>{
                deferred.resolve('error');
            })
        ;

        if(font.status == 'error'){
            deferred.resolve('notsupported');
        }
    } :
    (iframeData, name, src, deferred, _text) => {
        let spans, stopTimer;
        const {iframeDocument} = iframeData;
        const div = iframeDocument.createElement('div');
        let markup = `<div style="min-width:1000px;width:100%;"><span style="float:left;font-weight:400;font-style:normal;font-size:99px;">${_text}</span></div>`;

        const cleanup = (status)=>{
            stopTimer();

            if(status == 'load'){
                deferred.resolve('load');
            } else {
                deferred.resolve('timeout');
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

linkPreload.add('font', function(linkData, getIframeData, linkElement){
    const fontName = 'font' + id;
    const iframeData = getIframeData();
    const deferred = linkPreload.deferred();
    const text = linkElement.getAttribute('data-text') || 'QW@HhsXJ';
    const src = `url("${linkData.href}") ${(linkData.type ? ' format("'+ (linkData.type.split('/')[1] || linkData.type) +'")' : '')}`;

    loadFont(iframeData, fontName, src, deferred, text);

    id++;

    return deferred;
});

linkPreload.add('font-fetch', function(linkData, getIframeData, linkElement){
    return supportsFontFace || !linkPreload.as[''] ?
        linkPreload.as.font(linkData, getIframeData, linkElement) :
        linkPreload.as[''](linkData, getIframeData, linkElement)
    ;
});
