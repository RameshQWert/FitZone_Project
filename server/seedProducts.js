const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const sampleProducts = [
  // SUPPLEMENTS
  {
    name: 'Premium Whey Protein Isolate',
    slug: 'premium-whey-protein-isolate',
    description: 'Ultra-pure whey protein isolate with 27g protein per serving. Fast-absorbing formula for post-workout recovery. Low in fat and carbs, perfect for lean muscle building.',
    shortDescription: '27g protein per serving, fast-absorbing isolate for optimal recovery',
    price: 2999,
    comparePrice: 3499,
    category: 'supplements',
    subcategory: 'protein',
    brand: 'MuscleBlaze',
    sku: 'SUPP-WPI-001',
    stock: 50,
    images: [{ url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600', alt: 'Whey Protein' }],
    thumbnail: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
    variants: [
      { name: 'Chocolate', price: 2999, stock: 20 },
      { name: 'Vanilla', price: 2999, stock: 15 },
      { name: 'Strawberry', price: 2999, stock: 15 }
    ],
    specifications: {
      'Protein per serving': '27g',
      'Servings per container': '30',
      'Weight': '1kg',
      'Form': 'Powder'
    },
    tags: ['protein', 'whey', 'isolate', 'muscle', 'recovery'],
    isFeatured: true,
    isActive: true,
    ratings: { average: 4.5, count: 128 }
  },
  {
    name: 'BCAA Energy Drink',
    slug: 'bcaa-energy-drink',
    description: 'Advanced BCAA formula with 2:1:1 ratio. Contains caffeine for energy boost during workouts. Zero sugar, zero carbs.',
    shortDescription: 'BCAA 2:1:1 ratio with caffeine for energy and muscle recovery',
    price: 1299,
    comparePrice: 1499,
    category: 'supplements',
    subcategory: 'amino-acids',
    brand: 'ON',
    sku: 'SUPP-BCAA-001',
    stock: 75,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', alt: 'BCAA Energy' }],
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    variants: [
      { name: 'Blue Raspberry', price: 1299, stock: 25 },
      { name: 'Fruit Punch', price: 1299, stock: 25 },
      { name: 'Lemon Lime', price: 1299, stock: 25 }
    ],
    specifications: {
      'BCAA per serving': '7g',
      'Caffeine': '100mg',
      'Servings': '30',
      'Weight': '300g'
    },
    tags: ['bcaa', 'amino', 'energy', 'pre-workout'],
    isFeatured: true,
    isActive: true,
    ratings: { average: 4.3, count: 89 }
  },
  {
    name: 'Creatine Monohydrate',
    slug: 'creatine-monohydrate',
    description: 'Pure micronized creatine monohydrate for strength and power. Increases muscle ATP for explosive workouts. No fillers, no additives.',
    shortDescription: 'Pure micronized creatine for strength and power gains',
    price: 899,
    comparePrice: 1099,
    category: 'supplements',
    subcategory: 'creatine',
    brand: 'MyProtein',
    sku: 'SUPP-CREAT-001',
    stock: 100,
    images: [{ url: 'https://images.unsplash.com/photo-1579722820903-4e9b4aa96b90?w=600', alt: 'Creatine' }],
    thumbnail: 'https://images.unsplash.com/photo-1579722820903-4e9b4aa96b90?w=400',
    specifications: {
      'Creatine per serving': '5g',
      'Servings': '100',
      'Weight': '500g',
      'Type': 'Monohydrate'
    },
    tags: ['creatine', 'strength', 'power', 'muscle'],
    isFeatured: false,
    isActive: true,
    ratings: { average: 4.7, count: 256 }
  },
  {
    name: 'Pre-Workout Extreme',
    slug: 'pre-workout-extreme',
    description: 'High-intensity pre-workout formula with 300mg caffeine, beta-alanine, and citrulline malate. Explosive energy, enhanced focus, and skin-splitting pumps.',
    shortDescription: 'High-intensity formula for explosive energy and pumps',
    price: 1799,
    comparePrice: 2199,
    category: 'supplements',
    subcategory: 'pre-workout',
    brand: 'C4',
    sku: 'SUPP-PRE-001',
    stock: 45,
    images: [{ url: 'https://images.unsplash.com/photo-1612837017391-4b6b7b0e2b0b?w=600', alt: 'Pre-Workout' }],
    thumbnail: 'https://images.unsplash.com/photo-1612837017391-4b6b7b0e2b0b?w=400',
    variants: [
      { name: 'Blue Raspberry', price: 1799, stock: 15 },
      { name: 'Fruit Punch', price: 1799, stock: 15 },
      { name: 'Watermelon', price: 1799, stock: 15 }
    ],
    specifications: {
      'Caffeine': '300mg',
      'Beta-Alanine': '3.2g',
      'Citrulline Malate': '6g',
      'Servings': '30'
    },
    tags: ['pre-workout', 'energy', 'focus', 'pump', 'caffeine'],
    isFeatured: true,
    isActive: true,
    ratings: { average: 4.4, count: 167 }
  },
  {
    name: 'Multivitamin Daily',
    slug: 'multivitamin-daily',
    description: 'Complete daily multivitamin with 23 essential vitamins and minerals. Supports immune function, energy production, and overall health.',
    shortDescription: '23 essential vitamins and minerals for daily health',
    price: 599,
    comparePrice: 799,
    category: 'supplements',
    subcategory: 'vitamins',
    brand: 'HealthKart',
    sku: 'SUPP-MULTI-001',
    stock: 120,
    images: [{ url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600', alt: 'Multivitamin' }],
    thumbnail: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400',
    specifications: {
      'Tablets': '60',
      'Servings': '60 days',
      'Key vitamins': 'A, B-complex, C, D3, E',
      'Key minerals': 'Zinc, Iron, Calcium'
    },
    tags: ['vitamins', 'minerals', 'health', 'immunity', 'daily'],
    isFeatured: false,
    isActive: true,
    ratings: { average: 4.2, count: 312 }
  },

  // CLOTHING
  {
    name: 'Performance Dry-Fit T-Shirt',
    slug: 'performance-dry-fit-tshirt',
    description: 'Lightweight, breathable dry-fit t-shirt perfect for intense workouts. Moisture-wicking fabric keeps you cool and dry. Athletic fit for freedom of movement.',
    shortDescription: 'Moisture-wicking dry-fit tee for intense workouts',
    price: 799,
    comparePrice: 999,
    category: 'clothing',
    subcategory: 't-shirts',
    brand: 'Nike',
    sku: 'CLO-TSH-001',
    stock: 60,
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', alt: 'Dry-Fit T-Shirt' }],
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    variants: [
      { name: 'S / Black', price: 799, stock: 10 },
      { name: 'M / Black', price: 799, stock: 15 },
      { name: 'L / Black', price: 799, stock: 15 },
      { name: 'XL / Black', price: 799, stock: 10 },
      { name: 'M / Grey', price: 799, stock: 10 }
    ],
    specifications: {
      'Material': '100% Polyester',
      'Fit': 'Athletic',
      'Care': 'Machine wash cold',
      'Technology': 'Dri-FIT'
    },
    tags: ['t-shirt', 'gym', 'dry-fit', 'workout', 'performance'],
    isFeatured: true,
    isActive: true,
    ratings: { average: 4.6, count: 203 }
  },
  {
    name: 'Compression Training Shorts',
    slug: 'compression-training-shorts',
    description: 'High-performance compression shorts with inner pocket. Supports muscles during intense training. Quick-dry fabric with anti-odor technology.',
    shortDescription: 'Compression shorts with muscle support and quick-dry fabric',
    price: 1299,
    comparePrice: 1599,
    category: 'clothing',
    subcategory: 'shorts',
    brand: 'Under Armour',
    sku: 'CLO-SHO-001',
    stock: 40,
    images: [{ url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600', alt: 'Compression Shorts' }],
    thumbnail: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
    variants: [
      { name: 'S / Black', price: 1299, stock: 8 },
      { name: 'M / Black', price: 1299, stock: 12 },
      { name: 'L / Black', price: 1299, stock: 12 },
      { name: 'XL / Black', price: 1299, stock: 8 }
    ],
    specifications: {
      'Material': '87% Polyester, 13% Elastane',
      'Fit': 'Compression',
      'Length': '7 inches',
      'Features': 'Inner pocket, Anti-odor'
    },
    tags: ['shorts', 'compression', 'training', 'gym', 'quick-dry'],
    isFeatured: false,
    isActive: true,
    ratings: { average: 4.5, count: 156 }
  },
  {
    name: 'Training Running Shoes',
    slug: 'training-running-shoes',
    description: 'Versatile training shoes perfect for gym workouts and running. Responsive cushioning, breathable mesh upper, and durable rubber outsole.',
    shortDescription: 'Versatile shoes for gym and running with responsive cushioning',
    price: 4999,
    comparePrice: 5999,
    category: 'clothing',
    subcategory: 'shoes',
    brand: 'Adidas',
    sku: 'CLO-SHO-002',
    stock: 30,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', alt: 'Running Shoes' }],
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    variants: [
      { name: 'UK 7 / Black', price: 4999, stock: 5 },
      { name: 'UK 8 / Black', price: 4999, stock: 8 },
      { name: 'UK 9 / Black', price: 4999, stock: 8 },
      { name: 'UK 10 / Black', price: 4999, stock: 5 },
      { name: 'UK 8 / White', price: 4999, stock: 4 }
    ],
    specifications: {
      'Upper': 'Mesh',
      'Sole': 'Rubber',
      'Cushioning': 'Boost',
      'Weight': '280g'
    },
    tags: ['shoes', 'running', 'training', 'gym', 'sneakers'],
    isFeatured: true,
    isActive: true,
    ratings: { average: 4.7, count: 289 }
  },
  {
    name: 'Gym Hoodie Fleece',
    slug: 'gym-hoodie-fleece',
    description: 'Warm fleece-lined hoodie perfect for pre and post workout. Kangaroo pocket for essentials, adjustable hood, and ribbed cuffs.',
    shortDescription: 'Warm fleece hoodie for gym sessions',
    price: 1999,
    comparePrice: 2499,
    category: 'clothing',
    subcategory: 'hoodies',
    brand: 'Puma',
    sku: 'CLO-HOO-001',
    stock: 35,
    images: [{ url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', alt: 'Gym Hoodie' }],
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    variants: [
      { name: 'M / Black', price: 1999, stock: 10 },
      { name: 'L / Black', price: 1999, stock: 10 },
      { name: 'XL / Black', price: 1999, stock: 8 },
      { name: 'L / Grey', price: 1999, stock: 7 }
    ],
    specifications: {
      'Material': '80% Cotton, 20% Polyester',
      'Lining': 'Fleece',
      'Features': 'Kangaroo pocket, Adjustable hood',
      'Care': 'Machine wash'
    },
    tags: ['hoodie', 'fleece', 'warm', 'gym', 'workout'],
    isFeatured: false,
    isActive: true,
    ratings: { average: 4.4, count: 134 }
  },

  // EQUIPMENT
  {
    name: 'Adjustable Dumbbell Set 24kg',
    slug: 'adjustable-dumbbell-set-24kg',
    description: 'Space-saving adjustable dumbbells that replace 15 sets of weights. Quick-change weight system from 2.5kg to 24kg. Perfect for home gyms.',
    shortDescription: 'Adjustable 2.5kg-24kg dumbbells, replaces 15 weight sets',
    price: 12999,
    comparePrice: 15999,
    category: 'equipment',
    subcategory: 'weights',
    brand: 'Bowflex',
    sku: 'EQP-DMB-001',
    stock: 15,
    images: [{ url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', alt: 'Adjustable Dumbbells' }],
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    specifications: {
      'Weight Range': '2.5kg - 24kg',
      'Increments': '2.5kg',
      'Material': 'Steel with rubber grip',
      'Includes': 'Pair of dumbbells, storage tray'
    },
    tags: ['dumbbell', 'adjustable', 'weights', 'home-gym', 'strength'],
    isFeatured: true,
    isActive: true,
    ratings: { average: 4.8, count: 78 }
  },
  {
    name: 'Resistance Bands Set',
    slug: 'resistance-bands-set',
    description: 'Complete resistance bands set with 5 different resistance levels. Includes door anchor, ankle straps, and carrying bag. Perfect for full-body workouts.',
    shortDescription: '5 resistance levels with accessories for full-body training',
    price: 999,
    comparePrice: 1299,
    category: 'equipment',
    subcategory: 'bands',
    brand: 'Boldfit',
    sku: 'EQP-BND-001',
    stock: 80,
    images: [{ url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600', alt: 'Resistance Bands' }],
    thumbnail: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400',
    specifications: {
      'Bands included': '5 (5-50 lbs)',
      'Accessories': 'Door anchor, 2 ankle straps, 2 handles',
      'Material': 'Natural latex',
      'Includes': 'Carrying bag, Exercise guide'
    },
    tags: ['resistance', 'bands', 'training', 'home-workout', 'portable'],
    isFeatured: false,
    isActive: true,
    ratings: { average: 4.3, count: 412 }
  },
  {
    name: 'Premium Yoga Mat 6mm',
    slug: 'premium-yoga-mat-6mm',
    description: 'Extra thick 6mm yoga mat with non-slip texture. High-density foam provides excellent cushioning for joints. Includes carrying strap.',
    shortDescription: '6mm thick mat with non-slip surface and carrying strap',
    price: 1499,
    comparePrice: 1799,
    category: 'equipment',
    subcategory: 'mats',
    brand: 'Lifelong',
    sku: 'EQP-MAT-001',
    stock: 55,
    images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600', alt: 'Yoga Mat' }],
    thumbnail: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    variants: [
      { name: 'Blue', price: 1499, stock: 15 },
      { name: 'Purple', price: 1499, stock: 15 },
      { name: 'Black', price: 1499, stock: 15 },
      { name: 'Green', price: 1499, stock: 10 }
    ],
    specifications: {
      'Thickness': '6mm',
      'Material': 'High-density TPE foam',
      'Dimensions': '183cm x 61cm',
      'Features': 'Non-slip, Eco-friendly'
    },
    tags: ['yoga', 'mat', 'exercise', 'fitness', 'stretching'],
    isFeatured: false,
    isActive: true,
    ratings: { average: 4.5, count: 267 }
  },
  {
    name: 'Pull-Up Bar Doorway',
    slug: 'pull-up-bar-doorway',
    description: 'Heavy-duty doorway pull-up bar supports up to 150kg. Multiple grip positions for various exercises. No screws required, easy installation.',
    shortDescription: 'Doorway pull-up bar, 150kg capacity, no screws needed',
    price: 1299,
    comparePrice: 1599,
    category: 'equipment',
    subcategory: 'bars',
    brand: 'Iron Gym',
    sku: 'EQP-BAR-001',
    stock: 40,
    images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', alt: 'Pull-Up Bar' }],
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    specifications: {
      'Max weight': '150kg',
      'Door width': '62-92cm',
      'Material': 'Steel with foam grips',
      'Grip positions': '3 (wide, neutral, close)'
    },
    tags: ['pull-up', 'bar', 'doorway', 'strength', 'home-gym'],
    isFeatured: true,
    isActive: true,
    ratings: { average: 4.4, count: 189 }
  },

  // ACCESSORIES
  {
    name: 'Gym Gloves with Wrist Support',
    slug: 'gym-gloves-wrist-support',
    description: 'Premium weight lifting gloves with integrated wrist wraps. Padded palm for grip and protection. Breathable mesh back keeps hands cool.',
    shortDescription: 'Weight lifting gloves with wrist wraps and padded palm',
    price: 699,
    comparePrice: 899,
    category: 'accessories',
    subcategory: 'gloves',
    brand: 'RDX',
    sku: 'ACC-GLO-001',
    stock: 70,
    images: [{ url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600', alt: 'Gym Gloves' }],
    thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    variants: [
      { name: 'S', price: 699, stock: 15 },
      { name: 'M', price: 699, stock: 20 },
      { name: 'L', price: 699, stock: 20 },
      { name: 'XL', price: 699, stock: 15 }
    ],
    specifications: {
      'Material': 'Synthetic leather, Mesh',
      'Features': 'Wrist wrap, Padded palm',
      'Closure': 'Velcro',
      'Suitable for': 'Weight training, CrossFit'
    },
    tags: ['gloves', 'gym', 'weight-lifting', 'wrist-support', 'grip'],
    isFeatured: false,
    isActive: true,
    ratings: { average: 4.3, count: 234 }
  },
  {
    name: 'Shaker Bottle 700ml',
    slug: 'shaker-bottle-700ml',
    description: 'Leak-proof protein shaker with mixing ball. BPA-free plastic with measurement markings. Wide mouth for easy cleaning and adding supplements.',
    shortDescription: 'Leak-proof 700ml shaker with mixing ball',
    price: 299,
    comparePrice: 399,
    category: 'accessories',
    subcategory: 'bottles',
    brand: 'BlenderBottle',
    sku: 'ACC-SHK-001',
    stock: 100,
    images: [{ url: 'https://images.unsplash.com/photo-1594044047879-5e8c16e2e0a5?w=600', alt: 'Shaker Bottle' }],
    thumbnail: 'https://images.unsplash.com/photo-1594044047879-5e8c16e2e0a5?w=400',
    variants: [
      { name: 'Black', price: 299, stock: 25 },
      { name: 'Blue', price: 299, stock: 25 },
      { name: 'Red', price: 299, stock: 25 },
      { name: 'Green', price: 299, stock: 25 }
    ],
    specifications: {
      'Capacity': '700ml',
      'Material': 'BPA-free Tritan plastic',
      'Features': 'Mixing ball, Leak-proof',
      'Care': 'Dishwasher safe'
    },
    tags: ['shaker', 'bottle', 'protein', 'mixer', 'gym'],
    isFeatured: false,
    isActive: true,
    ratings: { average: 4.6, count: 567 }
  },
  {
    name: 'Weight Lifting Belt',
    slug: 'weight-lifting-belt',
    description: 'Professional leather weight lifting belt for heavy lifts. 4-inch width provides optimal support. Double-prong buckle for secure fit.',
    shortDescription: 'Leather lifting belt with double-prong buckle',
    price: 1499,
    comparePrice: 1899,
    category: 'accessories',
    subcategory: 'belts',
    brand: 'Harbinger',
    sku: 'ACC-BLT-001',
    stock: 35,
    images: [{ url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600', alt: 'Weight Lifting Belt' }],
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    variants: [
      { name: 'S (26-32")', price: 1499, stock: 8 },
      { name: 'M (32-38")', price: 1499, stock: 12 },
      { name: 'L (38-44")', price: 1499, stock: 10 },
      { name: 'XL (44-50")', price: 1499, stock: 5 }
    ],
    specifications: {
      'Material': 'Genuine leather',
      'Width': '4 inches (10cm)',
      'Buckle': 'Double-prong steel',
      'Suitable for': 'Squats, Deadlifts, Heavy lifts'
    },
    tags: ['belt', 'weight-lifting', 'powerlifting', 'support', 'leather'],
    isFeatured: true,
    isActive: true,
    ratings: { average: 4.7, count: 145 }
  },
  {
    name: 'Sports Gym Bag',
    slug: 'sports-gym-bag',
    description: 'Spacious gym duffel bag with separate shoe compartment. Water-resistant fabric, multiple pockets for organization. Adjustable shoulder strap.',
    shortDescription: 'Duffel bag with shoe compartment and multiple pockets',
    price: 1299,
    comparePrice: 1599,
    category: 'accessories',
    subcategory: 'bags',
    brand: 'Nike',
    sku: 'ACC-BAG-001',
    stock: 45,
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', alt: 'Gym Bag' }],
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    variants: [
      { name: 'Black', price: 1299, stock: 20 },
      { name: 'Navy', price: 1299, stock: 15 },
      { name: 'Grey', price: 1299, stock: 10 }
    ],
    specifications: {
      'Capacity': '40L',
      'Material': 'Polyester, Water-resistant',
      'Features': 'Shoe compartment, Multiple pockets',
      'Dimensions': '56cm x 28cm x 28cm'
    },
    tags: ['bag', 'gym', 'duffel', 'sports', 'travel'],
    isFeatured: false,
    isActive: true,
    ratings: { average: 4.5, count: 298 }
  },
  {
    name: 'Wireless Sport Earbuds',
    slug: 'wireless-sport-earbuds',
    description: 'Sweat-proof wireless earbuds designed for workouts. 8-hour battery life, secure ear hooks, deep bass sound. Includes charging case.',
    shortDescription: 'Sweat-proof earbuds with 8-hour battery and secure fit',
    price: 2499,
    comparePrice: 2999,
    category: 'accessories',
    subcategory: 'electronics',
    brand: 'JBL',
    sku: 'ACC-EAR-001',
    stock: 30,
    images: [{ url: 'https://images.unsplash.com/photo-1590658165737-15a047b7c0b0?w=600', alt: 'Wireless Earbuds' }],
    thumbnail: 'https://images.unsplash.com/photo-1590658165737-15a047b7c0b0?w=400',
    variants: [
      { name: 'Black', price: 2499, stock: 15 },
      { name: 'White', price: 2499, stock: 15 }
    ],
    specifications: {
      'Battery life': '8 hours (24 with case)',
      'Connectivity': 'Bluetooth 5.0',
      'Features': 'Sweat-proof (IPX5), Ear hooks',
      'Includes': 'Charging case, Ear tips (S/M/L)'
    },
    tags: ['earbuds', 'wireless', 'sport', 'bluetooth', 'music'],
    isFeatured: true,
    isActive: true,
    ratings: { average: 4.4, count: 312 }
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitzone');
    console.log('MongoDB Connected');

    // Delete existing products
    await Product.deleteMany({});
    console.log('Existing products deleted');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`${products.length} products seeded successfully!`);

    // Show summary
    const summary = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    console.log('\nProducts by category:');
    summary.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} products`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
