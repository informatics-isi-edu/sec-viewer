//
// sec-viewer/viewer-plotly.js
//
//
var savePlot=null;  // point to the viewer node
var saveSliderPlot=null;  // point to the viewer node
var saveY=[];       // Ys values
var saveX=[];       // X value, base on actual_sampling_interval
                    // in seconds
var saveYnorm=[];   // Ys normalized values
var saveTrace=[];   // key/label for the traces
var saveTracking=[];// state of traces being shown (true/false)
var saveColor=[];
var saveStar=0;     // the trace (index in saveTracking) to be
                    // shown on the rangeslider-default is 0
var saveSliderClicks=[5,9];

var saveYmax=null;
var saveYmin=null;
var saveXmax=null;
var saveXmin=0;

function getColor(idx) {
 var i=idx;
 // from colorbrewer.js
  var clist=colorbrewer.RdBu;
  var cnt=clist.length;
  if(idx > cnt) {
    window.console.log("oh no..");    
    i=idx % cnt;
  }
  var color=clist[i];
  return color;
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

     var range=getNormRange(_y.length);
     window.console.log('range ', range);
     saveYnorm.push(normalizeWithFullY(_y, _y.slice(range[0],range[1])));
   }
}

// XXX something to look into, all traces are now assume
// to be of same elapsed time.. ie. 3000 data points, 
// 
function getNormRange(count) {
  first=saveSliderClicks[0];
  next=saveSliderClicks[1];
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

  var _data2=getSliderAt(saveX[saveStar], saveY[saveStar],saveTrace[saveStar],saveColor[saveStar]);
  var _layout2=getSliderDefaultLayout();
  saveSliderPlot=addAPlot('#mySliderViewer',_data2, _layout2,600,400, {displayModeBar: false});

  saveSliderPlot.on('plotly_click', function(data){
    saveSliderClicks=saveSliderPlot.layout.xaxis.range;
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
}

function makeOne(xval,yval,trace,cval) {
  var marker_val = { size:10, color:cval};
  var t= { x:xval,
           y:yval, 
           name:trimKey(trace), 
           marker: marker_val, 
           type:"scatter" };
  return t;
}

function makeSliderOne(xval,yval,trace,cval) {
  var marker_val = { size:10, color:cval};
  var t= { x:xval,
           y:yval,
           name:trimKey(trace), 
           marker: marker_val, 
           type:"scatter" };
  return t;
}

function getLinesAt(x,y,trace,color) {
  var cnt=y.length;
  var data=[];
  for (var i=0;i<cnt; i++) {
    data.push(makeOne(x[i],y[i],trace[i],color[i])); 
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
        margin: { t:50 },
        showlegend: true,

        xaxis: { title: 'Click to save baseline range',
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
        width: 600,
        height: 300,
        margin: { t:50, b:40 },
        showlegend: true,
        legend: { traceorder: 'reversed' },
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

function toggleTrace(idx) {
  saveTracking[idx] = !saveTracking[idx];
  // rebuilt the plot
  updateLineChart();
}

// remake the normalized data set..
function updateNormalizedLineChart() { 
  // reprocess normalizedYs
  if(showNormalize) { // refresh the normalized Y 
    var cnt=saveY.length;
    for(var i=0;i<cnt;i++) {
      var range=getNormRange(saveY[i].length);
//      alertify.success('Normalizing between:\n\n'+range[0]+' and '+range[1]);
      window.console.log('Normalizing range ', range);
      saveYnorm[i]=normalizeWithFullY(saveY[i], saveY[i].slice(range[0],range[1]));
    }
  }
  updateLineChart();
}

// save range
function saveSliderState() {
  var slider=saveSliderPlot;
  var range=slider.layout.xaxis.range;
  window.console.log(range);
  return range;
}

// set range
function restoreSliderState(layout, range) {
  layout.xaxis.range=range;
}

/*********************************************/
