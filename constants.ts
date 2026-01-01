
import { MenuPackage, ServiceItem, ClientItem } from './types';

export const MENUS: MenuPackage[] = [
  {
    id: 'mandi-std',
    name: 'Standard Mandi Package',
    items: ['Chicken Mandi', 'Green Salad', 'Yogurt Sauce', 'Water', 'Dates'],
    base_cost_per_pax: 25
  },
  {
    id: 'mandi-vip',
    name: 'VIP Lamb Mandi',
    items: ['Lamb Mandi', 'Arabic Salad', 'Kunafa', 'Soft Drinks', 'Coffee/Tea'],
    base_cost_per_pax: 45
  },
  {
    id: 'breakfast-box',
    name: 'Corporate Breakfast Box',
    items: ['Club Sandwich', 'Muffin', 'Fruit Cup', 'Orange Juice'],
    base_cost_per_pax: 18
  }
];

export const SEED_CLIENTS: ClientItem[] = [
  { id: 1, name: "Aramco Systems", contact: "+966 50 123 4567", vat: "3000123456789", email: "procure@aramco.com", address: "Dhahran, Saudi Arabia" },
  { id: 2, name: "Red Sea Global", contact: "+966 55 999 8888", vat: "3000987654321", email: "contracts@redsea.com", address: "Riyadh, Saudi Arabia" },
  { id: 3, name: "Paul", contact: "+966 59 111 2222", vat: "N/A", email: "paul@partner.com" },
  { id: 4, name: "SABIC", contact: "+966 13 345 6789", vat: "3000555556666", email: "procurement@sabic.com", address: "Jubail Industrial City" },
  { id: 5, name: "JAG Arabia", contact: "+966 50 123 4567", vat: "3000999888777", email: "info@jag.sa", address: "Dammam, Saudi Arabia" },
  { id: 6, name: "Bukhamseen Trading Company", contact: "+966 56 502 2355", vat: "N/A", email: "info@bukhamseen.com", address: "Khobar, KSA" }
];

export const CLIENTS = SEED_CLIENTS.map(c => c.name);

export const SEED_SERVICES: ServiceItem[] = [
  // TENTS
  { 
    id: 1, 
    title: 'Beach Tent Package (Majlis Style)', 
    category: 'TENT', 
    selling_price: 4500, 
    cost_price: 3500, 
    profit: 1000,
    specifications: { size: "6x12m", type: "Traditional" }, 
    includes: ["Majlis Seating", "Basic Rugs", "Installation & Removal", "Lighting Setup"],
    image_url: 'https://images.unsplash.com/photo-1565538810643-b5bdb839ee29?auto=format&fit=crop&w=800',
    status: 'AVAILABLE'
  },
  { 
    id: 2, 
    title: 'Saudi Heritage Suite Tent', 
    category: 'TENT', 
    selling_price: 8500, 
    cost_price: 6000, 
    profit: 2500,
    specifications: { size: "10x20m", style: "Opulent Traditional" }, 
    includes: ["Luxury Sadu Fabrics", "Chandeliers", "VIP Ground Seating", "AC Units"],
    image_url: 'https://images.unsplash.com/photo-1605218427368-80b8b0532512?auto=format&fit=crop&w=800',
    status: 'AVAILABLE'
  },
  { 
    id: 3, 
    title: 'European Glass Marquee', 
    category: 'TENT', 
    selling_price: 15000, 
    cost_price: 11000, 
    profit: 4000,
    specifications: { size: "Modular", features: "Transparent Panels" }, 
    includes: ["Glass Walls", "Draped Ceiling", "Hardwood Flooring", "Climate Control"],
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800',
    status: 'AVAILABLE'
  },
  // CATERING
  { 
    id: 4, 
    title: 'Heritage Feast (Whole Naimi Lamb)', 
    category: 'CATERING', 
    selling_price: 3200, 
    cost_price: 2400, 
    profit: 800,
    specifications: { serves: "15-20 People", cuisine: "Authentic Saudi" }, 
    includes: ["Whole Roasted Naimi Lamb", "Traditional Spiced Rice", "Tahini & Hot Sauce", "Saudi Coffee"],
    image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800',
    status: 'AVAILABLE'
  },
  { 
    id: 5, 
    title: 'Premium International Buffet', 
    category: 'CATERING', 
    selling_price: 250, 
    cost_price: 160, 
    profit: 90,
    specifications: { style: "Buffet", min_pax: "50" }, 
    includes: ["Oriental Mixed Grill", "Beef Stroganoff", "Chicken Caesar Salad", "Cheesecake"],
    image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800',
    status: 'AVAILABLE'
  },
  { 
    id: 6, 
    title: 'VIP Coffee Break', 
    category: 'CATERING', 
    selling_price: 85, 
    cost_price: 45, 
    profit: 40,
    specifications: { style: "Corporate", duration: "4 Hours" }, 
    includes: ["Fresh Juices", "Mini Croissants", "Cheese Kunafa", "Arabic Coffee & Dates"],
    image_url: 'https://images.unsplash.com/photo-1517056637379-34ba71337d11?auto=format&fit=crop&w=800',
    status: 'AVAILABLE'
  },
  // ENTERTAINMENT
  {
    id: 7,
    title: 'Carnival Skill Game: Balloon Darts',
    category: 'ENTERTAINMENT',
    selling_price: 1200,
    cost_price: 600,
    profit: 600,
    specifications: { type: "Skill", space: "3x3m" },
    includes: ["Game Stall", "Darts & Balloons", "Prizes", "Attendant"],
    status: 'AVAILABLE'
  },
  {
    id: 8,
    title: 'VR Simulator: 360 Degree',
    category: 'ENTERTAINMENT',
    selling_price: 3500,
    cost_price: 2000,
    profit: 1500,
    specifications: { type: "Tech", capacity: "2 Persons" },
    includes: ["360 Motion Pod", "VR Headsets", "Operator", "Screen Display"],
    status: 'AVAILABLE'
  },
  {
    id: 9,
    title: 'Padel Court Rental (Mobile)',
    category: 'ENTERTAINMENT',
    selling_price: 8000,
    cost_price: 5000,
    profit: 3000,
    specifications: { size: "20x10m", surface: "Artificial Turf" },
    includes: ["Glass Enclosure", "Turf", "Lighting", "Equipment"],
    status: 'AVAILABLE'
  }
];
