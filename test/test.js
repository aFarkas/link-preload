describe('link[preload] initial loads/errors', function() {
    var expect = chai.expect;

    ['style', 'font', '', 'script'].forEach(function(name){
        ['before', 'after'].forEach(function(suffix){
            var id = name + '-' + suffix;
            it('should load ' + id + ' initially and successfully', function(done){
                var timer = setInterval(function(){
                    if(window.testData[id]){
                        clearInterval(timer);

                        expect(window.testData[id].success.length).to.equals(1);
                        expect(window.testData[id].error.length).to.equals(0);
                        done();
                    }
                }, 22);
            });
        });

        it('should load ' + name + ' initially and with error', function(done){
            var testName = name + '-error';

            var timer = setInterval(function(){
                if(window.testData[testName]){
                    clearInterval(timer);

                    expect(window.testData[testName].success.length).to.equals(0);
                    expect(window.testData[testName].error.length).to.equals(1);
                    done();
                }
            }, 22);
        });
    });
});

describe('link[preload] should handle dynamically added links', function() {
    var expect = chai.expect;

    ['preload', 'preload_'].forEach(function(attr){
        ['style.css', 'font.woff', 'fetch.json', 'script.js'].forEach(function(file){

            it('should load dynamically added ' + file, function(done){
                var name = file.split('.')[0];
                var as = (name == 'fetch') ? '' : name;
                var link = document.createElement('link');
                var successSpy = sinon.spy();
                var errorSpy = sinon.spy();

                link.as = as;
                link.rel = attr;
                link.href = 'test-data/' + file;

                link.onload = successSpy;
                link.addEventListener('load', successSpy);

                link.onerror = successSpy;
                link.addEventListener('error', errorSpy);

                document.body.appendChild(link);

                var timer = setInterval(function(){
                    if(successSpy.called || errorSpy.called){
                        clearInterval(timer);

                        expect(successSpy.calledTwice).to.be.true;
                        expect(errorSpy.called).to.be.false;
                        done();

                    }
                }, 22);


                if(!window.MutationObserver || attr != 'preload'){
                    linkPreloadPolyfill.default.run(attr);
                }
            });

            it('should load deep dynamically added ' + file, function(done){
                var name = file.split('.')[0];
                var as = (name == 'fetch') ? '' : name;
                var div = document.createElement('div');
                var link = document.createElement('link');
                var successSpy = sinon.spy();
                var errorSpy = sinon.spy();

                link.as = as;
                link.setAttribute('rel', attr);

                link.href = 'test-data/' + file;

                link.onload = successSpy;
                link.addEventListener('load', successSpy);

                link.onerror = successSpy;
                link.addEventListener('error', errorSpy);

                div.appendChild(link);

                document.body.appendChild(div);

                var timer = setInterval(function(){
                    if(successSpy.called || errorSpy.called){
                        clearInterval(timer);

                        expect(successSpy.calledTwice).to.be.true;
                        expect(errorSpy.called).to.be.false;
                        done();

                    }
                }, 22);

                if(!window.MutationObserver || attr != 'preload'){
                    linkPreloadPolyfill.default.run(attr);
                }
            });
        });
    });
});

describe('link[preload] should handle media attribute', function() {
    var expect = chai.expect;

    ['preload', 'preload_'].forEach(function(attr){
        ['style.css', 'font.woff', 'fetch.json', 'script.js'].forEach(function(file){

            it('should load dynamically added ' + file + ' with media', function(done){
                var name = file.split('.')[0];
                var as = (name == 'fetch') ? '' : name;
                var link = document.createElement('link');
                var successSpy = sinon.spy();
                var errorSpy = sinon.spy();

                link.as = as;
                link.rel = attr;
                link.media = '(min-width: 1px)';
                link.href = 'test-data/' + file;

                link.onload = successSpy;
                link.addEventListener('load', successSpy);

                link.onerror = successSpy;
                link.addEventListener('error', errorSpy);

                document.body.appendChild(link);

                var timer = setInterval(function(){
                    if(successSpy.called || errorSpy.called){
                        clearInterval(timer);

                        expect(successSpy.calledTwice).to.be.true;
                        expect(errorSpy.called).to.be.false;
                        done();

                    }
                }, 22);


                if(!window.MutationObserver || attr != 'preload'){
                    linkPreloadPolyfill.default.run(attr);
                }
            });

            it('should not load dynamically added ' + file + ' with non matching media', function(done){
                var name = file.split('.')[0];
                var as = (name == 'fetch') ? '' : name;
                var div = document.createElement('div');
                var link = document.createElement('link');
                var successSpy = sinon.spy();
                var errorSpy = sinon.spy();

                link.as = as;
                link.media = '(max-width: 1px)';
                link.setAttribute('rel', attr);

                link.href = 'test-data/' + file + '?' + Date.now();

                link.onload = successSpy;
                link.addEventListener('load', successSpy);

                link.onerror = successSpy;
                link.addEventListener('error', errorSpy);

                div.appendChild(link);

                document.body.appendChild(div);

                setTimeout(function(){
                    expect(successSpy.called).to.be.false;
                    expect(errorSpy.called).to.be.false;
                    done();
                }, 150);

                if(!window.MutationObserver || attr != 'preload'){
                    linkPreloadPolyfill.default.run(attr);
                }
            });
        });
    });
});

describe('link[preload] adds as/type IDL attributes', function() {
    var expect = chai.expect;

    ['as', 'type'].forEach(function(prop){
        it('should add ' + prop + ' IDL attributes getter', function(done){
            var link = document.createElement('link');
            link.setAttribute(prop, 'script');

            expect(link[prop]).to.equal('script');
            done();
        });

        it('should add ' + prop + ' IDL attributes setter', function(done){
            var link = document.createElement('link');
            link[prop] = 'script';

            expect(link.getAttribute(prop)).to.equal('script');
            done();
        });
    });
});
