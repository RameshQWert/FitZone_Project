require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const User = require('./models/User');
const Trainer = require('./models/Trainer');
const Subscription = require('./models/Subscription');
const Class = require('./models/Class');
const Equipment = require('./models/Equipment');

// Import seed data from original seed file
const {
  trainersData,
  subscriptionsData,
  classesData,
  equipmentData,
  adminUserData,
  memberUserData
} = require('./seed');

// Safe seed function that preserves existing users
const safeSeedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('🔄 Checking existing users...');
    const existingUsers = await User.find({});
    console.log(`📊 Found ${existingUsers.length} existing users in database`);

    if (existingUsers.length > 0) {
      console.log('✅ Existing users will be preserved!');
      existingUsers.forEach(user => {
        console.log(`   - ${user.fullName} (${user.email})`);
      });
    }

    // Clear only non-user data
    await Trainer.deleteMany({});
    await Subscription.deleteMany({});
    await Class.deleteMany({});
    await Equipment.deleteMany({});

    console.log('🗑️  Cleared trainers, subscriptions, classes, and equipment');

    // Check if default users exist, create if not
    const adminExists = await User.findOne({ email: adminUserData.email });
    const memberExists = await User.findOne({ email: memberUserData.email });

    if (!adminExists) {
      await User.create(adminUserData);
      console.log('✅ Created default admin user: admin@fitzone.com');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    if (!memberExists) {
      await User.create(memberUserData);
      console.log('✅ Created default member user: member@fitzone.com');
    } else {
      console.log('ℹ️  Member user already exists');
    }

    // Seed the other data
    console.log('🌱 Seeding other data...');

    if (trainersData.length > 0) {
      const trainers = await Trainer.insertMany(trainersData);
      console.log(`✅ Inserted ${trainers.length} trainers`);
    }

    if (subscriptionsData.length > 0) {
      const subscriptions = await Subscription.insertMany(subscriptionsData);
      console.log(`✅ Inserted ${subscriptions.length} subscription plans`);
    }

    if (classesData.length > 0) {
      const classes = await Class.insertMany(classesData);
      console.log(`✅ Inserted ${classes.length} programs/classes`);
    }

    if (equipmentData.length > 0) {
      const equipment = await Equipment.insertMany(equipmentData);
      console.log(`✅ Inserted ${equipment.length} equipment items`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('-----------------------------------');
    console.log('✅ All existing users preserved');
    console.log('✅ Default admin/member users available');
    console.log('✅ All classes, trainers, and equipment seeded');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error in safe seeding:', error);
  }
};

safeSeedDatabase();