//
// sec-viewer/viewer-baseline.js
//
// support routines for normalizing y with baseline
// managing the baselines per y trace
// 
// for each trace in saveY, needs a structure to manage
// baselines segments,
//   the segment can be default segment extracted from the
//   initial experiment sec files or it could be selected
//   and set on viewer by the user
//   the segment can be marked as a full range 'min-max'
//   or it could be 'peak-only' or 'zero-target' 
//

// var saveY=[];       // Ys values
var baseForY=[];  // should be pairs of baseStart, baseEnd

function processXX() {

baseForY.push(baseList);
// 'file','viewer'
// 'min-max', 'peak-only', 'zero-target'
base={'start':start_time, 'stop':stop_time, 'src':'file', type:'zero-target' };
baseline.push(base);

}

//http://www.originlab.com/doc/X-Function/ref/cnormalize#Algorithm
//minmaxbase
function normalizeWithRange(y,minmaxbase) {
  var n=[];
  var cnt=y.length;
  var len=minmaxbase.length;
  var max=Math.max.apply(Math,minmaxbase);
  var min=Math.min.apply(Math,minmaxbase);
  var delta=max-min;
  var t;
  for(var i=0;i<cnt;i++) {
    t=(y[i]-min)/(delta); 
    n.push(t);
  }
  return n;
}

//+ Carlos R. L. Rodrigues
//@ http://jsfromhell.com/array/average [rev. #1]
function processArray(base) {
    var r = {mean: 0, variance: 0, deviation: 0}, t = base.length;
    for(var m, s = 0, l = t; l--; s += base[l]);
    for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(base[l] - m, 2));
    return r.deviation = Math.sqrt(r.variance = s / t), r;
}

// norm by shifting the y by mean
function normalizeWithZero(y,zerobase) {
  var n=[];
  var cnt=y.length;
  var len=zerobase.length;
  var p=processArray(zerobase);
  var colmin=p['mean'];
  window.console.log("mean is..",mean);
  var delta=0-colmin;
  var t;
  for(var i=0;i<cnt;i++) {
    t=y[i]+delta; 
    n.push(t);
  }
  return n;
}

/*
colrange <- max(trace[baseIndex + 1:peakIndex])  - colmin
should be trace[1:peakIndex]??
*/
function normalizeWithPeak(y,peakbase) {
  var n=[];
  var cnt=y.length;
  var len=peakbase.length;
  var p=processArray(peakbase);
  var colmin=p['mean'];
  window.console.log("mean is..",mean);
  var max=Math.max.apply(Math,peakbase);
  var colrage=max-colmin;
  var t;
  for(var i=0;i<cnt;i++) {
    t=(y[i]-colmin)/(colrang); 
    n.push(t);
  }
  return n;
}
