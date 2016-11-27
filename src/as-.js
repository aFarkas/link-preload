import linkPreload from './core';

linkPreload.add('', function(link, callback){
    try {
        var request = new XMLHttpRequest();

        request.addEventListener('load', () => {
            callback('load');
        });

        request.addEventListener('error', () => {
            callback('error');
        });

        request.open('GET', link.href, true);

        request.send(null);
    } catch(er){
        callback(er);
    }
});
