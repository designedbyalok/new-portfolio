const fs = require('fs');
const glob = require('glob'); // use standard sync or just write custom walker
const path = require('path');

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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add import if not present
  if (!content.includes('import TopBar')) {
    const depth = file.split('src/pages/')[1].split('/').length - 1;
    const prefix = depth === 0 ? '../' : '../../';
    const importStatement = `import TopBar from "${prefix}components/TopBar.astro";\n`;
    
    // insert import after Layout import
    content = content.replace(/(import Layout.*?\n)/, `$1${importStatement}`);
    changed = true;
  }

  // Remove logo in inner pages
  const logoRegex = /<a href="\/".*?><img src="\/favicon\.svg".*?><\/a>/;
  if (logoRegex.test(content) && !file.includes('index.astro') && !file.includes('resume.astro')) {
    content = content.replace(logoRegex, '<TopBar />');
    changed = true;
  }

  // Handle resume.astro specifically since it has a top-bar div
  if (file.includes('resume.astro')) {
    const resumeRegex = /<div class="top-bar[^>]*>[\s\S]*?<\/div>\s*<\/div>/;
    if (resumeRegex.test(content)) {
       // resume's top bar is complicated. Let's just manually fix resume and index later.
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
