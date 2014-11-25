var gulp = require( 'gulp' ),
    browserify = require( 'gulp-browserify' ),
    rename = require( 'gulp-rename' ),
    debug = require( 'gulp-debug' ),
    uglify = require( 'gulp-uglify' );

gulp.task( 'build', function ( ) {
    gulp.src( './index.js' )
        // .pipe( debug( { verbose: true } ) )
        .pipe( browserify( {
            transform: [ 'es6ify' ],
            debug: true
        } ) )
        .pipe( rename( 'metrics.js' ) )
        .pipe( gulp.dest( './dist' ) );
} );

gulp.task( 'compress', function ( ) {
    
    gulp.src( './index.js' )
        // .pipe( debug( { verbose: true } ) )
        .pipe( browserify( {
            transform: [ 'es6ify' ],
            debug: false
        } ) )
        .pipe( uglify() )
        .pipe( rename( 'metrics.min.js') )
        .pipe( gulp.dest( './dist' ) );
} );

gulp.task( 'startup-script', function() {

    gulp.src( './src/startup.js')
        .pipe( uglify() )
        .pipe( rename( 'startup.min.js' ) )
        .pipe( gulp.dest( './dist' ) );

} );

gulp.task( 'default', ['build', 'compress', 'startup-script'] );