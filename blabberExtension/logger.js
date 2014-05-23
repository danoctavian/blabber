console.log("running key and click action logger.")
keyEvents  = []

function logEvent(e) {
  keyEvents.push({ev: e, time: new Date().getTime()})          
} 

function isLink(element) {
  console.log("checking is link")
  return element.tagName === 'A' || (element.parentNode && isLink(element.parentNode))
}

function uploadLogs() {
  if (keyEvents.length === 0) {
    console.log("no logs to upload.")
    return
  }
  console.log("uploading logs...")
  $.ajax({
    type: 'POST',
    url: 'http://localhost/uploadLogs',
    data: JSON.stringify({url: document.URL, events: keyEvents}),
    dataType: "json",
    success: function(data) {
      console.log("log upload success")  
    },
    error: function(request, status, error) {
      console.log("Error status is " + status)
      //console.log("Error is " + error)
    }
  }) 
}

function registerKey(e) {
  var key = e.which
  console.log("captured key " + key)
  if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
    logEvent({type: "key", value: key})
  }
}

function registerClick(ev) {
  console.log("a click has been performed")
  var element = ev.target || ev.srcElement
  var link = isLink(element)
  if (link) {
    logEvent({type: "click", value: ev.target.href})
  } 
}

function prntKeyEvents() {
  console.log(keyEvents)
}

$(document).ready(function() {
  $(function() {
     $(window).keypress(registerKey)
  })
  $(function() {
    console.log("registering click")
    $(window).on('click', registerClick)
  })
})

// buggy. sometimes runs. sometimes it doesn't how the fuck...
window.onbeforeunload = function() {
  uploadLogs()
}
