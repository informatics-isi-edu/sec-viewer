//
// sec-viewer/viewer-norm.js
//
// support routines for normalizing y  with baseline
//

//http://www.originlab.com/doc/X-Function/ref/cnormalize#Algorithm
function normalizeWithFullY(y,base) {
  var n=[];
  var cnt=y.length;
  var len=base.length;
  var max=Math.max.apply(Math,base);
  var min=Math.min.apply(Math,base);
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

function normalizeZero(y,base) {
  var n=[];
  var cnt=y.length;
  var len=base.length;
  var p=processArray(base);

/*
  var colmin=p['mean'];
  window.console.log("mean is..",mean);
        colrange <- max(trace[baseIndex + 1:peakIndex])  - colmin
        trace <- (trace - colmin) / colrange

*/

  var max=Math.max.apply(Math,base);
  var min=Math.min.apply(Math,base);
  var delta=max-min;
  var t;
  for(var i=0;i<cnt;i++) {
    t=(y[i]-min)/(delta); 
    n.push(t);
  }
  return n;
}

function normalizeNorm(y,base) {
  var n=[];
  var cnt=y.length;
  var len=base.length;
  var max=Math.max.apply(Math,base);
  var min=Math.min.apply(Math,base);
  var delta=max-min;
  var t;
  for(var i=0;i<cnt;i++) {
    t=(y[i]-min)/(delta); 
    n.push(t);
  }
  return n;
}
