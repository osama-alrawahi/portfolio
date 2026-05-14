// Projects Data
// Each project should have: id, title, date, tags, stack, description, image, demoUrl, codeUrl, icon

const PROJECTS = [
  {
    id: 1,
    title: "JISSR-OM — Omani Sign Language Recognition & Translation",
    date: "2026-05-12",
    tags: ["AI", "Computer Vision", "Flask", "Real-time"],
    stack: ["Python", "PyTorch", "Transformer", "OpenCV", "Flask", "RTMPose", "CUDA"],
    description: "Real-time web application that captures live video and translates Omani Sign Language (OSL) gestures into Arabic text at the sentence level. Integrated UniSign (transformer-based model) with RTMPose/RTMLib for whole-body pose estimation. Features avatar animation for reverse sign-to-video playback.",
    image: "images/projects/3.png",
    demoUrl: "#",
    codeUrl: "https://github.com/osama-alrawahi/JSSIR-OM",
    icon: "fa-solid fa-hands",
    badge: "Final Year Project",
    badgeColor: "green",
    featured: true
  },
  {
    id: 2,
    title: "Mapping-Based Navigation — ANN-Controlled Mobile Robot",
    date: "2025-05-15",
    tags: ["Robotics", "AI", "Embedded Systems"],
    stack: ["Arduino (C/C++)", "ANN", "A* Algorithm", "Dijkstra's", "Robotics"],
    description: "Physical mobile robot using Artificial Neural Network (ANN) for camera-based environment scanning and real-time 8×8 grid map construction. Implemented Dijkstra's algorithm and A* (Manhattan heuristic) for optimal path planning. Achieved >90% path completion accuracy in controlled indoor testing.",
    image: "images/projects/1.jpeg",
    demoUrl: "#",
    codeUrl: "#",
    icon: "fa-solid fa-robot",
    badge: "Robotics Course",
    badgeColor: "purple",
    featured: false
  },
  {
    id: 3,
    title: "Green Balance — Oil Detection & Bio-Response Maritime System",
    date: "2026-02-15",
    tags: ["Web", "IoT", "Hackathon", "Dashboard"],
    stack: ["JavaScript", "Leaflet.js", "IoT Simulation", "Drone Systems"],
    description: "Smart maritime monitoring dashboard for Sohar Port that detects oil-leaking vessels and autonomously deploys oil-eating bacteria from sea floats. Features GPS-based real-time ship tracking with color-coded status for all entities. Won 3rd Place at Rubban Hackathon.",
    image: "images/projects/2.jpeg",
    demoUrl: "#",
    codeUrl: "#",
    icon: "fa-solid fa-ship",
    badge: "3rd Place · Hackathon",
    badgeColor: "yellow",
    featured: true
  },
  {
    id: 4,
    title: "Luqma (لُقمة) — National Platform for Sustainable Food",
    date: "2024-05-03",
    tags: ["Web", "Arabic RTL", "Gamification"],
    stack: ["HTML/CSS/JS", "Leaflet.js", "Arabic RTL", "Gamification"],
    description: "Arabic-language RTL web platform combating food waste in Oman via local farm discovery, smart fridge freshness tracking, and AI-driven recipe suggestions for expiring ingredients. Features leaderboard, daily food-waste challenges, and mini-games to drive engagement.",
    image: "images/projects/4.png",
    demoUrl: "#",
    codeUrl: "#",
    icon: "fa-solid fa-seedling",
    badge: "Competition Entry",
    badgeColor: "blue",
    featured: false
  },
  {
    id: 5,
    title: "Calisthenics RPG — Gamified Skill Tree Progression",
    date: "2025 - Now",
    tags: ["Web", "UI/UX", "Arabic RTL", "In Development"],
    stack: ["HTML/CSS/JS", "SVG", "Arabic RTL", "UI/UX"],
    description: "Arabic-language web app that turns calisthenics training into an RPG-style skill tree with 100+ ranked exercises (Tier 0–100) across Push, Pull, Core, and Legs categories. Features SVG body map for muscle activation visualization and full RTL Arabic UI with dark neon glassmorphism aesthetic.",
    image: "images/projects/5.png",
    demoUrl: "#",
    codeUrl: "#",
    icon: "fa-solid fa-dumbbell",
    badge: "In Development",
    badgeColor: "gray",
    featured: false
  }
];

// All available tags (for filtering)
const PROJECT_TAGS = [
  "All",
  "AI",
  "Computer Vision",
  "Robotics",
  "Web",
  "IoT",
  "Flask",
  "Real-time",
  "Embedded Systems",
  "Hackathon",
  "Dashboard",
  "Arabic RTL",
  "Gamification",
  "UI/UX",
  "In Development"
];
