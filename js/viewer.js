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
//     baseline=0
//


// GLOBAL tracking
var SINGLE_BLOB=true;
var saveBigBlob=null;
var showNormalize=false;
var saveBaseline=0;
var saveBlob=null;
var saveFirst=false;
var saveURLs=[];

// initial setup on the plot
var init_baseline=saveBaseline;

function toggleNormalize() {
  showNormalize = ! showNormalize;
  var tog = document.getElementById('normalizeBtn');
  if(showNormalize) {
    tog.style.color='red';
    } else {
      tog.style.color='white';
  }
  updateNormalizedLineChart();
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
          case 'baseline':
             {
             var t=parseInt(kvp[1]);
             if(!isNaN(t))
               init_baseline=t;
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

  // defaults from viewer-user.js
  init_baseline=saveBaseline;

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
