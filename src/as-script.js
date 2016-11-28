import linkPreload from './core';

linkPreload.add('script', function(linkData, getIframeData){
    const {iframeDocument} = getIframeData();
    const script = iframeDocument.createElement('script');
    const deferred = linkPreload.deferred();

    const stop = status => {
        deferred.resolve(status);
        iframeDocument.documentElement.removeChild(script);
    };

    script.src = linkData.href;

    iframeDocument.documentElement.appendChild(script);

    script.onreadystatechange = () => {
        if(script.readyState == 'complete'){
            stop('load');
        }
    };

    script.onload = () => {
        stop('load');

    };
    script.onerror = () => {
        stop('error');
    };

    return deferred;
});
