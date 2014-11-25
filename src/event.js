
let browser = require( './browser' ),
    mixin = require( './utils' ).mixin;

module.exports = Event;

function Event ( eventName, options = {}, id = {} ) {
    this.attributes = mixin( {
        eventName: eventName
    }, options, browser.getInfo(), id );
}

Event.prototype = {
    toObject: function( ) {
        return this.attributes;
    }
};