import fs from 'fs';

let content = fs.readFileSync('src/pages/resume.astro', 'utf8');

// Update screen sizes
content = content.replace(/\.summary-text\s*\{[^}]*font-size:\s*13px;/, match => match.replace('13px', 'var(--text-base)'));
content = content.replace(/\.exp-bullets li\s*\{[^}]*font-size:\s*12px;/, match => match.replace('12px', 'var(--text-base)'));
content = content.replace(/\.exp-company\s*\{[^}]*font-size:\s*14px;/, match => match.replace('14px', 'var(--text-lg)'));
content = content.replace(/\.exp-role\s*\{[^}]*font-size:\s*12px;/, match => match.replace('12px', 'var(--text-base)'));
content = content.replace(/\.exp-date\s*\{[^}]*font-size:\s*11px;/, match => match.replace('11px', 'var(--text-sm)'));
content = content.replace(/\.edu-degree\s*\{[^}]*font-size:\s*13px;/, match => match.replace('13px', 'var(--text-lg)'));
content = content.replace(/\.edu-school\s*\{[^}]*font-size:\s*12px;/, match => match.replace('12px', 'var(--text-base)'));
content = content.replace(/\.edu-date\s*\{[^}]*font-size:\s*11px;/, match => match.replace('11px', 'var(--text-sm)'));
content = content.replace(/\.skill-category\s*\{[^}]*font-size:\s*12px;/, match => match.replace('12px', 'var(--text-base)'));
content = content.replace(/\.skill-tag\s*\{[^}]*font-size:\s*11px;/, match => match.replace('11px', 'var(--text-sm)'));
content = content.replace(/\.interest-tag\s*\{[^}]*font-size:\s*11px;/, match => match.replace('11px', 'var(--text-sm)'));
content = content.replace(/\.contact-pill\s*\{[^}]*font-size:\s*12px;/, match => match.replace('12px', 'var(--text-sm)'));
content = content.replace(/\.download-btn\s*\{[^}]*font-size:\s*11px;/, match => match.replace('11px', 'var(--text-sm)'));
content = content.replace(/\.back-link\s*\{[^}]*font-size:\s*12px;/, match => match.replace('12px', 'var(--text-sm)'));

// Inject print overrides
const printOverrides = `
    .exp-company { font-size: 14px !important; }
    .exp-role { font-size: 12px !important; }
    .exp-date { font-size: 11px !important; }
    .edu-degree { font-size: 13px !important; }
    .edu-school { font-size: 12px !important; }
    .edu-date { font-size: 11px !important; }
    .skill-category { font-size: 12px !important; }
    .skill-tag { font-size: 11px !important; }
    .interest-tag { font-size: 11px !important; }
    .contact-pill { font-size: 12px !important; }`;

content = content.replace(/\.summary-text \{ font-size: 11px; \}/, match => match + printOverrides);

fs.writeFileSync('src/pages/resume.astro', content);
console.log('Updated font sizes');
