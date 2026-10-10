# Protecting the private admin tools

The public portfolio is hosted on GitHub Pages. Its `/admin.html` route returns
404, and the public deployment workflow excludes the admin tools.

The Cloudflare Pages project `riyad-private-admin` serves the private admin
tools. Both production and preview deployments are protected by Cloudflare
Access.

## Public portfolio deployment

The public portfolio is deployed through
`.github/workflows/deploy-public-site.yml`. That workflow excludes the private
admin tools and `.docx` files from the GitHub Pages artifact. The public site
returns 404 for `/admin.html`; its `/test-newsletter.html` and
`/signature.html` files are unavailable notices, not the working admin tools.

If the GitHub repository is public, files committed to the repository can
still be downloaded from GitHub even when excluded from the Pages artifact.
Keep private source documents and admin implementation files out of the
public repository.

## Access configuration

- The production application is `Riyad Admin - Production`, covering only
  `riyad-private-admin.pages.dev`.
- Its Allow policy permits only the configured owner email; there is no
  public bypass or domain-wide allow rule.
- Users can choose either Cloudflare One-time PIN or Cloudflare account
  sign-in. The Cloudflare identity provider is restricted to account members,
  and the application policy still permits only the configured owner email.
- No admin password is stored in the static site. Cloudflare account
  credentials are entered only on Cloudflare's own sign-in screen.
- The separate preview application covers
  `*.riyad-private-admin.pages.dev` and also uses an owner-email-only Allow
  policy.

Unauthenticated requests to `/`, `/test-newsletter.html`, and
`/signature.html` on production, and `/` on the preview hostname, were checked
after deployment and redirected to Cloudflare Access (HTTP 302). The public
GitHub Pages site still returns 404 for `/admin.html`.

## Deploying future admin changes

Keep the Access applications and owner-only policy in place before deploying.
Build and deploy the private source from the private workspace:

```powershell
node .\scripts\build-admin.mjs
npx wrangler pages deploy .\dist-admin --project-name riyad-private-admin --branch main
```

After deployment, repeat the unauthenticated URL checks above and confirm the
preview restriction is still active.

## Signing out

Use the **Log out** link shown in the admin tools, newsletter test, and
signature generator pages. It opens Cloudflare Access's logout endpoint to
clear the Access session. If the browser offers to confirm logout, confirm it.
Closing a tab alone does not sign out of Access.

## Security notes

- Never send Cloudflare passwords or one-time PINs in chat. Enter them only on
  Cloudflare's own sign-in screen.
- The logout link signs out of the Access session for this application. It
  does not sign out of the user's Cloudflare dashboard session.
- Keep the private admin source out of the public GitHub repository. Do not
  connect the public repository to the admin Pages project.
- The static admin tool generates code for manual updates; it does not write
  changes back to GitHub. The working newsletter test and signature
  generator are bundled only in the Access-protected deployment.
- The admin service worker is disabled so it cannot cache protected pages for
  offline use.
- Do not put API tokens, passwords, or other secrets in the static app.
