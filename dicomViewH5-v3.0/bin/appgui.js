/**
 * Application GUI.
 */
dwv.tool.colourMaps = {
    "plain": dwv.image.lut.plain,
    "invplain": dwv.image.lut.invPlain,
    "rainbow": dwv.image.lut.rainbow,
    "hot": dwv.image.lut.hot,
    "hotiron": dwv.image.lut.hot_iron,
    "pet": dwv.image.lut.pet,
    "hotmetalblue": dwv.image.lut.hot_metal_blue,
    "pet20step": dwv.image.lut.pet_20step
};
// Default window level presets.
dwv.tool.defaultpresets = {};
// Default window level presets for CT.
dwv.tool.defaultpresets.CT = {
    "chest": {"center": 40, "width": 350},
    "abdomen": {"center": 40, "width": 350},
    "lung": {"center": -600, "width": 1500},
    "bone": {"center": 480, "width": 2500},
    "head": {"center": 90, "width": 350},
    "brain": {"center": 40, "width": 80}
};
// decode query
dwv.utils.decodeQuery = dwv.utils.base.decodeQuery;

// Window
dwv.gui.getWindowSize = dwv.gui.base.getWindowSize;
// Progress
dwv.gui.displayProgress = function (percent) {};
// Help
dwv.gui.appendHelpHtml = dwv.gui.base.appendHelpHtml;
// get element
dwv.gui.getElement = dwv.gui.base.getElement;
// refresh
dwv.gui.refreshElement = dwv.gui.base.refreshElement;
// Slider
dwv.gui.Slider = null;
// Tags table
dwv.gui.DicomTags = null;

// Loaders
dwv.gui.Loadbox = dwv.gui.base.Loadbox;
// File loader
dwv.gui.FileLoad = dwv.gui.base.FileLoad;
dwv.gui.FileLoad.prototype.onchange = function (/*event*/) {
    $("#popupOpen").popup("close");
};

// Toolbox
dwv.gui.Toolbox = function (app)
{
    var base = new dwv.gui.base.Toolbox(app);

    this.setup = function (list)
    {
        base.setup(list);

        // toolbar
        var buttonClass = "ui-btn ui-btn-inline ui-btn-icon-notext ui-mini";

        var open = document.createElement("a");
        open.href = "#popupOpen";
        open.setAttribute("class", buttonClass + " ui-icon-plus");
        open.setAttribute("data-rel", "popup");
        open.setAttribute("data-position-to", "window");

        var undo = document.createElement("a");
        undo.setAttribute("class", buttonClass + " ui-icon-back");
        undo.onclick = app.onUndo;

        var redo = document.createElement("a");
        redo.setAttribute("class", buttonClass + " ui-icon-forward");
        redo.onclick = app.onRedo;

        var toggleInfo = document.createElement("a");
        toggleInfo.setAttribute("class", buttonClass + " ui-icon-info");
        toggleInfo.onclick = app.onToggleInfoLayer;

        var toggleSaveState = document.createElement("a");
        toggleSaveState.setAttribute("class", buttonClass + " download-state ui-icon-action");
        toggleSaveState.onclick = app.onStateSave;
        toggleSaveState.download = "state.json";

        var tags = document.createElement("a");
        tags.href = "#tags_page";
        tags.setAttribute("class", buttonClass + " ui-icon-grid");

        var drawList = document.createElement("a");
        drawList.href = "#drawList_page";
        drawList.setAttribute("class", buttonClass + " ui-icon-edit");

        var node = app.getElement("toolbar");
        node.appendChild(open);
        node.appendChild(undo);
        node.appendChild(redo);
        node.appendChild(toggleInfo);
        node.appendChild(toggleSaveState);
        node.appendChild(tags);
        node.appendChild(drawList);
        dwv.gui.refreshElement(node);
    };
    this.display = function (flag)
    {
        base.display(flag);
    };
    this.initialise = function (list)
    {
        base.initialise(list);
    };
};

// Draw
dwv.gui.Draw = dwv.gui.base.Draw;
//Window/level
dwv.gui.WindowLevel = function (app)
{
    this.setup = function ()
    {
        var button = document.createElement("button");
        button.className = "wl-button";
        button.value = "WindowLevel";
        button.onclick = app.onChangeTool;
        button.appendChild(document.createTextNode(dwv.i18n("tool.WindowLevel.name")));

        var node = app.getElement("toolbar");
        node.appendChild(button);
    };
    this.display = function (bool)
    {
        var button = app.getElement("wl-button");
        button.disabled = bool;
    };
    this.initialise = function ()
    {
        // clear previous
        dwv.html.removeNode(app.getElement("presetSelect"));
        dwv.html.removeNode(app.getElement("presetLabel"));

        // create preset select
        var select = dwv.html.createHtmlSelect("presetSelect",
            app.getViewController().getWindowLevelPresetsNames(), "wl.presets", true);
        select.className = "presetSelect";
        select.onchange = app.onChangeWindowLevelPreset;
        select.title = "Select w/l preset.";
        select.setAttribute("data-inline","true");
        var label = document.createElement("label");
        label.className = "presetLabel";
        label.setAttribute("for", "presetSelect");
        label.appendChild(document.createTextNode(dwv.i18n("basics.presets") + ": "));

        var node = app.getElement("toolbar");
        node.appendChild(label);
        node.appendChild(select);
    };
};

// Zoom
dwv.gui.ZoomAndPan = function (app)
{
    this.setup = function ()
    {
        var button = document.createElement("button");
        button.className = "zoom-button";
        button.value = "ZoomAndPan";
        button.onclick = app.onChangeTool;
        button.appendChild(document.createTextNode(dwv.i18n("tool.ZoomAndPan.name")));

        var node = app.getElement("toolbar");
        node.appendChild(button);
    };
    this.display = function (bool)
    {
        var button = app.getElement("zoom-button");
        button.disabled = bool;
    };
};

// Scroll
dwv.gui.Scroll = function (app)
{
    this.setup = function ()
    {
        var button = document.createElement("button");
        button.className = "scroll-button";
        button.value = "Scroll";
        button.onclick = app.onChangeTool;
        button.appendChild(document.createTextNode(dwv.i18n("tool.Scroll.name")));

        var node = app.getElement("toolbar");
        node.appendChild(button);
    };
    this.display = function (bool)
    {
        var button = app.getElement("scroll-button");
        button.disabled = bool;
    };
};

//Reset
dwv.gui.appendResetHtml = function (app)
{
    var button = document.createElement("button");
    button.className = "reset-button";
    button.value = "reset";
    button.onclick = app.onDisplayReset;
    button.appendChild(document.createTextNode(dwv.i18n("basics.reset")));

    var node = app.getElement("toolbar");
    node.appendChild(button);
};
dwv.gui.plot = function (div, data, options)
{
    var plotOptions = {
        "bars": { "show": true },
        "grid": { "backgroundcolor": null },
        "xaxis": { "show": true },
        "yaxis": { "show": false }
    };
    if (typeof options !== "undefined" &&
        typeof options.markings !== "undefined") {
        plotOptions.grid.markings = options.markings;
    }
    $.plot(div, [ data ], plotOptions);
};
