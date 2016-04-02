
var savePlot=null;  // point to the viewer node
var saveY=[];     // Ys values
var saveTrace=[]; // key/label for the traces
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
  window.console.log("getColor.."+idx+" and "+tmp);
  return stockColor[tmp];
}

// { dataset: { "signal0: [v1, v2...] },
function processForLines(blob) {
   var topkeys=getKeys(blob);
   var k=topkeys[0];
   var dblob=blob[k];
   saveTrace=getKeys(dblob);
   var cnt=saveTrace.length;
   for(i=0;i<cnt;i++) {
     var k=saveTrace[i];
     saveY.push(dblob[k]);
     saveColor.push(getColor(i));
     saveTracking.push(true); //
     saveXmax=(dblob[k].length>saveXmax)?dblob[k].length:saveXmax;
     var max=Math.max.apply(Math,dblob[k]);
     var min=Math.min.apply(Math,dblob[k]);
     if(saveYmax==null)
        saveYmax=max; 
        else 
           saveYmax=(max>saveYmax)?max:saveYmax;
     if(saveYmin==null)
        saveYmin=min; 
        else 
           saveYmin=(min>saveYmin)?saveYmin:min;
   }
}

// initial set
function addLineChart(blob) {
  // returns, Y-array, array-length, array-names
  processForLines(blob);
  var _y=saveY;
  var _keys=saveTrace;
  var _colors=saveColor;

  var _data=getLinesAt(_y,_keys,_colors);
  var _layout=getLinesDefaultLayout();

  savePlot=addAPlot('#myViewer',_data, _layout,600,500);
}

function updateLineChart() {
  $('#myViewer').empty();
  var cnt=saveTracking.length; 
  var _y=[];
  var _colors=[];
  var _keys=[];

window.console.log("----"+cnt);
  for(i=0;i<cnt;i++) {
     if(saveTracking[i]==true) {
     window.console.log("here.."+i+" "+saveTracking[i]);
       _y.push(saveY[i]);
       _colors.push(getColor(i));
       _keys.push(saveTrace[i]);
       } else {
     window.console.log("here.."+i+" "+saveTracking[i]);
     }
  }
  var _data=getLinesAt(_y,_keys,_colors);
  var _layout=getLinesDefaultLayout();
  savePlot=addAPlot('#myViewer',_data, _layout,600,500);
}

function makeOne(y,trace,color) {
  var len=y.length;
  var x=Array.apply(0, Array(len)).map(function(_,b) { return b + 1; });
  var marker_val = { 'size':10, 'color':color};
  var t= { "x":x, "y":y, "name":trace, "marker": marker_val,  "type":"scatter" };
  return t;
}

function getLinesAt(y,trace,color) {
  var cnt=y.length;
  var data=[];
  for (var i=0;i<cnt; i++) {
    data.push(makeOne(y[i],trace[i],color[i])); 
  }
  return data;
}

function getLinesDefaultLayout(keys){
  var p= {
        "width": 600,
        "height": 400,
        "xaxis": { "title":"Time", "range":[0,3000]} ,
        "yaxis": { "title":"Intensity","range":[-5,15] } ,
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

function deleteTrace(which) {
  var idx=saveTrace.indexOf(which);
  window.console.log("delete a trace..");
  Plotly.deleteTraces(savePlot, idx);
}

function toggleTrace(idx) {
  saveTracking[idx] = !saveTracking[idx];
  // rebuilt the plot
  updateLineChart();
}
