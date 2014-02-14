
/*
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});
*/

var searchEngines = (function() {
  var se = {}
  se.google = {url: "http://www.google.com", browserId: -1}
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
      tabWrappers.push({tab: tab, config: config})
      deferredTab.resolve(tab)
    })
    return deferredTab.promise()
  }

  chrome.tabs.onRemoved.addListener(function(tabId) {
    console.log("removed tab " + tabId)
    var wtab = _.find(tabWrappers, function(x) {return x.tab.id === tabId})
    if (wtab !== undefined) {
      wtab.tab = null // it's not there for the moment
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

  query.randWordsSlice = function(sentence) {
    var words = sentence.split(/\s+/)
    console.log(words)
    return _.sample(words, _.sample(_.range(1, 2 + words.length / 2)))
  }
  
  query.getQueryGen = function(feeds) {
    var all = _.reduce(feeds, function (x, y) {return x.concat(y)}, [])
    return function() {
      return query.randWordsSlice(_.sample(all))
    }
  }
  
  return query
}())

console.log("running background script ")

var se = searchEngines.google


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

  console.log(query.randWordsSlice("so fut pe matah"))
  return
/*
  permaTabs.makeTab({url: se.url}).then(function() {
    console.log("created tab")
  })
*/

  search.loadOptions()
  .then(function (options) {
    var urls = options.feeds
    return $.when.apply($, _.map(urls, function (url) { return feed.getFeed(url, 2)}))
  })
  .then(function() {
    var feeds = Array.prototype.slice.call(arguments)
    for (i in feeds) {
      debug.printFeed(feeds[i])
    }
  })
}

main()

/* 

  background tab activity
    load options
    load data seeds (rss feeds)
    load search tab
    send searches to do regularly (log them?)
*/


