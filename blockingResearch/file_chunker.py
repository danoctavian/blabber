#chunks file based on line count

import sys

fileName = sys.argv[1]
chunkCount = int(sys.argv[2])
outputDir = sys.argv[3]
chunk = 0
currentFile = open(outputDir + "/" + str(chunk), "w")

inputFile = open(fileName)
lines = inputFile.readlines()

lineCount = len(lines)
chunkSize = lineCount / chunkCount

i = 0
for line in lines:    
  if i / chunkSize != chunk and i /chunkSize < chunkCount:
    chunk = i / chunkSize  
    currentFile.close()
    currentFile = open(outputDir + "/" + str(chunk), "w")
  currentFile.write(line)
  i += 1

currentFile.close()

