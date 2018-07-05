// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.image = dwv.image || {};

dwv.image.ThreeDBuilder = function(imgPics,textureMsg){
    var self = this;
    var firstImg = imgPics[0];
    var imgLength = imgPics.length;
    var width = imgPics[0].width;
    var height = imgPics[0].height;
    var object = {
        _center : [ 0, 0, 0 ],
        _dimensions : [ 10, 10, 10 ],
        _BBox : [1, 1, 1],
        _range : [ 10, 10, 10 ],
        _spacing : [ 1, 1, 1 ],
        _image : [],
        _indexX : 0,
        _indexXold : 0,
        _indexY : 0,
        _indexYold : 0,
        _indexZ : 0,
        _indexZold : 0,
        _slicesX : {},
        _slicesY : {},
        _slicesZ : {},
        slices:[],
        _volumeRendering : false,
        _volumeRenderingOld : false,
        _volumeRenderingDirection : -1,
        _volumeRenderingCache : [],
        _labelmap : null,
        _borders : true,
        _windowLow : Infinity,
        _windowHigh : -Infinity,
        _reslicing : true,
        _resolutionFactor : 1,
        _max : 0,
        _data : null,
        _childrenInfo : [],
        _RASCenter : [0, 0, 0],
        _RASDimensions : [0, 0, 0],
        _RASSpacing : [0, 0, 0],
        _IJKVolume : [],
        _IJKVolumeN : [],
        _filedata : null,
    };
    this.getSagittal = function(index){return {buffer:self.getSagittalSlice(index),width:imgLength,height:height};}
    this.getCoronal = function(index){return {buffer:self.getCoronalSlice(index),width:width,height:imgLength};}
    this.getAxial = function(index){return {buffer:self.getAxialSlice(index),width:width,height:height};}

    this.createThreeD = function(callback){
        if(!imgPics) return;
        object.slices = textureMsg||[];
        var taskList = [];
        var taskTime = null;
        var taskFlag = false;
        var taskCount = 0;
        for(var i=0;i<imgPics.length;i++){
            var image = imgPics[i];
            var width = image.width;
            var height = image.height;
            var self = this;
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var ctx2 = canvas.getContext('2d');
            ctx2.drawImage(imgPics[i], 0, 0);
            var newData = ctx2.getImageData(0, 0, imgPics[i].width, imgPics[i].height);
            var newbData = new Uint8Array(newData.data.buffer);
    
            taskList.push(newbData);
            if(taskTime){
              clearInterval(taskTime);
              taskTime = null;
            }
            taskTime = setInterval(function(){
                if(!taskFlag){
                    taskFlag = true;
                    setTimeout(function(){
                      try{
                        if(!taskList || taskCount >= taskList.length) return;
                        var newbData2 = taskList[taskCount];
                        var bdata = new Uint16Array(newbData2.length/4);
                        var count = 0;
                        for( var l = 0,j = newbData2.length; j > l;) {
                            if(newbData2[j]){
                                bdata[count] = self.colorRGB2Hex(newbData2[j],newbData2[j+1],newbData2[j+2])
                            }
                            count+=1;
                            j-=4;
                        }
                        if(taskCount%10 == 0)
                          threeDProcess(((taskCount/(imgPics.length-1))*0.9*100).toFixed(0)+"%")
                        taskFlag = false;
                        object.slices[taskCount].data = bdata;
                        taskCount ++;
                      }catch(e){
                        console.error(e)
                      }
                    },0)
                    if(taskCount >= taskList.length){
                        clearInterval(taskTime);
                        imgPics = null;
                        taskList = null;
                        self.paramBuild(object)
                        callback && callback();
                    }
                  }
            },10)
        }
    }
    this.getSagittalSlice = function(index){
        if(typeof index == "undefined" || index == null) index = object._childrenInfo[0]._nb/2;
        var _sliceOrigin = object._childrenInfo[0]._sliceOrigin;
        _sliceOrigin[0] = object._childrenInfo[0]._solutionsLine[0][0][0] + object._childrenInfo[0]._sliceDirection[0]*Math.floor(index);
        _sliceOrigin[1] = object._childrenInfo[0]._solutionsLine[0][0][1] + object._childrenInfo[0]._sliceDirection[1]*Math.floor(index);
        _sliceOrigin[2] = object._childrenInfo[0]._solutionsLine[0][0][2] + object._childrenInfo[0]._sliceDirection[2]*Math.floor(index);
        var _slice = this.reslice2(_sliceOrigin, object._childrenInfo[0]._sliceXYSpacing, object._childrenInfo[0]._sliceNormal, object._childrenInfo[0]._color, object._BBox, object._IJKVolume, object, object.hasLabelMap, object._colorTable);
      
        return _slice;
    }
    this.getCoronalSlice = function(index){
        if(typeof index == "undefined" || index == null) index = object._childrenInfo[1]._nb/2;
        var _sliceOrigin = object._childrenInfo[1]._sliceOrigin;
        _sliceOrigin[0] = object._childrenInfo[1]._solutionsLine[0][0][0] + object._childrenInfo[1]._sliceDirection[0]*Math.floor(index);
        _sliceOrigin[1] = object._childrenInfo[1]._solutionsLine[0][0][1] + object._childrenInfo[1]._sliceDirection[1]*Math.floor(index);
        _sliceOrigin[2] = object._childrenInfo[1]._solutionsLine[0][0][2] + object._childrenInfo[1]._sliceDirection[2]*Math.floor(index);
      
        var _slice = this.reslice2(_sliceOrigin, object._childrenInfo[1]._sliceXYSpacing, object._childrenInfo[1]._sliceNormal, object._childrenInfo[1]._color, object._BBox, object._IJKVolume, object, object.hasLabelMap, object._colorTable);
        return _slice;
    }
    this.getAxialSlice = function(index){
        if(typeof index == "undefined" || index == null) index = object._childrenInfo[2]._nb/2;
        var _sliceOrigin = object._childrenInfo[2]._sliceOrigin;
        _sliceOrigin[0] = object._childrenInfo[2]._solutionsLine[0][0][0] + object._childrenInfo[2]._sliceDirection[0]*Math.floor(index);
        _sliceOrigin[1] = object._childrenInfo[2]._solutionsLine[0][0][1] + object._childrenInfo[2]._sliceDirection[1]*Math.floor(index);
        _sliceOrigin[2] = object._childrenInfo[2]._solutionsLine[0][0][2] + object._childrenInfo[2]._sliceDirection[2]*Math.floor(index);
        var _slice = this.reslice2(_sliceOrigin, object._childrenInfo[2]._sliceXYSpacing, object._childrenInfo[2]._sliceNormal, object._childrenInfo[2]._color, object._BBox, object._IJKVolume, object, object.hasLabelMap, object._colorTable);
        return _slice;
    }

    this.clearObject = function(){
      object = null;
      // imgPics = null;
      textureMsg = null;
    }
    this.clearTextureMsg = function(){
      textureMsg = null;
    }

}
dwv.image.ThreeDBuilder.prototype.colorRGB2Hex = function(r,g,b){
    var hex = (r << 16) + (g << 8) + b
    return hex;
}
dwv.image.ThreeDBuilder.prototype.paramBuild = function(object){
	var series = {};
    var imageSeriesPushed = {};
    for (var i = 0; i < object.slices.length; i++) {
      if(!series.hasOwnProperty(object.slices[i]['series_instance_uid'])){
        series[object.slices[i]['series_instance_uid']] = new Array();
        imageSeriesPushed[object.slices[i]['series_instance_uid']] = {};
      }
      if(!imageSeriesPushed[object.slices[i]['series_instance_uid']].hasOwnProperty(object.slices[i]['sop_instance_uid'])){
        imageSeriesPushed[object.slices[i]['series_instance_uid']][object.slices[i]['sop_instance_uid']] = true;
        series[object.slices[i]['series_instance_uid']].push(object.slices[i]);
      }
    }
    var seriesInstanceUID = Object.keys(series)[0];
    var first_image = series[seriesInstanceUID];
    var first_image_stacks = first_image.length;
    var volumeAttributes = {};

    var _ordering = 'image_position_patient';

    if(first_image_stacks == 1){
        _ordering = 'image_position_patient';
        series[seriesInstanceUID][0]['dist'] = 0;
    }
    else if(first_image[0]['image_position_patient'][0] != first_image[1]['image_position_patient'][0] ||
      first_image[0]['image_position_patient'][1] != first_image[1]['image_position_patient'][1] ||
      first_image[0]['image_position_patient'][2] != first_image[1]['image_position_patient'][2]){
        _ordering = 'image_position_patient';
        var _x_cosine = new goog.math.Vec3(first_image[0]['image_orientation_patient'][0],
          first_image[0]['image_orientation_patient'][1], first_image[ 0 ]['image_orientation_patient'][2]);
        var _y_cosine = new goog.math.Vec3(first_image[ 0 ]['image_orientation_patient'][3],
          first_image[ 0 ]['image_orientation_patient'][4], first_image[ 0 ]['image_orientation_patient'][5]);
        var _z_cosine = goog.math.Vec3.cross(_x_cosine, _y_cosine);

        function computeDistance(flag, arrelem)
          {
            arrelem['dist'] = arrelem['image_position_patient'][0]*flag.x +
              arrelem['image_position_patient'][1]*flag.y +
              arrelem['image_position_patient'][2]*flag.z;
            return arrelem;
          }

      first_image.map(computeDistance.bind(null, _z_cosine));
      first_image.sort(function(a,b){return a["dist"]-b["dist"]});
    }
    else if(first_image[0]['instance_number'] != first_image[1]['instance_number']){
      _ordering = 'instance_number';
      first_image.sort(function(a,b){return a["instance_number"]-b["instance_number"]});
    
    }
    else{
      window.console.log("Could not resolve the ordering mode");
    }


    if(isNaN(first_image[0]['pixel_spacing'][0])){
      first_image[0]['pixel_spacing'][0] = 1.;
    }

    if(isNaN(first_image[0]['pixel_spacing'][1])){
      first_image[0]['pixel_spacing'][1] = 1.;
    }

    if( first_image_stacks > 1) {
      switch(_ordering){
        case 'image_position_patient':
          var _first_position = first_image[ 0 ]['image_position_patient'];
          var _second_image_position = first_image[ 1 ]['image_position_patient'];
          var _x = _second_image_position[0] - _first_position[0];
          var _y = _second_image_position[1] - _first_position[1];
          var _z = _second_image_position[2] - _first_position[2];
          first_image[0]['pixel_spacing'][2] = Math.sqrt(_x*_x + _y*_y  + _z*_z);
          break;
        case 'instance_number':
          first_image[0]['pixel_spacing'][2] = 1.0;
          break;
        default:
          window.console.log("Unkown ordering mode - returning: " + _ordering);
          break;
      }
    }
    else {
      first_image[0]['pixel_spacing'][2] = 1.0;
    }
    var first_image_expected_nb_slices = 1;
    switch(_ordering){
      case 'image_position_patient':
        // get distance between 2 points
        var _first_position = first_image[ 0 ]['image_position_patient'];
        var _last_image_position = first_image[ first_image_stacks - 1]['image_position_patient'];
        var _x = _last_image_position[0] - _first_position[0];
        var _y = _last_image_position[1] - _first_position[1];
        var _z = _last_image_position[2] - _first_position[2];
        var _distance_position = Math.sqrt(_x*_x + _y*_y  + _z*_z);
        //normalize by z spacing
        first_image_expected_nb_slices += Math.round(_distance_position/first_image[0]['pixel_spacing'][2]);
        break;
      case 'instance_number':
        first_image_expected_nb_slices += Math.abs(first_image[ first_image_stacks - 1]['instance_number'] - first_image[0]['instance_number']);
        break;
      default:
        window.console.log("Unkown ordering mode - returning: " + _ordering);
        break;
    }

    var first_slice_size = first_image[0]['columns'] * first_image[0]['rows'];
    var first_image_size = first_slice_size * (first_image_expected_nb_slices);

    var first_image_data = null;

    // create data container
    switch (first_image[0].bits_allocated) {
      case 8:
        first_image_data = new Uint8Array(first_image_size);
        break;
      case 16:
        first_image_data = new Uint16Array(first_image_size);
        break;
      case 32:
        first_image_data = new Uint32Array(first_image_size);
      default:
        window.console.log("Unknown number of bits allocated - using default: 32 bits");
        break;
    }

    object._spacing = first_image[0]['pixel_spacing'];

    for (var _i = 0; _i < first_image_stacks; _i++) {
      // get data
      var _data = first_image[_i].data;
      var _distance_position = 0;

      switch(_ordering){         
        case 'image_position_patient':
          var _x = first_image[_i]['image_position_patient'][0] - first_image[0]['image_position_patient'][0];
          var _y = first_image[_i]['image_position_patient'][1] - first_image[0]['image_position_patient'][1];
          var _z = first_image[_i]['image_position_patient'][2] - first_image[0]['image_position_patient'][2];
          _distance_position = Math.round(Math.sqrt(_x*_x + _y*_y  + _z*_z)/first_image[0]['pixel_spacing'][2]);
          break;
        case 'instance_number':
          _distance_position = first_image[_i]['instance_number'] - first_image[0]['instance_number'];
          break;
        default:
          window.console.log("Unkown ordering mode - returning: " + _ordering);
          break;
      }
      try {
        
        first_image_data.set(_data, _distance_position * first_slice_size);
      } catch (error) {
        debugger
      }
    }
    volumeAttributes.data = first_image_data;
    // object._data = first_image_data;


    object._dimensions = [first_image[0]['columns'], first_image[0]['rows'], first_image_expected_nb_slices];
    volumeAttributes.dimensions = object._dimensions;

    var min_max = this.arrayMinMax(first_image_data);
    var min = min_max[0];
    var max = min_max[1];

    volumeAttributes.min = min;
    volumeAttributes.max = max;
    if (object._lowerThreshold == -Infinity) {
      object._lowerThreshold = min;
    }
    if (object._upperThreshold == Infinity) {
      object._upperThreshold = max;
    }

    var _origin = first_image[0]['image_position_patient'];


    var IJKToRAS = goog.vec.Mat4.createFloat32();

    if(object['reslicing'] == 'false' || object['reslicing'] == false){
        goog.vec.Mat4.setRowValues(IJKToRAS,
          0,
          first_image[0]['pixel_spacing'][0],
          0,
          0,
          0);
        goog.vec.Mat4.setRowValues(IJKToRAS,
          1,
          0,
          first_image[0]['pixel_spacing'][1],
          0,
          0);
        goog.vec.Mat4.setRowValues(IJKToRAS,
          2,
          0,
          0,
          first_image[0]['pixel_spacing'][2],
          0);
        goog.vec.Mat4.setRowValues(IJKToRAS,
          3,0,0,0,1);
    }
    else{
      switch(_ordering){ 
        case 'image_position_patient':
          var _x_cosine = new goog.math.Vec3(first_image[0]['image_orientation_patient'][0],
            first_image[ 0 ]['image_orientation_patient'][1], first_image[ 0 ]['image_orientation_patient'][2]);
          var _y_cosine = new goog.math.Vec3(first_image[ 0 ]['image_orientation_patient'][3],
            first_image[ 0 ]['image_orientation_patient'][4], first_image[ 0 ]['image_orientation_patient'][5]);
          var _z_cosine = goog.math.Vec3.cross(_x_cosine, _y_cosine);

          goog.vec.Mat4.setRowValues(IJKToRAS,
            0,
            -first_image[ 0 ]['image_orientation_patient'][0]*first_image[0]['pixel_spacing'][0],
            -first_image[ 0 ]['image_orientation_patient'][3]*first_image[0]['pixel_spacing'][1],
            -_z_cosine.x*first_image[0]['pixel_spacing'][2],
            -_origin[0]);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            1,
            -first_image[ 0 ]['image_orientation_patient'][1]*first_image[0]['pixel_spacing'][0],
            -first_image[ 0 ]['image_orientation_patient'][4]*first_image[0]['pixel_spacing'][1],
            -_z_cosine.y*first_image[0]['pixel_spacing'][2],
            -_origin[1]);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            2,
            first_image[ 0 ]['image_orientation_patient'][2]*first_image[0]['pixel_spacing'][0],
            first_image[ 0 ]['image_orientation_patient'][5]*first_image[0]['pixel_spacing'][1],
            _z_cosine.z*first_image[0]['pixel_spacing'][2],
            _origin[2]);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            3,0,0,0,1);
          break;
        case 'instance_number':
          goog.vec.Mat4.setRowValues(IJKToRAS,
            0,-1,0,0,-_origin[0]);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            1,-0,-1,-0,-_origin[1]);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            2,0,0,1,_origin[2]);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            3,0,0,0,1);
          break;
        default:
          window.console.log("Unkown ordering mode - returning: " + _ordering);
          break;
      }
    }

    volumeAttributes.IJKToRAS = IJKToRAS;
    volumeAttributes.RASToIJK = goog.vec.Mat4.createFloat32();
    goog.vec.Mat4.invert(volumeAttributes.IJKToRAS, volumeAttributes.RASToIJK);

    var tar = goog.vec.Vec4.createFloat32FromValues(0, 0, 0, 1);
    var res = goog.vec.Vec4.createFloat32();
    goog.vec.Mat4.multVec4(IJKToRAS, tar, res);

    var tar2 = goog.vec.Vec4.createFloat32FromValues(1, 1, 1, 1);
    var res2 = goog.vec.Vec4.createFloat32();
    goog.vec.Mat4.multVec4(IJKToRAS, tar2, res2);

    volumeAttributes.RASSpacing = [res2[0] - res[0], res2[1] - res[1], res2[2] - res[2]];
  
    var _rasBB = goog.vec.Mat4.computeRASBBox(IJKToRAS, [object._dimensions[0], object._dimensions[1], object._dimensions[2]]);
    volumeAttributes.RASDimensions = [_rasBB[1] - _rasBB[0] + 1, _rasBB[3] - _rasBB[2] + 1, _rasBB[5] - _rasBB[4] + 1];
  
    volumeAttributes.RASOrigin = [_rasBB[0], _rasBB[2], _rasBB[4]];

    this.paramCreate_(object,volumeAttributes);
    series = null;
    // first_image_data = null;
    return this.reslice(object);
}

dwv.image.ThreeDBuilder.prototype.paramCreate_ = function(object,_info) {
    
    object._children = []
    // setup image specific information
    object._RASOrigin = _info.RASOrigin;
    object._RASSpacing = _info.RASSpacing;
    object._RASDimensions = _info.RASDimensions;
    object._IJKToRAS = _info.IJKToRAS;
    object._RASToIJK = _info.RASToIJK;
    object._max = _info.max;
    object._min = _info.min;
    object._data = _info.data;
    object._dirty = true;
};

dwv.image.ThreeDBuilder.prototype.reslice = function(object) {
    var sliceArray = [];
    var _IJKVolumes = this.createIJKVolume(object._data, object._dimensions, object._max, object._min);
    object._data = null;
    object._IJKVolume = _IJKVolumes[0];
    _IJKVolumes[1] = null;
    // object._IJKVolumeN = _IJKVolumes[1];
    object.hasLabelMap = object._labelmap != null;
    if (object._colortable) {
      object._colorTable = object._colortable._map;
    }
    object.range = [0,0,0];
    object._RASCenter = [object._RASOrigin[0] + (object._RASDimensions[0] - 1)/2,
                      object._RASOrigin[1] + (object._RASDimensions[1] - 1)/2,
                      object._RASOrigin[2] + (object._RASDimensions[2] - 1)/2
                      ];
  
    object._BBox = [Math.min(object._RASOrigin[0],object._RASOrigin[0] + object._RASDimensions[0] - 1),
                        Math.max(object._RASOrigin[0],object._RASOrigin[0] + object._RASDimensions[0] - 1),
                        Math.min(object._RASOrigin[1],object._RASOrigin[1] + object._RASDimensions[1] - 1),
                        Math.max(object._RASOrigin[1],object._RASOrigin[1] + object._RASDimensions[1] - 1),
                        Math.min(object._RASOrigin[2],object._RASOrigin[2] + object._RASDimensions[2] - 1),
                        Math.max(object._RASOrigin[2],object._RASOrigin[2] + object._RASDimensions[2] - 1)
                        ];
    object._childrenInfo = [{}, {}, {}];
  
    // CENTER
    var _sliceOrigin = goog.vec.Vec3.createFloat32FromValues(
        object._RASCenter[0],
        object._RASCenter[1],
        object._RASCenter[2]);
    object._childrenInfo[0]._sliceOrigin = _sliceOrigin;
  
    // NORMAL
    var _sliceNormal = goog.vec.Vec3.createFloat32FromValues(
       1.00,
       0.00,
       0.00);
    goog.vec.Vec3.normalize(_sliceNormal, _sliceNormal);
    object._childrenInfo[0]._sliceNormal = _sliceNormal;
  
    // COLOR
    var _color = [ 1, 0, 0 ];
    object._childrenInfo[0]._color = _color;
  
    // UPDATE SLICE INFO
    this.updateSliceInfo(0, _sliceOrigin, _sliceNormal, object);
  
    // CENTER
    _sliceOrigin = goog.vec.Vec3.createFloat32FromValues(
        object._RASCenter[0],
        object._RASCenter[1],
        object._RASCenter[2]);
    object._childrenInfo[1]._sliceOrigin = _sliceOrigin;
  
    // NORMAL
    _sliceNormal = goog.vec.Vec3.createFloat32FromValues(
       0,
       1,
       0);
      goog.vec.Vec3.normalize(_sliceNormal, _sliceNormal);
    object._childrenInfo[1]._sliceNormal = _sliceNormal;
    // COLOR
    _color = [ 0, 1, 0 ];
    object._childrenInfo[1]._color = _color;
    this.updateSliceInfo(1, _sliceOrigin, _sliceNormal, object);

  
    _sliceOrigin = goog.vec.Vec3.createFloat32FromValues(
        object._RASCenter[0],
        object._RASCenter[1],
        object._RASCenter[2]);
    object._childrenInfo[2]._sliceOrigin = _sliceOrigin;
  
    // NORMAL
    _sliceNormal = goog.vec.Vec3.createFloat32FromValues(
       0,
       0,
       1);
    goog.vec.Vec3.normalize(_sliceNormal, _sliceNormal);
    object._childrenInfo[2]._sliceNormal = _sliceNormal;
  
    // COLOR
    _color = [ 0, 0.392, 0.804 ];
    object._childrenInfo[2]._color = _color;
  
    // UPDATE SLICE INFO
    this.updateSliceInfo(2, _sliceOrigin, _sliceNormal, object);
  
  };
dwv.image.ThreeDBuilder.prototype.updateSliceInfo = function(_index, _sliceOrigin, _sliceNormal, object){
    var _solutionsLine = this.intersectionBBoxLine(object._BBox,_sliceOrigin, _sliceNormal);
    var _solutionsInLine = _solutionsLine[0];
    var _solutionsOutLine = _solutionsLine[1];

    object._childrenInfo[_index]._solutionsLine = _solutionsLine;
    var _first = new goog.math.Vec3(_solutionsInLine[0][0], _solutionsInLine[0][1], _solutionsInLine[0][2]);
    var _last = new goog.math.Vec3(_solutionsInLine[1][0], _solutionsInLine[1][1], _solutionsInLine[1][2]);
    var _dist = goog.math.Vec3.distance(_first, _last);
    object._childrenInfo[_index]._dist = _dist;
    var _XYNormal = goog.vec.Vec3.createFloat32FromValues(0, 0, 1);
    var _XYRASTransform = this.xyrasTransform(_sliceNormal, _XYNormal);
    var _RASToXY = _XYRASTransform[0];
    var _XYToRAS = _XYRASTransform[1];
    var _rasSpacing = goog.vec.Vec4.createFloat32FromValues(object._RASSpacing[0], object._RASSpacing[1], object._RASSpacing[2], 0);
    var _xySpacing = goog.vec.Vec4.createFloat32();

    goog.vec.Mat4.multVec4(_RASToXY, _rasSpacing, _xySpacing);
    var _sliceDirection = goog.vec.Vec4.createFloat32();
    // scale
    goog.vec.Vec4.scale(_sliceNormal,_xySpacing[2],_sliceDirection);
    // by default the minimum in plane spacing is 0.1
    if(Math.abs(_xySpacing[0]) < 0.1){
        _xySpacing[0] =  0.1;
    }

    if(Math.abs(_xySpacing[1]) < 0.1){
        _xySpacing[1] =  0.1;
    }
    // increase resolution if needed
    _xySpacing[0] /= object._resolutionFactor;
    _xySpacing[1] /= object._resolutionFactor;

    object._childrenInfo[_index]._sliceXYSpacing = [Math.abs(_xySpacing[0]), Math.abs(_xySpacing[1])];
    object._childrenInfo[_index]._sliceSpacing = _xySpacing[2];
    object._childrenInfo[_index]._sliceDirection = _sliceDirection;
    var _nb = Math.floor(Math.abs(_dist/_xySpacing[2]));
    object._range[_index] = _nb + 1;
    object._childrenInfo[_index]._nb = _nb + 1;

    if(object._childrenInfo[_index]._solutionsLine [0][0][0] > object._childrenInfo[_index]._solutionsLine [0][1][0]){
    if(_sliceDirection[0] > 0){
        // invert
        var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
        object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
        object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
    }
    else  if(object._childrenInfo[_index]._solutionsLine [0][0][0] < object._childrenInfo[_index]._solutionsLine [0][1][0]){
    if(_sliceDirection[0] < 0){
        // invert
        var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
        object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
        object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
    }
    else if(object._childrenInfo[_index]._solutionsLine [0][0][1] > object._childrenInfo[_index]._solutionsLine [0][1][1]){
    if(_sliceDirection[1] > 0){
        // invert
        var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
        object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
        object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
    }
    else if(object._childrenInfo[_index]._solutionsLine [0][0][1] < object._childrenInfo[_index]._solutionsLine [0][1][1]){
    if(_sliceDirection[1] < 0){
        // invert
        var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
        object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
        object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
    }
    else if(object._childrenInfo[_index]._solutionsLine [0][0][2] > object._childrenInfo[_index]._solutionsLine [0][1][2]){
    if(_sliceDirection[2] > 0){
        // invert
        var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
        object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
        object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
    }
    else if(object._childrenInfo[_index]._solutionsLine [0][0][2] < object._childrenInfo[_index]._solutionsLine [0][1][2]){
    if(_sliceDirection[2] < 0){
        // invert
        var _tmp = object._childrenInfo[_index]._solutionsLine [0][0];
        object._childrenInfo[_index]._solutionsLine [0][0] = object._childrenInfo[_index]._solutionsLine [0][1];
        object._childrenInfo[_index]._solutionsLine [0][1] = _tmp;
    }
    }

    object._childrenInfo[_index]._originD = -(_sliceNormal[0]*_solutionsInLine[0][0] + _sliceNormal[1]*_solutionsInLine[0][1] + _sliceNormal[2]*_solutionsInLine[0][2]);

};
dwv.image.ThreeDBuilder.prototype.intersectionBBoxLine = function(_bbox, _sliceOrigin, _sliceNormal){
    var _solutionsIn = new Array();
    var _solutionsOut = new Array();
    for(var _i = 0; _i < 6; _i++) {
    var _i2 = Math.floor(_i/2);
    var _i3 = (_i2 + 1)%3;
    var _i4 = (_i2 + 2)%3;
    var _j1 = (2 + (2*_i2))%6;
    var _j2 = (4 + (2*_i2))%6;
    var _dir = _i2;
    var _sol0 = _bbox[_i];
    var _invN1 = 1/_sliceNormal[_i2];
    var _t = (_sol0 - _sliceOrigin[_i2])*_invN1;
    if(_t != Infinity && _t != -Infinity) {
        var _sol1 = _sliceOrigin[_i3] + _sliceNormal[_i3]*_t;
        var _sol2 = _sliceOrigin[_i4] + _sliceNormal[_i4]*_t;
        if( (_sol1 >= _bbox[_j1] && _sol1 <= _bbox[_j1+1]) &&
            (_sol2 >= _bbox[_j2] && _sol2 <= _bbox[_j2+1])) {
        var _sol = new Array();
        _sol[_i2] = _bbox[_i];
        _sol[_i3] = _sol1;
        _sol[_i4] = _sol2;
        _solutionsIn.push(_sol);
        }
        else {
        var _sol = new Array();
        _sol[_i2] = _bbox[_i];
        _sol[_i3] = _sol1;
        _sol[_i4] = _sol2;
        _solutionsOut.push(_sol);
        }
    }
    }
    return [_solutionsIn, _solutionsOut];
};

dwv.image.ThreeDBuilder.prototype.xyrasTransform = function(_sliceNormal, _XYNormal){
      var _RASToXY = goog.vec.Mat4.createFloat32Identity();
      if(!goog.vec.Vec3.equals(_sliceNormal,_XYNormal)) {
        var _cp = _sliceNormal[2];
        var _teta = Math.acos(_cp);
        var _r = goog.vec.Vec3.createFloat32();
        goog.vec.Vec3.cross(_sliceNormal, _XYNormal, _r);
        goog.vec.Vec3.normalize(_r, _r);
    
        var a = Math.cos(_teta/2);
        var b = Math.sin(_teta/2)*_r[0];
        var c = Math.sin(_teta/2)*_r[1];
        var d = Math.sin(_teta/2)*_r[2];
        goog.vec.Mat4.setRowValues(_RASToXY,
            0,
            (a*a+b*b-c*c-d*d),
            2*(b*c-a*d),
            2*(b*d+a*c),
            0
            );
        goog.vec.Mat4.setRowValues(_RASToXY,
            1,
            2*(b*c+a*d),
            (a*a+c*c-b*b-d*d),
            2*(c*d-a*b),
            0
            );
        goog.vec.Mat4.setRowValues(_RASToXY,
            2,
            2*(b*d-a*c ),
            2*(c*d+a*b),
            (a*a+d*d-c*c-b*b),
            0
            );
        }
      var _XYToRAS = goog.vec.Mat4.createFloat32();
      goog.vec.Mat4.invert(_RASToXY, _XYToRAS);
      return [_RASToXY, _XYToRAS];
};

dwv.image.ThreeDBuilder.prototype.reslice2 = function(_sliceOrigin, _sliceXYSpacing, _sliceNormal, _color, _bbox, _IJKVolume, object, hasLabelMap, colorTable){
    goog.vec.Vec3.normalize(_sliceNormal, _sliceNormal);
    var _solutions = this.intersectionBBoxPlane(_bbox,_sliceOrigin, _sliceNormal);
    var _solutionsIn = _solutions[0];
    var _XYNormal = goog.vec.Vec3.createFloat32FromValues(0, 0, 1);
    var _XYRASTransform = this.xyrasTransform(_sliceNormal, _XYNormal);
    var _RASToXY = _XYRASTransform[0];
    var _XYToRAS = _XYRASTransform[1];
    var _solutionsXY = new Array();
    for (var i = 0; i < _solutionsIn.length; ++i) {
    var _rasIntersection = goog.vec.Vec4.createFloat32FromValues(_solutionsIn[i][0], _solutionsIn[i][1], _solutionsIn[i][2], 1);
    var _xyIntersection = goog.vec.Vec4.createFloat32();
    goog.vec.Mat4.multVec4(_RASToXY, _rasIntersection, _xyIntersection);
    _solutionsXY.push([_xyIntersection[0], _xyIntersection[1], _xyIntersection[2]]);
    }
    // right
    var _right = goog.vec.Vec3.createFloat32FromValues(1, 0, 0);
    var _rright = goog.vec.Vec3.createFloat32();
    goog.vec.Mat4.multVec3(_XYToRAS, _right, _rright);

    var _up = goog.vec.Vec3.createFloat32FromValues(0, 1, 0);
    var _rup = goog.vec.Vec3.createFloat32();
    goog.vec.Mat4.multVec3(_XYToRAS, _up, _rup);
    // get XY bounding box!
    var _xyBBox = this.xyBBox(_solutionsXY);

    var _xyCenter = goog.vec.Vec4.createFloat32FromValues(_xyBBox[0] + (_xyBBox[1] - _xyBBox[0])/2,_xyBBox[2] + (_xyBBox[3] - _xyBBox[2])/2, _xyBBox[4] + (_xyBBox[5] - _xyBBox[4])/2,0);
    var _RASCenter = goog.vec.Vec4.createFloat32();
    goog.vec.Mat4.multMat(_XYToRAS,_xyCenter, _RASCenter);

    var _wmin =  Math.floor(_xyBBox[0]);
    var _wmax =  Math.ceil(_xyBBox[1]);
    if(_wmin == _wmax){
    _wmax++;
    }
    var _swidth = _wmax - _wmin;
    var _hmin = Math.floor(_xyBBox[2]);
    var _hmax = Math.ceil(_xyBBox[3]);
    if(_hmin == _hmax){
    _hmax++;
    }
    var _sheight = _hmax - _hmin;
    var _resX = _sliceXYSpacing[0];
    var _resY = _sliceXYSpacing[1];
    // not sure why?
    var _epsilon = 0.0000001;
    // How many pixels are we expecting the raw data
    var _cswidth = Math.ceil(_swidth/_resX);
    var _csheight = Math.ceil(_sheight/_resY);
    var _csize =  _cswidth*_csheight;
    var textureSize = 4 * _csize;
    var textureForCurrentSlice = new Uint8Array(textureSize);
    // var pixelTexture = new X.texture();//未轉換
    var pixelTexture = {};
    pixelTexture._rawDataWidth = _cswidth;
    pixelTexture._rawDataHeight = _csheight;
    var _indexIJK = goog.vec.Vec4.createFloat32();
    var _indexXY = goog.vec.Vec4.createFloat32FromValues(0, 0, _xyBBox[4], 1);
    var _XYToIJK = goog.vec.Mat4.createFloat32();
    goog.vec.Mat4.multMat(object._RASToIJK,_XYToRAS, _XYToIJK);
    var _he = _hmax - _epsilon;
    var _we = _wmax - _epsilon;

    var _p = 0;
    var _iWidth = 0;
    var _iHeight = 0;
    var j = _hmin;
    var i = _wmin;
    for (j = _hmin; j <= _he; j+=_resY) {
    _iHeight++;
    _iWidth = 0;
    _indexXY[1] = j;
    i = _wmin;

    for (i = _wmin; i <= _we; i+=_resX) {
        _iWidth++;
        _indexXY[0] = i;
        goog.vec.Mat4.multVec4(_XYToIJK, _indexXY, _indexIJK);
        var textureStartIndex = _p * 4;
        var _k = Math.floor(_indexIJK[2]);
        var _j = Math.floor(_indexIJK[1]);
        var _i = Math.floor(_indexIJK[0]);

        if( (0 <= _i) && (_i < object._dimensions[0] ) &&
        (0 <= _j) && (_j < object._dimensions[1] ) &&
        (0 <= _k) && (_k < object._dimensions[2] )) {

        // map to 0 if necessary
        var pixval = _IJKVolume[_k][_j][_i];
        var pixelValue_r = 0;
        var pixelValue_g = 0;
        var pixelValue_b = 0;
        var pixelValue_a = 0;

        
        pixelValue_r = pixelValue_g = pixelValue_b = 255 * ((pixval - object._min )/ (object._max - object._min));
        pixelValue_a = 255;

        textureForCurrentSlice[textureStartIndex] = pixelValue_r;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_g;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_b;
        textureForCurrentSlice[++textureStartIndex] = pixelValue_a;
        }
        else {
        textureForCurrentSlice[textureStartIndex] = 0;
        textureForCurrentSlice[++textureStartIndex] = 0;
        textureForCurrentSlice[++textureStartIndex] = 0;
        textureForCurrentSlice[++textureStartIndex] = 0;
        }
    _p++;
    }
    }
    // setup slice texture
    pixelTexture._rawData = textureForCurrentSlice;
    
    return textureForCurrentSlice;
};
dwv.image.ThreeDBuilder.prototype.colorRgb = function(data){
    var sColor = (data+"").toLowerCase();
    for(var i=0;i<6-(data+"").toLowerCase().length;i++){
        sColor = "0" + sColor
    }
    sColor = "#"+sColor;
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 如果是16进制颜色
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i=1; i<4; i+=1) {
                sColorNew += sColor.slice(i, i+1).concat(sColor.slice(i, i+1));    
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for (var i=1; i<7; i+=2) {
            sColorChange.push(parseInt("0x"+sColor.slice(i, i+2)));    
        }
        sColorChange.push(255);
        return sColorChange;
    }
    return sColor;
}
dwv.image.ThreeDBuilder.prototype.intersectionBBoxPlane = function(_bbox, _sliceOrigin, _sliceNormal){
    var _solutionsIn = new Array();
    var _solutionsOut = new Array();
    // xmin, xmax, ymin, ymax, zmin, zmax
    for(var _i = 0; _i < 6; _i++) {
    var _i2 = Math.floor(_i/2);
    var _i3 = (_i2 + 1)%3;
    var _i4 = (_i2 + 2)%3;
    var _j3 = (4 + (2*_i2))%6;
    for(var _j = 0; _j < 2; _j++) {
        var _j2 = (2 + _j + (2*_i2))%6;
        var _solution = (-(
            _sliceNormal[_i2]*(_bbox[_i] - _sliceOrigin[_i2])
            +
            _sliceNormal[_i3]*(_bbox[_j2] - _sliceOrigin[_i3])
            )
            /
            _sliceNormal[_i4]
            )
            +
            _sliceOrigin[_i4]
            ;
        if((_solution >= _bbox[_j3] && _solution <= _bbox[_j3+1])
            ||
            (_solution <= _bbox[_j3] && _solution >= _bbox[_j3+1])) {
        var _sol = new Array();
        _sol[_i2] = _bbox[_i];
        _sol[_i3] = _bbox[_j2];
        _sol[_i4] = _solution;
        _solutionsIn.push(_sol);
        }
        else{
        var _sol = new Array();
        _sol[_i2] = _bbox[_i];
        _sol[_i3] = _bbox[_j2];
        _sol[_i4] = _solution;
        _solutionsOut.push(_sol);
        }
    }
    }
    return [_solutionsIn, _solutionsOut];
};
dwv.image.ThreeDBuilder.prototype.xyBBox = function(_solutionsXY){
    var _xyBBox = [Number.MAX_VALUE, -Number.MAX_VALUE,
    Number.MAX_VALUE, -Number.MAX_VALUE,
    Number.MAX_VALUE, -Number.MAX_VALUE];
    var i = 0;
    for (i = 0; i < _solutionsXY.length; ++i) {
    if(_solutionsXY[i][0] < _xyBBox[0]) {
        _xyBBox[0] = _solutionsXY[i][0];
    }
    if(_solutionsXY[i][0] > _xyBBox[1]) {
        _xyBBox[1] = _solutionsXY[i][0];
    }
    if(_solutionsXY[i][1] < _xyBBox[2]) {
        _xyBBox[2] = _solutionsXY[i][1];
    }
    if(_solutionsXY[i][1] > _xyBBox[3]) {
        _xyBBox[3] = _solutionsXY[i][1];
    }
    if(_solutionsXY[i][2] < _xyBBox[4]) {
        _xyBBox[4] = _solutionsXY[i][2];
    }
    if(_solutionsXY[i][2] > _xyBBox[5]) {
        _xyBBox[5] = _solutionsXY[i][2];
    }
    }
    return _xyBBox;
};


dwv.image.ThreeDBuilder.prototype.handleDefaults = function(_bytes, _bytePointer, _VR, _VL) {
    switch (_VR){
      case 16975:
        // UL
      case 20819:
        // SQ
      case 20053:
        // UN
      case 22351:
        // OW

        // bytes to bits
        function byte2bits(a)
          {
            var tmp = "";
            for(var i = 128; i >= 1; i /= 2)
                tmp += a&i?'1':'0';
            return tmp;
          }

        _VL = _bytes[_bytePointer++];
        var _VLT = _bytes[_bytePointer++];

        var _b0 = _VL & 0x00FF;
        var _b1 = (_VL & 0xFF00) >> 8;

        var _b2 = _VLT & 0x00FF;
        var _b3 = (_VLT & 0xFF00) >> 8;

        var _VLb0 = byte2bits(_b0);
        var _VLb1 = byte2bits(_b1);
        var _VLb = _VLb1 + _VLb0;

        var _VLTb0 = byte2bits(_b2);
        var _VLTb1 = byte2bits(_b3);
        var _VLTb = _VLTb1 + _VLTb0;

        var _VL2 =  _VLTb + _VLb ;
        _VL = parseInt(_VL2, 2);

        // flag undefined sequence length
        if(_VL == 4294967295){
          _VL = 0;
        }

        _bytePointer+=_VL/2;
      break;

    default:
      _bytePointer+=_VL/2;
        break;
    }

  return _bytePointer;
}
dwv.image.ThreeDBuilder.prototype.scan = function(type, chunks,_data,_dataPointer) {
      if (!chunks) {
        chunks = 1;
      }
      var _chunkSize = 1;
      var _array_type = Uint8Array;
    
      switch (type) {
      case 'uchar':
        break;
      case 'schar':
        _array_type = Int8Array;
        break;
      case 'ushort':
        _array_type = Uint16Array;
        _chunkSize = 2;
        break;
      case 'sshort':
        _array_type = Int16Array;
        _chunkSize = 2;
        break;
      case 'uint':
        _array_type = Uint32Array;
        _chunkSize = 4;
        break;
      case 'sint':
        _array_type = Int32Array;
        _chunkSize = 4;
        break;
      case 'float':
        _array_type = Float32Array;
        _chunkSize = 4;
        break;
      case 'complex':
        _array_type = Float64Array;
        _chunkSize = 8;
        break;
      case 'double':
        _array_type = Float64Array;
        _chunkSize = 8;
        break;
      }
      // increase the data pointer in-place
      var _bytes = new _array_type(_data.slice(_dataPointer,
          _dataPointer += chunks * _chunkSize));
      return _bytes;
};

dwv.image.ThreeDBuilder.prototype.buildCanvasImage = function(_sliceData){
    var _volume = {
        _max:2188,
        _min:0,
        _maxColor:[1,1,1],
        _minColor:[0,0,0],
        _lowerThreshold:0,
        _upperThreshold:2188,
        _windowHigh:2188,
        _windowLow:0,
    }
    var _sliceWidth = 512;
    var _sliceHeight = 1;
    var _pixelsLength = _sliceData.length;
    var _pixels = new Uint8ClampedArray(_pixelsLength);
    var _lowerThreshold = _volume._lowerThreshold;
    var _upperThreshold = _volume._upperThreshold;
    var _windowLow = _volume._windowLow;
    var _windowHigh = _volume._windowHigh;
    var _index = 0;
    do {
      var _color = [0, 0, 0, 0];
      var _label = [0, 0, 0, 0];
      var _fac1 = _volume._max - _volume._min;
      var _intensity = (_sliceData[_index] / 255) * _fac1 + _volume._min;
    
      var _window = _windowHigh - _windowLow;
      var _level = _window/2 + _windowLow;
      var _origIntensity = 0;
      if(_intensity < _level - _window/2 ){
        _origIntensity = 0;
      }
      else if(_intensity > _level + _window/2 ){
        _origIntensity = 255;
      }
      else{
        _origIntensity  = 255 * (_intensity - (_level - _window / 2))/_window;
      }
      if (_intensity >= _lowerThreshold && _intensity <= _upperThreshold) {
        var maxColor = new goog.math.Vec3(_volume._maxColor[0],
            _volume._maxColor[1], _volume._maxColor[2]);
        var minColor = new goog.math.Vec3(_volume._minColor[0],
            _volume._minColor[1], _volume._minColor[2]);
        _color = maxColor.scale(_origIntensity).add(
            minColor.scale(255 - _origIntensity));
    
        _color = [Math.floor(_color.x), Math.floor(_color.y),
                  Math.floor(_color.z), 255];
      }
      if(true){
        // invert nothing
        _pixels[_index] = _color[0]; // r
        _pixels[_index + 1] = _color[1]; // g
        _pixels[_index + 2] = _color[2]; // b
        _pixels[_index + 3] = _color[3]; // a
    
      }
      else if(false){
        // invert cols
        var row = Math.floor(_index/(_sliceWidth*4));
          var col = _index - row*_sliceWidth*4;
          var invCol = 4*(_sliceWidth-1) - col ;
          var _invertedColsIndex = row*_sliceWidth*4 + invCol;
        _pixels[_invertedColsIndex] = _color[0]; // r
        _pixels[_invertedColsIndex + 1] = _color[1]; // g
        _pixels[_invertedColsIndex + 2] = _color[2]; // b
        _pixels[_invertedColsIndex + 3] = _color[3]; // a
    
      }
      else{
        // invert all
        var _invertedIndex = _pixelsLength - 1 - _index;
        _pixels[_invertedIndex - 3] = _color[0]; // r
        _pixels[_invertedIndex - 2] = _color[1]; // g
        _pixels[_invertedIndex - 1] = _color[2]; // b
        _pixels[_invertedIndex] = _color[3]; // a
    
      }
    
      _index += 4; // increase by 4 units for r,g,b,a
    
    } while (_index < _pixelsLength);
    return _pixels;
}
/**
 * Calculate the data range of the image.
 * WARNING: for speed reasons, only calculated on the first frame...
 * @return {Object} The range {min, max}.
 */
dwv.image.ThreeDBuilder.prototype.arrayMinMax = function(data) {
    var _min = 0;
    var _max = 0;
    // buffer the length
    var _datasize = data.length;
    var i = 0;
    for (i = 0; i < _datasize; i++) {
      if(!isNaN(data[i])) {
        var _value = data[i];
        _min = Math.min(_min, _value);
        _max = Math.max(_max, _value);
      }
    }
    return [_min,_max];
};
dwv.image.ThreeDBuilder.prototype.createIJKVolume = function(_data, _dims, _max, _min){
    // initiate variables
    // allocate images
    var _image = new Array(_dims[2]);
    var _imageN = new Array(_dims[2]);
    var _nb_pix_per_slice = _dims[1] * _dims[0];
    var _pix_value = 0;
    var _i = 0;
    var _j = 0;
    var _k = 0;
    var _data_pointer = 0;
  
    for (_k = 0; _k < _dims[2]; _k++) {
  
      // get current slice
      var _current_k = _data.subarray(_k * (_nb_pix_per_slice), (_k + 1)
          * _nb_pix_per_slice);
      // initiate data pointer
      _data_pointer = 0;
  
      // allocate images
      _imageN[_k] = new Array(_dims[1]);
      _image[_k] = new Array(_dims[1]);
  
      for (_j = 0; _j < _dims[1]; _j++) {
  
        // allocate images
        _imageN[_k][_j] =new _data.constructor(_dims[0]);
        _image[_k][_j] = new _data.constructor(_dims[0]);
        for (_i = 0; _i < _dims[0]; _i++) {
          _pix_value = _current_k[_data_pointer];
          _imageN[_k][_j][_i] = 255 * ((_pix_value - _min) / (_max - _min));
          _image[_k][_j][_i] = _pix_value;
          _data_pointer++;
  
        }
      }
    }
    _data = null;
    return [_image, _imageN];
};