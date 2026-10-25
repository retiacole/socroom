/* SOCroom's offline adapter for Logroom's MIT-licensed virtual shell. */
(function (root, factory) {
  'use strict';
  const api = factory(typeof module === 'object' && module.exports ? require('./vendor-shell.js') : root.LogLabShell);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SocTerminal = api;
})(globalThis, function (Shell) {
  'use strict';

  const HOME = '/home/analyst';
  const MAX_FILE = 2097152, MAX_WORKSPACE = 4194304, MAX_FILES = 128, MAX_DIRS = 256;
  const UNSUPPORTED = new Set(['vi', 'view', 'sl']);
  const ErrorType = Shell.ShellError;
  const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const fail = message => { throw new ErrorType(message, 1); };
  function normalize(path, cwd = HOME) {
    const segments = (String(path).startsWith('/') ? String(path) : cwd + '/' + String(path)).split('/');
    const result = [];
    for (const segment of segments) {
      if (!segment || segment === '.') continue;
      if (segment === '..') result.pop();
      else result.push(segment);
    }
    return '/' + result.join('/');
  }
  const workingPath = path => path.startsWith(HOME + '/');
  const parent = path => path.slice(0, path.lastIndexOf('/')) || '/';
  const emptyWorkspace = () => ({ files: Object.create(null), dirs: [HOME], history: [], cwd: HOME, oldcwd: HOME });

  function normalizeSources(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('ログファイルの形式が不正です。');
    const files = Object.create(null);
    let total = 0;
    for (const [name, content] of Object.entries(value)) {
      if (!name.startsWith('/') || name.includes('\0') || name.length > 1024 || typeof content !== 'string') throw new Error('ログファイルの形式が不正です。');
      const path = normalize(name);
      if (path === '/' || path === HOME || content.length > MAX_FILE) throw new Error('ログファイルのサイズまたはパスが不正です。');
      total += content.length;
      if (total > 16777216) throw new Error('ログファイルの合計サイズが大きすぎます。');
      files[path] = content;
    }
    return files;
  }

  function validateWorkspace(value, sources) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !value.files || typeof value.files !== 'object' || Array.isArray(value.files)) throw new Error('作業領域の形式が不正です。');
    const next = emptyWorkspace(), entries = Object.entries(value.files);
    if (entries.length > MAX_FILES) throw new Error('作業ファイルは128個までです。');
    let total = 0;
    for (const [name, content] of entries) {
      const path = normalize(name);
      if (!workingPath(path) || has(sources, path) || !name.startsWith('/') || name.includes('\0') || name.length > 1024 || typeof content !== 'string') throw new Error('作業ファイルは /home/analyst 配下に保存してください。');
      total += content.length;
      if (content.length > MAX_FILE || total > MAX_WORKSPACE) throw new Error('作業領域のサイズ上限を超えています。');
      next.files[path] = content;
    }
    if (value.dirs !== undefined && (!Array.isArray(value.dirs) || value.dirs.length > MAX_DIRS)) throw new Error('作業ディレクトリの形式が不正です。');
    const dirs = new Set([HOME]);
    for (const name of value.dirs || []) {
      if (typeof name !== 'string' || name.length > 1024 || name.includes('\0')) throw new Error('作業ディレクトリの形式が不正です。');
      const path = normalize(name);
      if (path !== HOME && !workingPath(path)) throw new Error('作業ディレクトリは /home/analyst 配下に作成してください。');
      dirs.add(path);
    }
    for (const path of Object.keys(next.files)) {
      let dir = parent(path);
      while (dir !== HOME) { dirs.add(dir); dir = parent(dir); }
    }
    // Reject file/directory collisions, including parents supplied by the caller.
    for (const dir of [...dirs]) {
      if (has(next.files, dir) || has(sources, dir)) throw new Error('同じパスにファイルとディレクトリがあります。');
      let ancestor = dir;
      while (ancestor !== HOME) {
        if (has(next.files, ancestor) || has(sources, ancestor)) throw new Error('ファイルを親ディレクトリにはできません。');
        dirs.add(ancestor); ancestor = parent(ancestor);
      }
    }
    if (dirs.size > MAX_DIRS) throw new Error('作業ディレクトリは256個までです。');
    next.dirs = [...dirs];
    if (value.history !== undefined && !Array.isArray(value.history)) throw new Error('コマンド履歴の形式が不正です。');
    next.history = (value.history || []).slice(-200).filter(item => typeof item === 'string').map(item => item.slice(0, 8192));
    next.cwd = typeof value.cwd === 'string' ? normalize(value.cwd) : HOME;
    next.oldcwd = typeof value.oldcwd === 'string' ? normalize(value.oldcwd) : HOME;
    return next;
  }

  function create(initialFiles = {}, options = {}) {
    let sources = normalizeSources(initialFiles), workspace = emptyWorkspace();

    function makeShell() {
      const metadata = Object.fromEntries(Object.keys(sources).map(path => [path, {mode: 0o444, owner: 'root', group: 'adm'}]));
      const shell = new Shell(Object.assign(Object.create(null), workspace.files, sources), {metadata});
      for (const dir of workspace.dirs) { shell.directories.add(dir); shell.addParents(dir + '/.'); }
      shell.cwd = shell.isDir(workspace.cwd) ? workspace.cwd : HOME;
      shell.oldcwd = shell.isDir(workspace.oldcwd) ? workspace.oldcwd : HOME;
      shell.history = workspace.history.slice();
      shell.supportedCommands = shell.supportedCommands.filter(command => !UNSUPPORTED.has(command));
      shell.supportedCommands.push('evidence');

      const sourceParents = new Set();
      for (const source of Object.keys(sources)) {
        let path = parent(source);
        while (true) { sourceParents.add(path); if (path === '/') break; path = parent(path); }
      }
      function writable(name, directory = false) {
        const path = shell.resolve(name);
        if (!workingPath(path) || has(sources, path) || (directory && sourceParents.has(path))) {
          fail('読み取り専用: ' + path + '。変更できるのは /home/analyst 配下の作業用コピーだけです。');
        }
        return path;
      }

      // Guard the storage operations themselves, not just command strings. This
      // covers pipes, lists, xargs, backup suffixes, glob expansion and mv's direct
      // assignments. A protected write fails before a later command can read it.
      const storage = shell.files;
      shell.files = new Proxy(storage, {
        set(target, property, value) {
          const path = writable(String(property));
          const text = String(value);
          if (text.length > MAX_FILE) fail('作業ファイルは2 MiBまでです。');
          const paths = Object.keys(target).filter(key => workingPath(key) && !has(sources, key));
          if (!has(target, path) && paths.length >= MAX_FILES) fail('作業ファイルは128個までです。');
          const total = paths.reduce((size, key) => size + (key === path ? 0 : target[key].length), text.length);
          if (total > MAX_WORKSPACE) fail('作業領域は合計4 MiBまでです。');
          target[path] = text; return true;
        },
        deleteProperty(target, property) { delete target[writable(String(property))]; return true; },
        defineProperty() { fail('作業ファイルの属性変更は未対応です。'); }
      });
      const directories = shell.directories;
      shell.directories = new Proxy(directories, {
        get(target, property) {
          if (property === 'add') return name => {
            const path = shell.resolve(name);
            if (target.has(path)) return shell.directories;
            writable(path, true);
            if ([...target].filter(workingPath).length >= MAX_DIRS - 1) fail('作業ディレクトリは256個までです。');
            target.add(path); return shell.directories;
          };
          if (property === 'delete') return name => target.delete(writable(name, true));
          if (property === 'clear') return () => fail('原本ディレクトリは削除できません。');
          const value = Reflect.get(target, property, target);
          return typeof value === 'function' ? value.bind(target) : value;
        }
      });
      const baseWrite = shell.write.bind(shell);
      shell.write = (name, text, append) => { if (shell.resolve(name) !== '/dev/null') writable(name); return baseWrite(name, text, append); };
      // Remove Logroom's rm -rf / reset Easter egg; SOCroom evidence never resets
      // because of a terminal command.
      shell.isRootResetCommand = () => false;
      const baseExecute = shell.execute.bind(shell);
      shell.execute = (command, args, stdin, context) => {
        if (command === 'evidence') {
          if (args.length === 1 && args[0] === '--help') return {stdout: 'evidence /path/to/log:line\n原本の行を現在の案件の主証拠に登録します。grep -n で行番号を確認できます。\n', stderr: '', code: 0};
          const match = args.length === 1 && args[0].match(/^(.+):(\d+)$/);
          if (!match || !Number.isSafeInteger(Number(match[2])) || Number(match[2]) < 1) fail('evidence: evidence /path/to/log:line の形式で指定してください。');
          const path = shell.resolve(match[1]), line = Number(match[2]);
          const lines = has(sources,path) ? sources[path].split('\n') : [];
          if (lines.at(-1) === '') lines.pop();
          if (!has(sources, path) || line > lines.length) fail('evidence: 公開済みの原本ログ・資料の行を指定してください。');
          if (typeof options.onEvidence !== 'function') fail('evidence: この端末には案件が接続されていません。');
          let id;
          try { id = options.onEvidence(path, line); } catch (error) { fail('evidence: ' + error.message); }
          return {stdout: '主証拠に登録: ' + id + '\n', stderr: '', code: 0};
        }
        if (UNSUPPORTED.has(command)) return { stdout: '', stderr: command + ': SOCroomの端末では未対応です。テキストの確認には cat / less を使ってください。\n', code: 2 };
        const helpAt = args.indexOf('--help'), endOptionsAt = args.indexOf('--');
        const wantsHelp = helpAt >= 0 && (endOptionsAt < 0 || helpAt < endOptionsAt);
        if (['mkdir', 'touch', 'rm', 'rmdir', 'mv'].includes(command) && !wantsHelp) {
          let afterOptions = false;
          const operands = [];
          for (const arg of args) {
            if (!afterOptions && arg === '--') { afterOptions = true; continue; }
            if (!afterOptions && arg.startsWith('-') && arg !== '-') continue;
            operands.push(arg);
          }
          if (command === 'mv' && operands.length === 2) {
            const source = writable(operands[0], true);
            const destination = shell.resolve(operands[1]);
            writable(shell.isDir(destination) ? destination + '/' + source.slice(source.lastIndexOf('/') + 1) : destination, true);
          } else {
            for (const arg of operands) writable(arg, ['mkdir', 'rmdir', 'mv'].includes(command));
          }
        }
        const result = baseExecute(command, args, stdin, context);
        if (result.pager) delete result.pager;
        return result;
      };
      const baseHelp = shell.getHelp.bind(shell);
      shell.getHelp = command => {
        if (command === 'evidence') return 'evidence /path/to/log:line\ngrep -n で確認した原本の行を、現在の案件の主証拠に登録します。作業用コピーは登録できません。\n';
        if (UNSUPPORTED.has(command)) return command + ': SOCroomでは未対応です。\n';
        if (!command) return [
          'SOCroom 仮想端末 — ブラウザ内だけで動くログ調査用シェル',
          'コマンド: ' + shell.supportedCommands.join(', '),
          '構文: 引用符、|、<、>、>>、;、&&、||、*、?。help コマンド名 で使用方法を確認できます。',
          '原本ログと資料は読み取り専用です。作業ファイルは /home/analyst 配下に作成できます。',
          '例: grep -i failed /var/log/* | head -n 20',
          '例: cp /var/log/auth.log /home/analyst/auth-copy.log',
          '例: evidence /var/log/auth.log:12（grep -n の行番号を指定）',
          'less / more はテキストをそのまま表示します。vi / view / sl は未対応です。',
          '実OS、ネットワーク、プログラム実行には接続しません。ログは実行時点の画面と同じ範囲です。',
          ''
        ].join('\n');
        if (command === 'rm') return 'rm [-f] file ...\n/home/analyst 配下の作業ファイルだけを削除します。再帰削除・原本削除・演習のリセットはできません。\n';
        if (command === 'less' || command === 'more') return command + ' [file ...]\nテキストを端末に表示します。ページャー操作はありません。\n';
        return baseHelp(command) + '\nSOCroom: 変更は /home/analyst 配下の作業用コピーだけに許可されます。\n';
      };
      return shell;
    }

    return {
      setEvidenceHandler(handler) { options.onEvidence = handler; },
      run(command) {
        const shell = makeShell();
        const result = shell.run(command);
        const files = Object.create(null);
        for (const [path, content] of Object.entries(shell.files)) if (workingPath(path) && !has(sources, path)) files[path] = content;
        workspace = {
          files, dirs: [...shell.directories].filter(path => path === HOME || workingPath(path)),
          history: shell.history.slice(-200), cwd: shell.cwd, oldcwd: shell.oldcwd
        };
        return result;
      },
      updateFiles(files) {
        const next = normalizeSources(files);
        for (const path of Object.keys(workspace.files)) if (has(next, path)) delete workspace.files[path];
        sources = next;
      },
      getWorkspace() {
        return { files: { ...workspace.files }, dirs: workspace.dirs.slice(), history: workspace.history.slice(), cwd: workspace.cwd, oldcwd: workspace.oldcwd };
      },
      setWorkspace(value) { workspace = validateWorkspace(value, sources); }
    };
  }
  return { create };
});
