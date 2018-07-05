    var publicFn = {
        transformR:0,
        viewPageMarginLeft:0,
        speeds:{
            "default":50,
            "fast":17,
            "normal":33,
            "slow":67,
            "tardiness":200,
            "slide":1000
        },
        //刷新速度调节
        speedBuild:function(type,obj){
            var speedObj = null;
            if(type && type=="default"){
                var defaultObjs = $(".toolcontainer").find(".viewerplayspeed").find("a").find(".default");
                speedObj = defaultObjs;
            }else{
                speedObj = obj.find("i");
            }
    
            speedObj.parent().parent().siblings(".viewerplayspeed").find("i").removeClass("glyphicon glyphicon-ok")
            speedObj.addClass("glyphicon glyphicon-ok")
    
            if(previewDwvObj && previewDwvObj.getViewController()){
                previewDwvObj.getViewController().setPlaySpeed(this.speeds[type]);
            }
            for(var m=0;m<allDwvContainer.length;m++){
                var dwvObjs = allDwvContainer[m].getDwvObjs();
                for(var i=0;i<dwvObjs.length;i++){
                    dwvObjs[i].getViewController().setPlaySpeed(this.speeds[type])
                }  
            }
        },
        //试图列表切换
        changeViewPage:function(type){
            if(this.viewPageMarginLeft == 0 && type > 0){
                return;
            }
            if($(".view-canvas-ul-list").width()+this.viewPageMarginLeft <= $(".view-canvas-ul-container").width() && type<0){
                return;
            }
            this.viewPageMarginLeft += type*102;
            $(".view-canvas-ul-list").css("margin-left",this.viewPageMarginLeft+"px")
        },
        //反片功能
        setInvplain:function(type){
            var dwvObjs = allDwvContainer[activeDwvContainerIndex].getDwvObjs();
            if(previewDwvObj && previewDwvObj.getViewController()){
                previewDwvObj.generateAndDrawImage(type);
            }
            for(var i=0;i<dwvObjs.length;i++){
                dwvObjs[i].generateAndDrawImage(type);
            }
        },
        //旋转
        transformChange:function(clear){
            var dwvObjs = allDwvContainer[activeDwvContainerIndex].getDwvObjs();
            this.transformR += 90;
            if(this.transformR == 360 || clear) this.transformR = 0;
            if(previewDwvObj && previewDwvObj.getImageLayer()){
                setCss3(previewDwvObj.getImageLayer().getCanvas(),{transform:"rotate("+this.transformR+"deg)","transform-origin":"50% 50%"})
            }
            for(var i=0;i<dwvObjs.length;i++){
                setCss3(dwvObjs[i].getImageLayer().getCanvas(),{transform:"rotate("+this.transformR+"deg)","transform-origin":"50% 50%"})
            }   
            function setCss3(obj,objAttr){
                //循环属性对象
                for(var i in objAttr){
                    var newi=i;
                    //判断是否存在transform-origin这样格式的属性
                    if(newi.indexOf("-")>0){
                        var num=newi.indexOf("-");
                        newi=newi.replace(newi.substr(num,2),newi.substr(num+1,1).toUpperCase());
                    }
                    //考虑到css3的兼容性问题,所以这些属性都必须加前缀才行
                    obj.style[newi]=objAttr[i];
                    newi=newi.replace(newi.charAt(0),newi.charAt(0).toUpperCase());
                    obj.style[newi]=objAttr[i];
                    obj.style["webkit"+newi]=objAttr[i];
                    obj.style["moz"+newi]=objAttr[i];
                    obj.style["o"+newi]=objAttr[i];
                    obj.style["ms"+newi]=objAttr[i];
                }
            }
        },
        //上下页
        playchange:function(type){
            if(viewStatus == 1 && previewDwvObj && previewDwvObj.getViewController()){
                type>0?previewDwvObj.getViewController().incrementSliceNb():previewDwvObj.getViewController().decrementSliceNb();
            }else{
                if(!allDwvContainer[activeDwvContainerIndex].isNoData()){
                    var dwvObjs = allDwvContainer[activeDwvContainerIndex].getDwvObjs();
                    if(dwvObjs.length>1){
                        allDwvContainer[activeDwvContainerIndex].pageChange(type<0?true:false);
                    }else{
                        type>0?dwvObjs[0].getViewController().incrementSliceNb():dwvObjs[0].getViewController().decrementSliceNb()
                    }
                }
            }
        },
        //播放
        myappPlay:function(type,activeflag){
            if(!activeapp&&!allDwvContainer[activeDwvContainerIndex].isNoData()&&allDwvContainer[activeDwvContainerIndex].getDwvObjs().length>0){
                activeapp = allDwvContainer[activeDwvContainerIndex].getDwvObjs()[0];
            }
            var app = activeapp;
            if(viewStatus == 1) app = previewDwvObj;
            var typem = $(".toolcontainer").find(".viewerplayspeed").find("a").find(".glyphicon-ok").attr("class").split(" ")[0];
            if(previewDwvObj && previewDwvObj.getViewController()){
                previewDwvObj.getViewController().setPlaySpeed(this.speeds[typem]);
            }
            for(var m=0;m<allDwvContainer.length;m++){
                var dwvObjs = allDwvContainer[m].getDwvObjs();
                for(var i=0;i<dwvObjs.length;i++){
                    if(dwvObjs[i].getViewController()){
                        dwvObjs[i].getViewController().setPlaySpeed(this.speeds[typem])
                    }
                }  
            }
            if(type==1){
                if(!app || !app.getViewController()) return;
                if(app.getViewController().isPlaying()){
                    app.getViewController().stop()
                    this.fpsShowOrHidden(app,false);
                    $("#playpoint").removeClass("btn-link-active");
                    $("#playpoint").find("i").removeClass("glyphicon-stop");
                }else{
                    app.getViewController().play()
                    this.fpsShowOrHidden(app,true);
                    $("#playpoint").addClass("btn-link-active");
                    $("#playpoint").find("i").addClass("glyphicon-stop");
                }
            }else{
                if(activeflag){
                    if(app && app.getViewController() && app.getImageLayer().isVisible() && app.getImage().getGeometry().getSize().getNumberOfSlices() > 1){
                        $("#playpoint").removeClass("disabled");
                        if(app&&app.getViewController()&&app.getViewController().isPlaying()){
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
                }else{
                    for(var m=0;m<allDwvContainer.length;m++){
                        var dwvObjs = allDwvContainer[m].getDwvObjs();
                        for(var i=0;i<dwvObjs.length;i++){
                            if(dwvObjs[i].getViewController()&&dwvObjs[i].getViewController().isPlaying()){
                                dwvObjs[i].getViewController().stop();
                                this.fpsShowOrHidden(dwvObjs[i],false);
                            }
                        }
                    }
                    $("#playpoint").removeClass("btn-link-active");
                    $("#playpoint").find("i").removeClass("glyphicon-stop");
                }
            }
        },
        fpsShowOrHidden:function(activeapp,type){
            $(activeapp.getImageLayer().getCanvas()).parent().find(".infoLayer .info-tr-fps").css("display",(type?"block":"none"));
        },
        //大小缩放
        changeSize:function(type){
            var dwvObjs = allDwvContainer[activeDwvContainerIndex].getDwvObjs();
            if(viewStatus == 1 && previewDwvObj && previewDwvObj.getImageLayer()){
                var canvas = $(previewDwvObj.getImageLayer().getCanvas());
                previewDwvObj.stepZoom(type*0.1, canvas.width()/2, canvas.height()/2);
            }
            if(dwvObjs && dwvObjs.length>0){
                for(var i=0;i<dwvObjs.length;i++){
                    var canvas = $(dwvObjs[i].getImageLayer().getCanvas());
                    dwvObjs[i].stepZoom(type*0.1, canvas.width()/2, canvas.height()/2);
                } 
            }
        },
        selectChange:function(type){
            for(var m=0;m<allDwvContainer.length;m++){
                var dwvObjs = allDwvContainer[m].getDwvObjs();
                for(var i=0;i<dwvObjs.length;i++){
                    dwvObjs[i].getToolboxController().setSelectedTool(type);
                }
            }
        },
        //功能选中
        seleFunction:function(type){
            $(".toolcontainer").find(".btn-link-state").removeClass("btn-link-active");
            $(".toolcontainer").find(".btn-link-state-phone").removeClass("active");
            $(".toolcontainer").find("#"+type).addClass("btn-link-active")
            $(".toolcontainer").find("."+type).addClass("active")
            var fnObj = $("#imageOperations").find(".dropdown-toggle").find("i");
            fnObj.parent().addClass("btn-link-active");
            if(type == "ZoomAndPan"){
                this.selectChange("ZoomAndPan");
                fnObj.attr("class","glyphicon glyphicon-move");
            }else if(type == "WindowLevel"){
                this.selectChange("WindowLevel");
                fnObj.attr("class","glyphicon glyphicon-adjust");
            }else if(type == "Scroll"){
                this.selectChange("Scroll");
                fnObj.attr("class","glyphicon glyphicon-transfer");
            }else{
                $(".toolcontainer").find("#Scroll").addClass("btn-link-active")
                this.selectChange("Scroll");
                fnObj.parent().removeClass("btn-link-active");
            }
        },
        //重置
        appReset:function(){
            //旋转归正
            this.transformChange(true)
            this.myappPlay(0);
            for(var m=0;m<allDwvContainer.length;m++){
                var dwvObjs = allDwvContainer[m].getDwvObjs();
                for(var i=0;i<dwvObjs.length;i++){
                    if(dwvObjs[i] && dwvObjs[i].getViewController()){
                        dwvObjs[i].onDisplayReset();
                    }
                }
            }
            //重置反片
            this.setInvplain(2)
            //切换到滚动播放状态
            this.selectChange("Scroll");
            this.speedBuild("default")
            this.seleFunction();
        },
        createapp:function(id){
            var myapp = new dwv.App();
            myapp.init({
                "containerDivId": id,
                "fitToWindow": $("#imageSettings").find(".dropdown-menu").find(".relativeMode").find("a").find("i").hasClass("glyphicon glyphicon-ok"),
                "gui": ["tool"],
                "tools": ["Scroll", "ZoomAndPan", "WindowLevel","Draw"],
                "shapes": ["Arrow", "Ruler", "Protractor", "Rectangle", "Roi", "Ellipse", "FreeHand"],
                "skipLoadUrl": true,
                "isMobile": true,
            });
            dwv.gui.appendResetHtml(myapp);
            var listener = function (event) {
                if (event.type === "load-start") {
                    myapp.status = "loading";
                    $(myapp.getElement("loadingSpan")).css("display","")
                }
                else {
                    var canvas = $(myapp.getImageLayer().getCanvas());
                    myapp.stepZoom(0.001, canvas.width()/2, canvas.height()/2);
                    $(myapp.getElement("loadingSpan")).css("display","none")
                }
            };
            myapp.addEventListener("load-start", listener);
            myapp.addEventListener("load-end", listener);
            return myapp;
        }
    }
    
