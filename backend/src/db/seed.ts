
import bcrypt from "bcrypt";
import prisma from "../shared/prisma";
import { env } from "../config/env.config";



export const initiateSuperAdmin = async () => {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    if (!existingAdmin.isEmailVerified) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { isEmailVerified: true },
      });
    }
    console.log("Admin exists and verified.");
  } else {
    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    const user = await prisma.user.create({
      data: {
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL,
        role: "ADMIN",
        isEmailVerified: true,
      },
    });

    await prisma.userAuth.create({
      data: {
        userId: user.id,
        password: hashedPassword,
      },
    });

    console.log("Admin seeded successfully");
  }

  // Seed default customer user if not exists
  const existingUser = await prisma.user.findFirst({
    where: { email: "customer@shofy.com" },
  });
  if (!existingUser) {
    const userHashedPassword = await bcrypt.hash("12345678", 10);
    const customer = await prisma.user.create({
      data: {
        name: "Test Customer",
        email: "customer@shofy.com",
        phone: "+8801700000001",
        role: "USER",
        isEmailVerified: true,
      },
    });
    await prisma.userAuth.create({
      data: {
        userId: customer.id,
        password: userHashedPassword,
      },
    });
    console.log("Customer test user seeded successfully");
  }

  // Seed initial categories if none exist
  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    const defaultCategories = [
      { name: "Smartphones", slug: "smartphones", description: "Latest flagship and budget smartphones" },
      { name: "Laptops", slug: "laptops", description: "Powerful notebooks and ultrabooks" },
      { name: "Fragrances", slug: "fragrances", description: "Luxury perfumes and scents" },
      { name: "Skincare", slug: "skincare", description: "Premium skincare and wellness products" },
      { name: "Groceries", slug: "groceries", description: "Daily essentials and pantry goods" },
      { name: "Home Decoration", slug: "home-decoration", description: "Modern furniture and aesthetic home decor" },
    ];
    for (const cat of defaultCategories) {
      await prisma.category.create({ data: cat });
    }
    console.log("Categories seeded successfully");
  }

  // Seed initial products if none exist
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const defaultProducts = [
      {
        title: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        description: "Titanium design, A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.",
        price: 1199,
        discountPercentage: 5,
        rating: 4.9,
        stock: 25,
        brand: "Apple",
        category: "Smartphones",
        thumbnail: "https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/thumbnail.png",
        images: [
          "https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/1.png",
          "https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/2.png"
        ],
        tags: ["apple", "iphone", "flagship", "ios"],
        warrantyInformation: "1 year official Apple warranty",
        shippingInformation: "Ships in 1-2 business days",
        isFeatured: true,
      },
      {
        title: "MacBook Pro 16",
        slug: "macbook-pro-16",
        description: "M3 Max chip with up to 16-core CPU and 40-core GPU. Liquid Retina XDR display.",
        price: 2499,
        discountPercentage: 8,
        rating: 4.8,
        stock: 15,
        brand: "Apple",
        category: "Laptops",
        thumbnail: "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png",
        images: [
          "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/1.png"
        ],
        tags: ["apple", "macbook", "laptop", "m3"],
        warrantyInformation: "2 years Apple Care warranty",
        shippingInformation: "Free expedited shipping",
        isFeatured: true,
      },
      {
        title: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description: "Galaxy AI is here. 200MP camera with titanium frame and integrated S Pen.",
        price: 1299,
        discountPercentage: 10,
        rating: 4.7,
        stock: 30,
        brand: "Samsung",
        category: "Smartphones",
        thumbnail: "https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S24%20Ultra/thumbnail.png",
        images: [
          "https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S24%20Ultra/1.png"
        ],
        tags: ["samsung", "galaxy", "android", "ai"],
        warrantyInformation: "1 year manufacturer warranty",
        shippingInformation: "Ships in 24 hours",
        isFeatured: true,
      },
      {
        title: "Chanel Coco Noir Eau De Parfum",
        slug: "chanel-coco-noir",
        description: "Coco Noir by Chanel is an Amber Woody fragrance for women. Intimate, seductive and intensely brilliant.",
        price: 185,
        discountPercentage: 12,
        rating: 4.9,
        stock: 50,
        brand: "Chanel",
        category: "Fragrances",
        thumbnail: "https://cdn.dummyjson.com/products/images/fragrances/Chanel%20Coco%20Noir%20Eau%20De/thumbnail.png",
        images: [
          "https://cdn.dummyjson.com/products/images/fragrances/Chanel%20Coco%20Noir%20Eau%20De/1.png"
        ],
        tags: ["fragrance", "perfume", "luxury", "chanel"],
        warrantyInformation: "Authenticity guaranteed",
        shippingInformation: "Standard shipping 3-5 days",
        isFeatured: false,
      },
      {
        title: "Modern Minimalist Sofa",
        slug: "modern-minimalist-sofa",
        description: "Handcrafted ergonomic sofa with premium Scandinavian linen fabric and solid oak legs.",
        price: 899,
        discountPercentage: 15,
        rating: 4.6,
        stock: 12,
        brand: "Nordic Living",
        category: "Home Decoration",
        thumbnail: "https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Sofa/thumbnail.png",
        images: [
          "https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Sofa/1.png"
        ],
        tags: ["furniture", "sofa", "home", "decor"],
        warrantyInformation: "5 years structural warranty",
        shippingInformation: "White glove home delivery",
        isFeatured: true,
      }
    ];
    for (const prod of defaultProducts) {
      await prisma.product.create({ data: prod });
    }
    console.log("Initial products seeded successfully");
  }
};