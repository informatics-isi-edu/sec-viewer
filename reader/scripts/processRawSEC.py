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

## list to dictionary
def list2dictionary(list):
    blist = {i: list[i] for i in range(0, len(list))}
    return blist

def process_for_directory(dir) :
    onlyfiles = [f for f in os.listdir(dir) if os.path.isfile(os.path.join(dir, f))]
    firsttime=True
    jlist={}
    for file in onlyfiles:
        if file.endswith('.cdf'):
            targetfile = file[:-4]
            tlist,vlist=process_for_file(firsttime, dir,file)
            slist=list2dictionary(vlist)
            key= generate_dataset_name(dir,targetfile)
            jlist[key]=slist
            if(firsttime) :
               jlist['time']=tlist
               firsttime=False
        else:
            continue
    return jlist

## generate a range of cnt items in minutes
def generate_x_array(type,interval,cnt): 
    if type.find("seconds") != -1 :
      step=(interval/60)
    else:
      step=interval
    lastOne=round(step*(cnt-1))
    xRange=np.arange(0, lastOne, step)
    xlist=xRange.tolist()
    xxlist=list2dictionary(xlist)
    return xxlist

## the aia file could be a complete name like
## IMPT6749_NTX_E2-3_012216-SIGNAL01.cdf
## or it could be 
## KOR_construct_screening/IMPT4825_NTX_E2-3_020216.aia/SIGNAL01.cdf
def generate_dataset_name(dir,fname):
    if fname.find("SIGNAL") == 0 :
      stub=os.path.basename(dir)
      return stub+"-"+fname
    else:
      return fname

def process_for_file(yes, dir,file):
    inputgrp = Dataset(os.path.join(dir,file), 'r')
#    print inputgrp.variables.keys

## <type 'netCDF4._netCDF4.Variable'>
### extract variables
    actual_sampling_interval=inputgrp.variables['actual_sampling_interval'].getValue()
#    print "actual_sampling_interval ",actual_sampling_interval
    ordinate_values=inputgrp.variables['ordinate_values']
    cnt=len(ordinate_values)
#    print "ordinate_values length cnt ",cnt
    retention_unit=getattr(inputgrp,'retention_unit')
#    print "retention_unit ",retention_unit

    sample_name= getattr(inputgrp,'sample_name')
#    print "sample_name ",sample_name
    detector_unit=getattr(inputgrp,'detector_unit')
#    print "detector_unit ",detector_unit
    detector_name=getattr(inputgrp,'detector_name')
#    print "detector_name ",detector_name
    injection_date_time_stamp=getattr(inputgrp,'injection_date_time_stamp')
#    print "injection_date_time_stamp ",injection_date_time_stamp
    detection_method_name=getattr(inputgrp,'detection_method_name')
#    print "detection_method_name ",detection_method_name
    if yes:
      xlist=generate_x_array(retention_unit,actual_sampling_interval,cnt) 
    else:
      xlist=None
    
## <type 'numpy.ndarray'>
    values=ordinate_values[:]
    vlist=values.tolist()

    inputgrp.close()

#    figure()
#    plot(values)
#    show()

    return xlist,vlist
   

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
        jlist=process_for_directory(os.path.join(datadir,dir))
        f.write(json.dumps(jlist))
        f.close();
    else:
        continue

