import StringIO
import socket
import urllib
import datetime
import sys
import thread
import time

import socks  # SocksiPy module
import stem.process

from stem.util import term
from urllib import FancyURLopener

# args
SOCKS_PORT = int(sys.argv[1])
inputFile = sys.argv[2]
outputDir = sys.argv[3]
crawlerIndex = int(sys.argv[4])

logFile = open("logs/" + str(crawlerIndex), "w")

def log(msg):
  logEntry = str(datetime.datetime.now()) + ": " + msg + "\n"
  print logEntry
  logFile.write(logEntry)  

user_agents = [
    'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12',
    'Mozilla/5.0 (Windows; U; Windows NT 5.1; it; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11',
    'Opera/9.25 (Windows NT 5.1; U; en)',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)',
    'Mozilla/5.0 (compatible; Konqueror/3.5; Linux) KHTML/3.5.5 (like Gecko) (Kubuntu)',
    'Lynx/2.8.5rel.1 libwww-FM/2.14 SSL-MM/1.4.1 GNUTLS/1.2.9'
]

link = "https://www.google.com/search?q=related%3Ahttp%3A%2F%2Fwww.yahoo.com%2F"
myip = "https://duckduckgo.com/?q=what+is+my+ip&t=canonical" 

class CustomURLOpener(FancyURLopener, object):
    version = user_agents[1]

#myopener.retrieve(link, 'goog.html')


def currentMillis():
  now = datetime.datetime.now()
  timestamp=round(float(now.strftime('%s.%f')),3)
  return timestamp

def measureTime(func, args):
  before = currentMillis()
  func(*args)
  return currentMillis() - before

def query(url):
  """
  Uses urllib to fetch a site using SocksiPy for Tor over the SOCKS_PORT.
  """

  try:
    return urllib.urlopen(url).read()
  except:
    return "Unable to reach %s" % url

directTime =  measureTime(query, ["http://google.com"])
#sys.exit()

# Set socks proxy and wrap the urllib module

socks.setdefaultproxy(socks.PROXY_TYPE_SOCKS5, '127.0.0.1', SOCKS_PORT)
socket.socket = socks.socksocket

# Perform DNS resolution through the socket

def getaddrinfo(*args):
  return [(socket.AF_INET, socket.SOCK_STREAM, 6, '', (args[0], args[1]))]

socket.getaddrinfo = getaddrinfo

googleUrl = "http://google.com"
bingUrl = "http://bing.com"

#print(query())

def doQuery(url):
  print(query(url))

#thread.start_new_thread(doQuery, (googleUrl,))
#thread.start_new_thread(doQuery, (bingUrl,))

# magical sample
googleDetectMsg1 = "may be sending automated queries" 
googleDetectMsg2 = "unusual traffic from your computer network"

def getRelatedQuery(url):
  return "https://www.google.com/search?q=related:" + url

opener = CustomURLOpener()

def isGoogleDetectionPage(f):
  page = open(f).read()
  return googleDetectMsg2 in page or googleDetectMsg1 in page

def queryURL(url):
  try:
    log("processing url: " + str(i) + " " + url)
    outputFile = outputDir + "/" + str(hash(url)) #+ url.replace("/", "|")
    opener.retrieve(getRelatedQuery(url), outputFile)
    if isGoogleDetectionPage(outputFile):
      log("ERROR: got crawl detected at url " + url)
  except:
    e = sys.exc_info()[0] 
    log("ERROR: exception occured! " + str(e) + " on url "  + url)

#thread.start_new_thread(queryURL, ("http://yahoo.com",))
#thread.start_new_thread(queryURL, ("http://bing.com",))

#time.sleep(60)

#print isGoogleDetectionPage("/home/dan/repos/page-similarity/data/SHIT")
#sys.exit()
i = 0
with open(inputFile) as f:
    for line in f:
      i += 1
      url = line.split()[0]
      queryURL(url)
