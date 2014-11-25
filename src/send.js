var xhr = require( 'xhr' );

function noop ( ) { }

module.exports = function( uri, body = {}, callback = noop ) {
    var payload = { 
            eventName: body.eventName 
        };

    delete body.eventName;
    payload.data = body;

    xhr({
        uri: uri,
        body: JSON.stringify( body ),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }, callback );
}