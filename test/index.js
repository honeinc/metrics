
var test = require( 'tape' ),   
    _metrics = require( '../' );


test( 'testing the metrics object is exported to window', function( t ) {
    t.equals( typeof metrics, 'object', 'metrics is an object' );
    t.end();
} );

test( 'testing utils', function( t ) {
    t.equals( typeof metrics._utils, 'object', 'Utils is an object' );
    t.end();
} );

test( 'testing utils::makeArray', function( t ) {
    t.equals( typeof metrics._utils.makeArray, 'function', 'Utils::makeArray is an function' );
    t.equals( Array.isArray( metrics._utils.makeArray( 'foo' ) ), true, 'Utils::makeArray returns an array' );
    t.end();
} );

test( 'testing utils::mixin', function( t ) {
    var target = {},
        multiparams;
    t.equals( typeof metrics._utils.mixin, 'function', 'Utils::mixin is an function' );
    t.equals( typeof metrics._utils.mixin( target, { foo: 'bar' } ) , 'object', 'Utils::mixin returns an object' );
    t.equals( target.foo , 'bar', 'Utils::mixin extends the target object' );
    multiparams = metrics._utils.mixin( {}, { baz : 'qux' }, { bar: 'baz' } );
    t.equals( multiparams.baz , 'qux', 'Utils::mixin extends with the second param obj correctly' );
    t.equals( multiparams.bar , 'baz', 'Utils::mixin extends with the third param obj correctly' );
    t.end();
} );


test( 'testing Event', function( t ) {
    t.equals( typeof metrics.Event, 'function', 'Event is a function' );
    t.end();
} );

test( 'testing Event::constructor', function( t ) {
    var event = new metrics.Event();
    t.equals( typeof event, 'object', 'Event instance is an object' );
    t.equals( typeof event.attributes, 'object', 'Event.attributes is an object' );
    t.end();
} );

test( 'testing Event::toObject', function( t ) {
    var event = new metrics.Event( 'qux', { foo: 'bar' }, { id : 'baz' } ),
        data = event.toObject();
    t.equals( typeof data, 'object', 'event.toObject() returns a object' );
    t.equals( data.foo, 'bar', 'event.toObject returns a object that has the properties passed in' );
    t.equals( data.eventName, 'qux', 'event.toObject returns a object that has the property eventName that is the same as the event name passed in' );
    t.equals( data.id, 'baz', 'event.toObject returns a object that has the properties as last object passed in' );
    t.equals( typeof data.browser, 'string', 'event.toObject returns a object that has the property browser' );
    t.end();
} );

test( 'testing browser', function( t ) {
    t.equals( typeof metrics._browser, 'object', 'browser is an object' );
    t.end();
} );

test( 'testing browser::getInfo', function( t ) {
    t.equals( typeof metrics._browser.getInfo, 'function', 'browser.getInfo is a function' );
    t.equals( typeof metrics._browser.getInfo(), 'object', 'browser.getInfo returns an object' );
    t.equals( typeof metrics._browser.getInfo().browser, 'string', 'browser.getInfo returns an object that has the property browser as a string' );
    t.equals( typeof metrics._browser.getInfo().browserVersion, 'string', 'browser.getInfo returns an object that has the property browserVersion as a string' );
    t.equals( typeof metrics._browser.getInfo().os, 'string', 'browser.getInfo returns an object that has the property os as a string' );
    t.equals( typeof metrics._browser.getInfo().referrer, 'string', 'browser.getInfo returns an object that has the property referrer as a string' );

    t.end();
} );

test( 'testing mixpanel', function( t ) {
    t.equals( typeof metrics.__mixpanel, 'function', 'mixpanel is a function' );
    t.equals( typeof metrics.__mixpanel(), 'object', 'mixpanel returns a object' );
    t.end();
} );

test( 'testing metrics::init', function( t ) {
    t.equals( typeof metrics.init, 'function', 'mixpanel.init is a function' );
    t.end();
} );

test( 'testing metrics::track', function( t ) {
    t.equals( typeof metrics.track, 'function', 'mixpanel.track is a function' );
    t.end();
} );

test( 'testing metrics::identify', function( t ) {
    t.equals( typeof metrics.identify, 'function', 'mixpanel.identify is a function' );
    t.end();
} );

test( 'testing metrics::register', function( t ) {
    t.equals( typeof metrics.register, 'function', 'mixpanel.register is a function' );
    t.end();
} );
