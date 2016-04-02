

##
##
## setup.py for sec-viewer/reader/scripts/processRawSEC.py
##

from distutils.core import setup

setup(name='processSEC',
      description='SEC processing scripts',
      version='1.0',
      scripts=['scripts/processRawSEC.py'],
      license='Apache License, Version 2.0',
      classifiers=[
        'Intended Audience :: Developers',
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Software Development :: Libraries :: Python Modules'
      ])

