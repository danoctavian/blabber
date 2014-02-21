
/*
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});
*/

var searchEngines = (function() {
  var se = {}

  // TODO: find better url. this sends you straight to the search menu which is good
  //  but it's fixed
  se.google = {url: "http://www.google.com/search?hl=en&q=|", browserId: -1}
  return se
}())

var search = (function () {
  var search = {}

  search.defaultOptions =
   { searchFreq: 20 /* per minute */
   , feeds: ["http://www.reddit.com/.rss" ,"http://feeds.bbci.co.uk/news/rss.xml#"]
   }

  search.loadOptions = function() {
    var defOps = $.Deferred()
    //TODO: load options from google cache
    defOps.resolve(search.defaultOptions) // TODO: add option fields
    console.log(search.defaultOptions)
    return defOps.promise()
  }

  search.run = function() {
  }

  return search 
}())

/* tabs that keep reopening
   tabWrapper = {tab, config} - tab may be null for
    while when the tab is closed until reopened
*/
var permaTabs = (function() { 
  var permaTabs = {}
  var tabWrappers = []

  permaTabs.makeTab = function(config) {
    var deferredTab = $.Deferred()
    chrome.tabs.create(config,function(tab) {
      var newTab = {tab: tab, config: config}
      tabWrappers.push(newTab)
      deferredTab.resolve(newTab)
    })
    return deferredTab.promise()
  }

  chrome.tabs.onRemoved.addListener(function(tabId) {
    console.log("removed tab " + tabId)
    var wtab = _.find(tabWrappers, function(x) {return x.tab.id === tabId})
    if (wtab !== undefined) { wtab.tab = null // it's not there for the moment
      permaTabs.makeTab(wtab.config).then(function(tab) {
        wtab.tab = tab
      })
    }
  }) 
 
  permaTabs.removeTab = function(tabId) {
    var wrapper = _.find(tabWrappers, function(x) {return x.tab.id === tabId})
    if (wrapper !== undefined) {
      chrome.tabs.remove(tabId)
    }
  }

  return permaTabs
}())

var feed = (function() {
  var feedCollector = {}   

  feedCollector.getFeed = function(url, entryCount, callback) {
    var def = $.Deferred()
    $.ajax({
      url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=" + entryCount + "&callback=?&q=" + encodeURIComponent(url),
      dataType : 'json',
      success  : function (data) {
        if (data.responseData.feed && data.responseData.feed.entries) {
          console.log("successully collected feed " + url)
          def.resolve(data.responseData.feed)
          //callback(data.responseData.feed)
        }
      }
    })

    return def.promise()
  }
  return feedCollector
}())

var query = (function () {
  query = {}

  // TODO: needs better implementation; more sensical searches

  query.randWordsSlice = function(sentence) {
    var words = sentence.split(/\s+/)
//    console.log(words)
    return _.sample(words, _.sample(_.range(1, 2 + words.length / 2))).join(" ")
  }
  
  query.getQueryGen = function(feeds) {
    var all = _.reduce(_.pluck(feeds, 'entries'), function (x, y) {return x.concat(y)}, [])
    return function() {
      return query.randWordsSlice(_.sample(all).title)
    }
  }

  query.sendQueries = function(permaTab, getQuery) {

    function getQueryTime() { // millis
      // TODO; add randomness and per unit of time rate in options
      return 5000 + (Math.random() - 0.5) * 2000
    }

    function sendQuery() {
      if (permaTab.tab !== null) { // is currently available
        var q = getQuery()
        console.log("sending query: " + q + " to tab " + permaTab.tab.id)                 
        
        chrome.tabs.sendMessage(permaTab.tab.id, {query: q}, function(response) {
          console.log("sent query and got " + response)
          setTimeout(sendQuery, getQueryTime())
        })
      }
    }
    sendQuery()
  }
  
  return query
}())


/* DEBUG functions */
var debug = (function() {
  var debug = {}
  debug.printFeed = function(feed) {
    _.each(feed.entries, function(e, i) {
      console.log("------------------------")
      console.log("title      : " + e.title)
      console.log("author     : " + e.author)
      console.log("description: " + e.description)
  //    console.log("content: " + e.content)
      console.log("link: " + e.link)
    })
  } 
  return debug
}())


function main() {

  console.log("running background script ")

  var se = searchEngines.google

  var getQuery 
  var queryTab
  search.loadOptions()
  .then(function (options) {
    var urls = options.feeds
    return $.when.apply($, _.map(urls, function (url) { return feed.getFeed(url, 100)}))
  })
  .then(function() {
    var feeds = Array.prototype.slice.call(arguments)
    for (i in feeds) {
      debug.printFeed(feeds[i])
    }
    getQuery = query.getQueryGen(feeds)    
    return permaTabs.makeTab({url: se.url})
  })
  .then(function(permaTab) {
    queryTab = permaTab        
    // schedule regular queries
    query.sendQueries(permaTab, getQuery)        
  })
}

main()


