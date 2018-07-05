// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};
dwv.commonBufferArray = new Array();
/**
 * Create a simple array buffer from an ImageData buffer.
 * @param {Object} imageData The ImageData taken from a context.
 * @return {Array} The image buffer.
 */
dwv.image.imageDataToBuffer = function (imageData,flag) {
    // remove alpha
    // TODO support passing the full image data
    var buffer = dwv.commonBufferArray;
    if(!flag){
        buffer = new Array();
    }
    console.time("mm")
    buffer.length = ((imageData.data.length*3)/4);
    // new Array((imageData.data.length*3)/4);
    var data = imageData.data;
    var j = 0;
    for( var i = 0,l = data.length; i < l;) {
        buffer[j] = data[i];
        buffer[j+1] = data[i+1];
        buffer[j+2] = data[i+2];
        j+=3;
        i+=4;
    }
    console.timeEnd("mm")
    data = null;
    imageData = null;
    return buffer;
};

/**
 * Get data from an input context imageData.
 * @param {Number} width The width of the coresponding image.
 * @param {Number} height The height of the coresponding image.
 * @param {Number} sliceIndex The slice index of the imageData.
 * @param {Object} imageBuffer The image buffer.
 * @param {Number} numberOfFrames The final number of frames.
 * @return {Object} The corresponding view.
 */
dwv.image.getDefaultView = function (
    width, height, sliceIndex,
    imageBuffer, numberOfFrames, info,images,isrotate,size,get3DFn) {

    // image size
    var imageSize = new dwv.image.Size(width, height,size);
    // default spacing
    // TODO: misleading...
    var imageSpacing = new dwv.image.Spacing(1,1);
    // default origin
    var origin = new dwv.math.Point3D(0,0,sliceIndex);
    // create image
    var geometry = new dwv.image.Geometry(origin, imageSize, imageSpacing );
    var image = new dwv.image.Image( geometry, imageBuffer, numberOfFrames,images,isrotate,get3DFn);
    image.setPhotometricInterpretation("RGB");
    // meta information
    var meta = {};
    meta.BitsStored = 8;
    image.setMeta(meta);
    // overlay
    
    var imageData = images||imageBuffer;
    if(imageData.length > 1){
        var overlays = [];
        for(var i=0;i<imageData.length;i++){
            overlays.push(dwv.gui.info.createOverlaysForDom(info));
        }
        // image.setOverlays(overlays);
        image.setFirstOverlay( overlays,true );
    }else{
        image.setFirstOverlay( dwv.gui.info.createOverlaysForDom(info) );
    }

    // view
    var view = new dwv.image.View(image);
    imageBuffer = null;
    imageSize = null;
    imageSpacing = null;
    origin = null;
    geometry = null;
    image = null;
    // defaut preset
    view.setWindowLevelMinMax();

    // return
    return view;
};

/**
 * Get data from an input image using a canvas.
 * @param {Object} image The DOM Image.
 * @return {Mixed} The corresponding view and info.
 */
dwv.image.getViewFromDOMImage = function (image,callback,flag)
{
    // image size
    var width = image.width;
    var height = image.height;
    // var width = 189;
    // var height = image.height;
    // if(!flag){
    //     // draw the image in the canvas in order to get its data
    //     console.time("dd")
    //     var canvas = document.createElement('canvas');
    //     canvas.width = width;
    //     canvas.height = height;
    //     var ctx = canvas.getContext('2d');
    //     ctx.drawImage(image, 0, 0);
    //     // get the image data
    //     var imageData = ctx.getImageData(0, 0, width, height);
    //     console.timeEnd("dd")
    // }
    // image properties
    var info = [];
    if ( typeof image.origin === "string" ) {
        info.push({ "name": "origin", "value": image.origin });
    } else {
        info.push({ "name": "fileName", "value": image.origin.name });
        info.push({ "name": "fileType", "value": image.origin.type });
        info.push({ "name": "fileLastModifiedDate", "value": image.origin.lastModifiedDate });
    }
    info.push({ "name": "imageWidth", "value": width });
    info.push({ "name": "imageHeight", "value": height });
    
    // create view
    var sliceIndex = image.index ? image.index : 0;

    var buffer = null;
    // if(!flag){
    //     // var imageBuffer = dwv.image.imageDataToBuffer(imageData,flag);
    //     buffer = [];
    //     buffer[0] = [];
    //     // buffer[0][0] = imageBuffer;
    //     buffer[0][0] = imageData.data;
    // }
    var view = dwv.image.getDefaultView(
        width, height, sliceIndex, buffer, 1, info,[image]);
    callback&&callback({"view": view, "info": info},image);
    return {"view": view, "info": info};
};
dwv.image.getViewFromDOMPics = function (pics)
{
    var image = pics[0];
    var width = image.width;
    var height = image.height;
    var info = [];
    info.push({ "name": "imageWidth", "value": width });
    info.push({ "name": "imageHeight", "value": height });
    // create view
    var sliceIndex = 0;

    var view = dwv.image.getDefaultView(
        width, height, sliceIndex, null, 1, info,pics,null,pics.length);
    return {"view": view, "info": info};
};
dwv.image.getViewFromDOMBuffer = function (buffer,totalSlice,position,width,height,isrotate,get3DFn)
{
    var info = [];
    info.push({ "name": "imageWidth", "value": width });
    info.push({ "name": "imageHeight", "value": height });
    // create view
    var totalSlice = totalSlice||0;

    var allArray = new Array(totalSlice);
    allArray[position] = buffer[0];
    var view = dwv.image.getDefaultView(
        width, height, 0, allArray, 1, info,null,isrotate,totalSlice,get3DFn);
    return {"view": view, "info": info};
};

/**
 * Get data from an input image using a canvas.
 * @param {Object} video The DOM Video.
 * @param {Object} callback The function to call once the data is loaded.
 * @param {Object} cbprogress The function to call to report progress.
 * @param {Object} cbonloadend The function to call to report load end.
 * @param {Number} dataindex The data index.
 */
dwv.image.getViewFromDOMVideo = function (video, callback, cbprogress, cbonloadend, dataIndex)
{
    // video size
    var width = video.videoWidth;
    var height = video.videoHeight;

    // default frame rate...
    var frameRate = 30;
    // number of frames
    var numberOfFrames = Math.floor(video.duration * frameRate);

    // video properties
    var info = [];
    if( video.file )
    {
        info.push({ "name": "fileName", "value": video.file.name });
        info.push({ "name": "fileType", "value": video.file.type });
        info.push({ "name": "fileLastModifiedDate", "value": video.file.lastModifiedDate });
    }
    info.push({ "name": "imageWidth", "value": width });
    info.push({ "name": "imageHeight", "value": height });
    info.push({ "name": "numberOfFrames", "value": numberOfFrames });

    // draw the image in the canvas in order to get its data
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');

    // using seeked to loop through all video frames
    video.addEventListener('seeked', onseeked, false);

    // current frame index
    var frameIndex = 0;
    // video view
    var view = null;

    // draw the context and store it as a frame
    function storeFrame() {
        // send progress
        var evprog = {'type': 'load-progress', 'lengthComputable': true,
            'loaded': frameIndex, 'total': numberOfFrames};
        if (typeof dataIndex !== "undefined") {
            evprog.index = dataIndex;
        }
        cbprogress(evprog);
        // draw image
        ctx.drawImage(video, 0, 0);
        // context to image buffer
        var imgBuffer = dwv.image.imageDataToBuffer(
            ctx.getImageData(0, 0, width, height) );
        if (frameIndex === 0) {
            // create view
            view = dwv.image.getDefaultView(
                width, height, 1, [imgBuffer], numberOfFrames, info);
            // call callback
            callback( {"view": view, "info": info } );
        } else {
            view.appendFrameBuffer(imgBuffer);
        }
    }

    // handle seeked event
    function onseeked(/*event*/) {
        // store
        storeFrame();
        // increment index
        ++frameIndex;
        // set the next time
        // (not using currentTime, it seems to get offseted)
        var nextTime = frameIndex / frameRate;
        if (nextTime <= this.duration) {
            this.currentTime = nextTime;
        } else {
            cbonloadend();
            // stop listening
            video.removeEventListener('seeked', onseeked);
        }
    }

    // trigger the first seeked
    video.currentTime = 0;
};
