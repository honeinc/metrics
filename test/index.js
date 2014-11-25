
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

test( 'tesing utils::makeArray', function( t ) {
    t.equals( typeof metrics._utils.makeArray, 'function', 'Utils::makeArray is an function' );
    t.equals( Array.isArray( metrics._utils.makeArray( 'foo' ) ), true, 'Utils::makeArray returns an array' );
    t.end();
} );

test( 'tesing utils::mixin', function( t ) {
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
