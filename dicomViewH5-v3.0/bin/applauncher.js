/**
 * Application launcher.
 */

// start app function
function startApp() {
    viewCreater.dicomGetService(viewCreater.init)
}

// Image decoders (for web workers)
dwv.image.decoderScripts = {
    "jpeg2000": "./jslib/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "./jslib/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "./jslib/pdfjs/decode-jpegbaseline.js"
};

// check browser support
dwv.browser.check();
// initialise i18n
dwv.i18nInitialise();

// status flags
var domContentLoaded = false;
var i18nLoaded = false;
// launch when both DOM and i18n are ready
function launchApp() {
    // if ( domContentLoaded && i18nLoaded ) {
        startApp();
    // }
}
// DOM ready?
document.addEventListener("DOMContentLoaded", function (/*event*/) {
    domContentLoaded = true;
    launchApp();
});

dwv.i18nOnLoaded( function () {
    // call next once the overlays are loaded
    var onLoaded = function (data) {
        dwv.gui.info.overlayMaps = data;
        i18nLoaded = true;
        // launchApp();
    };
    // load overlay map info
    $.getJSON( dwv.i18nGetLocalePath("overlays.json"), onLoaded )
    .fail( function () {
        console.log("Using fallback overlays.");
        $.getJSON( dwv.i18nGetFallbackLocalePath("overlays.json"), onLoaded );
    });
});