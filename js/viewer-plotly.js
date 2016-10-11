//
// sec-viewer/viewer-plotly.js
//
//
var savePlot=null;  // point to the viewer node
var saveSliderPlot=null;  // point to the viewer node

var saveY=[];       // Ys values
var saveX=[];       // X value, base on actual_sampling_interval
                    // in seconds
var saveYnorm=[];   // Ys normalized values, default, with full y range
var qualityY=[];    // normalized quality of Y, calculated from the baseline pts

var saveTrace=[];   // key/label for the traces
var saveTracking=[];// state of traces being shown (true/false)
var saveColor=[];
var saveStar=0;     // the trace (index in saveTracking) to be
                    // shown on the rangeslider-default is 0
                    // initialize to the first one
var trackSliderClicks=[]; // default baseline (in minutes)
var trackRatio=null;

var saveYmax=null;
var saveYmin=null;
var saveXmax=null;
var saveXmin=0;

var colorMap=[];

// create a colormap of about 24 colors
function setupColorMap() {
  var c3=colorbrewer.Dark2[8];
  var c1=colorbrewer.Set1[8];
  var c2=colorbrewer.Paired[8];
  colorMap.push('#1347AE'); // the default blue
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
    var mins=Math.round(tmp);
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
   if(saveBaseStart < saveBaseEnd) {
     trackSliderClicks=[saveBaseStart, saveBaseEnd ];
     } else {
        trackSliderClicks=[saveBaseEnd, saveBaseStart ];
   }
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

// initial set
function addLineChart() {
  // returns, Y-array, array-length, array-names
  var _y=saveY;
  var _x=saveX;
  var _keys=saveTrace;
  var _colors=saveColor;

  var _data=getLinesAt(_x, _y,_keys,_colors);
  var _layout=getLinesDefaultLayout();
  savePlot=addAPlot('#myViewer',_data, _layout,600,400, {displaylogo: false});
  addOverlayArea(savePlot, trackSliderClicks[0], trackSliderClicks[1], saveYmin, saveYmax);

//XXX, in case there is not star line, then need to make some changes here
  var _data2=getSliderAt(saveX[saveStar], saveY[saveStar],saveTrace[saveStar],saveColor[saveStar]);
  var _layout2=getSliderDefaultLayout();
  saveSliderPlot=addAPlot('#mySliderViewer',_data2, _layout2,600,400, {displayModeBar: false});

  saveSliderPlot.on('plotly_click', function(data){
    var point = data.points[0];
//    var px=point.xaxis.d2l(point.x);
//    var py=point.xaxis.d2l(point.y);
    var x=parseFloat(data.points[0].x.toPrecision(4));
    var y=parseFloat(data.points[0].y.toPrecision(4));
    annotate_text = '('+x+','+y+')';

    annotation = {
      text: annotate_text,
      x: x,
      y: y,
      showarrow: true,
      ax: 0,
      ay: -20 
    };

    var ss = saveSliderPlot;
    var annotations = ss.layout.annotations || [];
// only keep the last annotations
    if(annotations.length > 1 ) {
      var last_anno=annotations[annotations.length-1];
      annotations = [];
      annotations.push(last_anno);
    }
    annotations.push(annotation);
    if(annotations.length == 2) { // reset the trackSliderClicks..
      var n1=annotations[0].x;
      var n2=annotations[1].x;

      if(n2 > n1) { 
        trackSliderClicks = [ n1, n2 ];
        } else {
          trackSliderClicks = [ n2, n1 ];
      }
      // if in normalized mode, recalculate and redraw
      if(showNormalize) { // refresh the normalized Y 
        updateNormalizedLineChart();
        } else {
          replaceOverlayArea(savePlot, trackSliderClicks[0], trackSliderClicks[1], saveYmin, saveYmax);
      }
    }
    Plotly.relayout(ss,{annotations: annotations});
  });
}

function updateLineChart() {
  var saveRange=saveSliderState();
  $('#myViewer').empty();
  var cnt=saveTracking.length; 
  var _y=[];
  var _x=[];
  var _colors=[];
  var _keys=[];

  for(var i=0;i<cnt;i++) {
     if(saveTracking[i]==true) {
       if(showNormalize==true) { 
         _y.push(saveYnorm[i]);
         _x.push(saveX[i]); 
         } else {
           _y.push(saveY[i]);
           _x.push(saveX[i]); 
       }
       _colors.push(saveColor[i]);
       _keys.push(saveTrace[i]);
       } else {
     }
  }
  var _data=getLinesAt(_x, _y,_keys,_colors);
  var _layout=getLinesDefaultLayout();
  savePlot=addAPlot('#myViewer',_data, _layout,600,400, {displaylogo: false});
  addOverlayArea(savePlot, trackSliderClicks[0], trackSliderClicks[1], saveYmin, saveYmax);
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
  for (var i=0;i<cnt; i++) {
    var one= makeOne(x[i],y[i],trace[i],color[i]); 
    if(i == saveStar) {
// make it dashed lines
        one.line = { dash : 'dash', width: 2 };
        hold_star=one;
      } else {
      data.push(one);
    }
  }
  if(hold_star) {
    data.push(hold_star);
  }
  return data;
}

function getSliderAt(x,y,trace,color) {
  var data=[];
  data.push(makeSliderOne(x,y,trace,color)); 
  return data;
}

function getSliderDefaultLayout(){
  var p= {
        width: 600,
        height: 300,
        title: 'Click to mark baseline points',
        margin: { t:50 },
        showlegend: true,
        hovermode: 'closest',

        xaxis: { title: 'Drag range tabs to focus on a section',
                 fixedrange: true,
                 rangeslider:{} 
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
        hovermode: 'closest',
        legend: { x:-0.5, y:1, traceorder: 'reversed' },
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

/***
function deleteTrace(which) {
  var idx=saveTrace.indexOf(which);
  window.console.log("delete a trace..");
  Plotly.deleteTraces(savePlot, idx);
}
***/

function toggleStarTrace(idx) {
// XXX do not toggle the visibility, 
//  saveTracking[idx] = !saveTracking[idx];
  // rebuilt the plot
  updateLineChart();
}

// remake the normalized data set..
function updateNormalizedLineChart() { 
  var quaY= document.getElementById('qualityY');
  var quaLabel= document.getElementById('quaLabel');
  // reprocess normalizedYs
  if(showNormalize) { // refresh the normalized Y 
    var cnt=saveY.length;
    for(var i=0;i<cnt;i++) {
      var range=getNormRange(saveY[i].length, trackSliderClicks);
//?? XXX is it with range values from star lines to saveY
      saveYnorm[i]=normalizeWithRange(saveY[i], saveY[saveStar].slice(range[0],range[1]));
      qualityY[i]=calcTrackRatio(saveY[i], range);
window.console.log("quality at ",i," is ",qualityY[i]);
    }
    quaY.value=qualityY[1]; // XXX set to first one for now
    quaY.style.display='';
    quaLabel.style.display='';
    } else {
      quaY.style.display='none';
      quaLabel.style.display='none';
  }
  updateLineChart();
}

// save range
function saveSliderState() {
  var slider=saveSliderPlot;
  var range=slider.layout.xaxis.range;
  return range;
}

// set range
function restoreSliderState(layout, range) {
  layout.xaxis.range=range;
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
             opacity: 0.1,
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
             opacity: 0.1,
             line: { width: 1 }
  };
  var update = { shapes : [ _s ] };
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

/*********************************************/
