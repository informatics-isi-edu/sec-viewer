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

function normalizeWithBaseMin(y, minmaxbase) {
  var n=[];
  var cnt=y.length;
  var t;
  var ymin=Math.min.apply(Math,minmaxbase);
window.console.log("normalizeWithBaseMin, shift by y..",ymin);
  for(var i=0;i<cnt;i++) {
    t=(y[i]-ymin);
    n.push(t)
  }
  return n;
}

// this is shifting with another signal
function normalizeWithBaseline(y, ybase) {
  var n=[];
  var cnt=y.length;
  var t;
  for(var i=0;i<cnt;i++) {
    t=(y[i]-ybase[i]);
    n.push(t)
  }
  return n;
}

//http://www.originlab.com/doc/X-Function/ref/cnormalize#Algorithm
//minmaxbase
function normalizeWithRange(y,minmaxbase) {
  var n=[];
  var cnt=y.length;
  var len=minmaxbase.length;
  var max=Math.max.apply(Math,minmaxbase);
  var min=Math.min.apply(Math,minmaxbase);
//window.console.log("minmax with max ",max," and min ",min);
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
  var colmean=p['mean'];
  var delta=0-colmean;
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
  var colmean=p['mean'];
  var max=Math.max.apply(Math,peakbase);
  var colrang=max-colmean;
  var t;
  for(var i=0;i<cnt;i++) {
    t=(y[i]-colmean)/(colrang); 
    n.push(t);
  }
  return n;
}


/*
http://stackoverflow.com/questions/11301438/return-index-of-greatest-value-in-an-array
*/

function _getMaxIndex(a) {
  var len=a.length;
  var _max=a[0];
  var _idx=1;
  for(var i=1; i<len; i++) {
    if(_max < a[i]) {
      _max=a[i];
      _idx=i;
    }
  }
  return _idx;
}
function _getMinIndex(a) {
  var len=a.length;
  var _min=a[0];
  var _idx=1;
  for(var i=1; i<len; i++) {
    if(_min > a[i]) {
      _min=a[i];
      _idx=i;
    }
  }
  return _idx;
}

function getIndexMinMax(a) {
//  var iOfMax = a.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
//  var iOfMin = a.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);
  var iOfMax = _getMaxIndex(a);
  var iOfMin = _getMinIndex(a);
  return [iOfMin, iOfMax];
}

