#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function A(argv) {
  this.argv = argv.slice();
}

A.prototype.commands = [
  'ls', 'b', 'r',
  'backup', 'bcp', 'bcpi', 'c', 'cd', 'chrome', 'cp', 'cpa', 'd',
  'dec', 'dread', 'drive', 'du', 'dwrite', 'e', 'enc', 'fan',
  'helpx', 'install', 'ip', 'kill',
];

A.prototype.helpText = function helpText() {
  return [
    'a — command help',
    '',
    'usage: a <command> [args...]',
    '',
    'a ls',
    '  ls -l',
    '',
    'a b SUFFIX [DIR]',
    '  tar -cvf pc0SUFFIX.tar DIR',
    '  default DIR: ./pc0',
    '',
    'a r',
    '  tar -xvf pc0.tar',
    '',
    'a r SUFFIX [DIR]',
    '  check pc0SUFFIX.tar exists',
    '  rm -fr DIR',
    '  tar -xvf pc0SUFFIX.tar',
    '  default DIR: pc0',
    '  exec $SHELL',
    '',
    'a backup',
    '  ls -lh ~/exp/2601',
    '',
    'a bcp',
    '  sudo cp nanonew20 /usr/local/bin/nanonew',
    '',
    'a bcp FILE',
    '  sudo cp FILE /usr/local/bin/',
    '',
    'a bcp SRC DEST',
    '  sudo cp SRC /usr/local/bin/DEST',
    '',
    'a bcpi',
    '  insert #!/usr/bin/env node if missing',
    '  sudo cp peta.js /usr/local/bin/peta',
    '  chmod +x if needed',
    '',
    'a bcpi SRC DEST',
    '  insert #!/usr/bin/env node if missing',
    '  sudo cp SRC /usr/local/bin/DEST',
    '  chmod +x',
    '',
    'a c',
    '  cd ~; exec $SHELL',
    '',
    'a cd NAME',
    '  cd /media/ubuntu/NAME; exec $SHELL',
    '',
    'a chrome',
    '  google-chrome',
    '',
    'a cp SRC [DEST]',
    '  cp SRC DEST',
    '  no DEST → copies into ./',
    '',
    'a cpa SRC [DEST]',
    '  cp -a SRC DEST',
    '  no DEST → copies into ./',
    '',
    'a d [paths]',
    '  df -h',
    '',
    'a dec FILE PASSWORD',
    '  aes-256-cbc decrypt FILE.enc → FILE',
    '  sha256(password) key; first 32 bytes are iv hex prefix',
    '',
    'a dread DIR',
    "  sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'",
    '  dd if=DIR/speedtest.bin of=/dev/null bs=1M status=progress',
    '',
    'a drive [paths]',
    '  df -h',
    '',
    'a du [DIR]',
    '  sudo du -sb DIR',
    '  default DIR: .',
    '  exact bytes',
    '',
    'a dwrite DIR',
    '  sync',
    '  dd if=/dev/zero of=DIR/speedtest.bin bs=1M count=1024 conv=fdatasync status=progress',
    '  sync',
    '',
    'a e [file]',
    '  gedit FILE',
    '  default FILE: init.json',
    '',
    'a enc FILE PASSWORD',
    '  aes-256-cbc encrypt FILE → FILE.enc',
    '  sha256(password) key; iv written as 32-char hex prefix',
    '',
    'a fan',
    '  sudo watch -n1 a fan temp',
    '',
    'a fan auto',
    "  sudo tee 0 > fan_fullspeed",
    '',
    'a fan full',
    "  sudo tee 1 > fan_fullspeed",
    '',
    'a fan N',
    '  sudo tee N into pwm*_auto_point{1..10}_pwm that exist',
    '',
    'a fan temp',
    '  sensors | grep -A8 -i legion',
    '',
    'a helpx',
    '  write /tmp/x-help.js with this help; gedit /tmp/x-help.js',
    '',
    'a install chrome',
    '  cd /tmp && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb',
    '  sudo apt install -y /tmp/google-chrome-stable_current_amd64.deb',
    '',
    'a install cpp',
    '  sudo apt install g++ libssl-dev zlib1g-dev libsodium-dev',
    '',
    'a install ess',
    '  sudo apt-get install build-essential autoconf automake libtool pkg-config curl net-tools zip unzip nano sshfs sshpass iperf3',
    '',
    'a install let',
    '  sudo snap install --classic certbot',
    '',
    'a install PKG',
    '  sudo apt install PKG',
    '',
    'a install rem',
    '  sudo apt update',
    '  sudo apt install remmina remmina-plugin-rdp',
    '',
    'a ip',
    '  ifconfig',
    '',
    'a kill',
    '  sudo pkill -9 -f nodel',
    '',
  ].join('\n');
};

A.prototype.usage = function usage() {
  console.error(this.helpText());
};

A.prototype.run = function run(bin, binArgs, opts) {
  const result = spawnSync(bin, binArgs, {
    stdio: 'inherit',
    env: process.env,
    ...opts,
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  return result;
};

A.prototype.runExit = function runExit(bin, binArgs, opts) {
  this.run(bin, binArgs, opts);
  process.exit(0);
};

A.prototype.execShell = function execShell(cwd) {
  this.runExit(process.env.SHELL || '/bin/bash', [], { cwd });
};

A.prototype.ensureNodeShebang = function ensureNodeShebang(srcPath) {
  let content = fs.readFileSync(srcPath, 'utf8');
  if (!content.startsWith('#!')) {
    content = '#!/usr/bin/env node\n' + content;
  }
  const tmp = path.join(os.tmpdir(), `a-bcpi-${path.basename(srcPath)}`);
  fs.writeFileSync(tmp, content, { mode: 0o755 });
  return tmp;
};

A.prototype.installBin = function installBin(src, destName) {
  const dest = path.posix.join('/usr/local/bin', destName);
  this.run('sudo', ['cp', src, dest]);
  return dest;
};

A.prototype.call = function call(name, args) {
  if (!this.commands.includes(name) || typeof A.prototype[name] !== 'function') {
    return false;
  }
  A.prototype[name].call(this, args);
  return true;
};

A.prototype.ls = function ls(args) {
  this.runExit('ls', ['-l', ...args]);
};

A.prototype.b = function b(args) {
  const [suffix, dir = './pc0'] = args;
  if (!suffix) {
    console.error('a b: SUFFIX required');
    this.usage();
    process.exit(1);
  }
  this.runExit('tar', ['-cvf', `pc0${suffix}.tar`, dir]);
};

A.prototype.r = function r(args) {
  const [suffix, dir = 'pc0'] = args;

  if (!suffix) {
    this.runExit('tar', ['-xvf', 'pc0.tar']);
    return;
  }

  const archive = `pc0${suffix}.tar`;
  if (!fs.existsSync(archive)) {
    console.error(`a r: ${archive} not found`);
    process.exit(1);
  }

  fs.rmSync(dir, { recursive: true, force: true });
  this.run('tar', ['-xvf', archive]);
  this.execShell(process.cwd());
};

A.prototype.backup = function backup() {
  this.runExit('ls', ['-lh', path.join(os.homedir(), 'exp/2601')]);
};

A.prototype.bcp = function bcp(args) {
  if (args.length === 0) {
    this.runExit('sudo', ['cp', 'nanonew20', '/usr/local/bin/nanonew']);
  } else if (args.length === 1) {
    this.runExit('sudo', ['cp', args[0], '/usr/local/bin/']);
  } else {
    const [src, dest] = args;
    this.runExit('sudo', ['cp', src, path.posix.join('/usr/local/bin', dest)]);
  }
};

A.prototype.bcpi = function bcpi(args) {
  let src = 'peta.js';
  let destName = 'peta';
  if (args.length >= 2) {
    [src, destName] = args;
  } else if (args.length === 1) {
    console.error('a bcpi: need SRC DEST (or no args for peta.js → peta)');
    process.exit(1);
  }
  if (!fs.existsSync(src)) {
    console.error(`a bcpi: ${src} not found`);
    process.exit(1);
  }
  const staged = this.ensureNodeShebang(src);
  const dest = this.installBin(staged, destName);
  this.run('sudo', ['chmod', '+x', dest]);
  fs.unlinkSync(staged);
  process.exit(0);
};

A.prototype.c = function c() {
  this.execShell(os.homedir());
};

A.prototype.cd = function cd(args) {
  const [name] = args;
  if (!name) {
    console.error('a cd: NAME required');
    process.exit(1);
  }
  const dir = path.join('/media/ubuntu', name);
  if (!fs.existsSync(dir)) {
    console.error(`a cd: ${dir} not found`);
    process.exit(1);
  }
  this.execShell(dir);
};

A.prototype.chrome = function chrome(args) {
  this.runExit('google-chrome', args);
};

A.prototype.cp = function cp(args) {
  const [src, dest = './'] = args;
  if (!src) {
    console.error('a cp: SRC required');
    process.exit(1);
  }
  this.runExit('cp', [src, dest]);
};

A.prototype.cpa = function cpa(args) {
  const [src, dest = './'] = args;
  if (!src) {
    console.error('a cpa: SRC required');
    process.exit(1);
  }
  this.runExit('cp', ['-a', src, dest]);
};

A.prototype.d = function d(args) {
  this.runExit('df', ['-h', ...args]);
};

A.prototype.sha256Key = function sha256Key(password) {
  return crypto.createHash('sha256').update(String(password), 'utf8').digest();
};

A.prototype.enc = function enc(args) {
  const [file, password] = args;
  if (!file || password == null) {
    console.error('a enc: FILE PASSWORD required');
    process.exit(1);
  }
  if (!fs.existsSync(file)) {
    console.error(`a enc: ${file} not found`);
    process.exit(1);
  }
  const key = this.sha256Key(password);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const plain = fs.readFileSync(file);
  const out = Buffer.concat([
    Buffer.from(iv.toString('hex'), 'ascii'),
    cipher.update(plain),
    cipher.final(),
  ]);
  fs.writeFileSync(`${file}.enc`, out);
  process.exit(0);
};

A.prototype.dec = function dec(args) {
  const [file, password] = args;
  if (!file || password == null) {
    console.error('a dec: FILE PASSWORD required');
    process.exit(1);
  }
  const encPath = `${file}.enc`;
  if (!fs.existsSync(encPath)) {
    console.error(`a dec: ${encPath} not found`);
    process.exit(1);
  }
  const data = fs.readFileSync(encPath);
  if (data.length < 32) {
    console.error(`a dec: ${encPath} too short`);
    process.exit(1);
  }
  const iv = Buffer.from(data.subarray(0, 32).toString('ascii'), 'hex');
  if (iv.length !== 16) {
    console.error('a dec: invalid iv hex prefix');
    process.exit(1);
  }
  const key = this.sha256Key(password);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let plain;
  try {
    plain = Buffer.concat([decipher.update(data.subarray(32)), decipher.final()]);
  } catch (err) {
    console.error(`a dec: ${err.message}`);
    process.exit(1);
  }
  fs.writeFileSync(file, plain);
  process.exit(0);
};

A.prototype.dread = function dread(args) {
  const [dir] = args;
  if (!dir) {
    console.error('a dread: DIR required');
    process.exit(1);
  }
  const bin = path.join(dir, 'speedtest.bin');
  this.run('sudo', ['sh', '-c', "echo 3 > /proc/sys/vm/drop_caches"]);
  this.runExit('dd', [
    `if=${bin}`, 'of=/dev/null', 'bs=1M', 'status=progress',
  ]);
};

A.prototype.drive = function drive(args) {
  this.runExit('df', ['-h', ...args]);
};

A.prototype.du = function du(args) {
  const [dir = '.'] = args;
  this.runExit('sudo', ['du', '-sb', dir]);
};

A.prototype.dwrite = function dwrite(args) {
  const [dir] = args;
  if (!dir) {
    console.error('a dwrite: DIR required');
    process.exit(1);
  }
  const bin = path.join(dir, 'speedtest.bin');
  this.run('sync', []);
  this.run('dd', [
    'if=/dev/zero', `of=${bin}`, 'bs=1M', 'count=1024',
    'conv=fdatasync', 'status=progress',
  ]);
  this.runExit('sync', []);
};

A.prototype.e = function e(args) {
  const [file = 'init.json'] = args;
  this.runExit('gedit', [file]);
};

A.prototype.findFanFullspeed = function findFanFullspeed() {
  if (this._fanFullspeed !== undefined) {
    return this._fanFullspeed;
  }
  const found = spawnSync(
    'bash',
    ['-lc', 'find /sys/devices -name fan_fullspeed 2>/dev/null | head -1'],
    { encoding: 'utf8' },
  );
  this._fanFullspeed = (found.stdout || '').trim() || null;
  return this._fanFullspeed;
};

A.prototype.fanHwmonDir = function fanHwmonDir() {
  const full = this.findFanFullspeed();
  if (!full) {
    return null;
  }
  const hwmonRoot = path.join(path.dirname(full), 'hwmon');
  if (!fs.existsSync(hwmonRoot)) {
    return null;
  }
  const kids = fs.readdirSync(hwmonRoot);
  for (const kid of kids) {
    const dir = path.join(hwmonRoot, kid);
    if (fs.statSync(dir).isDirectory()) {
      return dir;
    }
  }
  return null;
};

A.prototype.teeTo = function teeTo(file, value) {
  const result = spawnSync('sudo', ['tee', file], {
    input: `${value}\n`,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

A.prototype.fan = function fan(args) {
  const [mode] = args;

  if (!mode) {
    this.runExit('sudo', ['watch', '-n1', 'a', 'fan', 'temp']);
    return;
  }

  if (mode === 'temp') {
    const result = spawnSync('sensors', {
      encoding: 'utf8',
      env: process.env,
    });
    if (result.error) {
      console.error(result.error.message);
      process.exit(1);
    }
    const lines = (result.stdout || '').split('\n');
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      if (/legion/i.test(lines[i])) {
        out.push(...lines.slice(i, i + 9));
      }
    }
    process.stdout.write(out.join('\n') + (out.length ? '\n' : ''));
    process.exit(result.status ?? 0);
    return;
  }

  if (mode === 'auto' || mode === 'full') {
    const fullspeed = this.findFanFullspeed();
    if (!fullspeed) {
      console.error('a fan: fan_fullspeed not found');
      process.exit(1);
    }
    this.teeTo(fullspeed, mode === 'full' ? '1' : '0');
    process.exit(0);
    return;
  }

  if (/^\d+$/.test(mode)) {
    const hwmon = this.fanHwmonDir();
    if (!hwmon) {
      console.error('a fan: hwmon pwm dir not found');
      process.exit(1);
    }
    let wrote = 0;
    for (let point = 1; point <= 10; point++) {
      for (const pwm of fs.readdirSync(hwmon)) {
        if (pwm.match(new RegExp(`^pwm\\d+_auto_point${point}_pwm$`))) {
          this.teeTo(path.join(hwmon, pwm), mode);
          wrote++;
        }
      }
    }
    if (!wrote) {
      console.error('a fan: no pwm point files found');
      process.exit(1);
    }
    process.exit(0);
    return;
  }

  console.error(`a fan: unknown mode ${mode}`);
  process.exit(1);
};

A.prototype.install = function install(args) {
  const [pkg, ...rest] = args;
  if (!pkg) {
    console.error('a install: PKG required (chrome|cpp|ess|let|rem|PKG)');
    process.exit(1);
  }

  switch (pkg) {
    case 'chrome': {
      const deb = '/tmp/google-chrome-stable_current_amd64.deb';
      const url = 'https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb';
      this.run('wget', ['-O', deb, url], { cwd: '/tmp' });
      this.runExit('sudo', ['apt', 'install', '-y', deb]);
      break;
    }
    case 'cpp':
      this.runExit('sudo', [
        'apt', 'install', '-y',
        'g++', 'libssl-dev', 'zlib1g-dev', 'libsodium-dev',
      ]);
      break;
    case 'ess':
      this.runExit('sudo', [
        'apt-get', 'install', '-y',
        'build-essential', 'autoconf', 'automake', 'libtool', 'pkg-config',
        'curl', 'net-tools', 'zip', 'unzip', 'nano', 'sshfs', 'sshpass', 'iperf3',
      ]);
      break;
    case 'let':
      this.runExit('sudo', ['snap', 'install', '--classic', 'certbot']);
      break;
    case 'rem':
      this.run('sudo', ['apt', 'update']);
      this.runExit('sudo', ['apt', 'install', '-y', 'remmina', 'remmina-plugin-rdp']);
      break;
    default:
      this.runExit('sudo', ['apt', 'install', '-y', pkg, ...rest]);
  }
};

A.prototype.ip = function ip(args) {
  this.runExit('ifconfig', args);
};

A.prototype.kill = function kill() {
  this.runExit('sudo', ['pkill', '-9', '-f', 'nodel']);
};

A.prototype.helpx = function helpx() {
  const dest = '/tmp/x-help.js';
  const body = [
    '#!/usr/bin/env node',
    "'use strict';",
    '',
    '/**',
    ' * a — command help',
    ' * generated by: a helpx',
    ' */',
    '',
    'const help = `',
    this.helpText().replace(/`/g, '\\`'),
    '`;',
    '',
    'if (require.main === module) {',
    '  process.stdout.write(help);',
    '  if (!help.endsWith("\\n")) process.stdout.write("\\n");',
    '}',
    '',
    'module.exports = help;',
    '',
  ].join('\n');
  fs.writeFileSync(dest, body);
  this.runExit('gedit', [dest]);
};

A.prototype.main = function main() {
  const [cmd, ...args] = this.argv;
  if (!cmd) {
    this.usage();
    process.exit(1);
  }
  if (!this.call(cmd, args)) {
    this.runExit(cmd, args);
  }
};

if (require.main === module) {
  new A(process.argv.slice(2)).main();
}

module.exports = A;
