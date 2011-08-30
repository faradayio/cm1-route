task 'package', 'Package javascript into a deployable file', ->
  console.log 'Tar/gzing...'
  child = require('child_process')
  child.exec 'cp -R lib build/package; cp package.json build/package; cd build; tar -czf ../native-route.tar.gz package'
