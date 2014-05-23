console.log("stats 2")



FEED_URL = "http://feeds.bbci.co.uk/news/rss.xml#"

reddit_url = "http://www.reddit.com/.rss"
var feedCount = 100

function getFeed(feedUrl, handleData) {
  $.ajax({
    url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=" + feedCount + "&callback=?&q=" + encodeURIComponent(feed_url),
    dataType : 'json',
    success  : function (data) {
      console.log("success")
      if (data.responseData.feed && data.responseData.feed.entries) {
        handleData(data.responseData.feed)
        $.each(data.responseData.feed.entries, function (i, e) {
          console.log("------------------------")
          console.log("title      : " + e.title)
          console.log("author     : " + e.author)
          console.log("description: " + e.description)
          console.log("content: " + e.content)
          console.log("link: " + e.link)
        })
      }
    }
  })
}
