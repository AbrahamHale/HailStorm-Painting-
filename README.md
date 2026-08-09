# Heritage Painting & Renewal — website

Plain static HTML site for Heritage Painting & Renewal (heritagepaintingandrenewal.com, once the
domain is bought). No WordPress, no frameworks, no build step — just HTML,
CSS, and a little vanilla JavaScript. It will work the same in five years.

## See it on your own machine

From this folder, run:

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123 in your browser. Ctrl-C in the terminal stops it.

## Adding photos

1. Drop photos into the right folder under `images/`:
   - `images/exterior-residential/`
   - `images/exterior-commercial/`
   - `images/interior-residential/`
   - `images/interior-commercial/`
   - `images/furniture/`

   Give files descriptive names with dashes: `white-farmhouse-porch.jpg`.
   The gallery builds its captions and alt text from the filename, so a good
   name matters. HEIC straight off the iPhone is fine — the script converts it.

2. **Before/after pairs:** name the two files with the same base plus
   `-before` and `-after` — e.g. `farmhouse-before.jpg` and
   `farmhouse-after.jpg`, in the same folder. The gallery automatically
   shows them as a draggable slider.

3. Run the one command:

```bash
python3 tools/prep_photos.py
```

   That compresses everything (max 1600px, JPEG 80), **strips all EXIF/GPS
   metadata** (no customer addresses leak from photo files), makes small
   thumbnails, and rebuilds `images.json` — the manifest the gallery reads.

4. Commit and push. The site redeploys itself.

To write a better photo description than the filename gives, add a line to
`tools/alt_text.json` and rerun the command.

`images/extras/` is for photos you want to keep but not show on the site
(near-duplicates, process shots). It's ignored by the gallery.

## Changing the phone number

The number lives in **one place**: the top of `js/site.js`. To swap it
everywhere (including the static fallbacks in the HTML), run:

```bash
tools/set-phone.sh "(218) 555-0123"
```

Commit and push afterward.

## Changing the slogan

Like the phone number, the slogan lives in **one place**: the top of
`js/site.js`. To swap it everywhere (including the static fallbacks and
meta tags in the HTML), run:

```bash
tools/set-slogan.sh "The new slogan here."
```

## The estimate + contact forms (one-time setup)

The forms post to [Web3Forms](https://web3forms.com) — free, works on
static sites.

1. Go to web3forms.com, enter **info@heritagepaintingandrenewal.com**, and it emails
   you an **access key**.
2. Open `estimate.html` and `contact.html`, find
   `YOUR-WEB3FORMS-ACCESS-KEY-HERE` (one spot in each file, marked with a
   big comment), and paste your key in both.
3. Commit and push.

Submissions then arrive in your email. Planned: replace this with a Jobber
request form later — when you do, swap the `<form>` block in those two files
for Jobber's embed.

## Putting it online (Cloudflare Pages, free)

One-time setup — after this, every push to GitHub redeploys automatically:

1. Go to https://dash.cloudflare.com and sign up (free) or log in.
2. In the left sidebar pick **Workers & Pages → Create → Pages →
   Connect to Git**.
3. It asks to connect your GitHub account — approve it, and give it access
   to the `HailStorm-Painting-` repository.
4. Pick the repository. On the build settings screen leave **everything
   blank/default** — no framework, no build command, output directory `/`.
5. Click **Save and Deploy**. A minute later you get a live URL like
   `https://hailstorm-painting.pages.dev` — that's the link you can text
   to anyone.

(You can rename the project in Cloudflare to `heritage-painting` to get
`heritage-painting.pages.dev`.)

## When you buy heritagepaintingandrenewal.com

1. In Cloudflare Pages: your project → **Custom domains → Set up a custom
   domain** → enter `heritagepaintingandrenewal.com` and follow the DNS steps it
   shows (easiest if you also move the domain's DNS to Cloudflare — it
   walks you through it).
2. **Let Google in** (do NOT skip — the site is invisible to search until
   you do both):
   - In every `.html` file, delete the one line:
     `<meta name="robots" content="noindex">`
     (each one sits under a `PRE-LAUNCH` comment — delete that comment too).
     One command does all of them:
     ```bash
     sed -i '' -e '/PRE-LAUNCH:/d' -e '/Delete the next line/d' -e '/name="robots" content="noindex"/d' *.html
     ```
   - In `robots.txt`, replace the contents with the LAUNCH version that's
     already written in a comment at the bottom of the file.
3. Commit and push.

Everything else keeps working untouched — all links on the site are
relative, so nothing else changes when the domain does.

## Town pages

`wadena.html`, `park-rapids.html`, and `staples.html` are live in the
footer. Each has a big `ABE: PASTE REAL LOCAL CONTENT HERE` comment —
fill those in with real local detail (jobs you've done there, what the
houses are like). `menahga.html`, `sebeka.html`, `verndale.html`, and
`motley.html` exist but are not linked from anywhere; add your local
content first, then link them from the footer service-area text.

Don't copy the same paragraphs between town pages — search engines bury
sites that do that.
