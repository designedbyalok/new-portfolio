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
      if (file.endsWith('.astro')) {
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

  // Change <div class="top-bar-wrapper..."> to something we can make sticky without breaking layout
  // Actually, let's just make the back-link-circle itself sticky, and change the wrapper to NOT be absolute on desktop, or just use sticky for the wrapper.
  
  if (content.includes('top-bar-wrapper')) {
     content = content.replace(/\.top-bar-wrapper\s*\{[^}]*\}/g, match => {
        if (match.includes('position: absolute')) {
           return `.top-bar-wrapper {
      position: sticky;
      top: 32px;
      left: -60px;
      width: 0;
      height: 0;
      margin-bottom: 0;
      z-index: 100;
    }`;
        }
        return `.top-bar-wrapper {
    position: sticky;
    top: 32px;
    z-index: 100;
    width: fit-content;
  }`;
     });
     changed = true;
  }

  if (content.includes('class="top-bar animate a1" style="margin-bottom: 24px;"')) {
     content = content.replace('class="top-bar animate a1" style="margin-bottom: 24px;"', 'class="top-bar-wrapper animate a1" style="margin-bottom: 24px; position: sticky; top: 32px; z-index: 100; width: fit-content;"');
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
}
