console.log("searcher script running now")

var queryWriter = (function () {
  var queryWriter = {}
  queryWriter.writeQuery = function (query, searchBoxName) {
        
    var searchBox = document.getElementById(searchBoxName)
    searchBox.value = query
    console.log("filled query filed")

   $("#gbqfq").click()
   setTimeout(function() {
     console.log("clicked search")
     $("#gbqfb").click()
      e = jQuery.Event("keypress")
      console.log(jQuery)
      e.which = 13 //choose the one you want
      $("#" + searchBoxName).trigger(e)
    }, 1000)
  }
    
  return queryWriter    
}())

$( document ).ready(function () {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
    console.log(request)
    queryWriter.writeQuery(request.query, "gbqfq")
    sendResponse("done")
  })
})




