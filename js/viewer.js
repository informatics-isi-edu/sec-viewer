//
// sec-viewer
//
// Usage example:
//  http://localhost/sec-viewer/view.html?
//     http://localhost/data/SEC/IMPT6750_NTX_E2-3_020216-SIGNAL01.json
//
//  http://localhost/plotly/view.html?
//     url=http://localhost/data/plotly/IMPT6750_NTX_E1-1_020216-SIGNAL01.json&
//     url=http://localhost/data/plotly/IMPT6750_NTX_E2-3_020216-SIGNAL01.json&
//     url=http://localhost/data/plotly/IMPT6750_NTX_E2-4_020216-SIGNAL01.json&
//     regionStart=5&regionEnd=9&base=3&standard=1&
//     detectorName="MWD1 E,  Sig=280,4  Ref= 360,4"&
//     plotTitle="IMPT6750_NTX_E2"&
//     plotUnit=RFU 
//     urlLabel_2="sample0_UV"
//
// regionStart, regionEnd are in minutes
//   if there are more than one standard, then regionStart and regionEnd is
//   reset to span the whole time series
// base, standard is i_th url in the list (n-1)
// for the example, the default region segment is from minute-5 to minute-9
//                  base is signal03 and standardline is signal01  
//                  default is 0 for standard and also for base unless specified
//      if there is a supplied baseline, then smoothing is by the line
//         or else smoothing is by the min of each trace within the 'region'
// there could be one or more standard
//                 


// GLOBAL tracking
var SINGLE_BLOB=true;
var saveBigBlob=null;
var showNormalize=false;
var smoothBase=false; // reduce the noise
var saveBlob=null;
var saveFirst=false;
var saveURLs=[];
var saveRegionStart=-1;
var saveRegionEnd=-1;
var saveDetectorName=null;
var savePlotUnit=null;
var savePlotTitle=null;

// this is minmax normalization
function toggleNormalize() {
  if(!showNormalize) {
    if(smoothBase) {
      toggleBase();
    }
    document.getElementById('resetBtn').style.display='';
    } else {
      document.getElementById('resetBtn').style.display='none';
  }
  showNormalize = ! showNormalize;
  updateNormalizedLineChart();
}
  
// normalize to the base signal
function toggleBase() {
  if(!smoothBase) {
    if(showNormalize) {
      toggleNormalize();
    }
  }
  smoothBase = ! smoothBase;
  updateWithBaseLineChart();
}

function minmaxAgain() {
  updateNormalizedLineChart();

}

function resetSlider() {
  resetSliderPlot();
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
// to handle, detectorName="MWD1 E,  Sig=280,4  Ref= 360,4"
        kvp[1]=param.split('=').slice(1).join('=');
        switch (kvp[0].trim()) {
          case 'url':
             {
             url=kvp[1].replace(new RegExp('/$'),'').trim();
             saveURLs.push(url);
             rc++;
             break;
             }
          case 'regionStart':
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               saveRegionStart=t;
             break;
             }
          case 'regionEnd':
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               saveRegionEnd=t;
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
             if(!isNaN(t) && t > 0) {
               saveStandardIdx.push(t-1);
             }
             break;
             }
          case 'detectorName':
             {
// trim " from the head and tail
             var str=kvp[1];
             if( (str[0] == "\"" && str[ str.length-1 ] == "\"")
               || (str[0] == "\'" && str[ str.length-1 ] == "\'"))
               str=str.substr(1,str.length-2);
             saveDetectorName=str;
             break;
             }
          case 'plotTitle':
             {
// trim " from the head and tail
             var str=kvp[1];
             if( (str[0] == "\"" && str[ str.length-1 ] == "\"")
               || (str[0] == "\'" && str[ str.length-1 ] == "\'"))
               str=str.substr(1,str.length-2);
             savePlotTitle=str;
             break;
             }
          case 'plotUnit':
             {
// trim " from the head and tail
             var str=kvp[1];
             if( (str[0] == "\"" && str[ str.length-1 ] == "\"")
               || (str[0] == "\'" && str[ str.length-1 ] == "\'"))
               str=str.substr(1,str.length-2);
             savePlotUnit=str;
             break;
             }
          case 'urlLabel':
          default:
             {
             var _utype=kvp[0].trim();
             var str=kvp[1];
// special handling for urlLabel_N
             if( (str[0] == "\"" && str[ str.length-1 ] == "\"")
               || (str[0] == "\'" && str[ str.length-1 ] == "\'"))
               str=str.substr(1,str.length-2);

             if(_utype.indexOf('urlLabel_')==0) {
               saveUrlLabel(_utype, str);
               } else {
                 alertify.error("Error: Unable to handle param type, "+_utype);
             }
             break;
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

$('#standardList').select2({theme:"classic"});
$('#standardList').select2({dropdownAutoWidth : true});

$('#normalizationList').select2({theme:"classic"});
$('#normalizationList').select2({dropdownAutoWidth : true});

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

  $('#normalizationList').change(function() {
    var ntype = document.getElementById("normalizationList").value;
    var itype=parseInt(ntype);
    switch(itype) {
      case NORM_NONE: {
                      if(showNormalize)
                        toggleNormalize();
                      if(smoothBase)
                        toggleBase();
                      break;
                      }
      case NORM_MINMAX: {          
                        toggleNormalize();
                        break;
                        }
      case NORM_ZERO: {
                      toggleBase(); 
                      break;
                      }
      default: { }
   }
  });

  $('#standardList').change(function() {
    var standard = document.getElementById("standardList").value;
//window.console.log("TOGGLE.. standard to ", standard);
    saveStandard=standard;
    updateEverything();
  });


$('#mySliderViewer').on('plotly_relayout', function(event, arguments){
  var _arg=arguments;
  var _keys = Object.keys(_arg);
  var _str=_keys[0];
window.console.log("mySliderViewer, relayout for ..",_str);
  if( _str == "xaxis.range") {
    if(showNormalize) {
      minmaxAgain();
    }
  }
});

  if(!enableEmbedded) {
    displayInitPlot();
  }
})

