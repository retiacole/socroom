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
// Fail explicitly instead of treating PCRE \d as a POSIX digit class.
const regexMarker = '    let source=posixClasses(extended ? pattern : basicRegex(pattern));';
if (!source.includes(regexMarker)) throw new Error('Regex implementation changed: review compatibility guard');
source = source.replace(regexMarker, String.raw`    if (/(^|[^\\])(\\\\)*\\[dD]/.test(pattern)) fail('PCRE \\d/\\D is unsupported; use [[:digit:]] or [^[:digit:]]');` + '\n' + regexMarker);
const root = path.resolve(__dirname, '..');
const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8');
const header = '/*\nVendored from https://github.com/retiacole/logroom/blob/' + commit + '/src/shell.js\nSOCroom changes: ShellError/CommonJS exports and explicit PCRE digit-class rejection.\nRegenerate with scripts/sync-logroom.js; verify read-only adapter tests after every sync.\n\n' + license + '\n*/\n';
fs.writeFileSync(path.join(root, 'src/vendor-shell.js'), header + source);
fs.writeFileSync(path.join(root, 'scripts/logroom-source.json'), JSON.stringify({repository:'https://github.com/retiacole/logroom',commit,path:'src/shell.js',sha256:crypto.createHash('sha256').update(original).digest('hex')},null,2)+'\n');
console.log('Synced Logroom ' + commit);
