// Usage: node scripts/sync-logroom.js /path/to/upstream/src/shell.js <40-char commit>
// Fetch the source from the pinned upstream commit before running this command.
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const [input, commit] = process.argv.slice(2);
if (!input || !/^[a-f0-9]{40}$/.test(commit || '')) throw new Error('Specify upstream shell.js and full commit SHA');
const original = fs.readFileSync(input, 'utf8');
if (!original.includes('class LogLabShell') || !original.includes('class ShellError')) throw new Error('Unexpected upstream module');
const marker = '  root.LogLabShell=LogLabShell;';
if (original.split(marker).length !== 2) throw new Error('Export marker changed: review adapter before syncing');
let source = original.replace(marker, '  LogLabShell.ShellError=ShellError;\n' + marker + '\n  if (typeof module === "object" && module.exports) module.exports=LogLabShell;');
// Preserve upstream's grep-only digit-class guard. A shared regex guard would
// also reject the digit escapes that rg explicitly supports.
if (!source.includes('if(!options.allowDigitEscapes)') || !source.includes('{allowDigitEscapes:true}')) throw new Error('grep/rg digit-class handling changed: review compatibility before syncing');
const root = path.resolve(__dirname, '..');
const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8');
const header = '/*\nVendored from https://github.com/retiacole/logroom/blob/' + commit + '/src/shell.js\nSOCroom changes: ShellError/CommonJS exports. Upstream grep/rg digit-class handling is preserved.\nRegenerate with scripts/sync-logroom.js; verify read-only adapter tests after every sync.\n\n' + license + '\n*/\n';
fs.writeFileSync(path.join(root, 'src/vendor-shell.js'), header + source);
fs.writeFileSync(path.join(root, 'scripts/logroom-source.json'), JSON.stringify({repository:'https://github.com/retiacole/logroom',commit,path:'src/shell.js',sha256:crypto.createHash('sha256').update(original).digest('hex')},null,2)+'\n');
console.log('Synced Logroom ' + commit);
