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
      profilePhoto: first('.about-photo img')?.getAttribute('src') || '',
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

function buildCvHtml(data, baseUrl) {
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
  <base href="${escapeHtml(baseUrl)}">
  <title>CV — ${escapeHtml(data.name)}</title>
  <style>
    @page { size: A4; margin: 12mm 13mm 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #e6edf3;
      background: #0a0e17;
      font: 8.5pt/1.42 Inter, "Segoe UI", Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .hero {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 30mm;
      gap: 7mm;
      align-items: center;
      overflow: hidden;
      margin-bottom: 5mm;
      padding: 7mm;
      border: 1px solid #2a3850;
      border-radius: 4mm;
      background: linear-gradient(125deg, #111826 0%, #111826 62%, #17172b 100%);
      break-inside: avoid;
    }
    .hero::after {
      position: absolute;
      top: -24mm;
      right: 19mm;
      width: 56mm;
      height: 56mm;
      border: 1px solid rgba(0, 217, 255, .2);
      border-radius: 50%;
      content: "";
    }
    .eyebrow {
      margin-bottom: 2mm;
      color: #00d9ff;
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: .17em;
      text-transform: uppercase;
    }
    h1 { position: relative; z-index: 1; margin: 0 0 2mm; color: #e6edf3; font-size: 23pt; line-height: 1.08; }
    .headline { margin: 0 0 3mm; color: #00d9ff; font-size: 9.5pt; font-weight: 700; }
    .contact { position: relative; z-index: 1; color: #9ba8b8; font-size: 7.1pt; }
    .separator { padding: 0 1.5mm; color: #7c3aed; }
    .profile-photo {
      position: relative;
      z-index: 1;
      width: 27mm;
      height: 27mm;
      border: 1.1mm solid #1e2a3d;
      border-radius: 50%;
      object-fit: cover;
      outline: .45mm solid #00d9ff;
    }
    .section { margin: 0 0 4mm; break-inside: auto; }
    h2 {
      display: flex;
      align-items: center;
      gap: 2mm;
      margin: 0 0 2mm;
      padding-bottom: 1.1mm;
      border-bottom: 1px solid #1e2a3d;
      color: #00d9ff;
      font-size: 10pt;
      letter-spacing: .1em;
      text-transform: uppercase;
      break-after: avoid;
    }
    h2::before { color: #7c3aed; content: "//"; font-size: 8pt; letter-spacing: 0; }
    p { margin: 1mm 0 0; color: #c1ccd7; }
    .section > p { padding: 2.5mm 3mm; border-left: .7mm solid #00d9ff; border-radius: 0 2mm 2mm 0; background: #111826; }
    .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 3mm; }
    .skill, .credential {
      min-width: 0;
      padding: 2mm 2.5mm;
      border: 1px solid #1e2a3d;
      border-radius: 2mm;
      background: #111826;
      break-inside: avoid;
    }
    .skill strong, .credential strong { display: block; margin-bottom: .6mm; color: #e6edf3; font-size: 8pt; }
    .skill span, .credential span, .meta { color: #9ba8b8; font-size: 7pt; }
    ul { display: grid; gap: 1.5mm; margin: 0; padding: 0; list-style: none; }
    li {
      padding: 2mm 2.5mm;
      border: 1px solid #1e2a3d;
      border-left: .7mm solid #7c3aed;
      border-radius: 0 2mm 2mm 0;
      background: #111826;
      color: #c1ccd7;
      break-inside: avoid;
    }
    .project {
      margin: 0 0 2mm;
      padding: 2.5mm 3mm;
      border: 1px solid #1e2a3d;
      border-radius: 2mm;
      background: #111826;
      break-inside: avoid;
    }
    .entry-heading { display: flex; gap: 3mm; justify-content: space-between; align-items: baseline; }
    .entry-heading strong { color: #e6edf3; font-size: 8.5pt; }
    .entry-heading span { color: #00d9ff; font-size: 7pt; text-align: right; }
    .meta { margin-top: 1mm; color: #00d9ff; }
    .footer {
      margin-top: 4mm;
      padding-top: 2mm;
      border-top: 1px solid #1e2a3d;
      color: #6b7688;
      font-size: 7pt;
    }
  </style>
</head>
<body>
  <header class="hero">
    <div>
      <div class="eyebrow">Cyber Security · AI · Product</div>
      <h1>${escapeHtml(data.name)}</h1>
      <p class="headline">${escapeHtml(data.headline)}</p>
      <div class="contact">${contact}</div>
    </div>
    ${data.profilePhoto ? `<img class="profile-photo" src="${escapeHtml(data.profilePhoto)}" alt="">` : ''}
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
    await page.setContent(buildCvHtml(data, `${server.origin}/`), { waitUntil: 'load' });
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
