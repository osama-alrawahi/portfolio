// Gallery Data
// Each gallery item should have: id, title, category, image, date (optional), description (optional)

const GALLERY_ITEMS = [

  { id: 1, title: "AI Drone Competition - 1st Place and 3rd Place", category: "competitions", image: "images/gallery/2.jpeg", date: "2024", description: "Winning moment at AI Drone Competition" },
  { id: 2, title: "Rubban Hackathon - 3rd Place", category: "competitions", image: "images/gallery/6.jpeg", date: "2026", description: "Team Winning in the Rubban Hackathon" },
  
  { id: 3, title: "Olympic tech", category: "competitions", image: "images/gallery/7.jpeg", date: "2025", description: "Data Processing Competitions in Iran" },

  { id: 4, title: "AI Drone Competition", category: "events", image: "images/gallery/8.jpeg", date: "2025 - 2026", description: "instractor" },
  { id: 5, title: "AI Drone Competition", category: "events", image: "images/gallery/3.jpeg", date: "2025 - 2026", description: "flying with Drone" },
];

// Gallery categories
const GALLERY_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "projects", label: "Projects" },
  { value: "competitions", label: "Competitions" },
  { value: "workshops", label: "Workshops" },
  { value: "events", label: "Events" },
  { value: "certificates", label: "Certificates" }
];
