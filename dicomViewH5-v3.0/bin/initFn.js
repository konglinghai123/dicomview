var previewDwvObj = null;
var viewStatus = 0; //0:正常，1：双击后的预览
var activeapp = null;
var activeDwvContainerIndex = 0;
var allViewDwvObjs = [];
var allDwvContainer = [];
var fitWinFlag = true;
function speedClick(){
    publicFn.speedBuild($(this).find("i")[0].className.split(" ")[0],$(this));
}
function settingClick(){
    $(this).parent().siblings("li").find("i").removeClass("glyphicon glyphicon-ok")
    if($(this).find("i").hasClass("glyphicon glyphicon-ok")) return;

    if(allDwvContainer && allDwvContainer.length>0){
        if($(this).parent().hasClass("relativeMode")){
            fitWinFlag = true;
        }else if($(this).parent().hasClass("absoluteMode")){
            fitWinFlag = false;
        }
        for(var m=0;m<allDwvContainer.length;m++){
            var dwvObjs = allDwvContainer[m].getDwvObjs();
            for(var i=0;i<dwvObjs.length;i++){
                dwvObjs[i].setFitToWindow(fitWinFlag);
            }
        }
    }
    $(this).find("i").addClass("glyphicon glyphicon-ok")
}
function layoutClick(){
    var layoutArray = this.text.split("X")
    allDwvContainer[activeDwvContainerIndex].startCreateDwv(layoutArray)
    allDwvContainer[activeDwvContainerIndex].scrollSliceFnInit();
    if(!allDwvContainer[activeDwvContainerIndex].isNoData()){
        allDwvContainer[activeDwvContainerIndex].loadDwvView();
    }
}
function seqLayoutClick(){
    var layoutArray = this.text.split("X")
    viewCreater.loadDwvContainer(layoutArray)
    publicFn.myappPlay(0)
}
function wSetClick(){
    var wSetArray = $(this).find("i")[0].innerHTML.split("/");
    if(viewStatus == 1 && previewDwvObj){
        previewDwvObj.getViewController().setWindowLevel(wSetArray[0],wSetArray[1]);
    }
    var dwvObjs = allDwvContainer[activeDwvContainerIndex].getDwvObjs();
    if(dwvObjs && dwvObjs.length>0){
        for(var i=0;i<dwvObjs.length;i++){
            dwvObjs[i].getViewController().setWindowLevel(wSetArray[0],wSetArray[1]);
        } 
    }
}
function drawLineClick(value){
    if(viewStatus == 1 && previewDwvObj){
        $(previewDwvObj.getElement("toolSelect")).val(value||"Draw").trigger('change')
    }
    var dwvObjs = allDwvContainer[activeDwvContainerIndex].getDwvObjs();
    if(dwvObjs && dwvObjs.length>0){
        for(var i=0;i<dwvObjs.length;i++){
            $(dwvObjs[i].getElement("toolSelect")).val(value||"Draw").trigger('change')
        } 
    }
}
function drawShapeClick(value){
    if(viewStatus == 1 && previewDwvObj){
        $(previewDwvObj.getElement("shapeSelect")).val(value||"FreeHand").trigger('change')
    }
    var dwvObjs = allDwvContainer[activeDwvContainerIndex].getDwvObjs();
    if(dwvObjs && dwvObjs.length>0){
        for(var i=0;i<dwvObjs.length;i++){
            $(dwvObjs[i].getElement("shapeSelect")).val(value||"FreeHand").trigger('change')
        } 
    }
}
function previewDwvClick(){
    $("#preview-dwv").css("display","none");
    viewStatus = 0;
    if(previewDwvObj.getViewController().isPlaying()){
        previewDwvObj.getViewController().stop()
    }
}
function threeDProcess(value){
    if(value == "100%"){
        $("#threeDProgressModal").css("display","none");
    }
    $("#threeDProgressModal").find(".progress-bar").css("width",value);
    $("#threeDProgressModal").find(".progress-bar").text(value);
}
$(document).ready(function(){
    $(".dwvContainer").height(window.innerHeight - 170)
    var speedObjs = $(".toolcontainer").find(".viewerplayspeed").find("a");
    speedObjs.each(function(){
        $(this).bind("click",speedClick)
    })

    //设置按钮初始化
    var settingObjs = $("#imageSettings").find(".dropdown-menu").find("a");
    settingObjs.each(function(){
        $(this).bind("click",settingClick)
    })
    
    var layoutObjs = $("#changeLayout").find(".dropdown-menu").find("a");
    layoutObjs.each(function(){
        $(this).bind("click",layoutClick)
    })

    var seqLayoutObjs = $("#changeViewport").find(".dropdown-menu").find("a");
    seqLayoutObjs.each(function(){
        $(this).bind("click",seqLayoutClick)
    })

    var threeDObjs = $("#threeDMode").find("a");
    threeDObjs.click(function(){
        if(this.classList.value.indexOf("viewer2DMode") > -1){
            publicFn.appReset();
            viewCreater.threeD.clearObject();
            viewCreater.threeD = null;
            $("#changeLayout").css("display","inline-block");
            $("#changeViewport").css("display","inline-block");
            previewDwvObj = null;
            viewStatus = 0;
            activeapp = null;
            activeDwvContainerIndex = 0;
            allViewDwvObjs = [];
            allDwvContainer = [];
            fitWinFlag = true;
            viewCreater.threeD=null;
            viewCreater.picDatas=[],
            viewCreater.textureMsg=[],
            viewCreater.initdwvcontainernum=["1","1"],
            viewCreater.indexLength=1,
            viewCreater.allPicCount=0,
            viewCreater.hasLoadPicCount=0,
            viewCreater.hasLoadSec=false,
            viewCreater.picquality="LOSSY",
            viewCreater.dicomGetService(viewCreater.init);
        }else{
            if(!viewCreater.getIsThreeD()){
                console.log("等待资源加载完全！")
                return;
            };
            $("#threeDProgressModal").css("display","inline-block");
            threeDProcess("0%");
            $("#changeLayout").css("display","none");
            $("#changeViewport").css("display","none");
            setTimeout(function(){
                viewCreater.threeDAppCreate()
            },100);
        }
        $(this).css("display","none");
        $(this).siblings().css("display","inline-block");
    })

    var wSetObjs = $(".windowsetting").find("a");
    wSetObjs.each(function(){
        $(this).bind("click",wSetClick)
    })

    previewDwvObj = publicFn.createapp("preview-dwv");
    $("#preview-dwv")[0].ondblclick = previewDwvClick;

    new QRCode(document.getElementById('huigu_qrcode_con'), location.href);
    setTimeout(function(){
        $("#huigu_qrcode_con").find("img").css("display","inline-block")
    },0)
    
})