import StringIO
import socket
import urllib
import socks  # SocksiPy module
import stem.process
import sys
import time
from stem.util import term
import thread

print sys.argv

 
def print_bootstrap_lines(line):
  if "Bootstrapped " in line:
    print term.format(line, term.Color.BLUE)
def launch_tor_proc(socksPort, controlPort):
  tor_process = stem.process.launch_tor_with_config(
    config = {
      'SocksPort': str(socksPort),
      'ControlPort': str(controlPort),
    },
    init_msg_handler = print_bootstrap_lines,
  )
  return tor_process


def launch_proc(socks, control):
  tor_process = launch_tor_proc(socks, control) 
  raw_input("enter to close\n")
#  tor_process.kill()  # stops tor

launch_proc(int(sys.argv[1]), int(sys.argv[2]))

#time.sleep(180)
