# Portfolio Update Guide

The portfolio content is kept in the `data-*.js` files in the project root.
Edit those files to update the portfolio; the section markup and styling stay
in `index.html` and `style.css`. Save and refresh the page to see changes.

## Using the admin data managers

Open the admin site deployed to Cloudflare Pages and sign in through Cloudflare
Access. Select a content tab, fill in the form, and use **Generate ... Code**.
The live preview shows the object being generated. Copy the object into the
indicated data file and array, save, then refresh the portfolio. The managers
generate snippets; they do not edit or publish files automatically. Drafts are
saved only in the current browser.

The manager tabs cover Certifications, Projects, Skills, Achievements,
Education, Research, Social Links, Contact Info, Roadmap, Services, and Uses.
Their destination arrays are:

- `certificationsData`, `projectsData.featured` or `projectsData.classic`,
  `skillsData`, `achievementsData.achievements` or
  `achievementsData.leadership`, `educationData`, and `researchData`.
- Social Links go in `socialData.links`; Contact Info goes in
  `socialData.contact`.
- Roadmap and Services go in `roadmapData` and `servicesData`. The Uses manager
  adds an item to the selected category in `usesData`.
- Resources go in `resourcesData`; the Signature Generator tab opens the
  protected admin site's `signature.html`.

The Projects manager asks which project group to target. The Achievements
manager similarly asks whether the entry is an award or leadership item.
Follow the target shown above the preview so the generated item is added to
the correct array. For projects and social links, use an `http://` or
`https://` URL. Contact links may also use `mailto:` or `tel:`.

The existing Blog Posts and Testimonials tabs remain available. The admin
page's password gate is a convenience deterrent for a static site, not secure
authentication; do not treat it as a place to store secrets.

## Certifications

Edit `data-certifications.js`. Add an object to `certificationsData`:

```js
{
  title: 'Certificate name',
  issuer: 'Issuing organization',
  date: 'Completed: Month Day, Year',
  verifyUrl: 'https://example.com/verify',
  icon: 'star'
}
```

The supplied certificate files are PDF documents, so they are stored with
`.pdf` extensions and shown in embedded PDF previews/lightboxes. Keep the
`image` path pointed to a PDF file when adding another certificate.

Supported icon names include `star`, `clock`, `target`, `document`, `layers`,
`pin`, `code`, `terminal`, `education`, `file`, `shield`, and `award`.
Existing entries use translation keys (`titleKey` and `dateKey`) to keep their
English and Bengali versions. New entries can use plain `title` and `date`
strings as above.
The terminal's `cat certs.txt` output uses this same list.

## Projects

Edit `data-projects.js`. Projects are split into `featured` and `classic`
arrays. A plain-text entry can use this shape:

```js
{
  name: 'Project name',
  role: 'Your role',
  description: 'Short project summary',
  status: 'working',
  statusLabel: 'In progress',
  tech: ['JavaScript', 'Security'],
  features: ['Feature one', 'Feature two'],
  screenshots: ['screenshots/project-1.png', 'screenshots/project-2.png'],
  context: 'Competition or project context',
  githubLink: 'https://github.com/your-name/project'
}
```

`status`, `statusLabel`, `features`, `context`, and `githubLink` are optional.
Featured projects normally include a status. Classic projects may include a
GitHub link. Existing items use `*Key` properties where translations already
exist; those preserve the current bilingual wording. The terminal's
`ls prototypes/` and `fetch projects` commands also read these project arrays,
including repository links.
Each project may also include a `screenshots` array of local image paths. Store
originals in `screenshots/` and curated 16:9 previews in `screenshots/cropped/`;
update that project's paths in `data-projects.js`. The first image is displayed
initially, and the thumbnail buttons switch the main preview. Select the main
preview to open the full-size viewer, then use its arrows or the keyboard arrow
keys to browse. Press Escape to close. Review screenshots before publishing:
remove passwords, tokens, private contact details, and other information that
should not be public.

## Skills

Edit `data-skills.js`. Add a category to the `skillsData` array:

```js
{
  title: 'Category name',
  tags: ['Skill one', 'Skill two', 'Skill three']
}
```

Existing categories use `titleKey`; tag objects with a `key` property refer to
existing translations. Plain strings are shown as written.

## Career roadmap and skills evidence

- `data-roadmap.js` contains chronological milestones with `year`, `title`,
  and `description` values (or their `*Key` translation-key equivalents).
  Current entries are sample goals; edit or remove them to reflect your plan.
- Skill levels are not shown as percentages. The portfolio links to the public
  project repositories, listed certificates, and published technical articles
  as evidence of work and learning, not as a standardized proficiency rating.
- The Career Roadmap remains a set of editable sample goals, not a fixed plan.

## Services

Edit `data-services.js`. Each service can include an `icon`, `title`,
`description`, and a `features` array. Current offerings are marked as samples;
adjust scope, wording, and availability before publishing.

## Uses page

`uses.html` renders the categories and items from `data-uses.js`. Categories
have an `id`, `icon`, `title`/`titleKey`, and an `items` array. Each item has
an `emoji`, `name`/`nameKey`, and `description`/`descriptionKey`. Replace all
sample device and tool details with the exact setup you want to share. The
Uses admin tab generates an item snippet for the category you select.

## Booking and visitor statistics

The **Book a Call** area in `index.html` embeds Calendly at
`https://calendly.com/mdiftiurhossenriyad`. A loading status appears while the
widget initializes; if its script or iframe fails to load promptly, the page
falls back to a direct booking link and the contact form. A direct Calendly
link is also available below the widget and in the Contact section.
See [`calendly-setup.md`](calendly-setup.md) and
[`calendly-fix-guide.md`](calendly-fix-guide.md) for the event setup and
troubleshooting instructions.

The footer attempts to increment the public CountAPI key configured in
`script.js`. If CountAPI times out or is unavailable, a counter stored in
`localStorage` under `portfolio-visit-count` is displayed with an asterisk and
labeled "Your Visits"; a successful CountAPI response is labeled "Total
Visits". The online estimate counts active tabs in the current browser
profile only—it is not a site-wide real-time count.
GitHub Pages has no backend to provide an accurate global online visitor
count. No email addresses or form contents are sent to the counter.

### Calendly troubleshooting

- Confirm the event is named **15 Minute Call**, has a 15-minute duration, and
  uses Google Meet in the Calendly event settings.
- The site uses the base URL `https://calendly.com/mdiftiurhossenriyad`.
- The loading message hides when the iframe loads or after three seconds. If no
  iframe load is detected within five seconds, the embedded widget is replaced
  by its direct booking link. The direct link remains available below the
  widget in all cases.
- Test the calendar on the deployed HTTPS site. Browser privacy settings or
  network filters may block the cross-origin embed; the direct Calendly link
  remains the fallback.

## PWA installation and offline support

`site.webmanifest` defines the install name, colors, scope, and icons.
`service-worker.js` caches the app shell and essential pages for offline
navigation. The worker refreshes cached files from the network when available
and uses its cache when offline.
Service workers and install prompts require HTTPS (GitHub Pages qualifies) or
localhost. Use Chrome DevTools' Lighthouse PWA audit and Application panel to
test installation and offline behavior.

## Free resources

Edit `data-resources.js` to update the bilingual safety guide and trusted
external references. Add local guides under `resources/` and use their
relative paths; mark off-site links as external so they open safely in a new
tab. Keep the descriptions and resource actions bilingual in `translations.js`.
The Resources manager on the protected admin site can generate bilingual
entry snippets.

## Email signature generator

Open the protected admin site and choose the Signature Generator tab. Edit the
form fields to preview the signature, copy its HTML or plain-text version, or
download a standalone HTML file. The generator runs in the browser; entered
details are not submitted or saved to a server.

## Achievements and leadership

Edit `data-achievements.js`. Add awards to the `achievements` array:

```js
{
  badge: 'Award or year',
  title: 'Achievement name',
  organization: 'Organization',
  description: 'A short description'
}
```

Add leadership, roles, or mentorship items to the `leadership` array:

```js
{
  title: 'Role title',
  description: 'What you did'
}
```

Existing bilingual items use `*Key` properties. Achievement descriptions
containing formatted text should use translation keys with
`descriptionHtml: true` so the established trusted translation markup is kept.
Plain `description` values are rendered as text.

## Testimonials

`data-testimonials.js` is intentionally empty until genuine recommendations
are approved for publication. Add entries only with the person's permission;
the page hides the testimonials section when there are no entries. Each entry
uses `quote`, `name`, `role`, `organization`, and `relationship`. `avatar` may
be an image path; leave it empty to show the person's initial. `linkedin` is
optional and, when provided, links the author details.

### 📝 Adding a Real Testimonial

1. Request a testimonial using a template in
   [testimonial-request-template.md](./testimonial-request-template.md).
2. Open `data-testimonials.js`.
3. Add a testimonial object with the wording and details approved by the
   person.
4. Save the file. The section will appear when at least one real testimonial
   is present.

### 🚫 Removing a Testimonial

If someone asks to be removed:

1. Open `data-testimonials.js`.
2. Delete that person's entire testimonial object.
3. Save the file.

### 🔒 Privacy Note

Always get permission before publishing a testimonial. Include the person's
name, role, and organization only if they have agreed to publish those details.

## Social links and contact information

Edit `data-social.js`.

- Add or update entries in `socialData.links` with `name`, `href`, and `icon`.
- Set `showInHero: true` to include a link in the icon row at the top of the
  home page. All links appear in the footer.
- Use an existing icon name (`github`, `tryhackme`, `hackthebox`, or
  `facebook`) for its matching icon.
- Update `socialData.contact` to change email, phone, and location. For email
  and phone entries, keep `href` in sync with `value` (for example,
  `mailto:name@example.com` or `tel:+15551234567`). Contact cards, the hero
  and About locations, and the direct-email fallback use this data. Location
  entries may include `valueBn` for the Bengali version; it is used when the
  site is switched to Bengali.

## Education

Edit `data-education.js`. Add a chronological entry to `educationData`:

```js
{
  date: 'Expected graduation: Month Year',
  title: 'Degree or qualification',
  organization: 'School or institution',
  details: 'Optional extra details'
}
```

## Research and publications

Edit `data-research.js` and append an item to `researchData`:

```js
{
  status: 'Under review',
  title: 'Research or publication title',
  venue: 'Conference or journal',
  domain: 'Research area',
  note: 'Optional status or publication note'
}
```

Use `statusClass: 'independent'` for the independent-research status style.
Existing entries use translation keys for their bilingual descriptions.

## Blog posts and translations

- Blog entries remain in `posts-data.js`; use the blog generator on the
  protected admin site or edit the data file directly. Each entry needs a
  unique ISO 8601 `publishedAt` value with a Bangladesh (`+06:00`) offset.
- Keep the default `title`, `excerpt`, and `content` in English, and provide
  their Bengali counterparts under `localized.bn`. The blog cards, article
  page, and metadata switch together when the language toggle changes. The
  listing is ordered newest first using `publishedAt`.
- The current publication timestamps were assigned for the site because the
  source document did not specify exact publication times. Replace them with
  verified original timestamps if those become available.
- Blog card categories supported by the filters are `technical`,
  `cybersecurity`, `tutorials`, `projects`, `poetry`, `awareness`, and
  `personal`. Set a card's `data-category` to one of these values and use the
  matching badge class (for example, `blog-category cybersecurity`).
- Existing `*Key` fields refer to text in `translations.js`. To translate new
  content, add matching English and Bengali translation entries there and use
  the key in the data record. Plain text properties are convenient for new
  one-language entries and require no HTML changes.

## Publish changes

1. Save the edited data file.
2. Refresh the local page and check the section in both languages if you added
   translation keys.
3. Commit/push the changes to the GitHub Pages branch to publish them.
