# Build & Deployment Process

## Git Workflow

### Initial Setup
```bash
cd c:\ClaudeCodeProjects\porfolioweb
git init
git config user.email "praktisaiden@gmail.com"
git config user.name "wconui0193-cloud"
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/wconui0193-cloud/Obsidian-2nd-brain.git
git push -u origin main
```

### Saving Progress
```bash
# In porfolioweb folder
git add .
git commit -m "Your message"
git push origin main

# In Obsidian vault
cd C:\Github\.Obsidian
git pull origin main
git add .
git commit -m "Your message"
git push origin main
```

---

## Obsidian Integration

### Vault Location
`C:\Github\.Obsidian`

### Syncing
1. Pull changes: `git pull origin main`
2. Make edits in Obsidian
3. Commit: `git add .` → `git commit -m "msg"`
4. Push: `git push origin main`

### Auto-sync (Future)
- Obsidian Git plugin (if available)
- Or manual sync as needed

---

## Deployment

### Files to Deploy
- `index.html` - Landing page
- `portfolio.html` - Portfolio showcase
- `booking.html` - Booking page
- `style.css` - Global styles
- `script.js` - Main interactions
- `images/` - Brand assets
- `Fonts/` - Custom fonts

### Hosting
Ready for deployment to any static host:
- Vercel
- Netlify
- GitHub Pages
- Traditional web server

---

## Testing Checklist
- [ ] All links working
- [ ] Responsive on mobile
- [ ] Animations smooth (GSAP)
- [ ] Performance optimized
- [ ] No console errors
- [ ] Case study links configured

**Status:** ✅ Ready for production
