var utils = require("utils")
var casper = require('casper').create({   
 //   verbose: true, 
 //   logLevel: 'debug',
    pageSettings: {
         loadImages:  false,         // The WebPage instance used by Casper will
         loadPlugins: false,         // use these settings
         userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.9 Safari/536.5"
    }
})

console.log("casper js running")

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
    this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
    this.echo("Page Error: " + msg, "ERROR");
});

var loginURL = 'https://accounts.google.com'
var searchURL = "https://www.google.com"

casper.start(loginURL, function() {
  email = casper.cli.args[0]
  pass = casper.cli.args[1]
  console.log("page loaded")
  this.fill('form#gaia_loginform', { Email: email, Passwd:  pass}, true)
});

casper.then(function() {
  console.log("after login")
  console.log(this.getCurrentUrl())
  failureText = "The email or password you entered is incorrect"
  failed = this.getPageContent().indexOf(failureText) !== -1
  console.log("page fail " + failed)
})

casper.thenOpen(searchURL, function() {
  console.log(this.getCurrentUrl())
})

casper.run(function() {
  console.log("running")
})

