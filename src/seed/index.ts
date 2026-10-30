import 'dotenv/config';
import { prisma, connectDB, disconnectDB } from '../lib/prisma.ts';
import {
  seedCompanyInfo,
  seedCategories,
  seedGoldTypes,
  seedGoldRates,
  seedProducts,
  seedGemstones,
  seedCustomers,
  seedInvoices,
  seedInvoiceItems,
  seedPayments,
  seedClearances,
  seedClearanceItems,
  seedClearancePayments,
  seedCounters,
  seedUsers,
  seedPawningTerms,
} from './data.ts';

function toPrismaKarat(k: string | null | undefined): any {
  if (!k) return undefined;
  if (k.startsWith('K')) return k;
  return `K${k.replace('K', '')}`;
}

async function seed() {
  console.log('🌱 Starting database seed with Prisma...\n');
  await connectDB();

  console.log('🗑️  Clearing existing data...');
  await prisma.clearance_payments.deleteMany();
  await prisma.clearance_items.deleteMany();
  await prisma.clearances.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.invoice_items.deleteMany();
  await prisma.invoices.deleteMany();
  await prisma.customers.deleteMany();
  await prisma.product_gemstones.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.gold_rates.deleteMany();
  await prisma.gold_type_configs.deleteMany();
  await prisma.company_info.deleteMany();
  await prisma.counters.deleteMany();
  await prisma.users.deleteMany();
  try {
    await prisma.pawning_terms.deleteMany();
  } catch (e) {
    console.log('   ℹ️  pawning_terms table handled');
  }

  console.log('   ✓ Tables cleared\n');

  console.log('📦 Seeding company info...');
  await prisma.company_info.create({
    data: {
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
  });
  console.log('   ✓ 1 company record\n');

  console.log('📦 Seeding categories...');
  for (const cat of seedCategories) {
    await prisma.categories.create({
      data: {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        is_active: cat.isActive ?? true,
      },
    });
  }
  console.log(`   ✓ ${seedCategories.length} categories\n`);

  console.log('📦 Seeding gold type configs...');
  for (const gt of seedGoldTypes) {
    await prisma.gold_type_configs.create({
      data: {
        id: gt.id,
        gold_karat: toPrismaKarat(gt.karat),
        purity_percentage: gt.purityPercentage,
        description: gt.description,
        is_active: gt.isActive,
        default_wastage_percentage: gt.defaultWastagePercentage,
        color: gt.color,
      },
    });
  }
  console.log(`   ✓ ${seedGoldTypes.length} gold types\n`);

  console.log('📦 Seeding gold rates...');
  for (const rate of seedGoldRates) {
    await prisma.gold_rates.create({
      data: {
        id: rate.id,
        gold_karat: toPrismaKarat(rate.karat),
        buying_rate: rate.buyingRate,
        selling_rate: rate.sellingRate,
        date: rate.date,
        updated_by: rate.updatedBy,
      },
    });
  }
  console.log(`   ✓ ${seedGoldRates.length} gold rates\n`);

  console.log('📦 Seeding products...');
  for (const p of seedProducts) {
    await prisma.product.create({
      data: {
        id: p.id,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        description: p.description,
        categoryId: p.categoryId,
        metalType: p.metalType,
        gold_karat: toPrismaKarat(p.goldKarat),
        metalWeight: p.metalWeight,
        metalPurity: p.metalPurity,
        hasGemstones: p.hasGemstones ?? false,
        totalGemstoneWeight: p.totalGemstoneWeight,
        metalRate: p.metalRate,
        makingCharges: p.makingCharges ?? 0,
        gemstoneValue: p.gemstoneValue,
        otherCharges: p.otherCharges,
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice,
        stockQuantity: p.stockQuantity ?? 0,
        reorderLevel: p.reorderLevel ?? 0,
        images: p.images,
        supplierId: p.supplierId,
        supplierName: p.supplierName,
        isActive: p.isActive ?? true,
      },
    });
  }
  console.log(`   ✓ ${seedProducts.length} products\n`);

  console.log('💎 Seeding gemstones...');
  for (const g of seedGemstones) {
    await prisma.product_gemstones.create({
      data: {
        id: g.id,
        product_id: g.productId,
        name: g.name || g.gemstoneType || 'Gemstone',
        gemstone_type: (g.gemstoneType?.toLowerCase() || 'other') as any,
        carat: g.caratWeight,
        clarity: g.clarity,
        cut: g.cut,
        color: g.color,
      },
    });
  }
  console.log(`   ✓ ${seedGemstones.length} gemstones\n`);

  console.log('👥 Seeding customers...');
  for (const c of seedCustomers) {
    await prisma.customers.create({
      data: {
        id: c.id,
        name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
        phone: c.phone || '0000000000',
        nic: c.nic || c.nicNumber,
        address: c.address,
        city: c.city,
        registration_date: c.registrationDate || new Date().toISOString().split('T')[0],
        total_purchased: c.totalPurchased || c.totalPurchases || 0,
        customer_type: 'retail',
        is_active: c.isActive ?? true,
      },
    });
  }
  console.log(`   ✓ ${seedCustomers.length} customers\n`);

  console.log('🧾 Seeding invoices...');
  for (const inv of seedInvoices) {
    await prisma.invoices.create({
      data: {
        id: inv.id,
        invoice_number: inv.invoiceNumber || inv.invoice_number,
        customer_id: inv.customerId || inv.customer_id,
        customer_name: inv.customerName || inv.customer_name,
        customer_phone: inv.customerPhone || inv.customer_phone,
        customer_address: inv.customerAddress || inv.customer_address,
        subtotal: inv.subtotal,
        discount: inv.discount || inv.discountAmount || 0,
        discount_type: inv.discountType || inv.discount_type,
        tax: inv.tax || inv.taxAmount || 0,
        tax_rate: inv.taxRate || inv.tax_rate,
        total: inv.total || inv.totalAmount,
        amount_paid: inv.amountPaid || inv.paidAmount || 0,
        balance_due: inv.balanceDue || inv.balance_due || 0,
        payment_method: (inv.paymentMethod?.toLowerCase() || 'cash') as any,
        issue_date: inv.issueDate || inv.date || new Date().toISOString().split('T')[0],
        invoice_status: 'paid',
        notes: inv.notes,
        created_by: inv.cashierName || inv.createdBy || 'Admin',
      },
    });
  }
  console.log(`   ✓ ${seedInvoices.length} invoices\n`);

  console.log('📋 Seeding invoice items...');
  for (const item of seedInvoiceItems) {
    await prisma.invoice_items.create({
      data: {
        id: item.id,
        invoice_id: item.invoiceId,
        product_id: item.productId,
        sku: item.sku,
        product_name: item.productName,
        description: item.description,
        metal_type: item.metalType,
        gold_karat: toPrismaKarat(item.goldKarat),
        metal_weight: item.metalWeight,
        quantity: item.quantity ?? 1,
        unit_price: item.unitPrice,
        original_price: item.originalPrice,
        discount: item.discount,
        discount_type: item.discountType,
        total: item.total,
      },
    });
  }
  console.log(`   ✓ ${seedInvoiceItems.length} invoice items\n`);

  console.log('💳 Seeding payments...');
  for (const pay of seedPayments) {
    await prisma.payments.create({
      data: {
        id: pay.id,
        invoice_id: pay.invoiceId || pay.invoice_id,
        amount: pay.amount,
        payment_method: (pay.paymentMethod?.toLowerCase() || 'cash') as any,
        date: pay.date || new Date().toISOString().split('T')[0],
        reference: pay.referenceNumber || pay.receiptNumber || pay.reference,
        notes: pay.notes,
      },
    });
  }
  console.log(`   ✓ ${seedPayments.length} payments\n`);

  console.log('🏷️ Seeding clearances...');
  for (const clr of seedClearances) {
    await prisma.clearances.create({
      data: {
        id: clr.id,
        clearance_number: clr.clearanceNumber || clr.clearance_number,
        customer_id: clr.customerId || clr.customer_id,
        customer_name: clr.customerName || clr.customer_name,
        customer_phone: clr.customerPhone || clr.customer_phone,
        customer_address: clr.customerAddress || clr.customer_address,
        subtotal: clr.subtotal,
        discount: clr.discount || clr.discountAmount || 0,
        discount_type: clr.discountType || clr.discount_type,
        tax: clr.tax || clr.taxAmount || 0,
        tax_rate: clr.taxRate || clr.tax_rate,
        total: clr.total || clr.totalAmount,
        amount_paid: clr.amountPaid || clr.paidAmount || 0,
        balance_due: clr.balanceDue || clr.balance_due || 0,
        payment_method: (clr.paymentMethod?.toLowerCase() || 'cash') as any,
        issue_date: clr.issueDate || clr.date || new Date().toISOString().split('T')[0],
        invoice_status: 'paid',
        notes: clr.notes,
        created_by: clr.cashierName || clr.createdBy || 'Admin',
      },
    });
  }
  console.log(`   ✓ ${seedClearances.length} clearances\n`);

  console.log('📋 Seeding clearance items...');
  for (const item of seedClearanceItems) {
    await prisma.clearance_items.create({
      data: {
        id: item.id,
        clearance_id: item.clearanceId,
        product_id: item.productId,
        sku: item.sku,
        product_name: item.productName,
        description: item.description,
        metal_type: item.metalType,
        gold_karat: toPrismaKarat(item.goldKarat),
        metal_weight: item.metalWeight,
        quantity: item.quantity ?? 1,
        unit_price: item.unitPrice,
        original_price: item.originalPrice,
        discount: item.discount,
        discount_type: item.discountType,
        total: item.total,
        assessed_value: item.assessedValue,
      },
    });
  }
  console.log(`   ✓ ${seedClearanceItems.length} clearance items\n`);

  console.log('💳 Seeding clearance payments...');
  for (const pay of seedClearancePayments) {
    await prisma.clearance_payments.create({
      data: {
        id: pay.id,
        clearance_id: pay.clearanceId || pay.clearance_id,
        amount: pay.amount,
        payment_method: (pay.paymentMethod?.toLowerCase() || 'cash') as any,
        date: pay.date || new Date().toISOString().split('T')[0],
        reference: pay.referenceNumber || pay.receiptNumber || pay.reference,
        notes: pay.notes,
      },
    });
  }
  console.log(`   ✓ ${seedClearancePayments.length} clearance payments\n`);

  console.log('🔢 Seeding counters...');
  for (const cnt of seedCounters) {
    await prisma.counters.create({
      data: {
        id: cnt.id,
        entity_type: cnt.entityType,
        shop_code: cnt.shopCode,
        prefix: cnt.prefix,
        last_number: cnt.lastNumber,
        padding_length: cnt.paddingLength,
      },
    });
  }
  console.log(`   ✓ ${seedCounters.length} counters\n`);

  console.log('👤 Seeding users...');
  for (const u of seedUsers) {
    await prisma.users.create({
      data: {
        id: u.id,
        username: u.username,
        email: u.email,
        password_hash: u.passwordHash,
        full_name: u.fullName,
        phone: u.phone,
        user_role: u.role as any,
        shop_code: u.shopCode,
        is_active: u.isActive,
      },
    });
  }
  console.log(`   ✓ ${seedUsers.length} users\n`);

  console.log('📜 Seeding pawning terms...');
  for (const pt of seedPawningTerms) {
    await prisma.pawning_terms.create({
      data: {
        id: pt.id,
        group_id: pt.groupId,
        sort_order: pt.sortOrder,
        pawning_terms_language: pt.language as any,
        term_text: pt.termText,
      },
    });
  }
  console.log(`   ✓ ${seedPawningTerms.length} pawning terms\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Seed complete with Prisma!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  await disconnectDB();
}

seed()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('❌ Seed failed:', err);
    await disconnectDB();
    process.exit(1);
  });
