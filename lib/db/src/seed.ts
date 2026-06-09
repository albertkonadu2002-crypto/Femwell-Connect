import { pool, db } from "./index";
import { sql } from "drizzle-orm";
import {
  usersTable,
  productsTable,
  reviewsTable,
  ordersTable,
  cartItemsTable,
  subscriptionPlansTable,
  subscriptionsTable,
  appointmentsTable,
  blogPostsTable,
  cycleEntriesTable,
} from "./schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(cycleEntriesTable);
  await db.delete(appointmentsTable);
  await db.delete(subscriptionsTable);
  await db.delete(subscriptionPlansTable);
  await db.delete(ordersTable);
  await db.delete(cartItemsTable);
  await db.delete(reviewsTable);
  await db.delete(blogPostsTable);
  await db.delete(productsTable);
  await db.delete(usersTable);

  // Reset serial sequences so demo user gets ID 1 (matches GUEST_USER_ID in API routes)
  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE products_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE subscription_plans_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE orders_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE reviews_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE blog_posts_id_seq RESTART WITH 1`);

  // Create demo user
  const passwordHash = await bcrypt.hash("password123", SALT_ROUNDS);
  const [user] = await db.insert(usersTable).values({
    email: "demo@femwellconnect.com",
    passwordHash,
    name: "Ama Mensah",
    role: "admin",
    phone: "+233 24 000 0000",
    university: "University of Ghana, Legon",
    deliveryAddress: "Legon Hall, Room 205",
  }).returning();
  console.log(`Created user: ${user.name} (ID: ${user.id})`);

  // Seed products
  const products = await db.insert(productsTable).values([
    {
      name: "Standard Femwell Connect Kit",
      description: "Our essential care kit for comfortable, confident period management. Includes pads, liners, tissues, a health guide, and more.",
      price: 20,
      category: "Essential",
      imageUrl: "/images/products/product-standard-pink.jpg",
      featured: false,
      inStock: true,
      contents: ["2x Pads", "1x Liner", "1x Tissue", "1x Pants", "1x Bag", "1x Guide"],
    },
    {
      name: "Standard Femwell Connect Kit",
      description: "A refreshing care kit with everything you need for your cycle. Pads, sanitizer, liners, and a reproductive health guide.",
      price: 35,
      category: "Essential",
      imageUrl: "/images/products/product-standard-green.jpg",
      featured: true,
      inStock: true,
      contents: ["Pads", "Sanitizer", "Liners", "Tissues", "Reproductive Health Guide"],
    },
    {
      name: "Femwell Connect Ultimate Kit",
      description: "Our most comprehensive kit. Everything from hygiene essentials to an educational guide on reproductive health — your complete wellness companion.",
      price: 50,
      category: "Premium",
      imageUrl: "/images/products/product-ultimate.jpg",
      featured: true,
      inStock: true,
      contents: ["Sanitary pads", "Panty liners", "Tissues", "Hand sanitizer", "Educational Guide on Reproductive Health"],
    },
  ]).returning();
  console.log(`Created ${products.length} products`);

  // Seed subscription plans
  const plans = await db.insert(subscriptionPlansTable).values([
    {
      name: "Monthly Bloom",
      description: "Perfect for trying out Femwell Connect. Essential kit delivered monthly.",
      price: 44.99,
      interval: "monthly",
      features: ["1x Standard Care Kit monthly", "Free delivery to campus", "Health blog access", "Email support"],
      popular: false,
    },
    {
      name: "Quarterly Glow",
      description: "Three months of comprehensive care with premium products.",
      price: 119.99,
      interval: "quarterly",
      features: ["3x Premium Kits monthly", "Free priority delivery", "1x Telehealth consultation", "All blog access", "WhatsApp support", "10% product discount"],
      popular: true,
    },
    {
      name: "Semester Care",
      description: "Full semester coverage with premium care and consultations.",
      price: 199.99,
      interval: "semester",
      features: ["6x Premium Kits monthly", "Free express delivery", "3x Telehealth consultations", "Unlimited blog access", "Priority support", "15% all product discount", "Wellness tracker"],
      popular: true,
    },
  ]).returning();
  console.log(`Created ${plans.length} subscription plans`);

  // Seed blog posts
  const posts = await db.insert(blogPostsTable).values([
    {
      title: "Understanding Your Menstrual Cycle",
      excerpt: "Everything you need to know about the four phases of your cycle.",
      content: "Your menstrual cycle is a complex process. There are four main phases: menstruation, the follicular phase, ovulation, and the luteal phase. During menstruation (days 1-5) your uterine lining sheds and you may experience cramping. During the follicular phase estrogen rises and you may feel more energetic. Ovulation occurs around day 14. The luteal phase can bring PMS symptoms. Tracking your cycle can help you understand your unique patterns and plan accordingly. Knowing your cycle phase helps you manage energy, mood, and productivity better as a student.",
      category: "Menstrual Hygiene",
      author: "Nurse Abena Mensah",
      imageUrl: "/images/blog-nurse.svg",
      featured: true,
      readTime: 8,
      tags: ["menstrual cycle", "period health", "hormones"],
    },
    {
      title: "5 Essential Hygiene Tips for University Students",
      excerpt: "Staying on top of your menstrual hygiene while managing busy campus life.",
      content: "University life is demanding and it can be easy to let personal health routines slip. Maintaining good menstrual hygiene is crucial. Always carry spare products in your bag. Change your pad every 4-6 hours even on light flow days. Stay hydrated with at least 8 glasses of water daily to reduce bloating. Know where the nearest campus health center is located. Do not hesitate to seek help if your cramps are severe or your cycle is very irregular. Femwell Connect care kits are designed specifically for the busy student lifestyle and campus conditions in Ghana.",
      category: "Student Health",
      author: "Nurse Akosua Boateng",
      imageUrl: "/images/blog-student.svg",
      featured: true,
      readTime: 5,
      tags: ["student health", "campus life", "hygiene tips"],
    },
    {
      title: "Family Planning: What Every Young Woman Should Know",
      excerpt: "A comprehensive guide to contraception and family planning in Ghana.",
      content: "Family planning empowers women to make informed decisions about if and when to have children. In Ghana there are several contraception options available. Barrier methods like condoms are the only method that also protects against STIs. Hormonal methods include the pill, patch, injection, and implant. Long-acting methods like IUDs can provide multi-year protection. Emergency contraception is available after unprotected sex. Speak with a healthcare professional to find the method best suited to your lifestyle and health needs. Femwell Connect nurses offer confidential family planning consultations with no judgment in a safe supportive environment.",
      category: "Family Planning",
      author: "Nurse Ama Asante",
      imageUrl: "/images/blog-nurse.svg",
      featured: false,
      readTime: 10,
      tags: ["family planning", "contraception", "reproductive health"],
    },
    {
      title: "Managing Period Pain Naturally and Effectively",
      excerpt: "Evidence-based strategies for reducing menstrual cramps from heat therapy to diet.",
      content: "Period pain affects millions of women and can range from mild discomfort to debilitating cramping. Known medically as dysmenorrhea it is caused by prostaglandins that cause the uterus to contract. Heat therapy using a hot water bottle on your lower abdomen can relax muscles and relieve cramping. Exercise including gentle yoga and walking releases endorphins that reduce pain naturally. Reducing salt, sugar, and caffeine while increasing omega-3-rich foods lessens inflammation. Herbal teas like ginger and chamomile have anti-inflammatory properties. Over-the-counter pain relievers like ibuprofen taken before pain starts are very effective. If your pain is severe see a healthcare provider as it could indicate conditions like endometriosis.",
      category: "Women's Wellness",
      author: "Nurse Abena Mensah",
      imageUrl: "/images/blog-student.svg",
      featured: false,
      readTime: 7,
      tags: ["period pain", "dysmenorrhea", "natural remedies"],
    },
  ]).returning();
  console.log(`Created ${posts.length} blog posts`);

  // Seed a demo order
  await db.insert(ordersTable).values({
    userId: user.id,
    items: [{ id: products[0].id, productName: products[0].name, price: products[0].price, quantity: 1, imageUrl: products[0].imageUrl }],
    total: 49.99,
    status: "delivered",
    paymentMethod: "mtn_momo",
    deliveryAddress: "Legon Hall, Room 205",
    estimatedDelivery: "2026-06-08",
    trackingNumber: "BHK1717401600000",
  });
  console.log("Created demo order");

  // Seed reviews
  await db.insert(reviewsTable).values([
    {
      productId: products[0].id,
      userName: "Ama Mensah",
      rating: 5,
      comment: "Absolutely love this kit! Everything I need for the month is in one package. The pads are comfortable and the sanitizer is a nice touch. Highly recommend for campus life.",
    },
    {
      productId: products[0].id,
      userName: "Efua Darko",
      rating: 4,
      comment: "Great value for the price. The educational leaflet was really informative. Delivery to campus was super fast.",
    },
    {
      productId: products[1].id,
      userName: "Akua Serwaa",
      rating: 5,
      comment: "The premium kit is worth every cedi. The pregnancy test strips and feminine wash are quality products. Will be subscribing!",
    },
    {
      productId: products[2].id,
      userName: "Nana Agyeman",
      rating: 5,
      comment: "Bought this for my sister at KNUST. She absolutely loved it. The educational guide is a great addition. Fast delivery too.",
    },
  ]);
  console.log("Created reviews");

  // Seed a demo appointment
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const appointmentDate = tomorrow.toISOString().split("T")[0];
  await db.insert(appointmentsTable).values({
    userId: user.id,
    date: appointmentDate,
    time: "10:00 AM",
    type: "consultation",
    status: "scheduled",
    nurseName: "Nurse Abena Mensah",
    concern: "Questions about menstrual cycle irregularity",
    meetingLink: "https://meet.femwellconnect.com/demo-meeting-001",
  });
  console.log("Created demo appointment");

  // Seed a demo subscription
  await db.insert(subscriptionsTable).values({
    userId: user.id,
    planId: plans[1].id,
    planName: plans[1].name,
    status: "active",
    nextDelivery: "2026-07-03",
    deliveryAddress: "Legon Hall, Room 205",
    paymentMethod: "mtn_momo",
  });
  console.log("Created demo subscription");

  // Seed cycle entries
  const today = new Date();
  const periodStart1 = new Date(today);
  periodStart1.setDate(today.getDate() - 14);
  const periodEnd1 = new Date(periodStart1);
  periodEnd1.setDate(periodStart1.getDate() + 5);

  const periodStart2 = new Date(periodStart1);
  periodStart2.setDate(periodStart1.getDate() - 28);
  const periodEnd2 = new Date(periodStart2);
  periodEnd2.setDate(periodStart2.getDate() + 5);

  await db.insert(cycleEntriesTable).values([
    {
      userId: user.id,
      periodStart: periodStart1.toISOString().split("T")[0],
      periodEnd: periodEnd1.toISOString().split("T")[0],
      cycleLength: 28,
      symptoms: ["cramps", "bloating", "fatigue"],
      flow: "medium",
      notes: "Started feeling cramps a day before period. Managed with ibuprofen.",
    },
    {
      userId: user.id,
      periodStart: periodStart2.toISOString().split("T")[0],
      periodEnd: periodEnd2.toISOString().split("T")[0],
      cycleLength: 28,
      symptoms: ["cramps", "headache"],
      flow: "heavy",
      notes: "Heavy first two days. Used heating pad for cramps.",
    },
  ]);
  console.log("Created cycle entries");

  console.log("Seeding complete!");
  console.log("\nDemo credentials:");
  console.log("Email: demo@femwellconnect.com");
  console.log("Password: password123");

  await pool.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
