import linkPreload from './core';
import maxIntervalTimer from './utils/timer';

linkPreload.add('style', function(link, getIframeData){
    let stopTimer;

    const deferred = linkPreload.deferred();
    const {iframeDocument} = getIframeData();
    const sheets = iframeDocument.styleSheets;
    const preload = iframeDocument.createElement('link');

    const clear = () => {
        stopTimer();
        preload.onload = null;
        preload.onerror = null;
        iframeDocument.documentElement.removeChild(preload);
    };

    const onload = () => {
        clear();
        deferred.resolve('load');
    };

    const onerror = () => {
        clear();
        deferred.resolve('error');
    };

    const detectCssChange = ()=>{
        const resolvedHref = preload.href;

        let i = sheets.length;

        while( i-- ){
            if( sheets[ i ].href == resolvedHref ){
                onload();
                break;
            }
        }
    };

    preload.href = link.href;
    preload.rel = 'stylesheet';

    iframeDocument.documentElement.appendChild(preload);

    stopTimer = maxIntervalTimer(detectCssChange, () => {
        clear();
        deferred.resolve('timeout');
    });

    preload.onload = detectCssChange;

    preload.onerror = onerror;

    return deferred;
});
