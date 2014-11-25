/*
    Metrics.js
    ==================================================================
    Simple script to log some basic metric stuff to your server, its suppose to
    be lightweight and simple to use.
*/

let Event = require( './src/event' ),
    send = require( './src/send' ),
    browser = require( './src/browser' ),
    utils = require( './src/utils' );

module.exports = window.metrics = new Metrics();
module.exports.Metrics = Metrics;
module.exports.Event = Event;
module.exports._send = send;
module.exports._browser = browser;
module.exports._utils = utils;

function Metrics ( ) { 
    this.identity = {};
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
    this._mixpanel = require( './src/mixpanel' )( options.mixpanel );
};

/*
    Metrics::track - tracks an event
    data

    params
        eventName { String } - eventName in a string defaults to Unknown
        meta { Object } - keys to store in event defaults to an empty object
*/

Metrics.prototype.track = function ( eventName = 'Unknown', meta = {} ) {
    let event = new Event( eventName, meta, this.identity );
    send( this.url + 'Events', event.toObject() );
    if ( this._mixpanel ) {
        this._mixpanel.track( eventName, meta );
    }
};

/*
    Metrics::identify - identifys a user

    params
        identity { Object } - object with a id and a email 
*/

Metrics.prototype.identify = function ( identity = {} ) {
    this.identity = identity
    if ( this._mixpanel ) {
        this._mixpanel.identify( identity.id );
        this._mixpanel.name_tag( identity.email );
    }
};

/*
    Metrics::register - registers a user

    params
        identifier { String } - user object to register with system
*/

Metrics.prototype.register = function ( identity = {} ) {
    // this is one we should just push to mixpanel
    if ( this._mixpanel ) {
        this._mixpanel.register( identity );
    }
};
