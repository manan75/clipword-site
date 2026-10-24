# clipword-site

Landing page and waitlist for **Clipword**, an Android app that turns words you meet into flashcards with the sentence they came from. The app lives in a separate private repo; this repo only holds the website.

Plain static HTML/CSS/JS with no build step, hosted on GitHub Pages. Sign-ups go to a Google Sheet through a small Google Apps Script.

```
index.html          landing page
privacy.html        waitlist privacy note
styles.css          design A "Calm" (same colour tokens as the app), light + dark
site.js             form handling; SIGNUP_URL goes here
apps-script/Code.gs paste into the Sheet's Apps Script editor
assets/             Figtree font (SIL OFL, licence alongside), icon
```

## Preview locally

```
python -m http.server 8080
```
Then open http://localhost:8080.

## Set up sign-ups (one time, ~5 minutes)

1. **Create the Sheet.** Go to sheets.new (signed in to the Google account that should own the list) and name it e.g. "Clipword waitlist".
2. **Add the script.** In the Sheet: Extensions → Apps Script. Delete the sample code, paste all of `apps-script/Code.gs`, and save (Ctrl+S).
3. **Deploy it.** Deploy → New deployment → gear icon → *Web app*.
   - Description: `waitlist`
   - Execute as: **Me**
   - Who has access: **Anyone** (visitors aren't signed in to Google; the script only appends rows)
   - Deploy, then authorise. Google warns that the app isn't verified: Advanced → Go to (project) → Allow. It's your own script.
   - Copy the **Web app URL** (ends in `/exec`).
4. **Connect the page.** Paste that URL into `SIGNUP_URL` at the top of `site.js`, commit and push.
5. **Test.** Open the URL from step 3 in a browser; it should show `{"ok":true,"service":"clipword-waitlist"}`. Then sign up on the live page: a `Signups` tab with your row should appear in the Sheet.

If you change `Code.gs` later: Deploy → Manage deployments → edit (pencil) → Version: *New version* → Deploy. That keeps the same URL.

## Tracking which post brought people

Add `?ref=<name>` to links you share, e.g. `https://manan75.github.io/clipword-site/?ref=linkedin`. The value lands in the Sheet's *Source* column.

## Abuse limits

The web app URL is public by design (the browser has to call it). It can only append a row; it can't read the Sheet. `Code.gs` rejects invalid emails, drops bot submissions (hidden `website` field), skips duplicates with the same reply as a new sign-up (so nobody can check whether an address is listed), and stops after `MAX_PER_HOUR` new rows per hour. If junk still gets in: delete the rows, then Deploy → New deployment for a fresh URL and update `site.js`.

## Content rules (from the app repo)

- Copy comes from the app's `docs/PRODUCT.md`. Don't promise features that aren't in V1.
- Never use the Goethe name or Goethe word lists. JLPT levels, if mentioned, are "estimated".
- Lead with capture; starter decks are an optional quick start.
- Android only. No release date until the closed test is booked.
