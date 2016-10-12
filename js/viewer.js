//
// sec-viewer
//
// Usage example:
//  http://localhost/sec-viewer/view.html?
//     http://localhost/data/SEC/IMPT6750_NTX_E2-3_020216-SIGNAL01.json
//
//  http://localhost/plotly/view.html?
//     url=http://localhost/data/plotly/IMPT6750_NTX_E2-3_020216-SIGNAL01.json&
//     url=http://localhost/data/plotly/IMPT6750_NTX_E2-3_020216-SIGNAL02.json&
//     url=http://localhost/data/plotly/IMPT6750_NTX_E2-3_020216-SIGNAL03.json&
//     baseStart=5&baseEnd=9&base=3&standard=1
//
// basestart, baseend is in in minutes
// baseline, standard is i_th url in the list (n-1)
// for the example, the default base segment is from minute-5 to minute-9
//                  baseline is signal03 and standardline is signal01  
//                  default is 0 is standardline, and 1 is baseline but if
//                  assigned with -1, then that means it is missing in the set
//                 


// GLOBAL tracking
var SINGLE_BLOB=true;
var saveBigBlob=null;
var showNormalize=false;
var smoothBaseline=false;
var saveBlob=null;
var saveFirst=false;
var saveURLs=[];
var saveBaseStart=-1;
var saveBaseEnd=-1;


// this is minmax normalization
function toggleNormalize() {
  showNormalize = ! showNormalize;
  var nBtn = document.getElementById('normalizeBtn');
  var bBtn = document.getElementById('baselineBtn');
  if(showNormalize) {
    bBtn.disabled=true;
    document.getElementById('resetBtn').disabled=false;
    document.getElementById('againBtn').disabled=false;
    nBtn.style.color='red';
    } else {
      bBtn.disabled=false;
      nBtn.style.color='white';
  }
  updateNormalizedLineChart();
}

// normalize to the baseline signal
function toggleBaseline() {
  smoothBaseline = ! smoothBaseline;
  var bBtn = document.getElementById('baselineBtn');
  var nBtn = document.getElementById('normalizeBtn');
  if(smoothBaseline) {
      nBtn.disabled=true;
      bBtn.style.color='red';
    } else {
      nBtn.disabled=false;
      bBtn.style.color='white';
  }
  updateWithBaselineLineChart();
}

function minmaxAgain() {
  updateNormalizedLineChart();
}

function resetSlider() {
  resetSliderPlot();
  updateNormalizedLineChart();
//  toggleNormalize();
}


function processArgs(args) {
  var params = args[1].split('&');
  var rc=0;
  for (var i=0; i < params.length; i++) {
    var param = unescape(params[i]);
    if (param.indexOf('=') == -1) {
      url=param.replace(new RegExp('/$'),'').trim();
      saveURLs.push(url);
      rc++;
      } else {
        var kvp = param.split('=');
        switch (kvp[0].trim()) {
          case 'url':
             {
             url=kvp[1].replace(new RegExp('/$'),'').trim();
             saveURLs.push(url);
             rc++;
             break;
             }
          case 'baseStart':
             {
             var t=parseInt(kvp[1]);
             if(!isNaN(t))
               saveBaseStart=t;
             break;
             }
          case 'baseEnd':
             {
             var t=parseInt(kvp[1]);
             if(!isNaN(t))
               saveBaseEnd=t;
             break;
             }
          case 'base':
             {
             var t=parseInt(kvp[1]);
             if(!isNaN(t))
               saveBase=(t==-1)?t:t-1;
             break;
             }
          case 'standard':
             {
             var t=parseInt(kvp[1]);
             if(!isNaN(t)) {
               saveStandard=(t==-1)?t:t-1;
             }
             break;
             }
          default:
             {
             var _utype=kvp[0].trim();
             alertify.error("Error: Unable to handle param type, "+_utype);
             }
       }
    }
  }
  return rc;
}


// should be a very small file and used for testing and so can ignore
// >>Synchronous XMLHttpRequest on the main thread is deprecated
// >>because of its detrimental effects to the end user's experience.
function ckExist(url) {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState == 4) {
 // okay
    }
  }
  http.open("GET", url, false);
  http.send();
  if(http.status !== 404) {
    return http.responseText;
    } else {
      return null;
  }
};

// directly from SEC cdf signal files
function loadBlobFromJsonFile(fname) {
  var tmp=ckExist(fname);
  var blob=(JSON.parse(tmp));
  return blob;
}

// initial plot to display
function reset2InitPlot() {
//XXX  do some resetting
  displayInitPlot();
}

// under chaise/angular, the plot window has
// width/height=0 when accordian-group is-open=false
window.onresize=function() {
   if(enableEmbedded) {
     if(saveFirst) {
       reset2InitPlot();
       saveFirst=false;
     }
   }
}
// initial plot to display
function displayInitPlot() {
   addLineChart();
}

/*****MAIN*****/
jQuery(document).ready(function() {

  var args=document.location.href.split('?');
  if (args.length ==2) {
    var cnt=processArgs(args);

    for(var i=0; i<cnt; i++) {
      var blob=loadBlobFromJsonFile(saveURLs[i]);
      if(!blob) {
        window.console.log("ERROR, can not access ",saveURLs[i]);
        continue;
      }
      if(SINGLE_BLOB) {
        if(saveBigBlob) {
          var _keys = Object.keys(blob);
          for(var j=0; j<_keys.length;j++) {
             var p=blob[_keys[j]];
             saveBigBlob[_keys[j]]=p;
          }
        } else saveBigBlob=blob;
        } else {
          processForPlotting(blob);
      }
    }
    if(SINGLE_BLOB && saveBigBlob) {
      processForPlotting(saveBigBlob);
    }
    setupUI();
    } else {
      alertify.error("Usage: view.html?http://datapath/data.json");
      return;
  }

  if(!enableEmbedded) {
    displayInitPlot();
  }
})



/************** standalone test control ***********************/
function saveSEC(fname) {
}

function loadSEC(fname) {
}

var isDummy=true;
function dummyClick() {
   isDummy = !isDummy;
   var dtog = document.getElementById('dummy-toggle');
   if(isDummy) {
      dtog.style.color='blue';
      } else {
        dtog.style.color='black';
   }
}
