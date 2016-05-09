//
// sec-viewer/viewer-plotly.js
//
//
var savePlot=null;  // point to the viewer node
var saveY=[];       // Ys values
var saveX=[];       // X value, base on actual_sampling_interval
                    // in seconds
var saveYnorm=[];   // Ys normalized values
var saveTrace=[];   // key/label for the traces
var saveTracking=[];// state of traces being shown (true/false)
var saveColor=[];

var saveYmax=null;
var saveYmin=null;
var saveXmax=null;
var saveXmin=0;

function getColor(idx) {
  var stockColor=[
                'rgba(0, 128, 0, .8)',
                'rgba(152, 0, 0, .8)',
                'rgba(0, 0, 255, .8)',
                'rgba(255, 168, 0, .8)'];
  var tmp=(idx % 4);
  return stockColor[tmp];
}

//http://www.originlab.com/doc/X-Function/ref/cnormalize#Algorithm
function normalizeY(y) {
  var n=[];
  var cnt=y.length;
  var max=Math.max.apply(Math,y);
  var min=Math.min.apply(Math,y);
  var delta=max-min;
  var t;
  for(var i=0;i<cnt;i++) {
    t=(y[i]-min)/(delta); 
    n.push(t);
  }
  return n;
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
     saveYnorm.push(normalizeY(_y));
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

  savePlot=addAPlot('#myViewer',_data, _layout,600,500);
}

function updateLineChart() {
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
  savePlot=addAPlot('#myViewer',_data, _layout,600,500);
}

function makeOne(x,y,trace,color) {
  var marker_val = { 'size':10, 'color':color};
  var t= { "x":x, "y":y, "name":trimKey(trace), "marker": marker_val, 
           "type":"scatter" };
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

function getLinesDefaultLayout(){
  var tmp;
  if(showNormalize==true)
     tmp={ "title":"Signal","range":[0,1] };
     else  
       tmp={ "title":"Signal","range":[ saveYmin,saveYmax] };

  var p= {
        "width": 600,
        "height": 400,
        "xaxis": {"title":"Time(minutes)",
                  "range":[saveXmin,saveXmax],
                  "type":"linear"
                 },
        "yaxis": tmp,
        };
  return p;
}

function addAPlot(divname, data, layout, w, h) {
  var d3 = Plotly.d3;
  var gd3 = d3.select(divname)
    .append('div')
    .style({
        width: w,
        height: h,
        visibility: 'inherit'
    });

  var gd = gd3.node();
  Plotly.newPlot(gd, data, layout);
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
