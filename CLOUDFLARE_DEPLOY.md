# Deploy to Cloudflare Pages

This project has been configured to deploy to Cloudflare Pages for free using a **hybrid CDN architecture** that solves the 100MB deployment limit.

## Architecture Overview

Your dashboard uses a smart architecture that keeps deployment size minimal:

1. **App Code on Cloudflare Pages**: ~2MB deployment (HTML, JS, CSS)
2. **CSV Data on jsDelivr CDN**: 359MB of data served from GitHub via free global CDN
3. **Zero Cloud Storage Costs**: No S3, R2, or other storage services needed

## How It Works

1. **Static Export**: Next.js generates a fully static site
2. **Build-time Optimization**: CSV files are automatically removed from deployment
3. **Runtime Data Loading**: App fetches CSV files from jsDelivr (GitHub-backed CDN)
4. **Global CDN Performance**: jsDelivr serves files from 200+ edge locations worldwide

## Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

**IMPORTANT**: Make sure your CSV files are pushed to GitHub first! jsDelivr needs them in your repository.

1. **Commit and push all changes (including CSV files)**
   ```bash
   git add .
   git commit -m "Configure hybrid CDN architecture for Cloudflare Pages"
   git push
   ```

2. **Verify CSV files are on GitHub**
   - Visit: `https://github.com/amalkantony/estative-owners-list/tree/main/public/data`
   - Confirm all 248 CSV files are present
   - This is critical - jsDelivr serves files directly from your GitHub repo

3. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Pages** → **Create a project**
   - Click **Connect to Git**
   - Select repository: `amalkantony/estative-owners-list`

4. **Configure Build Settings**
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/`
   - **Node version**: 20.x

5. **Deploy**
   - Click **Save and Deploy**
   - Build will complete in ~2-3 minutes
   - Deployment size: ~2MB (CSV files excluded automatically)
   - Your site will be live at `your-project.pages.dev`

### Option 2: Deploy via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Build your project**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   wrangler pages deploy out --project-name=your-dashboard-name
   ```

## Build Output

When you run `npm run build`, the following happens:

1. **Prebuild**: `scripts/generate-locations.js` scans CSV files in `public/data/`
2. **Generate index**: Creates `public/locations.json` with all 248 available locations
3. **Next.js build**: Generates static site in `out/` directory
4. **Post-build cleanup**: `scripts/remove-csv-from-build.js` removes CSV files from output
5. **Final result**: ~2MB deployment (CSV files served from jsDelivr instead)

### Why This Works

- **CSV files stay in GitHub**: All 359MB of data remains in `public/data/`
- **Build excludes them**: Automatically removed from deployment package
- **Runtime fetching**: App fetches CSV files from jsDelivr CDN on-demand
- **CDN URL pattern**: `https://cdn.jsdelivr.net/gh/amalkantony/estative-owners-list@main/public/data/filename.csv`

## Local Testing

To test the static build locally:

```bash
# Build the project
npm run build

# Serve the static files (you can use any static server)
npx serve out
```

## CSV Files & jsDelivr CDN

Your CSV files are served via **jsDelivr**, a free global CDN that mirrors GitHub repositories.

### How It Works

- **Storage**: 359MB of CSV files remain in GitHub repository
- **CDN**: jsDelivr automatically caches files from your GitHub repo
- **Performance**: 200+ edge locations worldwide (as fast as Cloudflare!)
- **Bandwidth**: Completely free and unlimited
- **Caching**: Files cached at edge for 12 months (until git commit changes them)

### Total Locations

- **248 CSV files** in `public/data/`
- Automatically indexed in `locations.json`
- Loaded on-demand (only when user selects a location)

### Updating CSV Data

When you update CSV files:

```bash
# 1. Modify CSV files in public/data/
# 2. Commit and push
git add public/data/
git commit -m "Update CSV data"
git push

# 3. Wait 5-10 minutes for jsDelivr CDN to refresh
# 4. New data automatically available (no redeployment needed!)
```

**Note**: jsDelivr caches based on git commits, so data updates happen without rebuilding your app.

## Custom Domain (Optional)

1. In Cloudflare Pages dashboard, go to your project
2. Click **Custom domains**
3. Add your domain and follow the instructions

## Environment Variables

Since this is a static site, all data is embedded at build time. No environment variables are needed for the current setup.

## Architecture Benefits

### Why This Solution is Excellent for Demos

✅ **No file size limits**: 359MB of data easily handled
✅ **Zero storage costs**: No S3, R2, or cloud storage fees
✅ **Global performance**: jsDelivr CDN rivals Cloudflare's speed
✅ **Simple updates**: Just push to GitHub, no rebuilds needed
✅ **Unlimited bandwidth**: Both Cloudflare Pages and jsDelivr are free
✅ **Production-ready**: This architecture works for production too!

## Technical Limitations

- **Static site**: No server-side processing (perfect for dashboards)
- **Public data**: GitHub repos and jsDelivr are public (fine for demos)
- **CDN cache time**: Data updates take 5-10 minutes to propagate
- **Client-side parsing**: CSV files parsed in browser (acceptable performance)
- **GitHub repo size**: Soft limit of ~1GB per repository

## Free Tier Limits

Cloudflare Pages free tier includes:
- Unlimited sites
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 1 build at a time

## Troubleshooting

### Build fails
- Ensure all CSV files are in `public/data/`
- Verify file names end with `_data.csv`
- Check Node.js version (must be 20+)
- Run `npm ci` to reinstall dependencies

### CSV files not loading from jsDelivr
1. **Check browser console for errors**
   ```
   Failed to fetch https://cdn.jsdelivr.net/gh/...
   ```
2. **Verify files are on GitHub**
   - Visit: `https://github.com/amalkantony/estative-owners-list/tree/main/public/data`
   - Confirm all CSV files are present
3. **Test jsDelivr URL directly**
   - Open: `https://cdn.jsdelivr.net/gh/amalkantony/estative-owners-list@main/public/data/abu_dhabi_data.csv`
   - Should download the CSV file
4. **Wait for CDN cache**
   - After pushing new files, wait 5-10 minutes
   - jsDelivr needs time to sync from GitHub

### Deployment size exceeds 100MB
- This should not happen if build process worked correctly
- Check `out/data/` directory doesn't exist after build
- If it exists, the cleanup script didn't run
- Manually run: `node scripts/remove-csv-from-build.js`

### Performance issues
- CSV files are loaded on-demand (only when user selects location)
- jsDelivr provides global CDN performance
- Client-side parsing is fast enough for most CSV files
- For very large files (>10MB), consider compressing or splitting data

## Support

For issues with:
- **Cloudflare Pages**: [Cloudflare Community](https://community.cloudflare.com/)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)

## Quick Start Summary

**For your 359MB CSV demo, here's what to do:**

```bash
# 1. Commit all changes
git add .
git commit -m "Add jsDelivr CDN architecture for large CSV files"
git push

# 2. Go to dash.cloudflare.com
# 3. Pages → Create project → Connect Git
# 4. Select repo: amalkantony/estative-owners-list
# 5. Build command: npm run build
# 6. Output directory: out
# 7. Deploy!
```

**Result:**
- ✅ 2MB deployment (under 100MB limit)
- ✅ 359MB CSV data served from jsDelivr CDN
- ✅ Free hosting + free CDN
- ✅ Global performance
- ✅ Zero cloud storage costs

## Next Steps

After deployment:
- Test CSV loading from jsDelivr (may take 5-10 min for cache)
- Share your `*.pages.dev` URL
- Monitor usage in Cloudflare Analytics
- Optional: Add custom domain
- Data updates: Just `git push` (no rebuild needed!)
