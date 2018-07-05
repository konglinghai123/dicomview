    var viewCreater = {
        threeD:null,
        picDatas:[],
        textureMsg:undefined,
        loadPicTime:null,
        initdwvcontainernum:["1","1"],
        indexLength:1,
        allPicCount:0,
        hasLoadPicCount:0,
        hasLoadSec:false,
        picquality:"LOSSY",
        init:function(picDatas){
            viewCreater.picDatas = picDatas;
            viewCreater.textureMsg = [];
            picDatas.map(function(item){
                if(item.rebuild&&item.rebuild.length>=1){
                    viewCreater.textureMsg.push(item.rebuild[0]);
                }else{
                    viewCreater.textureMsg.push(null);
                }
                viewCreater.allPicCount += item.urls.length;
            })
            //加载进度的扫描记录
            loadMessage();
            viewCreater.loadPicTime = setInterval(function(){
                loadMessage();
            },10)
            function loadMessage(){
                if(allViewDwvObjs){
                    viewCreater.hasLoadPicCount = 0;
                    //记录已加载的所有试图的所有帧
                    allViewDwvObjs.map(function(item){
                        viewCreater.hasLoadPicCount += item.getLoadCount();
                    })
                }
                //判断当前选中dwv是否可以播放
                if(activeapp && activeapp.getViewController() && activeapp.getImageLayer().isVisible() && activeapp.getImage().getGeometry().getSize().getNumberOfSlices() > 1){
                    $("#playpoint").removeClass("disabled");
                    if(activeapp&&activeapp.getViewController()&&activeapp.getViewController().isPlaying()){
                        $("#playpoint").addClass("btn-link-active");
                        $("#playpoint").find("i").addClass("glyphicon-stop");
                    }else{
                        $("#playpoint").removeClass("btn-link-active");
                        $("#playpoint").find("i").removeClass("glyphicon-stop");
                    }
                }else{
                    $("#playpoint").addClass("disabled");
                    $("#playpoint").removeClass("btn-link-active");
                    $("#playpoint").find("i").removeClass("glyphicon-stop");
                }
                var badge = $("#studyInfoWithoutRS").find("i");
                if(badge.hasClass("load-active")){
                    badge[0].setAttribute("class","badge");
                }else{
                    badge[0].setAttribute("class","badge");
                }
                badge.text(((viewCreater.hasLoadPicCount/viewCreater.allPicCount)*100).toFixed(1)+"%");
                badge = null;
                $("#descModal").find(".imagedesc")[0].innerHTML = "共 "+picDatas.length+" 个序列，"+viewCreater.allPicCount+" 个影像，已加载 "+viewCreater.hasLoadPicCount+" 个影像。"
    
                if(viewCreater.allPicCount <= viewCreater.hasLoadPicCount){
                    viewCreater.stopLoadMsg();
                }
            }
    
            //默认展示一个序列
            var dwvcontainernum = ["1","1"];
            //根据屏幕大小匹配是否可以展示多个序列
            if(window.innerWidth >= 700){
                if(picDatas.length<=3){
                    dwvcontainernum = ["1",""+picDatas.length]
                    viewCreater.indexLength = picDatas.length;
                }else if(picDatas.length>3){//最多一次展示4个序列
                    dwvcontainernum = ["2","2"]
                    viewCreater.indexLength = 4;
                }
            }
            //构建各个序列容器html
            viewCreater.loadDwvContainer(dwvcontainernum,true);
            //底部列表构建html
            viewCreater.startCreatePreview();
        },
        stopLoadMsg:function(){
            clearInterval(this.loadPicTime)
            this.loadPicTime = null;
            $("#studyInfoWithoutRS").find("i")[0].setAttribute("class","glyphicon glyphicon-info-sign");
            $("#studyInfoWithoutRS").find("i").text("");
        },
        loadDwvContainer:function(dwvnum,flag){
            //若无自定义序列容器矩阵，则采用默认1，1
            var dwvcontainernum = dwvnum?dwvnum:this.initdwvcontainernum;
            this.initdwvcontainernum = dwvcontainernum;
            var self = this;
            var seqContainerObj = document.getElementsByClassName("seqContainer")[0];
            if(flag){
                seqContainerObj.innerHTML = "";
            }
            var count = 0;
            var totalCount = parseInt(dwvcontainernum[0])*parseInt(dwvcontainernum[1]);
            if(totalCount < allDwvContainer.length){
                $(".seqContainer").find(".dwvContContainer:gt("+(totalCount-1)+")").remove()
                allDwvContainer = allDwvContainer.slice(0,totalCount);
            }
            for(var i=0;i<parseInt(dwvcontainernum[0]);i++){
                for(var j=0;j<parseInt(dwvcontainernum[1]);j++){
                    var colnum = 12/parseInt(dwvcontainernum[1]);
                    var containerId = "dwvContContainer"+dwvcontainernum[0]+dwvcontainernum[1]+"-"+i+"-"+j;
                    if(count < allDwvContainer.length && !flag){
                        $("."+allDwvContainer[count].getContainerId())[0].setAttribute("id", containerId);
                        $("."+allDwvContainer[count].getContainerId())[0].setAttribute("class", containerId+" dwvContContainer"+" col-md-"+colnum+" col-sm-"+colnum+" col-xs-"+colnum+" col-lg-"+colnum);
                        $("."+containerId)[0].setAttribute("style", "height:"+100/parseInt(dwvcontainernum[0])+"%");
    
                        allDwvContainer[count].setContainerId(containerId);
                        
                    }else{
                        var dwvContainerObj = document.createElement("div");
                        dwvContainerObj.setAttribute("id", containerId);
                        dwvContainerObj.setAttribute("class", containerId+" dwvContContainer"+" col-md-"+colnum+" col-sm-"+colnum+" col-xs-"+colnum+" col-lg-"+colnum);
                        dwvContainerObj.setAttribute("style", "height:"+100/parseInt(dwvcontainernum[0])+"%");
                        dwvContainerObj.onclick = function(){
                            var idarray = $(this).attr("id").split("-");
                            activeDwvContainerIndex = parseInt(idarray[1])*parseInt(self.initdwvcontainernum[1])+parseInt(idarray[2]);
                            if(allDwvContainer[activeDwvContainerIndex].isNoData()){
                                activeapp = null;
                            }
                            $(this).addClass("active-dwv-item");
                            $(this).siblings().removeClass("active-dwv-item")
                            $(this).siblings().find(".dwv-item").removeClass("active-dwv-item")
                            publicFn.myappPlay(0,true);
                        }
    
                        dwvContainerObj.addEventListener("touchstart", function(){
                            var idarray = $(this).attr("id").split("-");
                            activeDwvContainerIndex = parseInt(idarray[1])*parseInt(self.initdwvcontainernum[1])+parseInt(idarray[2]);
                            if(allDwvContainer[activeDwvContainerIndex].isNoData()){
                                activeapp = null;
                            }
                            $(this).addClass("active-dwv-item");
                            $(this).siblings().removeClass("active-dwv-item")
                            $(this).siblings().find(".dwv-item").removeClass("active-dwv-item")
                            publicFn.myappPlay(0,true);
                        }, false);
        
                        seqContainerObj.appendChild(dwvContainerObj);
        
                        //根据预览列表的长度判断该序列是否会有内容加载
                        var noData = null;
                        if(count < this.indexLength){
                            noData = false;
                        }else{
                            noData = true;
                        }
                        //new序列对象
                        var dwvContainer = new dwv.DwvContainer();
                        dwvContainer.init({
                            containerId:containerId,//html容器id
                            index:count,            //序列容器所在位置
                            noData:noData,          //该序列是否会加载内容
                            viewIndex:count         //该序列对应的预览列表的下标
                        });
                        //存放所有序列对象
                        allDwvContainer[count] = dwvContainer;
                    }
                    
                    count++;
                }
            }
            for(var m=0;m<allDwvContainer.length;m++){
                if(!allDwvContainer[m].isNoData()){
                    var dwvObjs = allDwvContainer[m].getDwvObjs();
                    for(var i=0;i<dwvObjs.length;i++){
                        if(dwvObjs[i].getViewController()){
                            dwvObjs[i].setFitToWindow(fitWinFlag);
                        }
                    }
                }
            }
        },
        startCreatePreview:function(){
            if(this.picDatas.length <=0) return;
            var self = this;
            var previewObj = document.getElementsByClassName("view-canvas-ul-list")[0];
            previewObj.innerHTML = ""
            previewObj.style.width=102*this.picDatas.length+"px"
            self.viewAppCreate(previewObj,this.picDatas[0],0);
        },
        loadSceView:function(previewObj){
            for(var i=1;i<this.picDatas.length;i++){
                this.viewAppCreate(previewObj,this.picDatas[i],i);
            }
        },
        viewAppCreate:function(previewObj,item,index,is3D,flag,position,series,threeDDataHeight,get3DFn){
            var self = this;
            var id = "dwvp"+item.id+index;
            var redo = document.createElement("div");
            redo.setAttribute("id", id);
            redo.setAttribute("class", "preview-dwv");
            redo.onclick = function(){
                $(this).addClass("preview-active");
                $(this).siblings().removeClass("preview-active")
                var dwvContainer = allDwvContainer[activeDwvContainerIndex];
                if(dwvContainer.isNoData()){
                    dwvContainer.startCreateDwv();
                }
                dwvContainer.loadDwvView(index,series,is3D,threeDDataHeight,position);
            };
    
            var redolay = document.createElement("div")
            redolay.setAttribute("class", "layerContainer");
    
            var redodesc = document.createElement("span")
            redodesc.setAttribute("class", "layerDesc");
            redodesc.appendChild(document.createTextNode((series||(index+1))+"["+item.urls.length+"]"));
    
            var redocanvas = document.createElement("canvas")
            redocanvas.setAttribute("class", "imageLayer");

            // var stageContainer = document.createElement("div");
            // stageContainer.setAttribute("class", "drawDiv");
            // var stageCanvas = document.createElement("canvas")
            // stageCanvas.setAttribute("class", "stageCanvas");
            // stageContainer.appendChild(stageCanvas);
    
            // var redoimg = document.createElement("img")
            // redoimg.setAttribute("class", "previewImg");
            // redoimg.setAttribute("src", item.urls[0]);

            // redolay.appendChild(redoimg)
            redolay.appendChild(redocanvas)
            // redolay.appendChild(stageContainer)
            redo.appendChild(redolay)
            redo.appendChild(redodesc)
            previewObj.appendChild(redo);
    
            var app = new dwv.App();
            app.init({
                "containerDivId": id,
                "skipLoadUrl": true,
                "isMobile": true,
                "is3D":is3D,
                "threeDDataHeight":threeDDataHeight,
                "fitToWindow": true
            });
            app.setInstanceNum(item.urls.length);
            if(!is3D){
                var urls = item.urls;
                var listener2 = null;
                setTimeout(function(){
                    app.loadURLs(urls.slice(0,1));
                    listener2 = function (event) {
                        if (event.type === "load-end") {
                            if(index < self.indexLength){
                                app.removeEventListener("load-end", listener2);
                                //初始化底部预览再构建主视图
                                allDwvContainer[index].loadDwvView(index,series,is3D,threeDDataHeight,position);
                                if(!self.hasLoadSec){
                                    self.hasLoadSec = true;
                                    self.loadSceView(previewObj);
                                }
                            }
                        }
                    };
                    if(index < self.indexLength){
                        app.addEventListener("load-end", listener2);
                    }
                },0)
                if(urls.length > 1){
                    setTimeout(function(){
                        app.loadURLs(urls.slice(1,urls.length));
                    },10)
                }
            }else{
                var bufferData = item.bufferData;
                var postData = null;
                if(flag){
                    var pics = item.pics;
                    postData = dwv.image.getViewFromDOMPics(pics);
                }else{
                    if(index == 1){
                        var isrotate = true;
                    }else{
                        var isrotate = false;
                    }
                    // postData = dwv.image.getViewFromDOMBuffer(bufferData.buffer,0,bufferData.width,bufferData.height,isrotate,get3DFn);
                    postData = dwv.image.getViewFromDOMBuffer(bufferData.buffer,item.urls.length,position,bufferData.width,bufferData.height,isrotate,get3DFn);
                }
                app.postLoadInit(postData,true);
                var pos = app.getViewController().getCurrentPosition();
                pos.k = position;
                app.getViewController().setCurrentPosition(pos);
            }
            allViewDwvObjs[index] = app;
        },
        threeDAppCreate:function(){
            var textureMsg = viewCreater.textureMsg[activeDwvContainerIndex];
            if(!textureMsg || textureMsg.length <= 0) return;
            this.stopLoadMsg();
            var pics = activeapp.getImage().getPics();
            var threeD = new dwv.image.ThreeDBuilder(pics,textureMsg);
            var self = this;
            threeD.createThreeD(function(){
                threeDProcess("90%")
                setTimeout(function(){
                    self.threeD = threeD;
                    self.setThreeDSlice(pics);
                },1000)
            });
        },
        getIsThreeD:function(){
            var textureMsg = viewCreater.textureMsg[activeDwvContainerIndex];
            if(!textureMsg || textureMsg.length <= 0){
                alert("该序列不支持3D重建！")
                return false;
            }
            if(activeapp.getImage().getPics().length != activeapp.getInstanceNum()){
                alert("等待资源加载完全！")
                return false;
            }
            return true;
        },
        setThreeDSlice:function(pics,index){
            var count = pics[0].height;
            var count2 = pics[0].width;
            var count3 = pics.length;
            var threeDDataHeight = count;

            var cDefaultPostion = Math.floor(count/2);
            var sDefaultPostion = Math.floor(count2/2);
            var aDefaultPostion = Math.floor(count3/2);

            var sagittal = this.threeD.getSagittal(sDefaultPostion);
            var coronal = this.threeD.getCoronal(cDefaultPostion);
            var axial = this.threeD.getAxial(aDefaultPostion);
            threeDProcess("95%")
            var dwvcontainernum = ["1","1"];
            //根据屏幕大小匹配是否可以展示多个序列
            if(window.innerWidth >= 600){
                dwvcontainernum = ["2","2"]
            }
            viewCreater.indexLength = 4;
            viewCreater.loadDwvContainer(dwvcontainernum,true);
            var previewObj = document.getElementsByClassName("view-canvas-ul-list")[0];
            previewObj.style.width=102*4+"px"
            previewObj.innerHTML = "";
            
            var self = this;
            var get3DFn;
            for(var i=0;i<4;i++){
                var data = {};
                data.urls = {};
                var buffer = null;
                var flag = false;
                var position = 0;
                var series = "";
                if(i == 1){
                    series = "失位"
                    data.urls.length = count2;
                    buffer = sagittal;
                    position = sDefaultPostion;
                    get3DFn = self.threeD.getSagittal;
                }else if(i == 0){
                    series = "冠位"
                    data.urls.length = count;
                    buffer = coronal;
                    position = cDefaultPostion;
                    get3DFn = self.threeD.getCoronal;
                }else if(i == 2){
                    series = "轴位"
                    data.urls.length = count3;
                    buffer = axial;
                    position = aDefaultPostion;
                    get3DFn = self.threeD.getAxial;
                }
                if(i == 3){
                    data.urls.length = count3;
                    data.pics = pics;
                    position = aDefaultPostion;
                    flag = true;
                }else{
                    buffer.buffer = [buffer.buffer];
                    data.bufferData = buffer;
                }
                threeDProcess("95%");
                (function(i,data,flag,position,series,get3DFn){
                    setTimeout(function(){
                        //获得图像容器
                        self.viewAppCreate(previewObj,data,i,true,flag,position,series,threeDDataHeight,get3DFn); 
                        //加载对应图像
                        allDwvContainer[i]&&allDwvContainer[i].loadDwvView(i,series,true,threeDDataHeight,position);
                        allDwvContainer[i]&&allDwvContainer[i].getDwvObjs()[0].getViewController().setCurrentSlice(position)
                        threeDProcess("100%");
                    },100)
                })(i,data,flag,position,series,get3DFn)
            }

        },
        dicomGetService:function(callback,param){
            $.ajax({
                url: "/hgdicom-api/api/image/get",
                type: 'post',
                datatype: 'json',
                async: true,
                contentType: 'application/json;charset=UTF-8',
                data:JSON.stringify({screenageId:viewCreater.optUrlParams("screenageId")}),
                success: function(data){
                    callback && callback(data.data);
                },
                error: function(e){
                    console.error(e)
                }
            });
        },
        optUrlParams:function(name){
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");  
                var r = window.location.search.substr(0).split("?")[1].match(reg);  
                if (r != null) return unescape(r[2]);  
                return null;  
        }
    }


