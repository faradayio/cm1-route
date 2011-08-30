task 'package', 'Package javascript into a deployable file', ->
  console.log 'Tar/gzing...'
  child = require('child_process')
  child.exec 'tar -czf native-route.tar.gz package.json lib'
