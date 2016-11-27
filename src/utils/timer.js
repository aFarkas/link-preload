export default function(run, onTimeout, intervall = 33, clearTimeout = (window.preloadPolyfillClearTimeout || 9999)){
    let aborted = false;
    const now = Date.now();
    const timer = setInterval(function(){
        run();

        if(Date.now() - now > clearTimeout){
            clearInterval(timer);
            if(!aborted && onTimeout){
                onTimeout();
            }
        }
    }, intervall);

    return ()=> {
        aborted = true;
        clearInterval(timer);
    };
}
