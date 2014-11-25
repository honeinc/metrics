
'use strict';

const UAParser = require( 'ua-parser-js' ); 

module.exports.getInfo = function ( ) {

    let parser = new UAParser();

    parser.setUA( window.navigator.userAgent );

    let browser = parser.getBrowser(),
        os = parser.getOS(),
        device = parser.getDevice();

    return {
        browser: browser.name,
        browserVersion: browser.version,
        os: os.name,
        osVersion: os.version,
        device: device.model,
        referrer: document.referrer
    };
};



