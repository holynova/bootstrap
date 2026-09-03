const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, '.cloudflare', 'pages');

function hasRef(ref) {
  try {
    execFileSync('git', ['rev-parse', '--verify', ref], { cwd: root, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (!hasRef('origin/gh-pages')) {
  execFileSync('git', ['fetch', 'origin', 'gh-pages:refs/remotes/origin/gh-pages'], {
    cwd: root,
    stdio: 'inherit'
  });
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

const archive = execFileSync('git', ['archive', 'origin/gh-pages'], {
  cwd: root,
  maxBuffer: 256 * 1024 * 1024
});
execFileSync('tar', ['-x', '-C', output], { input: archive });

// The original artifact was built for getbootstrap.com at the host root.
// Rewrite only the root document so it also works at /bootstrap/ on GitHub Pages.
const indexPath = path.join(output, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');
index = index
  .replaceAll('href="../dist/', 'href="dist/')
  .replaceAll('src="../dist/', 'src="dist/')
  .replaceAll('href="../assets/', 'href="assets/')
  .replaceAll('src="../assets/', 'src="assets/')
  .replaceAll('href="../"', 'href="./"')
  .replaceAll('href="../getting-started/', 'href="getting-started/')
  .replaceAll('href="../css/', 'href="css/')
  .replaceAll('href="../components/', 'href="components/')
  .replaceAll('href="../javascript/', 'href="javascript/')
  .replaceAll('href="../customize/', 'href="customize/')
  .replaceAll('href="../2.3.2/', 'href="2.3.2/')
  .replaceAll('href="../about/', 'href="about/')
  .replaceAll('href="/apple-touch-icon.png"', 'href="apple-touch-icon.png"')
  .replaceAll('href="/favicon.ico"', 'href="favicon.ico"');
fs.writeFileSync(indexPath, index);

console.log(`Built static pages at ${path.relative(root, output)}`);
