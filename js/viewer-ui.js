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
  var dataKeys=saveTrace;
  var bElm = document.getElementById('controlBlock');
  if(bElm) {
    setupCheckBtns(dataKeys);
  }
}

function setupCheckBtns(keys) {
  var list = document.getElementById('dataList');
  if(list == null)
    return;
  list.innerHTML = '';
  var outItem = '<div class="panel panel-default" style="width:35%">' +
                       '<div class="list-group">';
  for (var i = 0; i < keys.length; i++) {
// can not really trim the key anymore..
//    var oneItem = '<div class="list-group-item"><input type="checkbox" checked id="'+keys[i]+'" name="'+keys[i]+'" class="switch" onclick="toggleTrace('+i+')"/><label for="'+keys[i]+'">'+trimKey(keys[i])+'</label> </div>';
    var oneItem = '<div class="list-group-item"><input type="checkbox" checked id="'+keys[i]+'" name="'+keys[i]+'" class="switch" onclick="toggleTrace('+i+')"/><label for="'+keys[i]+'">'+keys[i]+'</label> </div>';
    outItem += oneItem;
  }
  outItem += '</div></div>';
  list.innerHTML += outItem;
}
