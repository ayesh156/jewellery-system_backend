import { db } from '../db/index.ts';
import {
  companyInfo,
  categories,
  goldTypeConfigs,
  goldRates,
  counters,
  users,
  pawningTerms,
} from '../db/schema.ts';
import {
  seedCompanyInfo,
  seedCategories,
  seedGoldTypes,
  seedGoldRates,
  seedCounters,
  seedUsers,
  seedPawningTerms,
} from './production-data.ts';

async function runProductionSeed() {
  console.log('🌱 Onelka Jewellery නිෂ්පාදන මට්ටමේ දත්ත ඇතුළත් කිරීම අරඹයි...');

  try {
    // 1. Company Info
    await db.insert(companyInfo).values(seedCompanyInfo).onDuplicateKeyUpdate({ set: seedCompanyInfo });
    console.log('✅ Company Info සාර්ථකයි.');

    // 2. Categories
    for (const cat of seedCategories) {
      await db.insert(categories).values(cat).onDuplicateKeyUpdate({ set: cat });
    }
    console.log('✅ Categories 14 සාර්ථකයි.');

    // 3. Gold Types
    for (const gt of seedGoldTypes) {
      await db.insert(goldTypeConfigs).values(gt).onDuplicateKeyUpdate({ set: gt });
    }
    console.log('✅ Gold Type Configs සාර්ථකයි.');

    // 4. Gold Rates
    for (const rate of seedGoldRates) {
      await db.insert(goldRates).values(rate).onDuplicateKeyUpdate({ set: rate });
    }
    console.log('✅ Default Gold Rates සාර්ථකයි.');

    // 5. Counters
    for (const counter of seedCounters) {
      await db.insert(counters).values(counter).onDuplicateKeyUpdate({ set: counter });
    }
    console.log('✅ Clean Counters Initialized.');

    // 6. Admin Users
    for (const user of seedUsers) {
      await db.insert(users).values(user).onDuplicateKeyUpdate({ set: user });
    }
    console.log('✅ Admin Users සාර්ථකයි.');

    // 7. Pawning Terms
    for (const term of seedPawningTerms) {
      await db.insert(pawningTerms).values(term).onDuplicateKeyUpdate({ set: term });
    }
    console.log('✅ Legal Pawning Terms සාර්ථකයි.');

    console.log('\n🎉 අමතර dummy දත්ත රහිතව පිරිසිදු නිෂ්පාදන ඩේටාබේස් එක සූදානම්!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding අසාර්ථකයි:', err);
    process.exit(1);
  }
}

runProductionSeed();