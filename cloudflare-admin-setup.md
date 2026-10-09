# Protecting the admin tools with Cloudflare Access

The public portfolio remains on GitHub Pages. The admin tools are built as a
separate Cloudflare Pages project so they are not included in the public Pages
artifact. A browser-side password is not an access control; Cloudflare Access
must be enabled before using the Cloudflare deployment.

## 1. Publish the public site without private tools

1. In the GitHub repository, open **Settings → Pages** and choose **GitHub
   Actions** as the build and deployment source before pushing these changes.
   This prevents GitHub Pages from publishing the `private-admin/` source
   directory.
2. Push the project, including `.github/workflows/deploy-public-site.yml`, to
   the repository's `main` branch. If the default branch has another name,
   update the workflow trigger to match it.
3. Run the **Deploy public portfolio** workflow and confirm the deployment
   succeeds. The existing GitHub Pages deployment may remain live until the
   new workflow deployment finishes.
4. Verify the public site's `admin.html`, `test-newsletter.html`, and
   `signature.html` do not expose the tools. Each page should only show an
   unavailable notice.

The workflow also omits `.docx` files from the published site. If the GitHub
repository itself is public, files committed to the repository can still be
downloaded from GitHub; keep the source document out of a public repository or
make that repository private.

## 2. Create the protected admin deployment

1. In Cloudflare, create a **Pages** project connected to this GitHub
   repository. A custom domain is not required; the `*.pages.dev` hostname can
   be protected. Use the repository root as the root directory.
2. Set the build command to `node scripts/build-admin.mjs` and the output
   directory to `dist-admin`. Set the `NODE_VERSION` environment variable to
   `20`. The build includes only the admin tools and their required static
   assets; it does not include the source DOCX.
3. Deploy once and note the project's `https://<project-name>.pages.dev`
   address.
4. In the Pages project, open **Settings → General** and enable its Access
   policy. This first protects preview deployments.
5. In **Zero Trust → Access controls → Applications**, configure the created
   Access application for the exact production hostname
   `<project-name>.pages.dev` (remove the `*` wildcard from the production
   hostname). Add an **Allow** policy restricted to your own sign-in email.
   Access denies users who do not match an Allow policy.
6. Re-enable the Pages preview Access policy so preview deployments remain
   protected as well. Cloudflare documents these steps under [Enable Access on
   your `*.pages.dev` domain](https://developers.cloudflare.com/pages/platform/known-issues/#enable-access-on-your-pagesdev-domain).
7. Test in a private browser window: the Cloudflare Pages address must require
   authentication, and the authenticated account must be your allowlisted
   email. The GitHub Pages admin page must continue to show only the notice.

Use Cloudflare's email one-time PIN or an identity provider you control. Do not
add an `Everyone` or public Allow rule. The Access policy is enforced at
Cloudflare's edge; the admin app intentionally has no client-side password
gate. Its service worker is also disabled so it cannot cache the protected
admin page for offline use.

## 3. Operational notes

- This workspace cannot create the Cloudflare project or Access policy; those
  steps require signing in to your Cloudflare account and connecting the
  repository.
- The admin tools generate code for manual updates; they do not write changes
  back to GitHub.
- The source `test-newsletter.html` and `signature.html` are harmless
  unavailable notices. The corresponding working tools are bundled from
  `private-admin/` into the Access-protected deployment.
- Do not put credentials, API tokens, or other secrets in the static admin
  app. Cloudflare Access controls access to the hosted interface, not
  visibility of source files in a public Git repository.
- ThreatGuard, SecureAudit, Buy & Sell Platform, and EduQuiz have curated
  16:9 project screenshots. Other project cards remain placeholders until
  screenshots are supplied.
