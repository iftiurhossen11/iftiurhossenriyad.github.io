# Calendly booking setup

## Current event

- Scheduling URL: <https://calendly.com/mdiftiurhossenriyad>
- Event name: 15 Minute Call
- Duration: 15 minutes
- Meeting method: Google Meet
- Availability: Monday–Friday, 9:00 AM–5:00 PM, and Sunday

Calendly controls the actual event name, duration, availability, time zone, and
meeting instructions shown to invitees. Keep those settings current in the
Calendly account. The public profile and booking page were checked after the
event update; the event is listed and available dates are shown.

The previous event title (“30 Minute Meeting”) and phone-call location have
been corrected. Its existing event slug remains `/30min`, so the portfolio
uses the profile URL rather than depending on the slug. See
[`calendly-fix-guide.md`](calendly-fix-guide.md) for verification details.

## Changing the scheduling URL

If the event URL changes, update every copy of it in `index.html`:

1. The `data-url` attribute on `[data-calendly-widget]`.
2. The direct booking link in the booking fallback.
3. The always-visible direct booking link below the widget.
4. The direct booking link in the Contact section.

Also update this document, [`calendly-fix-guide.md`](calendly-fix-guide.md),
and the Calendly URL in `README.md`.

## Adding other event types

1. Create the event type in [Calendly](https://calendly.com/) and copy its
   public scheduling URL.
2. Add a new link or booking section for that URL in `index.html`.
3. For an additional inline widget, give it its own `data-calendly-widget`
   element and matching fallback link, then verify it loads on the deployed
   HTTPS site.
4. Update this document with the event duration, meeting method, and link.
