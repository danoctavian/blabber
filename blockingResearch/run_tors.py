import thread
import subprocess
import os
import re
#for x in range(0, 1):
#  subprocess.call(["python", "launch_tor.py", str(x * 2 + BASE_PORT), str(x * 2 + 1 + BASE_PORT)])

# assume Tor bundle dir dir structure and current dir is the root of it

TOR_COUNT = 1

dirs = os.listdir("./Data")
tor_dirs = filter(lambda d: re.match("Tor[0-9]", d) != None, dirs)
tor_dirs = tor_dirs[0:TOR_COUNT]
for tor_dir in tor_dirs:
  thread.start_new_thread(subprocess.call, (["tor", "-f", "Data/" + tor_dir + "/torrc"],))
#  subprocess.call(["tor", "-f", "Data/" + tor_dir + "/torrc"])

raw_input("press any key to kill\n")
