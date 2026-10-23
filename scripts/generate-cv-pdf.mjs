import { createReadStream } from 'node:fs';
import { access, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
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

const printStyles = `
  @page { size: A4; margin: 12mm 12mm 14mm; }
  @media print {
    html, body {
      width: auto !important;
      height: auto !important;
      overflow: visible !important;
      background: #fff !important;
      color: #182230 !important;
    }
    body { font-size: 9pt !important; line-height: 1.48 !important; }
    .navbar, .skip-link, .portfolio-return-link, .cookie-banner,
    .pwa-install-banner, .newsletter-form, .contact-form, .hero-cta, .hero-socials,
    .hero-terminal-input, .terminal-input-line, .project-search,
    .blog-filters, .blog-feed-link, .project-image-viewer,
    .filter-btn, button, input, textarea, select { display: none !important; }
    a { color: #075985 !important; text-decoration: none !important; }
    .hero {
      min-height: 0 !important;
      padding: 12mm 0 8mm !important;
      overflow: visible !important;
      border-bottom: 1px solid #cbd5e1;
    }
    .hero-container {
      max-width: none !important;
      grid-template-columns: 1fr !important;
      gap: 0 !important;
      padding: 0 !important;
    }
    .hero-content { padding: 0 !important; }
    .hero-content::before, .hero-glow, .hero-bg-grid, .hero-visual { display: none !important; }
    .hero-name { font-size: 28pt !important; margin-bottom: 5mm !important; }
    .hero-tagline, .hero-subtitle { max-width: none !important; font-size: 10pt !important; }
    .section {
      min-height: 0 !important;
      padding: 8mm 0 !important;
      overflow: visible !important;
      background: #fff !important;
      color: #182230 !important;
      border-bottom: 1px solid #e2e8f0;
      break-inside: auto !important;
    }
    .section-header { margin: 0 0 5mm !important; text-align: left !important; break-after: avoid; }
    .section-title, .section-label, h1, h2, h3, h4, strong { color: #102033 !important; }
    .section-title { font-size: 20pt !important; }
    p, li, span, time { color: #334155 !important; }
    .reveal { opacity: 1 !important; transform: none !important; }
    .about-grid, .skills-grid, .projects-grid, .cert-grid, .research-grid,
    .achievements-grid, .leadership-grid, .resources-grid, .blog-grid,
    .creative-grid, .education-grid, .services-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 4mm !important;
    }
    .project-card, .skill-card, .cert-card, .achievement-card, .leadership-card,
    .info-card, .resource-card, .blog-card, .research-card, .education-card,
    .service-card, .about-pathway, .lab-box {
      background: #fff !important;
      color: #182230 !important;
      border-color: #cbd5e1 !important;
      box-shadow: none !important;
      break-inside: avoid;
    }
    .project-card, .resource-card, .blog-card { padding: 5mm !important; }
    .about-photo { position: static !important; }
    .about-photo img { width: 32mm !important; height: 32mm !important; }
    .project-screenshot, .cert-image, .profile-photo { max-height: 48mm !important; object-fit: contain !important; }
    .footer { background: #fff !important; color: #182230 !important; padding: 8mm 0 !important; }
    .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .footer-bottom { text-align: left !important; }
    .interactive-terminal, .terminal-window, .hero-terminal-input { display: none !important; }
  }
`;

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

async function renderPage(browser, url, destination) {
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('language', 'en'));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.addStyleTag({ content: printStyles });
  await page.evaluate(async () => {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('active'));
    document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
    await Promise.allSettled([...document.images].map((image) => image.decode()));
    await document.fonts.ready;
  });
  await page.pdf({
    path: destination,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true
  });
  await page.close();
}

async function main() {
  await access(join(siteDirectory, 'index.html'));
  await access(join(siteDirectory, 'blog.html'));

  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'portfolio-cv-'));
  const indexPdfPath = join(temporaryDirectory, 'portfolio.pdf');
  const blogPdfPath = join(temporaryDirectory, 'blog.pdf');
  const server = await serveStaticFiles(siteDirectory);
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ serviceWorkers: 'block' });
    await renderPage(context, `${server.origin}/index.html`, indexPdfPath);
    await renderPage(context, `${server.origin}/blog.html`, blogPdfPath);

    const combinedPdf = await PDFDocument.create();
    combinedPdf.setTitle('Portfolio CV — Md Iftiur Hossen Riyad');
    combinedPdf.setAuthor('Md Iftiur Hossen Riyad');
    combinedPdf.setSubject('Automatically generated from the latest public portfolio and blog');
    combinedPdf.setCreator('Portfolio deployment workflow');

    for (const sourcePath of [indexPdfPath, blogPdfPath]) {
      const sourcePdf = await PDFDocument.load(await readFile(sourcePath));
      const pages = await combinedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((page) => combinedPdf.addPage(page));
    }

    await writeFile(outputPath, await combinedPdf.save());
    console.log(`Generated ${outputPath} (${combinedPdf.getPageCount()} pages).`);
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
