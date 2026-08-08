# Heritage Painting LLC

Website for Heritage Painting LLC — residential and light commercial painting in northern Minnesota. *Work worth passing down.*

## What's inside

- `index.html` — single-page site (hero, services, about, process, gallery, testimonials, contact)
- `css/styles.css` — all styling, fully responsive (desktop / tablet / mobile)
- `js/main.js` — mobile menu, contact-form note, footer year

No build step or dependencies — it's a static site.

## Preview locally

Open `index.html` in a browser, or run a simple server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Publish with GitHub Pages (free hosting)

1. On GitHub, go to **Settings → Pages**
2. Under **Source**, choose **Deploy from a branch**
3. Select the branch and `/ (root)` folder, then **Save**
4. Your site will be live at `https://<username>.github.io/<repo-name>/`

Tip: the repository can be renamed to `heritage-painting` under **Settings → General** to match the new business name.

## Customize

- **Phone number**: search for `(555) 555-1234` in `index.html` and replace it
- **Email**: currently set to `abenochale@gmail.com`
- **Gallery photos**: replace the colored placeholder tiles in the `#gallery` section with `<img>` tags of real project photos
- **Colors**: edit the CSS variables at the top of `css/styles.css`
