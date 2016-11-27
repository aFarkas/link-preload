import linkPreload from './core';

linkPreload.add('script', function(link, callback, getIframeData){
    const {iframeDocument} = getIframeData();
    const script = iframeDocument.createElement('script');
    const stop = status => {
        callback(status);
        iframeDocument.documentElement.removeChild(script);
    };
    script.src = link.href;
    iframeDocument.documentElement.appendChild(script);
    script.onload = () => {
        stop('load');

    };
    script.onerror = () => {
        stop('error');
    };
});
