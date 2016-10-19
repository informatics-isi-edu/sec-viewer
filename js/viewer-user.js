//
// sec-viewer/viewer-user.js
//
// This is very user/dataset specific information
// for, USC
/*

usc's signal2
GPCRUSC20161012EXP2_2 (MWD E  Sig= 280  Ref= 360) -- fluorescence

and

usc's signal1
GPCRUSC20161012EXP2_2 (MWD B  Sig= 280  Ref= off) -- absorbance

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
  var yes=dname.indexOf("MWD E");
  if(yes != -1)
    return 1;
    else return 0;
}

function isAbsorbance() {
  var dname=saveDetectorName;
  if(dname.length > 0) {
    alertify.error("PANIC, missing DetectorName");
  }
  var yes=key.indexOf("MWD B");
  if(yes > 0)
    return 1;
    else return 0;
}

function legendKey() {
  var name="Sample";
  if(isFluorescence()) {
    name=name+"_fluorescence";
    } else {
      name=name+"_absorbance";
  }
  return name;
}

// need to pick the target key
// in current particular case, it is the one that is not
// standard
function pickATarget(keys) {
  var i=keys.length;
  var s=saveStandard;
  if(i != 2) {
    alertify.error("PANIC, too many url");
  }
  if(s==0) i=1;
    else i=0; 
  return keys[i];
}

function plotTitle(keys) {
  var key=pickATarget(keys);
  var s = key.indexOf("_SIGNAL"); 

  var name=key.substring(0,s);
  name=name+ " (" +saveDetectorName+ ")";
  window.console.log(name)
  return name;
}

function plotYlabel(keys) {
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

var defaultDetectorNameSignal02="MWD E  Sig= 280  Ref= 360";
var defaultDetectorNameSignal01="MWD B  Sig= 280  Ref= off";

function setDefaultDetectorName(keys) {
  var key=pickATarget(keys);
  var s = key.indexOf("_SIGNAL02"); 
  if( s != -1 )
    return defaultDetectorNameSignal02;
    else return defaultDetectorNameSignal01;
}

