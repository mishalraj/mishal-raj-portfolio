# Mishal Raj — personal site

Static profile site. Dark, a bit terminal, mostly true.

Pretending to know what I am doing. Hosted on GitHub Pages because paying for a VPS to serve a résumé is a personality I do not have.

## Preview locally

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 4173
```

Then visit [http://localhost:4173](http://localhost:4173).

## Publish on GitHub Pages

1. Create a new GitHub repository named `mishal-raj-portfolio` (public).
2. Push this folder:

```bash
git add .
git commit -m "Initial portfolio site"
git remote add origin git@github.com:mishalraj/mishal-raj-portfolio.git
git branch -M main
git push -u origin main
```

3. In the repo: **Settings → Pages**.
4. Source: **Deploy from a branch**.
5. Branch: `main`, folder: `/ (root)`. Save.

After a minute the site is at:

**https://mishalraj.github.io/mishal-raj-portfolio/**

If you want the cleaner URL `https://mishalraj.github.io`, rename the repo to `mishalraj.github.io` and keep the same files. Relative paths already work either way.

## What’s in here

| File | Why |
| --- | --- |
| `index.html` | The site |
| `styles.css` | Dark / amber engineer look |
| `script.js` | Clock, counters, expandable work log, `/` command palette |
| `404.html` | A polite failure |
| `.nojekyll` | Stops GitHub’s Jekyll from eating files |

Press `/` on the site to jump sections. No build step, no framework, no `node_modules` that outlive the product.
