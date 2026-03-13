# Google Search Console — Setup Checklist

Do this once the site is live on the custom domain.

## Step 1: Verify Ownership

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click **Add property** → choose **Domain** (covers all subdomains + http/https)
3. Enter your domain (e.g. `localpdf.app`)
4. Copy the TXT record Google gives you
5. Add it as a DNS TXT record in your domain registrar (Namecheap, Cloudflare, etc.)
6. Click **Verify** — can take 30–60 min for DNS to propagate

## Step 2: Submit Sitemap

1. In GSC sidebar: **Sitemaps**
2. Enter `sitemap.xml` and click **Submit**
3. Your sitemap URL is: `https://yourdomain.com/sitemap.xml`
   - Generated dynamically by `app/sitemap.ts`

## Step 3: Request Indexing (Optional — speeds things up)

1. In the URL Inspection tool, paste your homepage URL
2. Click **Request Indexing**
3. Repeat for `/compress`, `/about`, and each `/guides/*` page

## Step 4: Monitor

- Check **Coverage** report after 1 week — look for "Discovered - currently not indexed" or "Crawled - currently not indexed" pages
- Check **Performance** after 2–3 weeks for first impressions data
- Target keywords to track: "edit pdf text free", "pdf editor no upload", "mybestpdf alternative"

## Notes

- `robots.txt` is already configured at `app/robots.ts` — allows all crawlers
- Sitemap includes: `/`, `/compress`, `/about`, all `/guides/*` pages
- Google typically takes 1–4 weeks to fully index a new domain
