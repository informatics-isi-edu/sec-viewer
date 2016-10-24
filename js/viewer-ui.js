//
// sec-viewer/viewer-ui.js
//
// A flag to track whether viewer is
// being used inside another window (i.e. Chaise), set enableEmbedded.

var enableEmbedded = false;
if (window.self !== window.top) {
  var $iframe_parent_div = window.frameElement ? $(window.frameElement.parentNode) : null;
  if (!$iframe_parent_div || !$iframe_parent_div.is(':visible')) enableEmbedded = true;
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
    setupStandardList(saveStandardIdx, saveStandardTrace);
 }
}

function setupStandardList(idx,keys) {
  var list = document.getElementById('standardList');
  if(list) {
    var _plist = '<option selected="selected" value="' + idx[0] + '">' + keys[0]  + '</option>';
    for(var i=1; i<keys.length; i++) {
      _plist += '<option value="' + idx[i] + '">' + keys[i] + '</option>';
    }
    list.innerHTML=_plist;
    $('#standardList').val(idx[0]).trigger('change');
  }  
}
