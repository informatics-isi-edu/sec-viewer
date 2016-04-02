#!/usr/bin/env python
##
##
## Given a path to original SEC data directory,
##   Iterate through all the subdirectory looking for dataSet.aia directory.
##   Iterate through all the subdirectory of datSet.aia for signalId.cdf
##   extract the ordinate_values within and generate a single JSON file
##   per dataSet for visualization purpose
##
## usage: ./processRawSEC.py dataDir outDir
##
##     will produce outdir/dataSet1.json
##                  ...
##     will produce outdir/dataSetN.json
##


import os
import sys
import pdb
import numpy as np
from netCDF4 import Dataset
from pylab import *
import json

def process_for_directory(dir) :
    onlyfiles = [f for f in os.listdir(dir) if os.path.isfile(os.path.join(dir, f))]
    v={}
    for file in onlyfiles:
        if file.endswith('.cdf'):
            targetfile = file[:-4]
            vlist=process_for_file(dir,file)
            v[targetfile] = vlist
        else:
            continue
    return v


def process_for_file(dir,file):
    inputgrp = Dataset(os.path.join(dir,file), 'r')

## <type 'netCDF4._netCDF4.Variable'>
    ordinate_values=inputgrp.variables['ordinate_values']
    cnt=len(ordinate_values)
## <type 'numpy.ndarray'>
    values=ordinate_values[:]

    vlist=values.tolist()
    return vlist
   
#    figure()
#    plot(values)
#    show()

    inputgrp.close()

################ MAIN #################################
if(len(sys.argv) < 3) :
  print "Usage: processRawSEC.py dataDir outDir"
  exit()

datadir=sys.argv[1]
outdir=sys.argv[2]

if not os.path.exists(datadir):
  exit()

if not os.path.exists(outdir):
  os.mkdir(outdir)

onlydirs = [d for d in os.listdir(datadir) if os.path.isdir(os.path.join(datadir, d))]

for dir in onlydirs:
    if dir.endswith('.aia'):
        targetdir = dir[:-4]
        target=os.path.join(outdir,targetdir)
        f = open(target+".json", 'w')
        v=process_for_directory(os.path.join(datadir,dir))
        f.write(json.dumps( { targetdir : v } ))
        f.close();
    else:
        continue

