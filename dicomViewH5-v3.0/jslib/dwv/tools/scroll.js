// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Scroll class.
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Scroll = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Scroll GUI.
     * @type Object
     */
    var gui = null;
    /**
     * Interaction start flag.
     * @type Boolean
     */
    this.started = false;
    // touch timer ID (created by setTimeout)
    var touchTimerID = null;

    /**
     * Handle mouse down event.
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // stop viewer if playing
        // if ( app.getViewController().isPlaying() ) {
        //     app.getViewController().stop();
        // }
        // start flag
        self.started = true;
        // first position
        self.x0 = event._x;
        self.y0 = event._y;
    };

    /**
     * Handle mouse move event.
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!self.started) {
            return;
        }

        // difference to last Y position
        var diffY = event._y - self.y0;
        var yMove = (Math.abs(diffY) > 5);
        // do not trigger for small moves
        if( yMove ) {
            // update GUI
            if( diffY > 0 ) {
                app.getViewController().incrementSliceNb();
            }
            else {
                app.getViewController().decrementSliceNb();
            }
        }

        // difference to last X position
        var diffX = event._x - self.x0;
        var xMove = (Math.abs(diffX) > 5);
        // do not trigger for small moves
        if( xMove ) {
            // update GUI
            if( diffX > 0 ) {
                app.getViewController().incrementFrameNb();
            }
            else {
                app.getViewController().decrementFrameNb();
            }
        }

        // reset origin point
        if (xMove) {
            self.x0 = event._x;
        }
        if (yMove) {
            self.y0 = event._y;
        }
    };

    /**
     * Handle mouse up event.
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };

    /**
     * Handle mouse out event.
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        self.mouseup(event);
    };

    /**
     * Handle touch start event.
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        var touches = event.targetTouches;
        if( touches.length === 1 ){
            // long touch triggers the dblclick
            touchTimerID = setTimeout(self.dblclick, 500);
            // call mouse equivalent
            self.mousedown(event);
        }
        else if( touches.length === 2 ){
            self.twotouchdown(event);
        }

    };
    this.twotouchdown = function(event){
        self.started = true;
        // store first point
        self.x0 = event._x;
        self.y0 = event._y;
        // first line
        var point0 = new dwv.math.Point2D(event._x, event._y);
        var point1 = new dwv.math.Point2D(event._x1, event._y1);
        self.line0 = new dwv.math.Line(point0, point1);
        self.midPoint = self.line0.getMidpoint();
    };

    /**
     * Handle touch move event.
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        var touches = event.targetTouches;
        if( touches.length === 1 ){
            // abort timer if move
            if (touchTimerID !== null) {
                clearTimeout(touchTimerID);
                touchTimerID = null;
            }
            // call mouse equivalent
            self.mousemove(event);
        }
        else if( touches.length === 2 ){
            self.twotouchmove(event);
        }

    };
    this.twotouchmove = function(event){
        if (!self.started)
        {
            return;
        }
        var point0 = new dwv.math.Point2D(event._x, event._y);
        var point1 = new dwv.math.Point2D(event._x1, event._y1);
        var newLine = new dwv.math.Line(point0, point1);
        var lineRatio = newLine.getLength() / self.line0.getLength();

        if( lineRatio === 1 )
        {
            // scroll mode
            // difference  to last position
            var diffY = event._y - self.y0;
            // do not trigger for small moves
            if( Math.abs(diffY) < 15 ) {
                return;
            }
            // update GUI
            if( diffY > 0 ) {
                app.getViewController().incrementSliceNb();
            }
            else {
                app.getViewController().decrementSliceNb();
            }
        }
        else
        {
            // zoom mode
            var zoom = (lineRatio - 1) / 50;
            if( Math.abs(zoom) % 0.1 <= 0.05 ) {
                app.stepZoom(zoom, event._xs, event._ys);
            }
        }
    };

    /**
     * Handle touch end event.
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        // abort timer
        if (touchTimerID !== null) {
            clearTimeout(touchTimerID);
            touchTimerID = null;
        }
        // call mouse equivalent
        self.mouseup(event);
    };

    /**
     * Handle mouse scroll event (fired by Firefox).
     * @param {Object} event The mouse scroll event.
     */
    this.DOMMouseScroll = function (event) {
        // ev.detail on firefox is 3
        if ( event.detail < 0 ) {
            mouseScroll(true);
        } else {
            mouseScroll(false);
        }
    };

    /**
     * Handle mouse wheel event.
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function (event) {
        // ev.wheelDelta on chrome is 120
        if ( event.wheelDelta < 0 ) {
            mouseScroll(true);
        } else {
            mouseScroll(false);
        }
    };

    /**
     * Mouse scroll action.
     * @param {Boolean} up True to increment, false to decrement.
     */
    function mouseScroll (up) {
        if(app.getAllScroll()){
            app.fireEvent({type:"scroll-slice",up:up});
            return;
        }
        var hasSlices = (app.getImage().getGeometry().getSize().getNumberOfSlices() !== 1);
        var hasFrames = (app.getImage().getNumberOfFrames() !== 1);
        if ( up ) {
            if (hasSlices) {
                app.getViewController().incrementSliceNb();
            } else if (hasFrames) {
                app.getViewController().incrementFrameNb();
            }
        } else {
            if (hasSlices) {
                app.getViewController().decrementSliceNb();
            } else if (hasFrames) {
                app.getViewController().decrementFrameNb();
            }
        }
    }

    /**
     * Handle key down event.
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };
    /**
     * Handle double click.
     * @param {Object} event The key down event.
     */
     this.dblclick = function (/*event*/) {
        //  app.getViewController().play();
     };

    /**
     * Setup the tool GUI.
     */
    this.setup = function ()
    {
        gui = new dwv.gui.Scroll(app);
        gui.setup();
    };

    /**
     * Enable the tool.
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        if ( gui ) {
            gui.display(bool);
        }
    };

    /**
     * Initialise the tool.
     */
    this.init = function() {
        if ( app.isMonoSliceData() && app.getImage().getNumberOfFrames() === 1 ) {
            return false;
        }
        return true;
    };

}; // Scroll class

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwv.tool.Scroll.prototype.getHelp = function()
{
    return {
        "title": dwv.i18n("tool.Scroll.name"),
        "brief": dwv.i18n("tool.Scroll.brief"),
        "mouse": {
            "mouse_drag": dwv.i18n("tool.Scroll.mouse_drag"),
            "double_click": dwv.i18n("tool.Scroll.double_click")
        },
        "touch": {
            'touch_drag': dwv.i18n("tool.Scroll.touch_drag"),
            'tap_and_hold': dwv.i18n("tool.Scroll.tap_and_hold")
        }
    };
};
