import sys
import os
import subprocess

config_dir = sys.argv[1]
config_count = int(sys.argv[2])
start_port = int(sys.argv[3])

os.chdir(config_dir)
# assume a Model model dir in config_dir
model = "Model"
# slurp torrc file
torrc = open(model + "/torrc").read()

for i in range(0, config_count):
  socks_port = start_port + 2 * i
  tor_dir = "Tor" + str(socks_port)
  subprocess.call(["cp", "-r", "Model", tor_dir])
  new_torrc = "DataDirectory " + os.path.abspath(tor_dir) + "\nSocksPort " + str(socks_port) + "\nControlPort " + str(socks_port + 1)

  with open(tor_dir + "/torrc", "a") as myfile:
    myfile.write(new_torrc)

