import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.astro') && !file.includes('TopBar.astro') && !file.includes('Layout.astro')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src/pages');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (file.includes('index.astro') && !file.includes('blog') && !file.includes('work') && !file.includes('projects')) {
    // handled manually
    continue;
  }
  if (file.includes('resume.astro')) {
    // handled manually
    continue;
  }

  // Add import if not present
  if (!content.includes('import TopBar')) {
    const depth = file.split('src/pages/')[1].split('/').length - 1;
    const prefix = depth === 0 ? '../' : '../../';
    const importStatement = `import TopBar from "${prefix}components/TopBar.astro";\n`;
    
    // insert import after Layout import
    content = content.replace(/(import Layout.*?\n)/, `$1${importStatement}`);
    changed = true;
  }

  // Remove logo and replace with TopBar
  const logoRegex = /<a href="\/".*?>\s*<img src="\/favicon\.svg"[^>]*>\s*<\/a>/;
  if (logoRegex.test(content)) {
    content = content.replace(logoRegex, '<TopBar />');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
}
