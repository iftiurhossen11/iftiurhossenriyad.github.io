# Md Iftiur Hossen Riyad — Portfolio

Static portfolio site for GitHub Pages. The public pages are `index.html`,
`blog.html`, the query-driven `post.html` article page, and the GitHub Pages
`404.html` fallback. Article content is
maintained in `posts-data.js`. Admin tools are deployed separately to Cloudflare
Pages and must be protected by Cloudflare Access.

## Deploy to GitHub Pages

1. In repository **Settings → Pages**, select **GitHub Actions** as the source
   before pushing the new workflow, so GitHub Pages does not publish the
   `private-admin/` source directory.
2. Push the project to the repository's `main` branch. If using a different
   default branch, update `.github/workflows/deploy-public-site.yml`.
3. Run the **Deploy public portfolio** workflow and check the deployed site.
   It excludes the admin tools, newsletter test page, signature generator, and
   DOCX files from the public artifact.
   The public artifact includes `robots.txt` and `sitemap.xml`; update the
   sitemap and `rss.xml` when adding or removing blog posts.
4. Follow [`cloudflare-admin-setup.md`](cloudflare-admin-setup.md) to deploy
   the separate admin project and require Cloudflare Access.
5. Newsletter signups use the Formspree endpoint
   `https://formspree.io/f/xnpjppdd`.
6. Once signed in to the protected admin project, use its newsletter test tool
   only with an email address you control.
7. Check cookie consent and GA4 events after the public site is deployed.

## Calendly booking

The **Book a Call** section embeds Calendly at the base URL
`https://calendly.com/mdiftiurhossenriyad`. The page also provides a direct
scheduling link and a no-JavaScript email fallback. See
[`calendly-setup.md`](calendly-setup.md) and
[`calendly-fix-guide.md`](calendly-fix-guide.md) for event settings and URL
instructions.

`G-82EWL4BGPD` is the GA4 Measurement ID. Analytics is loaded only after a
visitor accepts cookies. The cookie choice and language preference are stored
in browser local storage.

The contact form uses the configured Formspree endpoint in `index.html`.
The public `admin.html` is only an unavailable notice. The actual admin tools
are built from `private-admin/admin.html` and must only be served by the
Cloudflare Pages project protected with Cloudflare Access. Static files cannot
enforce authentication themselves. The admin build omits certificate binaries;
the public site keeps and serves the PDFs and optimized previews from `certs/`.

ThreatGuard, SecureAudit, Buy & Sell Platform, and EduQuiz use cropped 16:9
screenshots from `screenshots/cropped/`. IR Prohori uses four cropped 16:9 screenshots from
`Project SS.docx` and links to its GitHub repository.
Other proposal-based projects use clearly labeled interface mockups from
`screenshots/mockups/`; these illustrate proposed product screens and are not
captures of deployed products.
The MyGenie section uses four application screenshots from `Project SS.docx`
and links to its live website and GitHub repository.
