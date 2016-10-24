//
// sec-viewer/viewer-plotly.js
//
//
var savePlot=null;  // point to the viewer node
var saveSliderPlot=null;  // point to the viewer node

var saveY=[];       // Ys values of all input traces

var smoothedY=false;
var saveYsmooth=[];   // smoothed Ys value to experiment base signal, calculated 
                      // once only

var saveX=[];       // X value, base on actual_sampling_interval
                    // in seconds

var saveYnorm=[];   // Ys normalized values, default, with full y range, recalculated
                    // with each normalizeButton toggling

var qualityY=[];    // normalized quality of Y, calculated from the region pts
var qualityFirst=true; // for now, just calculate once for the full range

var saveTrace=[];   // key/label for all traces, ie. GPCRUSC20161012EXP2_2_SIGNAL01
var saveTracking=[];// state of traces being shown (true/false)
var saveColor=[];

// in a list of urls being passed, it is always assumed that the
// first url is the 'standard' signal per device per site
// 2nd url is the 'base/noise' of the experiment 
// rest of them are the different signal data
// but these could be changed using  base and standard commandline options
// to change
var saveBaseIdx= -1;      // a experiement run's baseline (noise baseline's idx in saveY)
var saveStandard=-1;    // the current trace (index in saveTracking) to be used

var saveStandardIdx=[];   // all standard trace's idx in saveY
var saveStandardTrace=[]; // all standard trace's key/label
var saveDataIdx=[];       // all data trace's idx in saveY
var saveDataTrace=[];     // all data trace's key/label

var trackSliderClicks=[]; // default region range (in minutes)
                          // saveRegionStart, saveBaseEnd set from commandline
var trackRatio=null;      // the index corresponds to the region 

var saveYmax=null;
var saveYmin=null;
var saveXmax=null;
var saveXmin=0;

var colorMap=[];

// create a colormap of about 24 colors
function setupColorMap() {
  var c1=colorbrewer.Dark2[8];
  var c2=colorbrewer.Set1[8];
  var c3=colorbrewer.Paired[8];
  for( var i=0; i<8; i++) {
    colorMap.push(c1[i]);
  }
  for( var i=0; i<8; i++) {
    colorMap.push(c2[i]);
  }
  for( var i=0; i<8; i++) {
    colorMap.push(c3[i]);
  }
}

function getColor(idx) {
  var maxColors=colorMap.length;
  return colorMap[idx % maxColors];
}

function getList(obj) {
    var vals = [];
    for( var key in obj ) {
        if ( obj.hasOwnProperty(key) ) {
            vals.push(obj[key]);
        }
    }
    return vals;
}

// convert from minutes to nearest index
function toIndex(cnt,mins)
{
   //cnt, 3000
   var max=saveXmax; // 20
   var tmp=(cnt / saveXmax) * mins;
   var idx=Math.round(tmp);
   return idx;
}

function toMinutes(y,idx)
{
    var cnt=y.length;
    var max=saveXmax;
    var tmp=(idx/cnt )*saveXmax;
    var mins=(Math.round(tmp*1000)/1000);
    return mins;
}


// needed actual_sampling_interval:0.4 
//        retention_unit: seconds
//        number of y values:3000
//        Xmin=0; Xmax=(0.4*3000)/60=20minutes
function processForPlotting(blob) {

   setupColorMap();
   var _trace=getKeys(blob); // skip '_time' line
   var cnt=_trace.length;
   firstColor=true;

   // default to the first url
   if(saveStandardIdx.length==0) 
     saveStandardIdx=[0];

   for(var i=0;i<cnt;i++) {
     var k=_trace[i];
     var _y=getList(blob[k]);

     saveTrace.push(k);
     saveY.push(_y);

     saveTracking.push(true); //

     //if in is in saveStandardIdx, 
     if (saveStandardIdx.indexOf(i) != -1) {
       saveColor.push('#000000'); // push black one for standard
       saveStandardTrace.push(k);
       } else {
// This is because there is just 1 target
         if(firstColor) {
           saveColor.push('#DD0202'); // the default red
           firstColor=false;
         } else saveColor.push(getColor(saveTrace.length-1));
         saveDataTrace.push(k)
         saveDataIdx.push(i);
     }
//window.console.log("standard are..",saveStandardTrace.toString());
//window.console.log("data are..",saveDataTrace.toString());

     var max=Math.max.apply(Math,_y);
     var min=Math.min.apply(Math,_y);
     if(saveYmax==null)
        saveYmax=max; 
        else 
           saveYmax=(max>saveYmax)?max:saveYmax;
     if(saveYmin==null)
        saveYmin=min; 
        else 
           saveYmin=(min>saveYmin)?saveYmin:min;
   // process for saveX
     var tkey=makeTimeKey(k);
     var _xblob=blob[tkey];
     if(_xblob == null) {
       alertify.error("big PANIC...");
     }
     var _x=getList(_xblob);
     saveX.push(_x);
     max=Math.max.apply(Math,_x);
     min=Math.min.apply(Math,_x);
     if(saveXmax==null)
        saveXmax=max; 
        else 
           saveXmax=(max>saveXmax)?max:saveXmax;
     if(saveXmin==null)
        saveXmin=min; 
        else 
           saveXmin=(min>saveXmin)?saveXmin:min;

   }
   // if either of saveRegionStart or saveRegionEnd is -1, then
   // initialize them to the full range of x axis
   if(saveRegionStart == -1 || saveRegionEnd == -1) {
     saveRegionStart=saveXmin;
     saveRegionEnd=saveXmax;
   }
   if(saveRegionStart > saveRegionEnd) {
     var t=saveRegionStart;
     saveRegionStart=saveRegionEnd;
     saveRegionEnd=t;
   }
   trackSliderClicks=[saveRegionStart, saveRegionEnd ];
   if(saveDetectorName==null) {
     saveDetectorName=setDefaultDetectorName();
   }

   saveStandard=saveStandardIdx[0];

}

// XXX something to look into, all traces are now assume
// to be of same elapsed time.. ie. 3000 data points, 
// 
function getNormRange(count, baseClicks) {
  first=baseClicks[0];
  next=baseClicks[1];
  var s1=toIndex(count,first);
  var s2=toIndex(count,next);
  return [s1,s2];

}

function hasStandard() 
{
   if(saveStandardIdx.length ==0)
     return false;
   return true;
}

function hasBase() 
{
   if(saveBaseIdx == -1)
     return false;
   return true;
}

// initial set
function addLineChart() {
  // returns, Y-array, array-length, array-names
  var _y=saveY;
  var _x=saveX;
  var _keys=saveTrace;
  var _colors=saveColor;

  savePlot=makeLinePlot(_x,_y,_keys,_colors);
  if(hasStandard())
    saveSliderPlot=makeSliderPlot();
}

function updateLineChart() {
  $('#myViewer').empty();
  var cnt=saveTracking.length; 
  var _y=[];
  var _x=[];
  var _colors=[];
  var _keys=[];

  var targetY=saveY;
  if(showNormalize)
    targetY=saveYnorm;
  if(smoothBase)
    targetY=saveYsmooth;

  for(var i=0;i<cnt;i++) {
     if(saveTracking[i]) {
       _y.push(targetY[i]);
       _x.push(saveX[i]); 
       _colors.push(saveColor[i]);
       _keys.push(saveTrace[i]);
     }
  }
  savePlot=makeLinePlot(_x, _y,_keys,_colors);
  if(showNormalize || smoothBase) {
    addOverlayArea(savePlot, trackSliderClicks[0], trackSliderClicks[1], saveYmin, saveYmax);
  }
}

function updateEverything() {
  updateLineChart();
  if(hasStandard()) {
    updateSliderPlot();
  }
}

function makeLinePlot(x,y,keys,colors) {
  var _data=getLinesAt(x, y,keys,colors);
  var _layout=getLinesDefaultLayout(plotTitle(), plotYlabel());
  var plot=addAPlot('#myViewer',_data, _layout,600,400, {displaylogo: false});
  return plot;
}

function makeSliderPlot() {
  var _data2=getSliderAt(saveX[saveStandard], saveY[saveStandard],saveTrace[saveStandard],'rgb(0,0,0)');
  var _layout2=getSliderDefaultLayout(trackSliderClicks, [saveXmin, saveXmax]);
  var plot=addAPlot('#mySliderViewer',_data2, _layout2,600,400, {displayModeBar: false});
  return plot;
}

function updateSliderPlot() {
  $('#mySliderViewer').empty();
  saveSliderPlot = makeSliderPlot();
  if(showNormalize) { // refresh the normalized Y 
    reprocessForNormalize();
  }
  if(smoothBase) {
    reprocessForBase();
  }
}

function resetSliderPlot() {
  $('#mySliderViewer').empty();
  trackSliderClicks=[saveRegionStart, saveRegionEnd]; 
  saveSliderPlot=makeSliderPlot();
}

function makeOne(xval,yval,trace,cval,dataIdx) {
  var marker_val = { size:10, color:cval};
  var t= { x:xval,
           y:yval, 
           name:legendKey(trace,dataIdx), 
           marker: marker_val, 
           line : { width: 3},
           hoverinfo: 'x+y',
           type:"scatter" };
  return t;
}

function makeOneWithText(xval,yval,trace,cval,tval,dataIdx) {
  var marker_val = { size:10, color:cval};
  var t= { x:xval,
           y:yval,
           name:legendKey(trace,dataIdx), 
           marker: marker_val,
           line : { width: 3},
           text: tval,
           hoverinfo: 'x+y+text',
           type:"scatter" };
  return t;
}

function makeSliderOne(xval,yval,trace,cval) {
  var marker_val = { size:10, color:cval};
  var t= { x:xval,
           y:yval,
           name:'STANDARD            ',
           marker: marker_val, 
           hoverinfo: 'x+y',
           type:"scatter" };
  return t;
}

// should add the star as the last one
function getLinesAt(x,y,trace,color) {
  var cnt=y.length;
  var data=[];
  var hold_star=null;
  var one;
  for (var i=0;i<cnt; i++) {
// if data or current standard index 
    var isDataIdx=saveDataIdx.indexOf(i);
    if (isDataIdx != -1 || i == saveStandard ) { 
      if(showNormalize) { // include qualityY value on the hover 
        var text="d.Q Ratio: "+qualityY[i];
        one= makeOneWithText(x[i],y[i],trace[i],color[i],text, isDataIdx);
        } else {
          one= makeOne(x[i],y[i],trace[i],color[i], isDataIdx);
      }
// the current standard index
      if(i == saveStandard) {
// make it dashed lines
        one.line = { dash : 'dash', width: 2 };
        one.name= 'STANDARD           ',
//        one.marker.color= 'rgb(0,0,0)';
        hold_star=one;
        } else {
          data.push(one);
      }
      } else {
//window.console.log(" the other standard.. don't include --", i)
    }
  }
  if(hold_star) 
    data.push(hold_star);
  return data;
}

function getSliderAt(x,y,trace,color) {
  var data=[];
  var one=makeSliderOne(x,y,trace,color); 
  data.push(one);
  return data;
}

function getSliderDefaultLayout(subRange, fullRange ){
  var p= {
        width: 800,
        height: 300,
        margin: { t:50 },
        showlegend: true,
        hovermode: 'closest',
        xaxis: { title: 'Drag tabs to mark a region to be used for normalize data',
                 range: subRange,
                 rangeslider: {
                    visible: true,
                    thickness: 0.2,
                    bgcolor: "#fafafa",
                    bordercolor: "#337ab7",
                    borderwidth: 2,
                    range: fullRange
                 }
               },
        yaxis: { fixedrange: true}
      }
  return p;
}

function getLinesDefaultLayout(title,ylabel){
  var tmp;
  if(showNormalize==true)
     tmp={ title: ylabel+" (Normalized)",
           range:[0,1] };
     else  
       tmp={ title: ylabel,
             range:[ saveYmin,saveYmax] };

  var p= {
        width: 800,
        height: 300,
        title: title,
        margin: { t:50, b:40 },
        showlegend: true,
        hovermode: 'closest',
        xaxis: { title: 'Time(minutes)'},
        yaxis: tmp,
        };
  return p;
}

function addAPlot(divname, data, layout, w, h, m) {
  var d3 = Plotly.d3;
  var gd3 = d3.select(divname)
    .append('div')
    .style({
        width: w,
        height: h,
        visibility: 'inherit'
    });

  var gd = gd3.node();
  Plotly.newPlot(gd, data, layout, m);
  return gd;
}

function getAPlot(divname) {
  var d3 = Plotly.d3;
  var gd3 = d3.select(divname);
  var gd = gd3.node();
  return gd;
}

// remake the normalized data set..
function updateNormalizedLineChart() { 
  trackSliderClicks=getSliderState();
  var normDiv= document.getElementById('normalizeDiv');
  // reprocess normalizedYs

  if(showNormalize) { // refresh the normalized Y 
    reprocessForNormalize();
    normDiv.style.display='';
    } else {
      removeAnnotations(saveSliderPlot);
      normDiv.style.display='none';
  }
  updateLineChart();
}

function reprocessForNormalize() {
    var cnt=saveY.length;
    var range=getNormRange(saveY[saveStandard].length, trackSliderClicks);
    makeMarkersOnSlider(range);
//window.console.log("making markers on slider..");
    
// use dynamic selected range
    var ratioIdx=calcTrackRatioIdx(saveY[saveStandard], range);
// make it full range as always
//   var ratioIdx=calcTrackRatioIdx(saveY[saveStandard], [0, saveY[saveStandard].length]);
//window.console.log("ratio's idx is ..", ratioIdx[0], " and ", ratioIdx[1]);
//window.console.log("time used ..", toMinutes(saveY[saveStandard], ratioIdx[0]),
//" and ", toMinutes(saveY[saveStandard], ratioIdx[1]));
    for(var i=0;i<cnt;i++) {
      saveYnorm[i]=normalizeWithRange(saveY[i], saveY[i].slice(range[0],range[1]));
//      saveYnorm[i]=normalizeWithRange(saveY[i], saveY[saveStandard].slice(range[0],range[1]));
//        if(qualityFirst) {
          var _y=saveY[i];
          var Y1=_y[ratioIdx[0]]
          var Y2=_y[ratioIdx[1]];
          qualityY[i]=Math.round((Y2/Y1)*1000)/1000;
//window.console.log("qualitY for ",i, " is ", qualityY[i]);
//        }
    }
//    qualityFirst=false;
}

// if saveBaseIdx is set, then smooth by the supplied trace
//    else smooth by the min-of-range of the trace
function updateWithBaseLineChart() {
  trackSliderClicks=getSliderState();
  if(smoothBase) {
    reprocessForBase();
    } else {
      removeAnnotations(saveSliderPlot);
  }
  updateLineChart();
}
  
function reprocessForBase() {
  var cnt=saveY.length;
  var range=getNormRange(saveY[saveStandard].length, trackSliderClicks);
  makeMarkersOnSlider(range);
  for(var i=0;i<cnt;i++) {
    var s=saveY[i];
    if(hasBase()) { 
      s=normalizeWithBaseline(saveY[i], saveY[saveBaseIdx]);
      } else {
        s=normalizeWithBaseMin(saveY[i], saveY[i].slice(range[0],range[1]));
    }
    saveYsmooth[i]=s;
  }
}

// save range
function getSliderState() {
  var slider=saveSliderPlot;
  var range=slider.layout.xaxis.range;
  return range;
}

function addOverlayArea(aPlot, xstart, xend, ystart, yend)
{
//window.console.log("addOverlay..",xstart, " ends..", xend);
  var _s = { type: 'rect',
             xref: 'x',
             yref: 'y',
             x0: xstart,
             x1: xend,
             y0: ystart,
             y1: yend,
             fillcolor: '#d3d3d3',
             opacity: 0.3,
             line: { width: 1 }
  };
  // _layout.shapes = _update
  var _layout=aPlot.layout;
  var _shapes = _layout.shapes;
  if(_shapes != null) {
    _shapes.push(_s);
    } else {
     _shapes= [_s];
  }
  var update = { shapes : _shapes };
  Plotly.relayout(aPlot,update);
}

function replaceOverlayArea(aPlot, xstart, xend, ystart, yend)
{
  var _s = { type: 'rect',
             xref: 'x',
             yref: 'y',
             x0: xstart,
             x1: xend,
             y0: ystart,
             y1: yend,
             fillcolor: '#d3d3d3',
             opacity: 0.3,
             line: { width: 1 }
  };
  var update = { shapes : [ _s ] };
  Plotly.relayout(aPlot,update);
}

function removeOverlayArea(aPlot)
{
  var update = { shapes : [] };
  Plotly.relayout(aPlot,update);
}

//Y1 = measured at x(on trace) where standard Y is maximum
//Y2 = measured at y1) - 0.5 min  
function calcTrackRatioIdx(targetY, nrange) {
  var cnt=targetY.length;
  var delta=toIndex(cnt, 0.5);
  var irange=getIndexMinMax(saveY[saveStandard].slice(nrange[0], nrange[1]));
  var maxIdx=irange[1]+nrange[0];
  var nextIdx=maxIdx - delta;
  if(nextIdx < 0) nextIdx=0;
  return [maxIdx, nextIdx];
}

function makeMarkersOnSlider(nrange) {
  var irange=getIndexMinMax(saveY[saveStandard].slice(nrange[0], nrange[1]));
  var minIdx=irange[0]+nrange[0];
  var maxIdx=irange[1]+nrange[0];
  var _y=saveY[saveStandard];
  var minY=_y[minIdx];
  var maxY=_y[maxIdx];
  var minX=toMinutes(_y,minIdx);
  var maxX=toMinutes(_y,maxIdx);
// precision can cause edges effect
  if(minX < trackSliderClicks[0]) minX=trackSliderClicks[0];
  if(maxX < trackSliderClicks[0]) maxX=trackSliderClicks[0];
  if(maxX > trackSliderClicks[1]) maxX=trackSliderClicks[1];
  if(minX > trackSliderClicks[1]) minX=trackSliderClicks[1];
  addMarkerAnnotation(minX, minY);
  addMarkerAnnotation(maxX, maxY);
}

function addMarkerAnnotation(_x,_y) {
  var x=Math.round(_x *1000)/1000;
  var y=Math.round(_y *1000)/1000;
  var annotate_text = '('+x+','+y+')';
  var annotation = {
//      text: annotate_text,
      x: x,
      y: y,
      showarrow: true,
      arrowcolor: 'rgb(255, 0, 0)',
      ax: 0,
      ay: -20 
  };

  var ss = saveSliderPlot;
//  var d=Math.max.apply(Math,saveSliderPlot.data[0].y);

  var annotations = ss.layout.annotations || [];
// reset if there is 2
  if(annotations.length == 2 ) {
    annotations = [];
  }
  annotations.push(annotation);
  Plotly.relayout(ss,{annotations: annotations});
}

function removeAnnotations(aPlot)
{
  Plotly.relayout(aPlot,{annotations: []});
}

/*********************************************/
