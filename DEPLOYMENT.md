# 🚀 Deploying Guitar Learning Hub to Vercel

This guide will help you deploy your Guitar Learning Hub to Vercel for free hosting.

## Prerequisites

- A [Vercel account](https://vercel.com) (free)
- A [GitHub account](https://github.com) (free)
- Your Supabase credentials (from SUPABASE_SETUP.md)

## Quick Deployment Steps

### 1. Push to GitHub

First, push your project to GitHub:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - Guitar Learning Hub"

# Create a new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/guitar-learning-hub.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `guitar-learning-hub` repository
4. Vercel will automatically detect it's a Vite project
5. **Important**: Add environment variables before deploying:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click "Deploy"

### 3. Environment Variables Setup

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:

```
VITE_SUPABASE_URL = https://hhvbejmurxkdejmvxdgw.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodmJlam11cnhrZGVqbXZ4ZGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjM3NjMsImV4cCI6MjA2NDg5OTc2M30.OgOaJPMpGZIbYjcbGGqNhhwPNHZLbtsg5KR9JdvGCp4
```

3. Redeploy your project for the environment variables to take effect

## Alternative: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/guitar-learning-hub&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)

## Project Configuration

The project is already configured for Vercel deployment with:

- ✅ `package.json` with proper build scripts
- ✅ `vite.config.ts` for Vite configuration
- ✅ `vercel.json` for deployment settings
- ✅ Environment variable support
- ✅ TypeScript configuration

## Build Configuration

The project uses:
- **Framework**: Vite (React + TypeScript)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Troubleshooting

### Build Errors
If you encounter TypeScript errors during build:

1. **Option 1**: Disable TypeScript checking for deployment
   ```json
   // In package.json, change the build script to:
   "build": "vite build"
   ```

2. **Option 2**: Fix TypeScript errors (recommended for production)
   - The main errors are in UI components with versioned imports
   - Consider using simpler UI components or fixing imports

### Environment Variables Not Working
- Make sure environment variables start with `VITE_`
- Redeploy after adding environment variables
- Check the Vercel deployment logs for errors

### Database Connection Issues
- Verify your Supabase URL and API key are correct
- Ensure your Supabase database tables are created (see NEXT_STEPS.md)
- Check Supabase project status

## Custom Domain (Optional)

To use a custom domain:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions

## Monitoring and Analytics

Vercel provides built-in:
- 📊 **Analytics**: Page views, performance metrics
- 🔍 **Function Logs**: Server-side debugging
- ⚡ **Performance Insights**: Core Web Vitals
- 🚨 **Error Tracking**: Runtime error monitoring

## Production Checklist

Before going live:

- [ ] Database tables created in Supabase
- [ ] Environment variables configured
- [ ] Test all functionality (add/edit/delete lessons and songs)
- [ ] Verify album artwork is loading
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Enable Vercel Analytics (optional)

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify Supabase connection in browser console
3. Test locally with `npm run dev`
4. Check this project's GitHub issues

## What's Deployed

Your deployed app will include:
- 🎸 **Lesson tracking** with notes and remaining lesson counts
- 🎵 **Song repertoire** with categories (rehearsing, want to learn, studied, recorded)
- 🎨 **Automatic album artwork** from iTunes API
- 📱 **Responsive design** for all devices
- ☁️ **Cloud database** with Supabase
- 🔄 **Real-time sync** between devices

## Next Steps

After deployment:
1. Share the URL with your guitar teacher
2. Start logging your lessons and building your repertoire
3. Enjoy your personalized guitar learning hub!

---

**Live URL**: Your app will be available at `https://your-project-name.vercel.app`

Happy practicing! 🎸 