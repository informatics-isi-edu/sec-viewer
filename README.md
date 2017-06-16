# sec-viewer

Plotly based viewer for SEC dataset (converted from cdf) in json

## Overview

sec-viewer takes one or more json files as a input and additional parameters and creates a view of two interactive plots using plot.ly JavaScript line plotting routines. The main line plot composes of traces from the data extracted and processed from each datafile, the second slider line plot with rangeselector is made from the data from the designated standard datafile

## Download and Run

You can clone the source repository with Git by running:

  git clone https://github.com/informatics-isi-edu/sec-viewer.git

and invoke the viewer as in **Examples**

## File Formats

The viewer assumes a json file format.  

## Region Start and Region End

Initial marking of a region used for normalization. This is highlighted in the slider plot

## Base and Standard

Default for Base line is 0. If a baseline (noise) supplied, then the smoothing is done with the baseline on all other data traces 

Default for Standard line is 0 unless specified.  

## Invoking sec-viewer

Parameters are optional and  may be passed to sec-viewer as 
URL query parameters.  

| Parameter | Value | Description |
| --- | --- | --- |
| **url** | URL | one or more URLs of the JSON datafiles to be used for each trace |
| **regionStart** | float | in minutes, the start of the region |
| **regionEnd** | float | in minutes, the end of the region |
| **base** | int | to indicate with url is the baseline(start with 1) |
| **standard** | int | to indicate which url is the standard(starting with 1) |
| **detectorName** | chars | name of the detector |
| **plotTitle** | chars | title of the plot |
| **plotUnit** | chars | unit of plot's y axis |
| **urlLabel_n** | chars | specify the alternative label for the datafile or else default to filename, n indicate the ith datafile(starting with 1) |


## Examples

Plot a single signal (signal=standard)

```
view.html?
  url=http://localhost/data/SEC/IMPT6750_NTX_E2-3_020216-SIGNAL01.json

```

```
plotly/view.html?
  url=http://localhost/data/plotly/IMPT6750_NTX_E1-1_020216-SIGNAL01.json&
  url=http://localhost/data/plotly/IMPT6750_NTX_E2-3_020216-SIGNAL01.json&
  url=http://localhost/data/plotly/IMPT6750_NTX_E2-4_020216-SIGNAL01.json&
  regionStart=5&
  regionEnd=9&
  base=3&
  standard=1&
  detectorName="MWD1 E,  Sig=280,4  Ref= 360,4"&
  plotTitle="IMPT6750_NTX_E2"&
  plotUnit=RFU
  urlLabel_2="sample0_UV"

```

Sample plot is in sample.png
