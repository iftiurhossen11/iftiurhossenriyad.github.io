# Calendly Event Settings Fix Guide

## Current State (Needs Fixing)

- Event name: "30 Minute Meeting" — does not match the duration
- Duration: 15 minutes
- Location: Phone call
- URL currently used by the portfolio: <https://calendly.com/mdiftiurhossenriyad>

## Target State

- Event name: "15 Minute Call"
- Duration: 15 minutes
- Location: Google Meet
- URL: <https://calendly.com/mdiftiurhossenriyad>

## How to Fix in Calendly Dashboard

### Step 1: Edit Event Name

1. Go to <https://calendly.com/app/scheduling/meeting_types/user/me>.
2. Find "30 Minute Meeting".
3. Open the "..." menu and choose "Edit".
4. Change the event name to "15 Minute Call".
5. Save the event.

### Step 2: Verify Duration

1. In the event editor, find "Duration".
2. Ensure it is set to "15 min".
3. Save if you changed it.

### Step 3: Change Location

1. Find the "Location" section in the event editor.
2. Change "Phone call" to "Google Meet".
3. Connect or authorize Google Meet if Calendly prompts you.
4. Save the event.

### Step 4: Confirm the Public URL

1. Return to the event list and choose "Copy link".
2. Confirm the copied public URL opens the intended 15-minute Google Meet event.
3. The portfolio currently uses the base URL
   <https://calendly.com/mdiftiurhossenriyad>, which avoids depending on a
   specific event slug. If Calendly supplies a distinct event URL, update the
   site links as described below.

### Step 5: Website URL Locations

If the public URL changes, update all four Calendly references in `index.html`:

- `[data-calendly-widget]` `data-url`
- `.booking-direct-link` `href`
- `.booking-direct-note` link `href`
- `.contact-book-note` link `href`

Also update the URL in `README.md`, `calendly-setup.md`, and this guide.
