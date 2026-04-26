const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('node_modules/voyageai/package.json'));
pkg.exports['.'].import = pkg.exports['.'].require;
pkg.module = './dist/cjs/extended/index.js';
fs.writeFileSync('node_modules/voyageai/package.json', JSON.stringify(pkg, null, 2));
console.log('voyageai patched to use CJS');
