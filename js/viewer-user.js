//
// sec-viewer/viewer-user.js
//
// This is very user/dataset specific information
// for, USC
/*

usc's signal2
GPCRUSC20161012EXP2_2 (MWD1 E  Sig= 280  Ref= 360) -- fluorescence

and

usc's signal1
GPCRUSC20161012EXP2_2 (MWD1 B  Sig= 280  Ref= off) -- absorbance

 and the legend is     Sample_fluorescence
         and           Sample_absorbance
 
 and the legend is     Standard
for the standard trace

and the y label is mAu for absorbance
            and    RFU for fluorescence

with (Normalized) attached if it got normalized..
-----

Top Plot:
title:  Sample SEC data
y-axis:  mAu —> if signal 1
y-axis: RFU —> if signal 2
y-axis:  Normalized signal —> if min/max normalization employed (true for both signals)
Middle Plot:
I don’t think we need it
bottom plot:
Increase size of Y (double) and use to define range.  no title necessary
minimax —> Normalize Y
baseline —> Zero Y
Legend:
Change sample trace (red) to Sample_(sample#) UV (or fluorescence depending on signal)
Change standard trace (black dash) to Standard_concentration  UV (or fluorescence depending on signal)
*/

// shortname to be use to display on the plot and on select
//IMPT6620_NTX_E2-3_012216-SIGNAL01
//^^^^^^^^^^^^^^^^^ sample name
function trimKey(key) {
window.console.log(key);
var one = key.indexOf("_SIGNAL01"); 
var two = key.indexOf("_SIGNAL02"); 
var s = key.indexOf("_SIGNAL"); 

var name=key.substring(0,s);
window.console.log(name)
return name;
}

function isFluorescence() {
  var dname=saveDetectorName;
  if(dname.length==0) {
    alertify.error("PANIC, missing DetectorName");
  }
  var yes=dname.indexOf("MWD1 E");
  if(yes != -1)
    return 1;
    else return 0;
}

function isAbsorbance() {
  var dname=saveDetectorName;
  if(dname.length > 0) {
    alertify.error("PANIC, missing DetectorName");
  }
  var yes=key.indexOf("MWD1 B");
  if(yes > 0)
    return 1;
    else return 0;
}

function legendKey(trace,dataIdx) {
  var name="Sample";
  if(isFluorescence()) {
    if(dataIdx != -1) name=name+dataIdx+"_fluorescence";
      else name=name+"_fluorescence";
    } else {
      if(dataIdx != -1) name=name+dataIdx+"_absorbance";
      else name=name+"_absorbance";
  }
  return name;
}

// always pick the one that is not base
// saveDataTrace --> could be a signal or the baseline trace
function pickATarget() {
  var _idx=saveDataIdx;
  var _keys=saveDataTrace;
  for(var i=0; i< _idx.length; i++) {
    if(_idx[i] != saveBaseIdx) {
window.console.log("pickATarget..", _keys[i]);
       return _keys[i];
    }
  }
  alertify.error("PANIC, missing Target trace");
  
}

// test1.json
function plotTitle() {
  var key=pickATarget();
  var s = key.indexOf("_SIGNAL"); 
  var j = key.indexOf(".json");
  var name=key;
  if( j != -1) {
    name=name.substring(0,s);
  }
  if(s != -1) {
    name=name.substring(0,s);
  }
  name=name+ " (" +saveDetectorName+ ")";
  window.console.log(name);
  return name;
}

function plotYlabel() {
  var ylabel;
  if(isFluorescence()) {
    ylabel="mAu";
    } else {
      ylabel="RFU";
  }
  return ylabel;
}

// return matching time key to the signal channel key
//IMPT6620_NTX_E2-3_012216-SIGNAL01
//return IMPT6620_NTX_E2-3_012216-SIGNAL01_time
function makeTimeKey(key) {
  return key+"_time";
}

//"detector_name": "MWD1 B, Sig=280,4 Ref=off"
//"detector_name": "MWD1 E, Sig=280,4 Ref=360,4"
var defaultDetectorNameSignal02="MWD1 E,  Sig=280,4  Ref= 360,4";
var defaultDetectorNameSignal01="MWD1 B, Sig=280,4  Ref= off";

function setDefaultDetectorName() {
  var key=pickATarget();
  var s = key.indexOf("_SIGNAL02"); 
  if( s != -1 )
    return defaultDetectorNameSignal02;
    else return defaultDetectorNameSignal01;
}

