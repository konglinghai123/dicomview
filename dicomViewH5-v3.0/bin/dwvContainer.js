dwv.DwvContainer = function(){
    var self = this;
    var initdwvnum = ["1","1"];
    var dwvObjs = [];
    var currentPage = 1;
    var totalPage = 1;
    var index = 0;
    var noData = null;
    var containerId = null;
    var viewIndex = null;
    this.setViewIndex=function(value){viewIndex = value;}
    this.getViewIndex=function(){return viewIndex;}

    this.setContainerId=function(value){containerId = value;}
    this.getContainerId=function(){return containerId;}
    this.isNoData=function(){return noData;}
    this.setNoData=function(objs){noData = objs;}
    this.getDwvObjs=function(){return dwvObjs;}
    this.setDwvObjs=function(objs){dwvObjs = objs;}
    this.getDwvNum=function(){return initdwvnum;}
    this.setDwvNum=function(num){initdwvnum = num;}

    this.init=function(config){
        if(config.containerId){
            containerId = config.containerId;
            index = config.index;
            noData = config.noData;
            viewIndex = config.viewIndex;
            if(!noData){
                //构建主试图
                self.startCreateDwv();
            }
            //主视图分页初始化
            self.scrollSliceFnInit();
        }else{
            return;
        }
    }
    this.startCreateDwv=function(dwvnum){
        var dwvcontainernum = dwvnum?dwvnum:initdwvnum;
        initdwvnum = dwvcontainernum;
        var dwvHtmlStr = "";
        var dwvContainerObj = document.getElementsByClassName(containerId)[0];
        dwvContainerObj.innerHTML = "";  
        if(dwvObjs){
            for(var i=0;i<dwvObjs.length;i++){
                window.removeEventListener('resize',dwvObjs[i].onResize,false);
                dwvObjs[i] = null;
            }
        }
        dwvObjs = [];
        var count = 0;
        for(var i=0;i<parseInt(dwvcontainernum[0]);i++){
            for(var j=0;j<parseInt(dwvcontainernum[1]);j++){
                var colnum = 12/parseInt(dwvcontainernum[1]);
                var dwvObj = document.createElement("div");
                dwvObj.setAttribute("id", "dwv"+index+"-"+i+"-"+j);
                dwvObj.setAttribute("class", "dwv-item"+" col-md-"+colnum+" col-sm-"+colnum+" col-xs-"+colnum+" col-lg-"+colnum);
                var dwvstyle = "height:"+100/parseInt(dwvcontainernum[0])+"%;border:initial";
                if(initdwvnum.toString() != ["1","1"].toString()){
                    dwvstyle = "height:"+100/parseInt(dwvcontainernum[0])+"%";
                }
                dwvObj.setAttribute("style", dwvstyle);
                dwvObj.onclick = function(){
                    var idarray = $(this).attr("id").split("-");
                    var tempApp = dwvObjs[parseInt(idarray[1])*parseInt(dwvcontainernum[1])+parseInt(idarray[2])];
                    if(!tempApp || !tempApp.getImage()) return;
                    activeapp = tempApp;
                    activeDwvContainerIndex = index;
                    $(this).addClass("active-dwv-item");
                    $(this).siblings().removeClass("active-dwv-item")
                    publicFn.myappPlay(0,true);
                }
                dwvObj.addEventListener("touchstart", function(){
                    var idarray = $(this).attr("id").split("-");
                    var tempApp = dwvObjs[parseInt(idarray[1])*parseInt(dwvcontainernum[1])+parseInt(idarray[2])];
                    if(!tempApp || !tempApp.getImage()) return;
                    activeapp = tempApp;
                    activeDwvContainerIndex = index;
                    $(this).addClass("active-dwv-item");
                    $(this).siblings().removeClass("active-dwv-item")
                    publicFn.myappPlay(0,true);
                }, false);
                dwvObj.ondblclick = function(){
                    var idarray = $(this).attr("id").split("-");
                    var tempApp = dwvObjs[parseInt(idarray[1])*parseInt(dwvcontainernum[1])+parseInt(idarray[2])];
                    if((dwvObjs.length <= 1 && allDwvContainer.length <= 1) || !tempApp || !tempApp.getImage()) return;

                    $("#preview-dwv").css("display","block");
                    viewStatus = 1;
                    var newData = {
                        info:tempApp.getAppData().info,
                        view:tempApp.getAppData().view.clone()
                    };
                    
                    previewDwvObj.setSeries(tempApp.getSeries());
                    previewDwvObj.setInstanceNum(tempApp.getInstanceNum());
                    previewDwvObj.postLoadInit(newData,true);
                    
                    //预览位置
                    var pos = tempApp.getViewController().getCurrentPosition();
                    previewDwvObj.getViewController().setCurrentPosition(pos);

                    //预览播放
                    if(tempApp.getViewController().isPlaying()){
                        previewDwvObj.getViewController().play()
                    }else{
                        if(previewDwvObj.getViewController().isPlaying()){
                            previewDwvObj.getViewController().stop()
                        }
                    }

                    //预览反片
                    if(tempApp.getViewController().getJpgReversalFlag()){
                        previewDwvObj.generateAndDrawImage(1);
                    }else{
                        if(previewDwvObj.getViewController().getJpgReversalFlag()){
                            previewDwvObj.generateAndDrawImage(2);
                        }
                    }
                    
                }
                var toolbar = document.createElement("div")
                toolbar.setAttribute("class", "toolbar");
                var toolList = document.createElement("div")
                toolList.setAttribute("class", "toolList");

                var layerContainer = document.createElement("div")
                layerContainer.setAttribute("class", "layerContainer");

                var loadingSpan = document.createElement("span")
                loadingSpan.setAttribute("class", "loadingSpan");
                loadingSpan.appendChild(document.createTextNode("loading..."));

                var canvas = document.createElement("canvas")
                // canvas.setAttribute("id", "mainlayer");
                canvas.setAttribute("class", "imageLayer");

                // var stageContainer = document.createElement("div");
                // stageContainer.setAttribute("class", "drawDiv");

                // var position = document.createElement("div")
                // position.setAttribute("class", "positionContainer");
                // var positionCanvas = document.createElement("canvas")
                // positionCanvas.setAttribute("class", "positionLayer");
                // position.appendChild(positionCanvas);

                var infoLayer = document.createElement("div")
                infoLayer.setAttribute("class", "infoLayer");
                var countfps = document.createElement("span")
                countfps.setAttribute("id", "countfps");
                countfps.setAttribute("class", "layer-count-fps");
                var infotl = document.createElement("div")
                infotl.setAttribute("class", "infotl");
                var infotc = document.createElement("div")
                infotc.setAttribute("class", "infotc");
                var infotr = document.createElement("div")
                infotr.setAttribute("class", "infotr");
                var infocl = document.createElement("div")
                infocl.setAttribute("class", "infocl");
                var infocr = document.createElement("div")
                infocr.setAttribute("class", "infocr");
                var infobl = document.createElement("div")
                infobl.setAttribute("class", "infobl");
                var infobc = document.createElement("div")
                infobc.setAttribute("class", "infobc");
                var infobr = document.createElement("div")
                infobr.setAttribute("class", "infobr");
                infoLayer.appendChild(countfps);
                infoLayer.appendChild(infotl);
                infoLayer.appendChild(infotc);
                infoLayer.appendChild(infotr);
                infoLayer.appendChild(infocl);
                infoLayer.appendChild(infocr);
                infoLayer.appendChild(infobl);
                infoLayer.appendChild(infobc);
                infoLayer.appendChild(infobr);

                layerContainer.appendChild(loadingSpan);
                layerContainer.appendChild(canvas);
                // layerContainer.appendChild(position);
                // layerContainer.appendChild(stageContainer);
                layerContainer.appendChild(infoLayer);

                dwvObj.appendChild(toolbar);
                dwvObj.appendChild(toolList);
                dwvObj.appendChild(layerContainer);

                dwvContainerObj.appendChild(dwvObj);
                
                dwvObjs.push(publicFn.createapp("dwv"+index+"-"+i+"-"+j));
            }
        }
        if(index == 0){
            activeapp = dwvObjs[0];
        }
    }
    this.scrollSliceFnInit=function(){
        this.currentPage = 1;
        for(var i=0;i<dwvObjs.length;i++){
            var app = dwvObjs[i];
            if(dwvObjs.length!=1){
                app.setAllScroll(true);
            }else{
                app.setAllScroll(false);
            }
            var listener = function (event) {
                if (event.type === "scroll-slice") {
                    self.pageChange(!event.up);
                }
            };
            app.addEventListener("scroll-slice", listener);
        }
    }
    this.loadDwvView=function(inputIndex,series,is3D,threeDDataHeight,position,get3DFn){
        var viewIndextemp = inputIndex
        if(typeof viewIndextemp == "undefined"){
            viewIndextemp = viewIndex;
        }
        if(allViewDwvObjs && allViewDwvObjs.length > 0){
            var sliceTotalNum = allViewDwvObjs[viewIndextemp].getImage().getGeometry().getSize().getNumberOfSlices();
            this.totalPage = Math.floor((sliceTotalNum-1)/dwvObjs.length+1);
            for(var i=0;i<dwvObjs.length;i++){
                noData = false;
                viewIndex = viewIndextemp;
                var app = dwvObjs[i];
                var sliceNum = (this.currentPage -1)*dwvObjs.length+i;
                if((sliceNum+1) <= sliceTotalNum ){
                    var newData = {
                        info:allViewDwvObjs[viewIndextemp].getAppData().info,
                        view:allViewDwvObjs[viewIndextemp].getAppData().view.clone()
                    };
                    var isPlay = false;
                    if(app.getViewController()){
                        isPlay = app.getViewController().isPlaying()
                        if(isPlay){
                            app.getViewController().stop();
                            publicFn.fpsShowOrHidden(app,false);
                        }
                    }
                    app.setSlice3DFn(get3DFn);
                    app.setIs3D(is3D);
                    app.setThreeDDataHeight(threeDDataHeight);
                    app.setSeries(series||(viewIndextemp+1));
                    app.setPicQuality(viewCreater.picquality);
                    app.setInstanceNum(allViewDwvObjs[viewIndextemp].getInstanceNum());
                    app.postLoadInit(newData,true);
                    var pos = app.getViewController().getCurrentPosition();
                    pos.k = sliceNum;
                    if(typeof position != "undefined" && position != null){
                        pos.k = position;
                    }
                    app.getViewController().setCurrentPosition(pos);
                    if(isPlay){
                        app.getViewController().play();
                        publicFn.fpsShowOrHidden(app,true);
                    }
                    //初始话给予模式选择
                    app.getToolboxController().setSelectedTool($("#moveStateToolContainer").find(".btn-link-active").attr("id"));

                    app.fireEvent({type:"load-end"})
                    app.fireEvent({type:"activeapp-load-end"})
                    app.getImageLayer().setStyleDisplay(true);
                    $(app.getElement("infoLayer")).css("display","")
                }else{
                    $(app.getElement("infoLayer")).css("display","none")
                    $(app.getElement("loadingSpan")).css("display","none")
                    if(app.getImageLayer()){
                        app.getImageLayer().setStyleDisplay(false);
                    }
                }
            }
        }

    }
    this.pageChange=function(up){
        if(!up){
            self.currentPage += 1;
            if(self.currentPage > self.totalPage){
                self.currentPage = 1;
            }
        }else{
            self.currentPage -= 1;
            if(self.currentPage <= 0){
                self.currentPage = self.totalPage;
            }
        }
        var sliceTotalNum = dwvObjs[0].getImage().getGeometry().getSize().getNumberOfSlices()
        for(var i=0;i<dwvObjs.length;i++){
            var app = dwvObjs[i];
            var sliceNum = (this.currentPage -1)*dwvObjs.length+i;
            if((sliceNum+1) <= sliceTotalNum ){
                var pos = app.getViewController().getCurrentPosition();
                pos.k = sliceNum;
                app.getViewController().setCurrentPosition(pos);
                
                app.getImageLayer().setStyleDisplay(true);
                $(app.getImageLayer().getCanvas()).siblings(".infoLayer").css("display","")
            }else{
                if(app.getImageLayer()){
                    app.getImageLayer().setStyleDisplay(false);
                    $(app.getImageLayer().getCanvas()).siblings(".infoLayer").css("display","none")
                }
            }
        }
    }

}
