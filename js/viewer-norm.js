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

