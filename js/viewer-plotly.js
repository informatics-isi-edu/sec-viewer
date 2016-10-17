//
// sec-viewer/viewer-plotly.js
//
//
var savePlot=null;  // point to the viewer node
var saveSliderPlot=null;  // point to the viewer node

var saveY=[];       // Ys values
var smoothedY=false;
var saveYsmooth=[];   // smoothed Ys value to experiment base signal, calculated 
                        // once only
var saveX=[];       // X value, base on actual_sampling_interval
                    // in seconds
var saveYnorm=[];   // Ys normalized values, default, with full y range, recalculated
                    // with each normalizeButton toggling
var qualityY=[];    // normalized quality of Y, calculated from the region pts

var saveTrace=[];   // key/label for the traces
var saveTracking=[];// state of traces being shown (true/false)
var saveColor=[];

// in a list of urls being passed, it is always assumed that the
// first url is the 'standard' signal per device per site
// 2nd url is the 'base/noise' of the experiment 
// rest of them are the different signal data
// but these could be changed using  base and standard commandline options
// to change
var saveBase= -1;
var saveStandard=0;    // the trace (index in saveTracking) to be
                        // shown on the rangeslider-default is 0
var trackSliderClicks=[]; // default region range (in minutes)
                          // saveRegionStart, saveBaseEnd set from commandline
var trackRatio=null;

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
  colorMap.push('#1347AE'); // the default blue
  colorMap.push('#DD0202'); // the default red
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
   for(var i=0;i<cnt;i++) {
     var k=_trace[i];
     var _y=getList(blob[k]);
     saveTrace.push(k);
     saveY.push(_y);
     saveColor.push(getColor(saveTrace.length-1));
     saveTracking.push(true); //
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
   if(saveStandard == -1)
     return false;
   return true;
}

function hasBase() 
{
   if(saveBase == -1)
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
  if(showNormalize) {
    addOverlayArea(savePlot, trackSliderClicks[0], trackSliderClicks[1], saveYmin, saveYmax);
  }
}

function makeLinePlot(x,y,keys,colors) {
  var _data=getLinesAt(x, y,keys,colors);
  var _layout=getLinesDefaultLayout();
  var plot=addAPlot('#myViewer',_data, _layout,600,400, {displaylogo: false});
  return plot;
}

function makeSliderPlot() {
  var _data2=getSliderAt(saveX[saveStandard], saveY[saveStandard],saveTrace[saveStandard],'rgb(0,0,0)');
  var _layout2=getSliderDefaultLayout(trackSliderClicks, [saveXmin, saveXmax]);
  var plot=addAPlot('#mySliderViewer',_data2, _layout2,600,400, {displayModeBar: false});
  return plot;
}

function resetSliderPlot() {
  $('#mySliderViewer').empty();
  trackSliderClicks=[saveRegionStart, saveRegionEnd]; 
  saveSliderPlot=makeSliderPlot();
}

function makeOne(xval,yval,trace,cval) {
  var marker_val = { size:10, color:cval};
  var t= { x:xval,
           y:yval, 
           name:trimKey(trace), 
           marker: marker_val, 
           line : { width: 3},
           hoverinfo: 'x+y',
           type:"scatter" };
  return t;
}

function makeSliderOne(xval,yval,trace,cval) {
  var marker_val = { size:10, color:cval};
  var t= { x:xval,
           y:yval,
           name:trimKey(trace), 
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
  var hold_base=null;
  for (var i=0;i<cnt; i++) {
    var one= makeOne(x[i],y[i],trace[i],color[i]); 
    if(i != saveStandard && i != saveBase) {
      data.push(one);
      } else {
// make it dashed lines
        if(i == saveStandard) {
          one.line = { dash : 'dash', width: 2 };
          one.marker.color= 'rgb(0,0,0)';
          hold_star=one;
          } else {
            hold_base=one;
        }
    }
  }
  if(hold_base) 
    data.push(hold_base);
  if(hold_star) 
    data.push(hold_star);
  return data;
}

function getSliderAt(x,y,trace,color) {
  var data=[];
  data.push(makeSliderOne(x,y,trace,color)); 
  return data;
}

function getSliderDefaultLayout(subRange, fullRange ){
  var p= {
        width: 800,
        height: 300,
        margin: { t:50 },
        showlegend: true,
        hovermode: 'closest',
        xaxis: { title: 'Drag to mark a range',
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

function getLinesDefaultLayout(){
  var tmp;
  if(showNormalize==true)
     tmp={ title:"Strength",
           range:[0,1] };
     else  
       tmp={ title:"Strength",
             range:[ saveYmin,saveYmax] };

  var p= {
        width: 800,
        height: 300,
        margin: { t:50, b:40 },
        showlegend: true,
//        legend: { traceorder: 'reversed'},
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
//  var quaY= document.getElementById('qualityY');
  // reprocess normalizedYs

  if(showNormalize) { // refresh the normalized Y 
    var cnt=saveY.length;
    var range=getNormRange(saveY[saveStandard].length, trackSliderClicks);
    makeMarkersOnSlider(range);
    
    for(var i=0;i<cnt;i++) {
      saveYnorm[i]=normalizeWithRange(saveY[i], saveY[i].slice(range[0],range[1]));
//      saveYnorm[i]=normalizeWithRange(saveY[i], saveY[saveStandard].slice(range[0],range[1]));
//      qualityY[i]=calcTrackRatio(saveY[i], range);
    }
    normDiv.style.display='';
//    quaY.value=qualityY[1]; // XXX set to first one for now
    } else {
      removeAnnotations(saveSliderPlot);
      normDiv.style.display='none';
  }
  updateLineChart();
}



function updateWithBaseLineChart() {
  // calculate the smoothed one if not there.
  if(!smoothedY) { 
    var cnt=saveY.length;
    for(var i=0;i<cnt;i++) {
      if(i != saveStandard ) {
        var s=normalizeWithBase(saveY[i], saveY[saveBase]);
        saveYsmooth[i]=s;
        } else {
          saveYsmooth[i]=saveY[i];
      }
    }
    smoothedY=true;
  }
  updateLineChart();
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


function calcTrackRatio(targetY, range)
{
  var _slice=targetY.slice(range[0],range[1]);
  var _sz=_slice.length;
  var _y1=_slice[0];
  var _y2=_slice[2];
  return (_y1/_y2);
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
      text: annotate_text,
      x: x,
      y: y,
      showarrow: true,
      arrowcolor: 'rgb(255, 0, 0)',
      ax: 0,
      ay: -20 
  };

  var ss = saveSliderPlot;
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
