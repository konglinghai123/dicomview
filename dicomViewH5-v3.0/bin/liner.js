var liner = function(app,){
    var app = 
    this.init=function(){

    }
}
liner.prototype.create=function(){
    var points = []
    var timer = null;
    var shapeGroup = null;
    var shapeEditor = new dwv.tool.ShapeEditor(activeapp);
    shapeEditor.disable();
    shapeEditor.setShape(null);
    shapeEditor.setImage(null);
    var lastPoint1 = new dwv.math.Point2D(0, 0);
    points.push(lastPoint1);
    lastPoint2 = new dwv.math.Point2D(600, 1500);
    if ( points.length != 1 ) {
        points.pop();
    }
    // add current one to the list
    points.push( lastPoint2 );
    // allow for anchor points
    var factory = new dwv.tool.RulerFactory();
    if( points.length < factory.getNPoints() ) {
        clearTimeout(timer);
        timer = setTimeout( function () {
            points.push( lastPoint2 );
        }, factory.getTimeout() );
    }
    // remove previous draw
    if ( shapeGroup ) {
        shapeGroup.destroy();
    }
    // create shape group
    shapeGroup = factory.create(points, new dwv.html.Style(), activeapp.getImage());
    // do not listen during creation
    var shape = shapeGroup.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    shape.listening(false);
    var drawLayer = activeapp.getCurrentDrawLayer();
    drawLayer.hitGraphEnabled(false);
    // draw shape command
    var command = new dwv.tool.DrawGroupCommand(shapeGroup, "Ruler", drawLayer, true);
    // draw
    command.execute();
}
liner.prototype.move=function(){

}