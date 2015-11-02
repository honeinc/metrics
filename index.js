
'use strict';

/*
    Metrics.js
    ==================================================================
    Simple script to log some basic metric stuff to your server, its suppose to
    be lightweight and simple to use.
*/

let EventModel = require( './src/event' ),
    send = require( './src/send' ),
    browser = require( './src/browser' ),
    mixpanel = require( './src/mixpanel' ),
    utils = require( './src/utils' ),
    queue = window.metrics ? window.metrics._queue : null;


function Metrics ( queue ) { 
    this.identity = {};
    this._queue = queue || [];
    if ( this._queue.length ) {
        for ( let i = 0; i < this._queue.length; i += 1 ) {
            let call = this._queue[ i ];
            if ( typeof this[ call.method ] === 'function' ) {
                this[ call.method ].apply( this, call.arguments );
            }
        }
        this._queue.length = 0; // remove all from queue
    }
}

/*
    Metrics::init - initializes metrics with options about where to push
    data

    params
        options { Object } - an object that hold many configuration for mertics file
            options.mixpanel - a mixpanel public api key
            options.domain - domain to point towards to register internal calls
*/


Metrics.prototype.init = function ( options = {} ) {
    this.options = options;
    this.url = ( this.options.domain || '//gohone.com' ) + '/api/1.0/';
    // this mixpanels object breaks ref when initializing so dont cache it
    require( './src/mixpanel' )( options.mixpanel );
};

/*
    Metrics::track - tracks an event
    data

    params
        eventName { String } - eventName in a string defaults to Unknown
        meta { Object } - keys to store in event defaults to an empty object
        callback { Function } - optional.. a callback that will be called once 
            once the xhr has a readyState of 4
*/

Metrics.prototype.track = function ( eventName = 'Unknown', meta = {}, callback = utils.noop ) {
    function removeNulls(obj){
      var isArray = obj instanceof Array;
      for (var k in obj){
        if (obj[k]===null) {
            if (isArray) {
                obj.splice(k,1) ;
            } else { 
                delete obj[k];
            }
        }
        else if (typeof obj[k]=="object") {
            removeNulls(obj[k]);
        }
      }
    }
    
    removeNulls(meta);
    
    let event = new EventModel( eventName, meta, this.identity );
    send( this.url + 'Events', event.toObject(), callback );
    if ( window.mixpanel ) {
        window.mixpanel.track( eventName, meta );
    }
};

/*
    Metrics::identify - identifys a user

    params
        identity { Object } - object with a id and a email 
*/

Metrics.prototype.identify = function ( identity = {} ) {
    this.identity = identity;
    if ( window.mixpanel ) {
        window.mixpanel.identify( identity.id );
        window.mixpanel.name_tag( identity.email );
    }
};

/*
    Metrics::register - registers a user

    params
        identifier { String } - user object to register with system
*/

Metrics.prototype.register = function ( identity = {} ) {
    // this is one we should just push to mixpanel
    if ( window.mixpanel ) {
        window.mixpanel.register( identity );
    }
};

module.exports = window.metrics = new Metrics( queue );
module.exports.Metrics = Metrics;
module.exports.Event = EventModel;
module.exports._send = send;
module.exports._browser = browser;
module.exports._utils = utils;
module.exports.__mixpanel = mixpanel;
