import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'dist-admin');
const files = [
  'style.css',
  'script.js',
  'translations.js',
  'data-achievements.js',
  'data-certifications.js',
  'data-education.js',
  'data-projects.js',
  'data-research.js',
  'data-resources.js',
  'data-roadmap.js',
  'data-services.js',
  'data-skills.js',
  'data-social.js',
  'data-testimonials.js',
  'data-uses.js',
  'posts-data.js',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon.ico',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png'
];

async function build() {
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  for (const file of files) {
    await cp(path.join(projectRoot, file), path.join(outputDirectory, file));
  }

  for (const directory of ['screenshots']) {
    await cp(
      path.join(projectRoot, directory),
      path.join(outputDirectory, directory),
      { recursive: true }
    );
  }

  const adminHtml = await readFile(
    path.join(projectRoot, 'private-admin', 'admin.html'),
    'utf8'
  );
  const standaloneHtml = adminHtml.replace(
    /\b(href|src)="\.\.\/([^"]+)"/g,
    '$1="$2"'
  );
  await writeFile(path.join(outputDirectory, 'index.html'), standaloneHtml);

  for (const file of ['test-newsletter.html', 'signature.html']) {
    await cp(
      path.join(projectRoot, 'private-admin', file),
      path.join(outputDirectory, file)
    );
  }

  console.log(`Built the Access-protected admin site in ${outputDirectory}`);
}

build().catch((error) => {
  console.error('Could not build the admin site.', error);
  process.exitCode = 1;
});
