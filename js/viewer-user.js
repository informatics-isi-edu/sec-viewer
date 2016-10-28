//
// sec-viewer/viewer-user.js
//
// This is very user/dataset specific information
// for, USC
/*
usc's signal2
GPCRUSC20161012EXP2_2 (MWD1 E  Sig= 280  Ref= 360) -- absorbance
and
usc's signal1
GPCRUSC20161012EXP2_2 (MWD1 B  Sig= 280  Ref= off) -- absorbance
 and the legend is     Sample_absorbance
         and           Sample_absorbance
 and the legend is     Standard
    for the standard trace
and the y label is mAu for absorbance
            and    RFU for fluorescence
with (Normalized) attached if it got normalized..
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
  if(dname==null) {
    window.console.log("WARN, missing DetectorName");
    return 0;
  }
  var yes=dname.indexOf("FLD");
  if(yes != -1)
    return 1;
    else return 0;
}

function isAbsorbance() {
  var dname=saveDetectorName;
  if(dname==null) {
    window.console.log("WARN, missing DetectorName");
    return 0;
  }
  var yes=dname.indexOf("MWD");
  if(yes > 0)
    return 1;
    else return 0;
}

function legendKey(trace,dataIdx) {
  var v=saveYLabel[dataIdx];
  if (v != undefined) {
    window.console.log(v);
    return v;
  }
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
  if(savePlotTitle) {
    return savePlotTitle;
  }
  var key=pickATarget();
  var name=key;
  var j = name.indexOf(".json");
  if( j != -1) {
    name=name.substring(0,j);
  }
  var s = name.indexOf("_SIGNAL"); 
  if(s != -1) {
    name=name.substring(0,s);
  }
  name=name+ " (" +saveDetectorName+ ")";
window.console.log(name);
  return name;
}

function plotYlabel() {
  if(savePlotUnit) {
    return savePlotUnit;
  }
  var ylabel;
  if(isFluorescence()) {
    ylabel="RFU";
    } else {
      ylabel="mAU";
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

