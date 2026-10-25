'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { create } = require('../src/terminal.js');

const LOG = [
  '09:00:01 bastion-01 sshd user=kei result=failed ip=203.0.113.21',
  '09:00:02 bastion-01 sshd user=kei result=failed ip=203.0.113.21',
  '09:00:03 bastion-01 sshd user=kei result=accepted ip=203.0.113.21',
  '09:00:04 app-01 sudo user=deploy result=accepted ip=10.20.0.2',
  ''
].join('\n');
const FILES = {
  '/var/log/auth.log': LOG,
  '/var/log/edr.jsonl': '{"host":"bastion-01","type":"login"}\n{"host":"app-01","type":"process"}\n',
  '/docs/asset.txt': 'bastion-01: 本番踏み台サーバー\n',
  '/docs/change.txt': 'CHG-104: app-01 の承認済み保守\n'
};

test('read/filter pipelines support grep, awk, sort, uniq, jq and recursive rg', () => {
  const terminal = create(FILES);
  assert.equal(terminal.run('cat /var/log/auth.log').stdout, LOG);
  assert.deepEqual(terminal.run("grep 'result=failed' /var/log/auth.log | awk '{print $NF}' | sort | uniq -c"), {
    stdout: '      2 ip=203.0.113.21\n', stderr: '', code: 0
  });
  assert.equal(terminal.run("awk '/accepted/ {print $2}' /var/log/auth.log").stdout, 'bastion-01\napp-01\n');
  assert.equal(terminal.run("jq -r 'select(.type == \"login\") | .host' /var/log/edr.jsonl").stdout, 'bastion-01\n');
  assert.match(terminal.run('rg -n CHG-104 /docs').stdout, /change.txt:1:CHG-104/);
  assert.equal(terminal.run('grep -c accepted < /var/log/auth.log').stdout, '2\n');
  assert.equal(terminal.run('grep missing /var/log/auth.log').code, 1);
});

test('workspace supports copying, editing, appending, directories and persistence', () => {
  const terminal = create(FILES);
  assert.equal(terminal.run('mkdir -p notes/auth; cp /var/log/auth.log notes/auth/copy.log').code, 0);
  assert.equal(terminal.run('cd notes/auth; pwd').stdout, '/home/analyst/notes/auth\n');
  assert.equal(terminal.run("sed -i.bak 's/result=failed/result=reviewed/g' copy.log").code, 0);
  assert.match(terminal.run('cat copy.log').stdout, /result=reviewed/);
  assert.equal(terminal.run('cat copy.log.bak').stdout, LOG);
  assert.equal(terminal.run('echo memo | tee memo.txt; echo second >> memo.txt').code, 0);
  assert.equal(terminal.run('cat memo.txt').stdout, 'memo\nsecond\n');
  const restored = create(FILES);
  restored.setWorkspace(JSON.parse(JSON.stringify(terminal.getWorkspace())));
  assert.equal(restored.run('pwd').stdout, '/home/analyst/notes/auth\n');
  assert.equal(restored.run('cat memo.txt').stdout, 'memo\nsecond\n');
  assert.equal(restored.run('mv memo.txt /home/analyst; rm copy.log.bak').code, 0);
  assert.equal(restored.run('cat /home/analyst/memo.txt').stdout, 'memo\nsecond\n');
  assert.equal(restored.run('cat /var/log/auth.log').stdout, LOG);
  assert.equal(restored.run('mkdir empty; rmdir empty').code, 0);
});

const deniedCommands = [
  'echo ALTERED > /var/log/auth.log',
  'echo ALTERED >> /var/log/auth.log',
  'echo ALTERED | tee /var/log/auth.log',
  "sed -i 's/failed/ALTERED/g' /var/log/auth.log",
  "sed -i.bak 's/failed/ALTERED/g' /var/log/auth.log",
  'cp /docs/asset.txt /var/log/auth.log',
  'mv /var/log/auth.log /home/analyst/moved.log',
  'mv /var/log /home/analyst/moved-directory',
  'mv /var /home/analyst/var',
  'rm /var/log/auth.log',
  'rm -f /var/log/nonexistent',
  'touch /var/log/auth.log',
  'touch /var/log/new.log',
  'touch ../../var/log/new.log',
  'mkdir -p /var/log/new-directory',
  'mkdir -p /var/log',
  'mkdir -p /tmp/new-directory',
  'rmdir /tmp',
  'echo /var/log/auth.log | xargs rm',
  "printf '%s\\n' /var/log/auth.log | xargs -I '{}' sed -i s/failed/ALTERED/ '{}'",
  'echo /var/log/auth.log | xargs touch',
  'echo ALTERED > /home/analyst/../../var/log/auth.log',
  'echo ALTERED > /home/analyst-notes',
  'rm -rf /',
  'rm --recursive --force /',
  'touch -- --help /var/log/auth.log'
];
for (const command of deniedCommands) {
  test('protected source rejects: ' + command, () => {
    const terminal = create(FILES);
    const result = terminal.run(command);
    assert.notEqual(result.code, 0, 'attempt should fail');
    assert.match(result.stderr, /読み取り専用/);
    assert.equal(result.gameOver, undefined);
    assert.equal(terminal.run('cat /var/log/auth.log').stdout, LOG);
    assert.equal(terminal.run('cat /docs/asset.txt').stdout, FILES['/docs/asset.txt']);
    assert.equal(terminal.run('cat /var/log/new.log').code, 1);
  });
}

test('read-only protection applies before the next command and to all command connectors', () => {
  const terminal = create(FILES);
  for (const command of [
    'echo ALTERED > /var/log/auth.log; cat /var/log/auth.log',
    "sed -i s/failed/ALTERED/ /var/log/auth.log; cat /var/log/auth.log",
    'rm /var/log/auth.log || cat /var/log/auth.log',
    'mv /var/log/auth.log moved.log; cat /var/log/auth.log'
  ]) {
    const result = terminal.run(command);
    assert.equal(result.stdout, LOG);
    assert.match(result.stderr, /読み取り専用/);
  }
  assert.equal(terminal.run('cat moved.log').code, 1);
});

test('protected destinations cannot be changed via directory moves, aliases or xargs', () => {
  const terminal = create(FILES);
  terminal.run('mkdir -p copy/sub; echo test > copy/sub/note.txt');
  for (const command of [
    'mv copy /var/log/copy',
    'mv copy /tmp',
    'mv copy/sub/note.txt /var/log/auth.log',
    'cd /var/log; echo altered > ./auth.log',
    'cd /var/log; echo altered | tee ../log/auth.log',
    'echo /var/log | xargs -I {} mv /home/analyst/copy {}'
  ]) {
    assert.notEqual(terminal.run(command).code, 0);
    assert.equal(terminal.run('cat /var/log/auth.log').stdout, LOG);
    terminal.run('cd /home/analyst');
  }
  assert.equal(terminal.run('cat copy/sub/note.txt').stdout, 'test\n');
  assert.equal(terminal.run('mv copy moved; cat moved/sub/note.txt').stdout, 'test\n');
});

test('source refresh exposes only currently supplied files while preserving notes', () => {
  const terminal = create({ '/var/log/auth.log': 'first\n' });
  terminal.run('echo note > notes.txt; cp /var/log/auth.log snapshot.log');
  assert.equal(terminal.run('cat /var/log/later.log').code, 1);
  terminal.updateFiles({ '/var/log/auth.log': 'first\nsecond\n', '/var/log/later.log': 'released\n' });
  assert.equal(terminal.run('cat /var/log/auth.log').stdout, 'first\nsecond\n');
  assert.equal(terminal.run('cat /var/log/later.log').stdout, 'released\n');
  assert.equal(terminal.run('cat notes.txt').stdout, 'note\n');
  assert.equal(terminal.run('cat snapshot.log').stdout, 'first\n');
  terminal.updateFiles({ '/docs/current.txt': 'current\n' });
  assert.equal(terminal.run('cat /var/log/auth.log').code, 1);
  assert.equal(terminal.run('cat /var/log/later.log').code, 1);
  assert.equal(terminal.getWorkspace().files['/var/log/auth.log'], undefined);
});

test('restoring workspaces cannot inject or shadow source files', () => {
  const terminal = create(FILES);
  terminal.run('echo preserved > note.txt');
  for (const value of [
    { files: { '/var/log/auth.log': 'tampered' } },
    { files: { '/home/analyst/../../var/log/auth.log': 'tampered' } },
    { files: { '/home/analyst-note': 'tampered' } },
    { files: { '/home/analyst/a': 'x', '/home/analyst/a/b': 'y' } },
    { files: {}, dirs: ['/var/log'] },
    { files: {}, dirs: ['/home/analyst/../../etc'] },
    { files: { '/home/analyst/a': [] } },
    { files: { '/home/analyst/a': 'x'.repeat(2097153) } },
    null,
    []
  ]) assert.throws(() => terminal.setWorkspace(value));
  assert.equal(terminal.run('cat note.txt').stdout, 'preserved\n');
  assert.equal(terminal.run('cat /var/log/auth.log').stdout, LOG);
  const clone = terminal.getWorkspace();
  clone.files['/home/analyst/note.txt'] = 'changed';
  clone.history.push('mutated');
  assert.equal(terminal.run('cat note.txt').stdout, 'preserved\n');
  assert.doesNotMatch(terminal.run('history').stdout, /mutated/);
});

test('even source files under home and their parent directories remain immutable', () => {
  const terminal = create({ '/home/analyst/reference/readonly.txt': 'original\n' });
  assert.match(terminal.run('echo replaced > reference/readonly.txt').stderr, /読み取り専用/);
  assert.match(terminal.run('mv reference moved').stderr, /読み取り専用/);
  assert.equal(terminal.run('cat reference/readonly.txt').stdout, 'original\n');
  assert.throws(() => terminal.setWorkspace({ files: { '/home/analyst/reference/readonly.txt': 'changed' } }));
});

test('unsupported UI commands and real system commands cannot run', () => {
  const terminal = create(FILES);
  for (const command of ['vi', 'view /var/log/auth.log', 'sl']) {
    const result = terminal.run(command);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /未対応/);
    assert.equal(result.editor, undefined);
    assert.equal(result.train, undefined);
  }
  for (const command of ['curl https://example.com', 'sh', 'python3', 'node', 'sudo', 'fetch']) assert.equal(terminal.run(command).code, 127);
  for (const command of ['echo $(cat /var/log/auth.log)', 'echo `pwd`', 'echo $HOME']) assert.equal(terminal.run(command).code, 2);
  assert.equal(terminal.run('less /var/log/auth.log').stdout, LOG);
  assert.equal(terminal.run('more /var/log/auth.log').pager, undefined);
  assert.doesNotMatch(terminal.run('help rm').stdout, /Easter egg|GAME OVER|reset current case/);
  assert.match(terminal.run('help').stdout, /読み取り専用/);
  assert.match(terminal.run('help sl').stdout, /未対応/);
});
