
'use strict';

const makeArray =
module.exports.makeArray = function ( arr ) {
    return Array.prototype.slice.call( arr, 0 );
};

const mixin =
module.exports.mixin = function( ) {

    let args = makeArray( arguments ),
        target = args.shift(),
        obj = args.shift(); 

    for ( let key in obj ) {
        target[ key ] = obj[ key ]; // very simple mixin
    }

    if ( args.length ) {
        args.unshift( target );
        mixin.apply( null, args );
    }

    return target;

};