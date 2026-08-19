import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function run(command, args, name, cwd = root) {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env,
  });

  const prefix = `[${name}]`;
  child.stdout.on('data', (data) => {
    String(data)
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => console.log(prefix, line));
  });
  child.stderr.on('data', (data) => {
    String(data)
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => console.error(prefix, line));
  });
  child.on('exit', (code) => {
    console.log(prefix, `exited with code ${code}`);
    process.exit(code || 0);
  });
  return child;
}

const api = run('npm', ['run', 'dev'], 'api', path.join(root, 'server'));
const web = run('npx', ['next', 'dev', '--turbopack'], 'web');

const shutdown = () => {
  api.kill();
  web.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
