'use strict';
const fs = require('node:fs');
const path = require('node:path');
function assemble() {
  const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, 'content', name), 'utf8'));
  const parts = ['low-medium.json', 'high.json', 'tutorial.json', 'bridge.json'].map(read);
  const cases = parts.flatMap(part => part.cases), assets = parts.flatMap(part => part.assets);
  const scenarios = read('scenarios.json');
  require('./prepare-data.js')(cases, assets);
  if (cases.length !== 21 || new Set(cases.map(c => c.id)).size !== 21) throw new Error('Expected 21 distinct cases');
  if (new Set(assets.map(a => a.name)).size !== assets.length) throw new Error('Duplicate asset');
  const membership = scenarios.flatMap(s => s.caseIds);
  if (membership.length !== cases.length || new Set(membership).size !== cases.length || membership.some(id => !cases.some(c => c.id === id))) throw new Error('Invalid scenario membership');
  const data = { version: 'socroom-3', releaseVersion: require('./package.json').version, company: read('company.json'), scenarios, assets, cases };
  const source = '/* SOCroom v0.6: 15 regular cases, one tutorial, five guided practice cases.\n * Generated from content/*.json by assemble-data.js. Synthetic offline data. */\n(function(root){\n  "use strict";\n  const data = ' + JSON.stringify(data, null, 2) + ';\n  root.SOC_DATA=data;\n  if(typeof module==="object"&&module.exports)module.exports=data;\n})(globalThis);\n';
  fs.writeFileSync(path.join(__dirname, 'src/data.js'), source);
}
if (require.main === module) assemble();
module.exports = assemble;
