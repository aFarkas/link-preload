import linkPreload from './core';

linkPreload.add('', function(link, callback, _getIframeData, linkElement){
    try {
        var request = new XMLHttpRequest();

        request.addEventListener('load', (e) => {
            const status = request.status;
            const isSuccess = status >= 200 && status < 300 || status == 304;

            callback(isSuccess ? 'load' : 'error');
            request = null;
        });

        request.addEventListener('error', () => {
            callback('error');
            request = null;
        });

        request.open('GET', link.href, true);

        request.send(null);
    } catch(er){
        callback(er);
    }
});
