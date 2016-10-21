//
// sec-viewer/viewer-ui.js
//
// A flag to track whether viewer is
// being used inside another window (i.e. Chaise), set enableEmbedded.

var enableEmbedded = false;
if (window.self !== window.top) {
    enableEmbedded = true;
}

function getKeys(blob) {
  var _keys = Object.keys(blob);
  var newkeys=[];
  for(var i=0; i<_keys.length;i++) {
    if( _keys[i].substr(-5) != "_time" ) {
      newkeys.push(_keys[i]);
    }
  }
  return newkeys;
}

function setupUI() {
  var bElm = document.getElementById('controlBlock');
  if(bElm) {
    var dataKeys=saveTrace;
    var list = document.getElementById('dataList');
    if(list) {
       var _plist=setupCheckBtns(dataKeys);
       list.innerHTML = _plist;
       
    }
    var standardKeys=[];
    for(var i=0; i< saveStandard.length; i++) {
       var k=saveStandard[i];
       standardKeys.push(saveTrace[i]);
    }
    list = document.getElementById('standardList');
    if(list) {
       var _plist=setupCheckBtns(standardKeys);
       list.innerHTML = _plist;
    }
 }
}

function setupCheckBtns(keys) {
  var _plist = '<option selected="selected" value="' + keys[0] + '">' + keys[0] + '</option>';
  for(var i=1; i<keys.length; i++) {
      _plist += '<option value="' + keys[i] + '">' + keys[i] + '</option>';
  }
  return _plist;
}
