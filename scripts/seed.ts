#!/usr/bin/env tsx

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import connectDB from '../lib/db/mongoose';
import Country from '../lib/models/Country';
import Role from '../lib/models/Role';
import User from '../lib/models/User';
import Restaurant from '../lib/models/Restaurant';
import MenuItem from '../lib/models/MenuItem';
import PaymentMethod from '../lib/models/PaymentMethod';

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    console.log('DEBUG: MONGODB_URI=', process.env.MONGODB_URI ? '[present]' : '[missing]');
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Country.deleteMany({});
    await Role.deleteMany({});
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await PaymentMethod.deleteMany({});

    // Create Countries
    console.log('🌍 Creating countries...');
    const india = await Country.create({
      name: 'India',
      code: 'IN',
      isActive: true,
    });

    const america = await Country.create({
      name: 'America',
      code: 'US',
      isActive: true,
    });

    console.log('✅ Countries created');

    // Create Roles
    console.log('👥 Creating roles...');
    const adminRole = await Role.create({
      name: 'Admin',
      permissions: {
        viewRestaurants: true,
        createOrder: true,
        checkout: true,
        cancelOrder: true,
        updatePaymentMethod: true,
      },
      description: 'Full system access',
      isActive: true,
    });

    const managerRole = await Role.create({
      name: 'Manager',
      permissions: {
        viewRestaurants: true,
        createOrder: true,
        checkout: true,
        cancelOrder: true,
        updatePaymentMethod: false,
      },
      description: 'Manager access with country restrictions',
      isActive: true,
    });

    const memberRole = await Role.create({
      name: 'Member',
      permissions: {
        viewRestaurants: true,
        createOrder: true,
        checkout: false,
        cancelOrder: false,
        updatePaymentMethod: false,
      },
      description: 'Basic member access',
      isActive: true,
    });

    console.log('✅ Roles created');

    // Create Users
    console.log('👤 Creating users...');
    
    // Admin
    const nickFury = await User.create({
      name: 'Nick Fury',
      email: 'nick.fury@shield.com',
      password: 'password123',
      role: adminRole._id,
      country: america._id,
      isActive: true,
    });

    // Managers
    const captainMarvel = await User.create({
      name: 'Captain Marvel',
      email: 'carol.danvers@avengers.com',
      password: 'password123',
      role: managerRole._id,
      country: india._id,
      isActive: true,
    });

    const captainAmerica = await User.create({
      name: 'Captain America',
      email: 'steve.rogers@avengers.com',
      password: 'password123',
      role: managerRole._id,
      country: america._id,
      isActive: true,
    });

    // Members
    const thanos = await User.create({
      name: 'Thanos',
      email: 'thanos@titan.com',
      password: 'password123',
      role: memberRole._id,
      country: india._id,
      isActive: true,
    });

    const thor = await User.create({
      name: 'Thor',
      email: 'thor@asgard.com',
      password: 'password123',
      role: memberRole._id,
      country: india._id,
      isActive: true,
    });

    const travis = await User.create({
      name: 'Travis',
      email: 'travis@example.com',
      password: 'password123',
      role: memberRole._id,
      country: america._id,
      isActive: true,
    });

    console.log('✅ Users created');

    // Create Restaurants - India
    console.log('🍽️  Creating restaurants...');
    const indianRestaurants = [
      {
        name: 'Spice Garden',
        description: 'Authentic Indian cuisine with traditional flavors',
        country: india._id,
        address: '123 MG Road, Mumbai, Maharashtra',
        phone: '+91-22-12345678',
        email: 'contact@spicegarden.in',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        cuisine: ['Indian', 'Vegetarian', 'North Indian'],
        rating: 4.5,
        isActive: true,
      },
      {
        name: 'Taj Mahal Restaurant',
        description: 'Royal dining experience with Mughlai specialties',
        country: india._id,
        address: '456 Brigade Road, Bangalore, Karnataka',
        phone: '+91-80-87654321',
        email: 'info@tajmahal.in',
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
        cuisine: ['Indian', 'Mughlai', 'Biryani'],
        rating: 4.7,
        isActive: true,
      },
      {
        name: 'Curry House',
        description: 'South Indian delicacies and coastal cuisine',
        country: india._id,
        address: '789 Anna Salai, Chennai, Tamil Nadu',
        phone: '+91-44-98765432',
        email: 'hello@curryhouse.in',
        image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80',
        cuisine: ['South Indian', 'Seafood', 'Coastal'],
        rating: 4.3,
        isActive: true,
      },
    ];

    // Create Restaurants - America
    const americanRestaurants = [
      {
        name: 'The American Grill',
        description: 'Classic American comfort food and BBQ',
        country: america._id,
        address: '123 Broadway, New York, NY 10001',
        phone: '+1-212-555-0123',
        email: 'info@americangrill.com',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
        cuisine: ['American', 'BBQ', 'Steakhouse'],
        rating: 4.6,
        isActive: true,
      },
      {
        name: 'Liberty Diner',
        description: 'All-day breakfast and American classics',
        country: america._id,
        address: '456 Market Street, San Francisco, CA 94102',
        phone: '+1-415-555-0456',
        email: 'contact@libertydiner.com',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
        cuisine: ['American', 'Diner', 'Breakfast'],
        rating: 4.4,
        isActive: true,
      },
      {
        name: 'Burger Paradise',
        description: 'Gourmet burgers and craft beer',
        country: america._id,
        address: '789 Michigan Avenue, Chicago, IL 60611',
        phone: '+1-312-555-0789',
        email: 'hello@burgerparadise.com',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
        cuisine: ['American', 'Burgers', 'Fast Food'],
        rating: 4.2,
        isActive: true,
      },
    ];

    const allRestaurants = [...indianRestaurants, ...americanRestaurants];
    const createdRestaurants = await Restaurant.insertMany(allRestaurants);

    console.log('✅ Restaurants created');

    // Create Menu Items
    console.log('🍔 Creating menu items...');
    const menuItems = [];

    // Menu for Indian Restaurants
    const indianMenuItems = [
      // Spice Garden
      { name: 'Butter Chicken', price: 350, category: 'Main Course', isVegetarian: false },
      { name: 'Paneer Tikka Masala', price: 320, category: 'Main Course', isVegetarian: true },
      { name: 'Garlic Naan', price: 50, category: 'Side Dish', isVegetarian: true },
      { name: 'Gulab Jamun', price: 80, category: 'Dessert', isVegetarian: true },
      { name: 'Mango Lassi', price: 100, category: 'Beverage', isVegetarian: true },
      // Taj Mahal Restaurant
      { name: 'Hyderabadi Biryani', price: 400, category: 'Main Course', isVegetarian: false },
      { name: 'Mutton Rogan Josh', price: 450, category: 'Main Course', isVegetarian: false },
      { name: 'Dal Makhani', price: 280, category: 'Main Course', isVegetarian: true },
      { name: 'Tandoori Roti', price: 40, category: 'Side Dish', isVegetarian: true },
      { name: 'Kulfi', price: 90, category: 'Dessert', isVegetarian: true },
      // Curry House
      { name: 'Masala Dosa', price: 180, category: 'Main Course', isVegetarian: true },
      { name: 'Fish Curry', price: 380, category: 'Main Course', isVegetarian: false },
      { name: 'Idli Sambar', price: 120, category: 'Appetizer', isVegetarian: true },
      { name: 'Filter Coffee', price: 60, category: 'Beverage', isVegetarian: true },
    ];

    // Menu for American Restaurants
    const americanMenuItems = [
      // The American Grill
      { name: 'Ribeye Steak', price: 35, category: 'Main Course', isVegetarian: false },
      { name: 'BBQ Ribs', price: 28, category: 'Main Course', isVegetarian: false },
      { name: 'Caesar Salad', price: 12, category: 'Appetizer', isVegetarian: true },
      { name: 'Apple Pie', price: 8, category: 'Dessert', isVegetarian: true },
      { name: 'Coca Cola', price: 3, category: 'Beverage', isVegetarian: true },
      // Liberty Diner
      { name: 'Pancake Stack', price: 14, category: 'Main Course', isVegetarian: true },
      { name: 'Eggs Benedict', price: 16, category: 'Main Course', isVegetarian: false },
      { name: 'Bacon & Eggs', price: 12, category: 'Main Course', isVegetarian: false },
      { name: 'Hash Browns', price: 6, category: 'Side Dish', isVegetarian: true },
      { name: 'Orange Juice', price: 5, category: 'Beverage', isVegetarian: true },
      // Burger Paradise
      { name: 'Classic Cheeseburger', price: 15, category: 'Main Course', isVegetarian: false },
      { name: 'Veggie Burger', price: 13, category: 'Main Course', isVegetarian: true },
      { name: 'French Fries', price: 5, category: 'Side Dish', isVegetarian: true },
      { name: 'Milkshake', price: 7, category: 'Beverage', isVegetarian: true },
    ];

    // Associate menu items with restaurants
    for (let i = 0; i < 3; i++) {
      const restaurant = createdRestaurants[i];
      const items = indianMenuItems.slice(i * 5, (i + 1) * 5);
      
      for (const item of items) {
        menuItems.push({
          restaurant: restaurant._id,
          ...item,
          description: `Delicious ${item.name.toLowerCase()}`,
          isAvailable: true,
          preparationTime: 20,
        });
      }
    }

    for (let i = 0; i < 3; i++) {
      const restaurant = createdRestaurants[i + 3];
      const items = americanMenuItems.slice(i * 5, (i + 1) * 5);
      
      for (const item of items) {
        menuItems.push({
          restaurant: restaurant._id,
          ...item,
          description: `Delicious ${item.name.toLowerCase()}`,
          isAvailable: true,
          preparationTime: 15,
        });
      }
    }

    await MenuItem.insertMany(menuItems);
    console.log('✅ Menu items created');

    // Create Payment Methods for users
    console.log('💳 Creating payment methods...');
    const paymentMethods = [
      // Nick Fury
      {
        user: nickFury._id,
        type: 'Credit Card',
        cardNumber: '****1234',
        cardHolderName: 'Nick Fury',
        expiryMonth: 12,
        expiryYear: 2027,
        isDefault: true,
        isActive: true,
      },
      // Captain Marvel
      {
        user: captainMarvel._id,
        type: 'UPI',
        upiId: 'carol@paytm',
        isDefault: true,
        isActive: true,
      },
      // Captain America
      {
        user: captainAmerica._id,
        type: 'Debit Card',
        cardNumber: '****5678',
        cardHolderName: 'Steve Rogers',
        expiryMonth: 6,
        expiryYear: 2026,
        isDefault: true,
        isActive: true,
      },
      // Thanos
      {
        user: thanos._id,
        type: 'Cash on Delivery',
        isDefault: true,
        isActive: true,
      },
      // Thor
      {
        user: thor._id,
        type: 'UPI',
        upiId: 'thor@asgard',
        isDefault: true,
        isActive: true,
      },
      // Travis
      {
        user: travis._id,
        type: 'Credit Card',
        cardNumber: '****9012',
        cardHolderName: 'Travis',
        expiryMonth: 3,
        expiryYear: 2028,
        isDefault: true,
        isActive: true,
      },
    ];

    await PaymentMethod.insertMany(paymentMethods);
    console.log('✅ Payment methods created');

    console.log('\n✨ Seed completed successfully!\n');
    console.log('📝 User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: nick.fury@shield.com');
    console.log('  Password: password123');
    console.log('  Country: America\n');
    console.log('Managers:');
    console.log('  Email: carol.danvers@avengers.com (India)');
    console.log('  Email: steve.rogers@avengers.com (America)');
    console.log('  Password: password123\n');
    console.log('Members:');
    console.log('  Email: thanos@titan.com (India)');
    console.log('  Email: thor@asgard.com (India)');
    console.log('  Email: travis@example.com (America)');
    console.log('  Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
