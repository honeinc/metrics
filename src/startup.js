(function( window ){

    'use strict';

    var methods = 'init,track,identify,register'.split(',');
    // setup initial constructor
    window.metrics = new Metrics();

    function Metrics() {
        this._queue = [];
    }

    // load the script into the page async
    function load( cdn, version ) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = cdn + '/metrics-' + version + '.min.js';

        // Insert our script next to the first script element.
        var first = document.getElementsByTagName('script')[0];
        first.parentNode.insertBefore(script, first);
    }

    // thunk to push calls into the queque
    function addToQueue( method ) {
        return function ( ) {
            window.metrics._queue.push({
                method: method,
                arguments: arguments
            });            
        };
    }

    // adding all the calls to the page
    for( var i = 0; i < methods.length; i += 1 ) {
        window.metrics[ methods[i] ]  = addToQueue( methods[i] );
    }

    window.metrics.load = load;

}( window ));