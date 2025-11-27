# Deploy to Cloudflare Pages

This project has been configured to deploy to Cloudflare Pages for free. Follow the steps below to deploy your dashboard.

## Changes Made

Your Next.js dashboard has been converted to a static export that's fully compatible with Cloudflare Pages:

1. **Static Export**: Configured Next.js to generate a fully static site
2. **Removed API Routes**: Replaced the Node.js API route with a static JSON file
3. **Build Script**: Added automatic generation of `locations.json` before build
4. **Optimized Headers**: Added Cloudflare-specific caching headers

## Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Easiest)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Configure for Cloudflare Pages deployment"
   git push
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Pages** → **Create a project**
   - Click **Connect to Git**
   - Select your repository

3. **Configure Build Settings**
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node version**: 20 or later

4. **Deploy**
   - Click **Save and Deploy**
   - Your site will be live in a few minutes at `your-project.pages.dev`

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

1. `scripts/generate-locations.js` scans your CSV files in `public/data/`
2. Generates `public/locations.json` with all available locations
3. Next.js builds a static site in the `out/` directory
4. All CSV files and assets are copied to the output

## Local Testing

To test the static build locally:

```bash
# Build the project
npm run build

# Serve the static files (you can use any static server)
npx serve out
```

## CSV Files

All your CSV files in `public/data/` will be deployed as static assets. The app will load them directly from the browser.

- **Total locations detected**: Check console output during build
- **Storage**: No cloud storage needed - all files are served as static assets
- **Performance**: CSV files are cached for 1 year, locations.json for 1 hour

## Custom Domain (Optional)

1. In Cloudflare Pages dashboard, go to your project
2. Click **Custom domains**
3. Add your domain and follow the instructions

## Environment Variables

Since this is a static site, all data is embedded at build time. No environment variables are needed for the current setup.

## Limitations

As a static site:
- No server-side processing
- All data must be available at build time
- CSV files are loaded in the browser (client-side)
- File size limits apply (100MB total per deployment)

## Free Tier Limits

Cloudflare Pages free tier includes:
- Unlimited sites
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 1 build at a time

## Troubleshooting

### Build fails
- Check that all CSV files are in `public/data/`
- Ensure file names end with `_data.csv`
- Check Node.js version (use 20+)

### CSV files not loading
- Verify files are in `out/data/` after build
- Check browser console for fetch errors
- Ensure `locations.json` was generated

### Performance issues
- Consider reducing CSV file sizes
- CSV files are loaded on-demand (only when selected)
- Use the search and filter features to handle large datasets

## Support

For issues with:
- **Cloudflare Pages**: [Cloudflare Community](https://community.cloudflare.com/)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)

## Next Steps

After deployment:
- Share your dashboard URL
- Monitor usage in Cloudflare Analytics
- Add custom domain if desired
- Set up automatic deployments on git push
