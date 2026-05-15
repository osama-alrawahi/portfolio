# Portfolio Website - Complete Documentation

A professional portfolio website with modular structure, data management system, and admin interface.

## 📁 Folder Structure

```
portfolio/
├── index.html              # Main landing page
├── edit.html              # Admin interface for data management (NOT linked to portfolio)
├── README.md              # This file
│
├── static/                # Static assets
│   ├── style.css         # Main stylesheet (all shared styles)
│   └── utils.js          # Utility functions (starfield, profile loading, etc.)
│
├── template/             # Page templates
│   ├── cv.html          # CV page
│   ├── projects.html    # Projects showcase
│   ├── certificates.html # Certificates timeline
│   └── gallery.html     # Image gallery
│
├── data/                # Data files (JavaScript)
│   ├── projects.js      # Projects data array
│   ├── certificates.js  # Certificates data array
│   └── gallery.js       # Gallery items data array
│
└── images/              # Image assets
    ├── profile/         # Profile/avatar images (auto-detected)
    │   ├── robot1.jpg
    │   ├── robot2.jpg
    │   └── robot3.jpg
    ├── projects/        # Project images
    ├── certificates/    # Certificate images
    └── gallery/         # Gallery images
```

## 🚀 Quick Start

### 1. Setup Images

**Profile Images (Auto-Detected):**
Add 1-3 images to `images/profile/`:
- Name them: `robot1.jpg`, `robot2.jpg`, `robot3.jpg`
- Or: `profile1.jpg`, `profile2.jpg`, `profile3.jpg`
- Or: `avatar1.jpg`, `avatar2.jpg`, `avatar3.jpg`
- The system will auto-detect and rotate them every 3 seconds
- If no images found, shows a robot icon fallback

**Project Images:**
- Add to `images/projects/`
- Update paths in `data/projects.js`

**Certificate Images:**
- Add to `images/certificates/`
- Update paths in `data/certificates.js`

**Gallery Images:**
- Add to `images/gallery/`
- Update paths in `data/gallery.js`

### 2. Edit Data

**Option A: Use the Admin Interface (Recommended)**
1. Open `edit.html` in your browser
2. Add, edit, or delete items
3. Export data when done
4. Manually update the corresponding JS files in `data/` folder

**Option B: Edit Data Files Directly**
Edit the data files in `data/` folder:
- `data/projects.js` - Add/modify projects
- `data/certificates.js` - Add/modify certificates
- `data/gallery.js` - Add/modify gallery items

### 3. Test Locally

1. Open `index.html` in your browser
2. Navigate through all pages
3. Check if images load correctly

### 4. Deploy

Upload the entire `portfolio/` folder to:
- **GitHub Pages** (recommended)
- **Netlify**
- **Vercel**
- Any web hosting service

## 📝 Data File Format

### Projects (data/projects.js)

```javascript
{
  id: 1,
  title: "Project Title",
  date: "2024-01-01",
  tags: ["AI", "Web", "Robotics"],
  stack: ["Python", "Flask", "PyTorch"],
  description: "Full project description...",
  image: "images/projects/project.jpg",
  demoUrl: "https://demo.com",
  codeUrl: "https://github.com/user/repo",
  icon: "fa-solid fa-robot",
  badge: "Final Year Project",
  badgeColor: "green"  // green, blue, purple, yellow, gray
}
```

### Certificates (data/certificates.js)

```javascript
{
  id: 1,
  title: "Certificate Title",
  date: "2024-01-01",
  tags: ["Workshop", "AI", "Competition"],
  image: "images/certificates/cert1.jpg",
  organization: "Organization Name"
}
```

### Gallery (data/gallery.js)

```javascript
{
  id: 1,
  title: "Gallery Item Title",
  category: "projects",  // projects, competitions, workshops, events, certificates
  image: "images/gallery/item.jpg",
  date: "2024-01-01",
  description: "Optional description"
}
```

## 🎨 Customization

### Change Colors

Edit `static/style.css` or Tailwind config in each HTML file:

```javascript
colors: {
  space: {
    accent: '#00F0FF',  // Change main accent color
  }
}
```

### Modify Styles

All shared styles are in `static/style.css`:
- Glassmorphism effects
- Tech borders
- Timeline styles
- Avatar styles
- Print styles (CV)

### Add Custom JavaScript

Add utility functions to `static/utils.js`

## 📄 Key Features

### Auto-Detecting Profile Images
The system automatically scans `images/profile/` for:
- robot1.jpg, robot2.jpg, robot3.jpg
- profile1.jpg, profile2.jpg, profile3.jpg  
- avatar1.jpg, avatar2.jpg, avatar3.jpg

It will use the first set found and rotate them every 3 seconds.

### Print-Friendly CV
When downloading/printing the CV (`template/cv.html`):
- Navigation bar is automatically hidden
- Styles optimized for printing
- Press Ctrl+P or use browser's print function

### Responsive Design
- Mobile-first approach
- Works on all devices
- Touch-friendly interfaces

## 🔧 Technical Details

### Technologies Used
- **HTML5** - Structure
- **Tailwind CSS** - Styling (CDN)
- **Vanilla JavaScript** - Functionality
- **Canvas API** - Starfield animation
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

### File Loading
All pages load data from `data/*.js` files:
```html
<script src="../data/projects.js"></script>
<script src="../data/certificates.js"></script>
<script src="../data/gallery.js"></script>
```

### Utils Functions
`static/utils.js` provides:
- `loadProfileImages()` - Auto-detect profile images
- `initProfileAvatar()` - Setup rotating avatar
- `initStarfield()` - Animated background
- `initScrollReveal()` - Scroll animations
- `initMobileMenu()` - Mobile navigation
- `setupPrintCV()` - Print functionality

## 📊 Statistics

Current portfolio includes:
- **5 major projects** (AI, Robotics, Web)
- **75 certificates** (Workshops, Competitions, Events)
- **25 gallery items** (Photos from various events)

## 🔐 Important Notes

### edit.html Security
- `edit.html` is a **local-only** admin tool
- **DO NOT deploy** edit.html to production
- It's for local data management only
- Keep it separate from your published portfolio

### Image Optimization
- Compress images before uploading
- Recommended sizes:
  - Profile: 400x400px
  - Projects: 800x600px
  - Certificates: 1200x900px
  - Gallery: 800x800px

### Data Backup
- Always backup your `data/` folder
- Export data regularly using edit.html
- Version control recommended (Git)

## 🎯 Workflow

### Adding New Content

**Using edit.html:**
1. Open `edit.html` locally
2. Add your item (project/certificate/gallery)
3. Export data (Download JSON)
4. Extract the relevant array from JSON
5. Update the corresponding `data/*.js` file
6. Add the image to the appropriate `images/` folder
7. Test on `index.html`

**Manual editing:**
1. Open the relevant `data/*.js` file
2. Add new object to the array
3. Ensure ID is unique
4. Add image to correct folder
5. Test the changes

### Deploying Updates
1. Make changes locally
2. Test thoroughly
3. Upload modified files to hosting
4. Clear browser cache if needed

## 📞 Customization Guide

### Personal Information
Update in `index.html` and `template/cv.html`:
- Name
- Email
- Phone
- Location
- Social links (GitHub, LinkedIn)

### Skills Section
Edit the skills in `index.html`:
```javascript
// Find the skills section and update
AI & Machine Learning: ["PyTorch", "Deep Learning", ...]
Robotics & IoT: ["Arduino", "Raspberry Pi", ...]
Development: ["Python", "C/C++", ...]
```

### Navigation Links
All pages use relative paths:
- From root: `template/cv.html`
- From template: `../index.html`

## 🐛 Troubleshooting

**Images not showing:**
- Check file paths (case-sensitive)
- Verify images exist in correct folders
- Check browser console for errors

**Profile images not rotating:**
- Ensure images are named correctly (robot1.jpg, robot2.jpg, etc.)
- Check `images/profile/` folder exists
- Open browser console for errors

**Data not loading:**
- Check JavaScript console for errors
- Verify data files exist in `data/` folder
- Check array syntax in JS files

**Print CV not working:**
- Use Ctrl+P or browser print
- Check print preview
- Ensure CSS is loaded

## 📈 Future Enhancements

Possible additions:
- Backend API for data management
- Image upload in edit.html
- Search functionality
- Dark/Light mode toggle
- Blog section
- Contact form

## 📄 License

Personal portfolio - all rights reserved

---

**Built by Osama Al-Rawahi**
- Email: s13234@squ.edu.om
- GitHub: github.com/osama-alrawahi
- LinkedIn: linkedin.com/in/osama-al-rawahi-06651a287
