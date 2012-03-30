browserify = require 'dkastner-browserify'
child = require 'child_process'
fs = require 'fs'

task 'clean', 'Clean up built files', ->
  fs.unlink('cm1-route.js');

task 'bake', 'Build client-side cm1-route.js using browserify', ->
  console.log "Browserifying..."
  b = browserify {
    require: { http: 'dkastner-http-browserify' },
    entry: 'browser.js'
  }
  fs.writeFileSync 'cm1-route.js', b.bundle()
  console.log 'CM1Route is now browserified in cm1-route.js'

task 'package', 'Package javascript into a deployable file', ->
  console.log 'Tar/gzing...'
  child.exec 'cp -R lib build/package; cp package.json build/package; cd build; tar -czf ../cm1-route.tar.gz package'
