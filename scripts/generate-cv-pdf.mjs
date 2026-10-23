import { createReadStream } from 'node:fs';
import { access, copyFile, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { chromium } from 'playwright';

const siteDirectory = resolve(process.argv[2] || '.');
const outputPath = resolve(process.argv[3] || join(siteDirectory, 'Iftiur_Hossen_Riyad_CV.pdf'));

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8']
]);

async function serveStaticFiles(root) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
      const rootPath = resolve(root);
      const requestedPath = resolve(rootPath, `.${pathname}`);
      if (requestedPath !== rootPath && !requestedPath.startsWith(`${rootPath}${sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      const filePath = requestedPath === rootPath || pathname.endsWith('/')
        ? join(requestedPath, 'index.html')
        : requestedPath;
      const fileInfo = await stat(filePath);
      if (!fileInfo.isFile()) {
        response.writeHead(404).end('Not found');
        return;
      }

      response.writeHead(200, {
        'Content-Length': fileInfo.size,
        'Content-Type': mimeTypes.get(extname(filePath).toLowerCase()) || 'application/octet-stream'
      });
      if (request.method === 'HEAD') {
        response.end();
      } else {
        createReadStream(filePath).pipe(response);
      }
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(500).end('Internal server error');
      server.emit('requestError', error);
    }
  });

  server.on('requestError', (error) => {
    console.error('Static site server error:', error);
  });

  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Could not determine the local preview server address.');
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolveClose, reject) => {
      server.close((error) => error ? reject(error) : resolveClose());
    })
  };
}

async function extractPageData(browser, url) {
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('language', 'en'));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  const data = await page.evaluate(() => {
    const clean = (value) => (value || '')
      .replace(/[·•]/g, ',')
      .replace(/[—–]/g, '-')
      .replace(/\s*(?:,|\|)?\s*(?:Student\s+)?ID:\s*[A-Za-z0-9_-]+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    const text = (element) => clean(element?.innerText);
    const all = (selector) => [...document.querySelectorAll(selector)];
    const first = (selector) => document.querySelector(selector);
    const cardText = (element) => text(element);
    const projects = all('#projects .project-card').map((card) => {
      const title = text(card.querySelector('h3'));
      const role = text(card.querySelector('.project-role'));
      const paragraphs = [...card.querySelectorAll('p')]
        .map(text)
        .filter((value) => value && value !== role);
      const technologies = text(card.querySelector('.project-tech'));
      return {
        title,
        role,
        description: (paragraphs.find((value) => value.length > 50) || paragraphs[0] || '').slice(0, 390),
        technologies: technologies.slice(0, 110)
      };
    }).filter((project) => project.title);
    const overview = all('#mygenie .mygenie-card')
      .map(cardText)
      .find((value) => value.startsWith('Overview')) || '';
    const certificates = all('.cert-card').map((card) => ({
      title: text(card.querySelector('h4')),
      issuer: text(card.querySelector('.cert-issuer')),
      date: text(card.querySelector('.cert-date'))
    })).filter((item) => item.title);

    return {
      name: clean(first('.hero-name')?.textContent) || text(first('h1')),
      headline: text(first('.hero-tagline')) || text(first('.hero-subtitle')),
      email: text(all('#contact .contact-item')[0]),
      phone: text(all('#contact .contact-item')[1]),
      location: text(all('#contact .contact-item')[2]),
      summary: all('#about p').map(text).filter(Boolean).slice(0, 2).join(' '),
      skills: all('.skill-card').map((card) => ({
        title: text(card.querySelector('h3, h4')),
        items: [...card.querySelectorAll('li, .skill-item, span')]
          .map(text).filter((value) => value && value !== text(card.querySelector('h3, h4')))
          .slice(0, 14)
      })).filter((item) => item.title),
      education: all('#education .timeline-content').map(cardText).filter(Boolean),
      projects,
      mygenie: {
        title: text(first('#mygenie h2')),
        overview: overview.replace(/^Overview\s*/, '').slice(0, 470)
      },
      research: all('.research-card').map(cardText).filter(Boolean),
      achievements: all('.achievement-card').map(cardText).filter(Boolean),
      leadership: all('.leadership-card').map(cardText).filter(Boolean),
      certificates,
      selectedWriting: []
    };
  });
  await page.close();
  return data;
}

async function extractWriting(browser, url) {
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('language', 'en'));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  const writing = await page.evaluate(() => [...document.querySelectorAll('.blog-card')]
    .map((card) => ({
      title: card.querySelector('h2, h3, h4')?.innerText?.replace(/\s+/g, ' ').trim() || '',
      category: card.querySelector('.blog-category, .post-category, .blog-card-category')?.innerText?.replace(/\s+/g, ' ').trim() || ''
    }))
    .filter((item) => item.title)
    .slice(0, 6));
  await page.close();
  return writing;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function section(title, content) {
  return content ? `<section class="section"><h2>${escapeHtml(title)}</h2>${content}</section>` : '';
}

function buildCvHtml(data) {
  const skills = data.skills.map((skill) => `
    <div class="skill">
      <strong>${escapeHtml(skill.title)}</strong>
      <span>${escapeHtml(skill.items.join(', '))}</span>
    </div>`).join('');
  const education = data.education.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const projects = data.projects.map((project) => `
    <article class="project">
      <div class="entry-heading"><strong>${escapeHtml(project.title)}</strong><span>${escapeHtml(project.role)}</span></div>
      <p>${escapeHtml(project.description)}</p>
      ${project.technologies ? `<div class="meta">${escapeHtml(project.technologies)}</div>` : ''}
    </article>`).join('');
  const research = data.research.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const achievements = data.achievements.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const leadership = data.leadership.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const certificates = data.certificates.map((item) => `
    <div class="credential"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.issuer)}${item.date ? ` - ${escapeHtml(item.date)}` : ''}</span></div>`).join('');
  const writing = data.selectedWriting.map((item) => `
    <div class="credential"><strong>${escapeHtml(item.title)}</strong>${item.category ? `<span>${escapeHtml(item.category)}</span>` : ''}</div>`).join('');
  const contact = [data.email, data.phone, data.location]
    .map((value) => (value || '').replace(/^(EMAIL|PHONE|LOCATION)\s*/i, '').trim())
    .filter(Boolean)
    .map(escapeHtml)
    .join('<span class="separator">|</span>');
  const experienceTitle = data.headline.match(/Founder\s*&\s*CEO\s*@\s*MyGenie/i)?.[0] || data.mygenie.title;
  const experience = data.mygenie.overview
    ? `<div class="entry-heading"><strong>${escapeHtml(experienceTitle)}</strong><span>AI product &amp; business</span></div><p>${escapeHtml(data.mygenie.overview)}</p>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CV — ${escapeHtml(data.name)}</title>
  <style>
    @page { size: A4; margin: 14mm 15mm 15mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #172b42; font: 9pt/1.42 Arial, Helvetica, sans-serif; }
    header { border-bottom: 2px solid #147d92; padding-bottom: 8mm; margin-bottom: 5mm; }
    h1 { font-size: 25pt; line-height: 1.08; margin: 0 0 2mm; color: #10283f; }
    .headline { color: #147d92; font-weight: 700; font-size: 11pt; margin: 0 0 3mm; }
    .contact { color: #526477; font-size: 8pt; }
    .separator { padding: 0 2mm; color: #91a0ae; }
    .section { margin: 0 0 4.5mm; break-inside: auto; }
    h2 { border-bottom: 1px solid #d8e2e9; color: #147d92; font-size: 11pt; letter-spacing: .08em; margin: 0 0 2.5mm; padding-bottom: 1mm; text-transform: uppercase; break-after: avoid; }
    p { margin: 1mm 0 0; }
    .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 7mm; }
    .skill, .credential { break-inside: avoid; margin-bottom: 2mm; }
    .skill strong, .credential strong { display: block; font-size: 8.5pt; }
    .skill span, .credential span, .meta { color: #526477; font-size: 7.7pt; }
    ul { margin: 0; padding-left: 4mm; }
    li { margin: 0 0 1.5mm; }
    .project { margin: 0 0 3mm; break-inside: avoid; }
    .entry-heading { display: flex; gap: 3mm; justify-content: space-between; align-items: baseline; }
    .entry-heading strong { font-size: 9pt; }
    .entry-heading span { color: #526477; font-size: 7.7pt; text-align: right; }
    .meta { margin-top: 1mm; }
    .footer { border-top: 1px solid #d8e2e9; color: #738294; font-size: 7pt; margin-top: 5mm; padding-top: 2mm; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(data.name)}</h1>
    <p class="headline">${escapeHtml(data.headline)}</p>
    <div class="contact">${contact}</div>
  </header>
  ${section('Professional Profile', data.summary ? `<p>${escapeHtml(data.summary)}</p>` : '')}
  ${section('Core Skills', skills ? `<div class="columns">${skills}</div>` : '')}
  ${section('Experience', experience)}
  ${section('Selected Projects', projects)}
  ${section('Education', education ? `<ul>${education}</ul>` : '')}
  ${section('Research', research ? `<ul>${research}</ul>` : '')}
  ${section('Awards & Recognition', achievements ? `<ul>${achievements}</ul>` : '')}
  ${section('Leadership', leadership ? `<ul>${leadership}</ul>` : '')}
  ${section('Certifications', certificates ? `<div class="columns">${certificates}</div>` : '')}
  ${section('Selected Writing', writing ? `<div class="columns">${writing}</div>` : '')}
  <div class="footer">Generated from the latest portfolio content | ${escapeHtml(data.name)}</div>
</body>
</html>`;
}

async function main() {
  await access(join(siteDirectory, 'index.html'));
  await access(join(siteDirectory, 'blog.html'));

  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'portfolio-cv-'));
  const pdfPath = join(temporaryDirectory, 'cv.pdf');
  const server = await serveStaticFiles(siteDirectory);
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const data = await extractPageData(context, `${server.origin}/index.html`);
    data.selectedWriting = await extractWriting(context, `${server.origin}/blog.html`);

    if (!data.name || !data.summary || !data.skills.length || !data.education.length) {
      throw new Error('Portfolio data is incomplete; expected profile, skills, and education content.');
    }

    const page = await context.newPage();
    await page.setContent(buildCvHtml(data), { waitUntil: 'load' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true
    });
    await page.close();

    await copyFile(pdfPath, outputPath);
    const pdf = await PDFDocument.load(await readFile(outputPath));
    console.log(`Generated ${outputPath} (${pdf.getPageCount()} pages).`);
  } finally {
    if (browser) await browser.close();
    await server.close();
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error('Could not generate the portfolio CV PDF:', error);
  process.exitCode = 1;
});
