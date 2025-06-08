# 🎸 Guitar Learning Hub

A modern, responsive web application for tracking guitar lessons and managing your song repertoire. Built with React, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

- **📚 Lesson Tracking**: Log your guitar lessons with notes and remaining lesson counts
- **🎵 Song Repertoire**: Organize songs into categories (rehearsing, want to learn, studied, recorded)
- **🎨 Album Artwork**: Automatic album cover fetching from iTunes API
- **☁️ Cloud Storage**: Real-time sync with Supabase database
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🤝 Collaborative**: Share with your guitar teacher for joint progress tracking

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/guitar-learning-hub&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)

## 📋 Prerequisites

- Node.js 18+ 
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free) for deployment

## 🛠️ Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/guitar-learning-hub.git
   cd guitar-learning-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Set up database**
   Follow the instructions in `NEXT_STEPS.md` to create your Supabase tables.

## 🚀 Deployment

See `DEPLOYMENT.md` for detailed deployment instructions to Vercel.

### Quick Steps:
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Styling**: Custom UI components with Tailwind

## 📁 Project Structure

```
guitar-learning-hub/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── LessonLog.tsx   # Lesson tracking component
│   │   ├── Repertoire.tsx  # Song management component
│   │   └── SetupBanner.tsx # Database setup guidance
│   ├── lib/                # Utilities and services
│   │   ├── supabase.ts     # Database client and operations
│   │   └── musicService.ts # iTunes API integration
│   ├── styles/             # CSS files
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── DEPLOYMENT.md           # Deployment guide
├── NEXT_STEPS.md          # Database setup instructions
└── SUPABASE_SETUP.md      # Supabase configuration guide
```

## 🎯 Usage

### Lesson Tracking
- Add new lessons with date, remaining lesson count, and notes
- Edit existing lessons
- View lesson history chronologically

### Song Repertoire
- Add songs with artist, tabs/video links, and comments
- Organize songs into four categories:
  - 🎵 **Currently Rehearsing**: Songs you're actively practicing
  - ❤️ **Want to Learn**: Songs on your wishlist
  - 📖 **Studied**: Songs you've learned well
  - ⭐ **Recorded**: Songs you've mastered and recorded
- Automatic album artwork fetching
- Quick category switching with drag-and-drop feel

## 🔧 Configuration

The app automatically detects if Supabase is configured and falls back to local storage if not. This allows you to:
- Use it immediately without setup (data stored locally)
- Upgrade to cloud storage when ready
- Share data with others once Supabase is configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- Check `DEPLOYMENT.md` for deployment issues
- Review `NEXT_STEPS.md` for database setup
- Open an issue on GitHub for bugs or feature requests

---

**Happy practicing! 🎸**