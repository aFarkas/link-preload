import linkPreload from './core';

linkPreload.add('', (linkData)=>{
    const deferred = linkPreload.deferred();

    try {
        let request = new XMLHttpRequest();

        request.addEventListener('load', () => {
            const status = request.status;
            const isSuccess = status >= 200 && status < 300 || status == 304;

            deferred.resolve(isSuccess ? 'load' : 'error');
            request = null;
        });

        request.addEventListener('error', () => {
            deferred.resolve('error');
            request = null;
        });

        request.open('GET', linkData.href, true);

        request.send(null);
    } catch(er){
        deferred.resolve(er);
    }

    return deferred;
});
