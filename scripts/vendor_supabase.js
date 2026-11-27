const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function vendorSupabase() {
  const rootDir = path.resolve(__dirname, '..');
  const srcJs = path.join(rootDir, 'node_modules', '@supabase', 'supabase-js', 'dist', 'umd', 'supabase.js');
  const pkgJs = path.join(rootDir, 'node_modules', '@supabase', 'supabase-js', 'package.json');

  if (!fs.existsSync(srcJs)) {
    console.error('Error: @supabase/supabase-js UMD build not found at:', srcJs);
    process.exit(1);
  }

  const vendorDir = path.join(rootDir, 'shared', 'vendor');
  if (!fs.existsSync(vendorDir)) {
    fs.mkdirSync(vendorDir, { recursive: true });
  }

  const jsContent = fs.readFileSync(srcJs);
  const pkgContent = JSON.parse(fs.readFileSync(pkgJs, 'utf8'));
  const version = pkgContent.version || '2.39.0';

  const hash = crypto.createHash('sha256').update(jsContent).digest('hex');

  const destJs = path.join(vendorDir, 'supabase.js');
  const destVersion = path.join(vendorDir, 'supabase.VERSION.txt');

  fs.writeFileSync(destJs, jsContent);
  fs.writeFileSync(destVersion, `version: ${version}\nsha256: ${hash}\n`);

  console.log(`Vendored Supabase JS v${version} to shared/vendor/supabase.js`);
  console.log(`SHA-256: ${hash}`);
}

vendorSupabase();
