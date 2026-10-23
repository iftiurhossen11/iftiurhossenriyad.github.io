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
      const description = text(card.querySelector('.project-desc'));
      const status = text(card.querySelector('.project-status'));
      const context = text(card.querySelector('.project-context'));
      const technologies = [...card.querySelectorAll('.project-tech span')].map(text).filter(Boolean);
      return {
        title,
        role,
        status,
        description: description.slice(0, 300),
        context,
        technologies,
        repository: card.querySelector('.project-link')?.href || ''
      };
    }).filter((project) => project.title);
    const genieCards = all('#mygenie .mygenie-card').map(cardText);
    const overview = genieCards.find((value) => value.startsWith('Overview')) || '';
    const cofounders = genieCards.find((value) => value.startsWith('Co-Founders')) || '';
    const certificates = all('.cert-card').map((card) => ({
      title: text(card.querySelector('h4')),
      issuer: text(card.querySelector('.cert-issuer')),
      date: text(card.querySelector('.cert-date')),
      verifyUrl: card.querySelector('.cert-verify')?.href || ''
    })).filter((item) => item.title);

    return {
      name: clean(first('.hero-name')?.textContent) || text(first('h1')),
      headline: text(first('.hero-tagline')) || text(first('.hero-subtitle')),
      profilePhoto: first('.about-photo img')?.getAttribute('src') || '',
      email: text(all('#contact .contact-item')[0]),
      phone: text(all('#contact .contact-item')[1]),
      location: text(all('#contact .contact-item')[2]),
      socialLinks: all('#heroSocials a').map((link) => ({
        name: link.getAttribute('aria-label') || link.title || text(link),
        url: link.href
      })),
      summary: all('#about p').map(text).filter(Boolean).slice(0, 2).join(' '),
      skills: all('.skill-card').map((card) => ({
        title: text(card.querySelector('h3, h4')),
        items: [...card.querySelectorAll('li, .skill-item, span')]
          .map(text).filter((value) => value && value !== text(card.querySelector('h3, h4')))
          .slice(0, 14)
      })).filter((item) => item.title),
      education: all('#education .timeline-content').map((card) => ({
        date: text(card.querySelector('.timeline-date')),
        title: text(card.querySelector('h3')),
        organization: text(card.querySelector('.timeline-org')),
        details: [...card.querySelectorAll('p:not(.timeline-org)')].map(text).filter(Boolean)
      })).filter((item) => item.title),
      projects,
      mygenie: {
        title: text(first('#mygenie h2')),
        overview: overview.replace(/^Overview\s*/, '').slice(0, 470),
        cofounders: cofounders.replace(/^Co-Founders\s*/, '').replace(/\s+/g, ' ').trim()
      },
      achievements: all('.achievement-card').map((card) => ({
        title: text(card.querySelector('h3')),
        organization: text(card.querySelector('.achievement-org')),
        description: [...card.querySelectorAll('p:not(.achievement-org)')].map(text).filter(Boolean).join(' ')
      })).filter((item) => item.title),
      leadership: all('.leadership-card').map(cardText).filter(Boolean),
      interests: all('#creative .creative-card')
        .filter((card) => !/blog/i.test(text(card.querySelector('h3'))))
        .map((card) => {
          const title = text(card.querySelector('h3'));
          const description = text(card.querySelector('p'));
          return description ? `${title} - ${description}` : title;
        })
        .filter(Boolean),
      certificates
    };
  });
  await page.close();
  return data;
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

function buildCvHtml(data, baseUrl) {
  const skills = data.skills.map((skill) => `
    <div class="skill-row"><strong>${escapeHtml(skill.title)}:</strong> ${escapeHtml(skill.items.join(', '))}</div>`).join('');
  const education = data.education.map((item) => `
    <div class="education-entry">
      <strong>${escapeHtml(item.organization || item.title)}</strong>
      <div>${escapeHtml(item.title)}${item.details.length ? ` - ${escapeHtml(item.details.join(' | '))}` : ''}${item.date ? ` | ${escapeHtml(item.date)}` : ''}</div>
    </div>`).join('');
  const contact = [data.email, data.phone, data.location]
    .map((value) => (value || '').replace(/^(EMAIL|PHONE|LOCATION)\s*/i, '').trim())
    .filter(Boolean)
    .map(escapeHtml)
    .join('<span class="separator">|</span>');
  const socialLinks = data.socialLinks
    .filter((link) => /github|tryhackme|hack the box/i.test(link.name))
    .map((link) => `<a href="${escapeHtml(link.url)}">${escapeHtml(link.name)}</a>`)
    .join('<span class="separator">|</span>');
  const preferredCertificateTitles = [
    'AV/EDR Evasion Practical Techniques',
    'Offensive Agent AI Course',
    'Introduction to Bug Bounty',
    'Foundations of Log Analysis for Cyber Defense',
    'Malware Analysis Introduction',
    'Introduction to Offensive Security with AI',
    'AI 100: Fundamentals',
    'Programming 100: Fundamentals',
    'Linux 100: Fundamentals',
    'C Programming Fundamentals'
  ];
  const certificatesByTitle = new Map(data.certificates.map((certificate) => [certificate.title.toLowerCase(), certificate]));
  const selectedCertificates = preferredCertificateTitles
    .map((title) => certificatesByTitle.get(title.toLowerCase())
      || data.certificates.find((certificate) => certificate.title.toLowerCase().startsWith(title.toLowerCase())))
    .filter(Boolean);
  const certificates = (selectedCertificates.length ? selectedCertificates : data.certificates.slice(0, 10))
    .map((item) => `
      <div class="certificate-entry">
        ${item.verifyUrl ? `<a href="${escapeHtml(item.verifyUrl)}"><strong>${escapeHtml(item.title)}</strong></a>` : `<strong>${escapeHtml(item.title)}</strong>`} - ${escapeHtml(item.issuer)}${item.date ? `, ${escapeHtml(item.date.replace(/^(Issued|Completed):\s*/i, ''))}` : ''}
        ${item.verifyUrl ? `<div class="certificate-url"><a href="${escapeHtml(item.verifyUrl)}">${escapeHtml(item.verifyUrl)}</a></div>` : ''}
      </div>`).join('');
  const projectOrder = ['NOJORGHOR', 'IR PROHORI', 'THREATGUARD', 'SECUREAUDIT', 'CAMPUSNET', 'SURAKSHA', 'APON', 'BUY & SELL PLATFORM', 'EDUQUIZ'];
  const orderedProjects = [...data.projects].sort((a, b) => {
    const aIndex = projectOrder.indexOf(a.title.toUpperCase());
    const bIndex = projectOrder.indexOf(b.title.toUpperCase());
    return (aIndex < 0 ? projectOrder.length : aIndex) - (bIndex < 0 ? projectOrder.length : bIndex);
  });
  const renderProject = (project) => `
    <article class="project">
      <div class="project-heading"><strong>${escapeHtml(project.title)}${project.role ? ` - ${escapeHtml(project.role)}` : ''}</strong>${project.repository ? ` <a href="${escapeHtml(project.repository)}">GitHub</a>` : ''}</div>
      ${project.context ? `<div class="project-context">${escapeHtml(project.context)}</div>` : ''}
      ${project.description ? `<div class="project-description"><span class="bullet">•</span> ${escapeHtml(project.description)}</div>` : ''}
    </article>`;
  const firstPageProjects = orderedProjects.slice(0, 6).map(renderProject).join('');
  const secondPageProjects = orderedProjects.slice(6).map(renderProject).join('');
  const leadership = data.leadership.map((item) => `<div class="leadership-entry">${escapeHtml(item)}</div>`).join('');
  const achievements = data.achievements.map((item) => `
    <div class="achievement-entry"><strong>${escapeHtml(item.title)}</strong>${item.organization ? ` (${escapeHtml(item.organization)})` : ''}${item.description ? ` - ${escapeHtml(item.description)}` : ''}</div>`).join('');
  const languageSkill = data.skills.find((skill) => /language/i.test(skill.title));
  const interests = data.interests.join(', ');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <base href="${escapeHtml(baseUrl)}">
  <title>CV - ${escapeHtml(data.name)}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 13mm 14mm;
      @bottom-right {
        color: #777;
        font: 8pt "Times New Roman", serif;
        content: "Md Iftiur Hossen Riyad  |  Page " counter(page);
      }
    }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; background: #fff; font: 8pt/1.17 "Times New Roman", Times, serif; }
    a { color: #174f88; text-decoration: none; }
    .header { position: relative; min-height: 29mm; margin-bottom: 2mm; padding: 0 25mm 3mm 0; border-bottom: 1.2pt solid #222; }
    h1 { margin: 0 0 1mm; font-size: 17pt; line-height: 1.08; }
    .headline { margin: 0 0 1mm; font-size: 9pt; font-style: italic; }
    .contact, .social { font-size: 7.3pt; line-height: 1.35; }
    .social { margin-top: .5mm; }
    .separator { padding: 0 1.2mm; }
    .profile-photo {
      position: absolute;
      top: 0;
      right: 4.5pt;
      width: 63.78pt;
      height: 82.2pt;
      object-fit: cover;
      object-position: center top;
    }
    .section { margin: 0 0 2mm; }
    h2 { margin: 0 0 1mm; padding-bottom: .6mm; border-bottom: .7pt solid #777; font-size: 9pt; line-height: 1.1; break-after: avoid; }
    .summary { text-align: justify; }
    .education-entry { margin: 0 0 .8mm; }
    .education-entry:last-child { margin-bottom: 0; }
    .skill-row { margin: 0 0 .55mm; }
    .skill-row:last-child { margin-bottom: 0; }
    .leadership-entry { margin: 0 0 .6mm; }
    .project { margin: 0 0 1.2mm; break-inside: avoid; }
    .project-heading { font-weight: 700; }
    .project-context { color: #444; font-size: 7.5pt; font-style: italic; }
    .project-description { padding-left: 3.3mm; text-indent: -2.3mm; }
    .bullet { font-size: 8.3pt; }
    .page-two { break-before: page; }
    .running-header { display: flex; justify-content: space-between; margin-bottom: 2mm; padding-bottom: 1mm; border-bottom: .5pt solid #aaa; color: #555; font-size: 7pt; }
    .achievement-entry { margin: 0 0 .7mm; }
    .certificate-entry { position: relative; margin: 0 0 .55mm; padding-left: 3mm; text-indent: -2.5mm; }
    .certificate-entry::before { content: "• "; }
    .certificate-url { padding-left: 2.5mm; font-size: 6.8pt; text-indent: 0; overflow-wrap: anywhere; }
    .languages, .interests { margin: 0 0 .6mm; }
  </style>
</head>
<body>
  <header class="header">
    <h1>${escapeHtml(data.name)}</h1>
    <div class="headline">${escapeHtml(data.headline.replace(/,\s*/g, ' | '))}</div>
    <div class="contact">${contact}</div>
    <div class="social">${socialLinks}</div>
    ${data.profilePhoto ? `<img class="profile-photo" src="${escapeHtml(data.profilePhoto)}" alt="">` : ''}
  </header>
  <section class="section">
    <h2>PROFESSIONAL SUMMARY</h2>
    <div class="summary">${escapeHtml(data.summary)}</div>
  </section>
  <section class="section">
    <h2>EDUCATION</h2>
    ${education}
  </section>
  <section class="section">
    <h2>TECHNICAL SKILLS</h2>
    ${skills}
  </section>
  <section class="section">
    <h2>STARTUP &amp; LEADERSHIP</h2>
    <div class="leadership-entry"><strong>${escapeHtml(data.mygenie.title || 'MyGenie')}</strong> - ${escapeHtml(data.headline)}</div>
    ${data.mygenie.cofounders ? `<div class="leadership-entry"><em>Co-founders: ${escapeHtml(data.mygenie.cofounders)}</em></div>` : ''}
    ${data.mygenie.overview ? `<div class="leadership-entry"><span class="bullet">•</span> ${escapeHtml(data.mygenie.overview)}</div>` : ''}
    ${leadership}
  </section>
  <section class="section">
    <h2>FEATURED PROJECTS</h2>
    ${firstPageProjects}
  </section>
  <div class="page-two">
    <div class="running-header"><span>${escapeHtml(data.name)}</span><span>Page 2</span></div>
    <section class="section">${secondPageProjects}</section>
    <section class="section">
      <h2>COMPETITIONS &amp; FELLOWSHIPS</h2>
      ${achievements}
    </section>
    <section class="section">
      <h2>CERTIFICATIONS &amp; PROFESSIONAL DEVELOPMENT</h2>
      ${certificates}
    </section>
    <section class="section">
      <h2>LANGUAGES &amp; INTERESTS</h2>
      ${languageSkill ? `<div class="languages"><strong>Languages:</strong> ${escapeHtml(languageSkill.items.join(', '))}</div>` : ''}
      ${interests ? `<div class="interests"><strong>Interests:</strong> ${escapeHtml(interests)}</div>` : ''}
    </section>
  </div>
</body>
</html>`;
}

async function main() {
  await access(join(siteDirectory, 'index.html'));

  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'portfolio-cv-'));
  const pdfPath = join(temporaryDirectory, 'cv.pdf');
  const server = await serveStaticFiles(siteDirectory);
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const data = await extractPageData(context, `${server.origin}/index.html`);

    if (!data.name || !data.summary || !data.skills.length || !data.education.length) {
      throw new Error('Portfolio data is incomplete; expected profile, skills, and education content.');
    }

    const page = await context.newPage();
    await page.setContent(buildCvHtml(data, `${server.origin}/`), { waitUntil: 'load' });
    const photoRatio = await page.locator('.profile-photo').evaluate((image) => {
      const { width, height } = image.getBoundingClientRect();
      return width / height;
    });
    if (!Number.isFinite(photoRatio) || Math.abs(photoRatio - 0.776) > 0.01) {
      throw new Error(`Expected a passport-style portrait photo (0.776 ratio), got ${photoRatio}.`);
    }
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true
    });
    await page.close();

    const pdf = await PDFDocument.load(await readFile(pdfPath));
    if (pdf.getPageCount() !== 2) {
      throw new Error(`Expected a two-page reference-style CV, generated ${pdf.getPageCount()} pages.`);
    }
    await copyFile(pdfPath, outputPath);
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
