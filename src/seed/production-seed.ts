import 'dotenv/config';
import { prisma, connectDB, disconnectDB } from '../lib/prisma.ts';
import {
  seedCompanyInfo,
  seedCategories,
  seedGoldTypes,
  seedGoldRates,
  seedCounters,
  seedUsers,
  seedPawningTerms,
} from './production-data.ts';

function toPrismaKarat(k: string | null | undefined): any {
  if (!k) return undefined;
  if (k.startsWith('K')) return k;
  return `K${k.replace('K', '')}`;
}

async function runProductionSeed() {
  console.log('🌱 Onelka Jewellery නිෂ්පාදන මට්ටමේ දත්ත ඇතුළත් කිරීම අරඹයි...');

  await connectDB();

  try {
    // 1. Company Info
    await prisma.company_info.upsert({
      where: { id: seedCompanyInfo.id },
      create: {
        id: seedCompanyInfo.id,
        name: seedCompanyInfo.name,
        tagline: seedCompanyInfo.tagline,
        address: seedCompanyInfo.address,
        city: seedCompanyInfo.city,
        country: seedCompanyInfo.country,
        phone: seedCompanyInfo.phone,
        email: seedCompanyInfo.email,
        default_tax_rate: seedCompanyInfo.defaultTaxRate,
        invoice_terms: seedCompanyInfo.invoiceTerms,
        clearance_terms: seedCompanyInfo.clearanceTerms,
        pawn_terms: seedCompanyInfo.pawnTerms,
        pawn_interest_rate: seedCompanyInfo.pawnInterestRate,
        pawn_interest_enabled: seedCompanyInfo.pawnInterestEnabled,
      },
      update: {
        name: seedCompanyInfo.name,
        tagline: seedCompanyInfo.tagline,
        address: seedCompanyInfo.address,
        city: seedCompanyInfo.city,
        country: seedCompanyInfo.country,
        phone: seedCompanyInfo.phone,
        email: seedCompanyInfo.email,
        default_tax_rate: seedCompanyInfo.defaultTaxRate,
        invoice_terms: seedCompanyInfo.invoiceTerms,
        clearance_terms: seedCompanyInfo.clearanceTerms,
        pawn_terms: seedCompanyInfo.pawnTerms,
        pawn_interest_rate: seedCompanyInfo.pawnInterestRate,
        pawn_interest_enabled: seedCompanyInfo.pawnInterestEnabled,
      },
    });
    console.log('✅ Company Info සාර්ථකයි.');

    // 2. Categories
    for (const cat of seedCategories) {
      await prisma.categories.upsert({
        where: { id: cat.id },
        create: {
          id: cat.id,
          name: cat.name,
          description: cat.description,
          is_active: cat.isActive ?? true,
        },
        update: {
          name: cat.name,
          description: cat.description,
          is_active: cat.isActive ?? true,
        },
      });
    }
    console.log('✅ Categories 14 සාර්ථකයි.');

    // 3. Gold Types
    for (const gt of seedGoldTypes) {
      await prisma.gold_type_configs.upsert({
        where: { id: gt.id },
        create: {
          id: gt.id,
          gold_karat: toPrismaKarat(gt.karat),
          purity_percentage: gt.purityPercentage,
          description: gt.description,
          is_active: gt.isActive,
          default_wastage_percentage: gt.defaultWastagePercentage,
          color: gt.color,
        },
        update: {
          gold_karat: toPrismaKarat(gt.karat),
          purity_percentage: gt.purityPercentage,
          description: gt.description,
          is_active: gt.isActive,
          default_wastage_percentage: gt.defaultWastagePercentage,
          color: gt.color,
        },
      });
    }
    console.log('✅ Gold Type Configs සාර්ථකයි.');

    // 4. Gold Rates
    for (const rate of seedGoldRates) {
      await prisma.gold_rates.upsert({
        where: { id: rate.id },
        create: {
          id: rate.id,
          gold_karat: toPrismaKarat(rate.karat),
          buying_rate: rate.buyingRate,
          selling_rate: rate.sellingRate,
          date: rate.date,
          updated_by: rate.updatedBy,
        },
        update: {
          gold_karat: toPrismaKarat(rate.karat),
          buying_rate: rate.buyingRate,
          selling_rate: rate.sellingRate,
          date: rate.date,
          updated_by: rate.updatedBy,
        },
      });
    }
    console.log('✅ Default Gold Rates සාර්ථකයි.');

    // 5. Counters
    for (const counter of seedCounters) {
      await prisma.counters.upsert({
        where: { id: counter.id },
        create: {
          id: counter.id,
          entity_type: counter.entityType,
          shop_code: counter.shopCode,
          prefix: counter.prefix,
          last_number: counter.lastNumber,
          padding_length: counter.paddingLength,
        },
        update: {
          entity_type: counter.entityType,
          shop_code: counter.shopCode,
          prefix: counter.prefix,
          last_number: counter.lastNumber,
          padding_length: counter.paddingLength,
        },
      });
    }
    console.log('✅ Clean Counters Initialized.');

    // 6. Admin Users
    for (const user of seedUsers) {
      await prisma.users.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          username: user.username,
          email: user.email,
          password_hash: user.passwordHash,
          full_name: user.fullName,
          phone: user.phone,
          user_role: user.role as any,
          shop_code: user.shopCode,
          is_active: user.isActive,
        },
        update: {
          username: user.username,
          email: user.email,
          password_hash: user.passwordHash,
          full_name: user.fullName,
          phone: user.phone,
          user_role: user.role as any,
          shop_code: user.shopCode,
          is_active: user.isActive,
        },
      });
    }
    console.log('✅ Admin Users සාර්ථකයි.');

    // 7. Pawning Terms
    for (const term of seedPawningTerms) {
      await prisma.pawning_terms.upsert({
        where: { id: term.id },
        create: {
          id: term.id,
          group_id: term.groupId,
          sort_order: term.sortOrder,
          pawning_terms_language: term.language as any,
          term_text: term.termText,
        },
        update: {
          group_id: term.groupId,
          sort_order: term.sortOrder,
          pawning_terms_language: term.language as any,
          term_text: term.termText,
        },
      });
    }
    console.log('✅ Legal Pawning Terms සාර්ථකයි.');

    console.log('\n🎉 අමතර dummy දත්ත රහිතව පිරිසිදු නිෂ්පාදන ඩේටාබේස් එක සූදානම්!');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding අසාර්ථකයි:', err);
    await disconnectDB();
    process.exit(1);
  }
}

runProductionSeed();
