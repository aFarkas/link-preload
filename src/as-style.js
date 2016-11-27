import linkPreload from './core';
import maxIntervalTimer from './utils/timer';

linkPreload.add('style', function(link, callback, getIframeData){
    let stopTimer;

    const sheets = document.styleSheets;
    const {iframeDocument} = getIframeData();
    const preload = iframeDocument.createElement('link');

    const clear = () => {
        stopTimer();
        preload.onload = null;
        preload.onerror = null;
        iframeDocument.documentElement.removeChild(preload);
    };

    const onload = () => {
        clear();
        callback('load');
    };

    preload.href = link.href;
    preload.rel = 'stylesheet';

    iframeDocument.documentElement.appendChild(preload);

    stopTimer = maxIntervalTimer(function(){
        const resolvedHref = preload.href;

        let i = sheets.length;

        while( i-- ){
            if( sheets[ i ].href == resolvedHref ){
                onload();
                break;
            }
        }

    }, () => {
        clear();
        callback('timeout');
    });

    preload.onload = onload;

    preload.onerror = () => {
        clear();
        callback('error');
    };
});
