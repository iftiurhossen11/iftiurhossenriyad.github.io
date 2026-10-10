# Calendly booking verification

The public portfolio uses the Calendly profile URL:
<https://calendly.com/mdiftiurhossenriyad>.

The active event was verified in Calendly as **15 Minute Call**, with a
15-minute duration. Its location is now **Google Meet**. The public profile
page lists the event; visitors can continue to choose an available date and
time there.

The event's existing public slug is `/30min`, even though the event duration
is 15 minutes. The portfolio intentionally links to the profile URL instead
of relying on that slug.

## If the booking event changes

1. Open Calendly **Scheduling → Event types** and edit **15 Minute Call**.
2. Confirm the event remains 15 minutes and uses Google Meet. If Calendly asks
   to connect a Google account, complete that authorization on Google's own
   sign-in page.
3. Save the event and verify its public booking page lists the intended
   duration and location.
4. If the profile URL changes, update its occurrences in `index.html`:
   - `[data-calendly-widget]` `data-url`
   - `.booking-direct-link` `href`
   - `.booking-direct-note` link `href`
   - `.contact-book-note` link `href`
5. Also update `README.md`, `calendly-setup.md`, and this guide.
