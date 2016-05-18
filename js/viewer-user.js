//
// sec-viewer/viewer-user.js
//
// This is very user/dataset specific information
// for, USC

// shortname to be use to display on the plot and on select
//IMPT6620_NTX_E2-3_012216-SIGNAL01
//^^^^^^^^^^^^^^^^^ sample name
function trimKey(key) {
var s = key.indexOf("_NTX_");
var e = key.indexOf("-SIGNAL"); 
if(s > 0 && e > 0)
   return key.substring(0,s)+key.substring(e);
return key;
}

// return matching time key to the signal channel key
//IMPT6620_NTX_E2-3_012216-SIGNAL01
//return IMPT6620_NTX_E2-3_012216-SIGNAL01_time
function makeTimeKey(key) {
  return key+"_time";
}

