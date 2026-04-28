import type {
  categories,
  products,
  productGemstones,
  goldTypeConfigs,
  goldRates,
  companyInfo,
  customers,
  invoices,
  invoiceItems,
  payments,
  counters,
  clearances,
  clearanceItems,
  clearancePayments,
  users,
} from '../db/schema.js';

type CategoryInsert = typeof categories.$inferInsert;
type ProductInsert = typeof products.$inferInsert;
type GemstoneInsert = typeof productGemstones.$inferInsert;
type GoldTypeInsert = typeof goldTypeConfigs.$inferInsert;
type GoldRateInsert = typeof goldRates.$inferInsert;
type CompanyInfoInsert = typeof companyInfo.$inferInsert;
type CustomerInsert = typeof customers.$inferInsert;
type InvoiceInsert = typeof invoices.$inferInsert;
type InvoiceItemInsert = typeof invoiceItems.$inferInsert;
type PaymentInsert = typeof payments.$inferInsert;
type CounterInsert = typeof counters.$inferInsert;
type ClearanceInsert = typeof clearances.$inferInsert;
type ClearanceItemInsert = typeof clearanceItems.$inferInsert;
type ClearancePaymentInsert = typeof clearancePayments.$inferInsert;
type UserInsert = typeof users.$inferInsert;

// ==========================================
// Company Info
// ==========================================

export const seedCompanyInfo: CompanyInfoInsert = {
  id: 'default',
  name: 'Onelka Jewellery',
  tagline: 'Exquisite Craftsmanship Since 1985',
  address: 'Makandura, Matara.',
  city: 'Matara',
  country: 'Sri Lanka',
  phone: '0770400789',
  email: 'onelkajewellery95@gmail.com',
  defaultTaxRate: '0',
  invoiceTerms: [
    'All jewellery items are hallmarked and certified for purity.',
    'Exchange within 7 days with original receipt. No refunds on custom-made items.',
    'Warranty does not cover damage caused by misuse, negligence or normal wear.',
  ].join('\n'),
  clearanceTerms: [
    'All clearance sale items are sold as-is. No warranty or guarantee.',
    'All clearance sales are final. No returns, exchanges or refunds.',
    'All jewellery items are hallmarked and certified for purity.',
  ].join('\n'),
  pawnTerms: [
    'Interest is calculated at the agreed monthly rate from date of pawning. / උකස් දිනයේ සිට එකඟ වූ මාසික අනුපාතයෙන් පොලිය ගණනය කෙරේ.',
    'Items must be redeemed within 6 months. Extensions available on request. / භාණ්ඩ මාස 6 ක් ඇතුළත ආපසු ගත යුතුය. ඉල්ලීම මත දීර්ඝ කළ හැකිය.',
    'The pawn ticket must be surrendered to redeem the pawned articles. / උකස් භාණ්ඩ ආපසු ගැනීමේදී මෙම ටිකට් පත ඉදිරිපත් කළ යුතුය.',
    'Customer NIC is mandatory for all pawn transactions. / සියලු උකස් ගනුදෙනු සඳහා ගනුදෙනුකරුගේ ජා.හැ.අංකය අනිවාර්ය වේ.',
    'Unclaimed items after the grace period may be forfeited without further notice. / සහන කාලය ඉකුත් වූ පසු භාණ්ඩ රඳවා ගැනීමට ආයතනයට අයිතිය ඇත.',
    'In the event of loss of an article, only the gold value at the time of loss will be reimbursed. / භාණ්ඩයක් නැතිවූ විට, නැතිවූ අවස්ථාවේ රන් වටිනාකම පමණක් ගෙවනු ලැබේ.',
  ].join('\n'),
  pawnInterestRate: '5.00',
  pawnInterestEnabled: true,
};

// ==========================================
// Categories — 14 jewellery categories
// ==========================================

export const seedCategories: CategoryInsert[] = [
  { id: 'm-cat-00001', name: 'Necklaces',           description: 'Gold, silver and platinum necklaces',   isActive: true },
  { id: 'm-cat-00002', name: 'Earrings',            description: 'Studs, drops, hoops and danglers',      isActive: true },
  { id: 'm-cat-00003', name: 'Rings',               description: 'Engagement, wedding and fashion rings', isActive: true },
  { id: 'm-cat-00004', name: 'Bangles & Bracelets', description: 'Traditional and modern bangles',        isActive: true },
  { id: 'm-cat-00005', name: 'Pendants',            description: 'Gold and gemstone pendants',            isActive: true },
  { id: 'm-cat-00006', name: 'Chains',              description: 'Gold and silver chains',                isActive: true },
  { id: 'm-cat-00007', name: 'Anklets',             description: 'Traditional and designer anklets',      isActive: true },
  { id: 'm-cat-00008', name: 'Nose Pins',           description: 'Diamond and gold nose pins',            isActive: true },
  { id: 'm-cat-00009', name: 'Mangalsutra',         description: 'Traditional wedding jewellery',         isActive: true },
  { id: 'm-cat-00010', name: 'Sets',                description: 'Complete jewellery sets',               isActive: true },
  { id: 'm-cat-00011', name: "Men's Jewellery",     description: 'Rings, chains and bracelets for men',   isActive: true },
  { id: 'm-cat-00012', name: 'Silver Items',        description: 'Silver jewellery and articles',         isActive: true },
  { id: 'm-cat-00013', name: 'Coins & Bars',        description: 'Gold and silver coins and bars',        isActive: true },
  { id: 'm-cat-00014', name: 'Watches',             description: 'Luxury watches',                       isActive: true },
];

// ==========================================
// Gold Type Configurations
// ==========================================

export const seedGoldTypes: GoldTypeInsert[] = [
  { id: 'gold-24k', karat: '24K', purityPercentage: '99.90', description: 'Pure gold - too soft for jewellery, used for coins & bars', isActive: true,  defaultWastagePercentage: '5.00',  color: '#FFD700' },
  { id: 'gold-22k', karat: '22K', purityPercentage: '91.67', description: 'Most popular for traditional Sri Lankan jewellery',         isActive: true,  defaultWastagePercentage: '8.00',  color: '#FFC125' },
  { id: 'gold-21k', karat: '21K', purityPercentage: '87.50', description: 'Popular in Middle Eastern jewellery',                       isActive: true,  defaultWastagePercentage: '8.00',  color: '#FFB347' },
  { id: 'gold-18k', karat: '18K', purityPercentage: '75.00', description: 'Ideal for gemstone settings & designer pieces',             isActive: true,  defaultWastagePercentage: '10.00', color: '#DAA520' },
  { id: 'gold-14k', karat: '14K', purityPercentage: '58.30', description: 'Durable for everyday wear',                                 isActive: true,  defaultWastagePercentage: '10.00', color: '#CD853F' },
  { id: 'gold-10k', karat: '10K', purityPercentage: '41.70', description: 'Most durable, affordable gold option',                      isActive: false, defaultWastagePercentage: '12.00', color: '#B8860B' },
  { id: 'gold-9k',  karat: '9K',  purityPercentage: '37.50', description: 'Entry-level gold jewellery',                                isActive: false, defaultWastagePercentage: '12.00', color: '#A0522D' },
];

// ==========================================
// Gold Rates (per gram, LKR)
// ==========================================

export const seedGoldRates: GoldRateInsert[] = [
  { id: 'rate-24k', karat: '24K', buyingRate: '28500.00', sellingRate: '29000.00', date: '2024-12-31', updatedBy: 'system' },
  { id: 'rate-22k', karat: '22K', buyingRate: '26100.00', sellingRate: '26600.00', date: '2024-12-31', updatedBy: 'system' },
  { id: 'rate-21k', karat: '21K', buyingRate: '24900.00', sellingRate: '25400.00', date: '2024-12-31', updatedBy: 'system' },
  { id: 'rate-18k', karat: '18K', buyingRate: '21400.00', sellingRate: '21900.00', date: '2024-12-31', updatedBy: 'system' },
  { id: 'rate-14k', karat: '14K', buyingRate: '16600.00', sellingRate: '17100.00', date: '2024-12-31', updatedBy: 'system' },
  { id: 'rate-10k', karat: '10K', buyingRate: '11900.00', sellingRate: '12400.00', date: '2024-12-31', updatedBy: 'system' },
  { id: 'rate-9k',  karat: '9K',  buyingRate: '10700.00', sellingRate: '11200.00', date: '2024-12-31', updatedBy: 'system' },
];

// ==========================================
// Products — 10 jewellery items
// ==========================================

export const seedProducts: ProductInsert[] = [
  {
    id: 'm-prod-00001', sku: 'M00001', name: '22K Gold Traditional Necklace',
    description: 'Handcrafted traditional Sri Lankan necklace with intricate floral design',
    categoryId: 'm-cat-00001', metalType: 'gold', karat: '22K',
    metalWeight: '35.500', metalPurity: '91.67',
    hasGemstones: false,
    metalRate: '18500.00', makingCharges: '45000.00',
    sellingPrice: '702250.00', costPrice: '620000.00',
    stockQuantity: 3, reorderLevel: 2,
    supplierId: 'sup-001', supplierName: 'Lanka Gold Suppliers',
    dateAdded: new Date('2024-01-15'),
  },
  {
    id: 'm-prod-00002', sku: 'M00002', name: '18K Gold Diamond Earrings',
    description: 'Elegant diamond stud earrings set in 18K gold, perfect for formal occasions',
    categoryId: 'm-cat-00002', metalType: 'gold', karat: '18K',
    metalWeight: '8.200', metalPurity: '75.00',
    hasGemstones: true, totalGemstoneWeight: '1.000',
    metalRate: '14000.00', makingCharges: '25000.00',
    gemstoneValue: '150000.00',
    sellingPrice: '289800.00', costPrice: '245000.00',
    stockQuantity: 5, reorderLevel: 2,
    supplierId: 'sup-002', supplierName: 'Ratnapura Gem Traders',
    dateAdded: new Date('2024-02-20'),
  },
  {
    id: 'm-prod-00003', sku: 'M00003', name: '18K White Gold Solitaire Ring',
    description: 'Stunning solitaire diamond ring in white gold setting',
    categoryId: 'm-cat-00003', metalType: 'white-gold', karat: '18K',
    metalWeight: '5.500', metalPurity: '75.00',
    hasGemstones: true, totalGemstoneWeight: '1.000',
    metalRate: '14500.00', makingCharges: '35000.00',
    gemstoneValue: '350000.00',
    sellingPrice: '464750.00', costPrice: '395000.00',
    stockQuantity: 2, reorderLevel: 1,
    supplierId: 'sup-002', supplierName: 'Ratnapura Gem Traders',
    dateAdded: new Date('2024-03-10'),
  },
  {
    id: 'm-prod-00004', sku: 'M00004', name: '22K Gold Bangles Set (6 pcs)',
    description: 'Set of 6 traditional gold bangles with embossed patterns',
    categoryId: 'm-cat-00004', metalType: 'gold', karat: '22K',
    metalWeight: '72.000', metalPurity: '91.67',
    hasGemstones: false,
    metalRate: '18500.00', makingCharges: '65000.00',
    sellingPrice: '1397000.00', costPrice: '1250000.00',
    stockQuantity: 4, reorderLevel: 2,
    supplierId: 'sup-001', supplierName: 'Lanka Gold Suppliers',
    dateAdded: new Date('2024-04-05'),
  },
  {
    id: 'm-prod-00005', sku: 'M00005', name: '22K Gold Ruby Pendant',
    description: 'Beautiful ruby pendant set in 22K gold with filigree work',
    categoryId: 'm-cat-00005', metalType: 'gold', karat: '22K',
    metalWeight: '12.500', metalPurity: '91.67',
    hasGemstones: true, totalGemstoneWeight: '2.500',
    metalRate: '18500.00', makingCharges: '28000.00',
    gemstoneValue: '180000.00',
    sellingPrice: '439250.00', costPrice: '375000.00',
    stockQuantity: 3, reorderLevel: 1,
    supplierId: 'sup-003', supplierName: 'Colombo Jewellery Wholesale',
    dateAdded: new Date('2024-05-12'),
  },
  {
    id: 'm-prod-00006', sku: 'M00006', name: '22K Gold Rope Chain 24"',
    description: 'Classic rope pattern gold chain, 24 inches length',
    categoryId: 'm-cat-00006', metalType: 'gold', karat: '22K',
    metalWeight: '25.000', metalPurity: '91.67',
    hasGemstones: false,
    metalRate: '18500.00', makingCharges: '15000.00',
    sellingPrice: '477500.00', costPrice: '420000.00',
    stockQuantity: 8, reorderLevel: 3,
    supplierId: 'sup-001', supplierName: 'Lanka Gold Suppliers',
    dateAdded: new Date('2024-06-01'),
  },
  {
    id: 'm-prod-00007', sku: 'M00007', name: '22K Gold Men\'s Ring',
    description: 'Classic men\'s gold ring with matte finish',
    categoryId: 'm-cat-00011', metalType: 'gold', karat: '22K',
    metalWeight: '15.000', metalPurity: '91.67',
    hasGemstones: false,
    metalRate: '18500.00', makingCharges: '12000.00',
    sellingPrice: '289500.00', costPrice: '255000.00',
    stockQuantity: 6, reorderLevel: 2,
    supplierId: 'sup-001', supplierName: 'Lanka Gold Suppliers',
    dateAdded: new Date('2024-07-15'),
  },
  {
    id: 'm-prod-00008', sku: 'M00008', name: '24K Gold Bar 100g',
    description: '100 gram 24K pure gold bar, hallmarked and certified',
    categoryId: 'm-cat-00013', metalType: 'gold', karat: '24K',
    metalWeight: '100.000', metalPurity: '99.99',
    hasGemstones: false,
    metalRate: '19500.00', makingCharges: '0.00',
    sellingPrice: '1950000.00', costPrice: '1900000.00',
    stockQuantity: 10, reorderLevel: 5,
    supplierId: 'sup-004', supplierName: 'International Gold Corp',
    dateAdded: new Date('2024-08-01'),
  },
  {
    id: 'm-prod-00009', sku: 'M00009', name: '925 Silver Anklet Pair',
    description: 'Traditional silver anklets with bell charms',
    categoryId: 'm-cat-00012', metalType: 'silver',
    metalWeight: '85.000', metalPurity: '92.50',
    hasGemstones: false,
    metalRate: '120.00', makingCharges: '2500.00',
    sellingPrice: '12700.00', costPrice: '10500.00',
    stockQuantity: 15, reorderLevel: 5,
    supplierId: 'sup-003', supplierName: 'Colombo Jewellery Wholesale',
    dateAdded: new Date('2024-09-10'),
  },
  {
    id: 'm-prod-00010', sku: 'M00010', name: '18K Rose Gold Hoop Earrings',
    description: 'Modern rose gold hoop earrings with brushed finish',
    categoryId: 'm-cat-00002', metalType: 'rose-gold', karat: '18K',
    metalWeight: '6.800', metalPurity: '75.00',
    hasGemstones: false,
    metalRate: '15000.00', makingCharges: '18000.00',
    sellingPrice: '120000.00', costPrice: '98000.00',
    stockQuantity: 4, reorderLevel: 2,
    supplierId: 'sup-004', supplierName: 'International Gold Corp',
    dateAdded: new Date('2024-10-20'),
  },
];

// ==========================================
// Gemstones for products that have them
// ==========================================

export const seedGemstones: GemstoneInsert[] = [
  // m-prod-00002: 18K Gold Diamond Earrings
  { id: 'm-gem-00001', productId: 'm-prod-00002', name: 'Diamond', type: 'diamond', carat: '0.500', clarity: 'VVS1', cut: 'Excellent', color: 'D', certified: true, certificateNumber: 'GIA-12345' },
  { id: 'm-gem-00002', productId: 'm-prod-00002', name: 'Diamond', type: 'diamond', carat: '0.500', clarity: 'VVS1', cut: 'Excellent', color: 'D', certified: true, certificateNumber: 'GIA-12346' },

  // m-prod-00003: 18K White Gold Solitaire Ring
  { id: 'm-gem-00003', productId: 'm-prod-00003', name: 'Diamond', type: 'diamond', carat: '1.000', clarity: 'VS1', cut: 'Ideal', color: 'E', certified: true, certificateNumber: 'GIA-12347' },

  // m-prod-00005: 22K Gold Ruby Pendant
  { id: 'm-gem-00004', productId: 'm-prod-00005', name: 'Ruby', type: 'ruby', carat: '2.500', clarity: 'Eye Clean', color: 'Pigeon Blood', origin: 'Myanmar', certified: true, certificateNumber: 'GRS-78901' },
];

// ==========================================
// Customers — 5 Sri Lankan customers
// ==========================================

export const seedCustomers: CustomerInsert[] = [
  {
    id: 'm-cus-00001', name: 'Chaminda Perera', businessName: 'Perera Jewellers',
    email: 'chaminda@pererajewellers.lk', phone: '+94 77 234 5678',
    nic: '752345678V',
    address: '45 Temple Road', city: 'Kandy',
    registrationDate: '2023-01-15', totalPurchased: '2500000',
    customerType: 'vip', isActive: true,
    creditLimit: '500000', creditBalance: '0',
  },
  {
    id: 'm-cus-00002', name: 'Malini Fernando',
    email: 'malini.f@gmail.com', phone: '+94 71 345 6789',
    nic: '896523451V',
    address: '78 Lake Drive', city: 'Colombo',
    registrationDate: '2023-03-22', totalPurchased: '850000',
    customerType: 'retail', isActive: true,
  },
  {
    id: 'm-cus-00003', name: 'Kamal Dissanayake', businessName: 'KD Gold House',
    email: 'kamal@kdgold.lk', phone: '+94 76 456 7890',
    nic: '823456789V',
    address: '156 Main Street', city: 'Galle',
    registrationDate: '2022-08-10', totalPurchased: '4200000',
    customerType: 'wholesale', isActive: true,
    creditLimit: '1000000', creditBalance: '350000',
  },
  {
    id: 'm-cus-00004', name: 'Nirosha Wijesinghe',
    email: 'nirosha.w@yahoo.com', phone: '+94 72 567 8901',
    nic: '935678901V',
    address: '23 Hill Street', city: 'Nuwara Eliya',
    registrationDate: '2024-01-05', totalPurchased: '175000',
    customerType: 'retail', isActive: true,
  },
  {
    id: 'm-cus-00005', name: 'Ruwan Jayawardena', businessName: 'Jayawardena & Sons',
    email: 'ruwan@jayawardenasons.lk', phone: '+94 77 678 9012',
    nic: '812345678V',
    address: '89 Station Road', city: 'Matara',
    registrationDate: '2022-05-18', totalPurchased: '3100000',
    customerType: 'credit', isActive: true,
    creditLimit: '750000', creditBalance: '225000',
  },
];

// ==========================================
// Invoices — 3 sample invoices
// ==========================================

export const seedInvoices: InvoiceInsert[] = [
  {
    id: 'm-inv-00001', invoiceNumber: 'M00001',
    customerId: 'm-cus-00001', customerName: 'Chaminda Perera',
    customerPhone: '+94 77 234 5678', customerAddress: '45 Temple Road, Kandy',
    subtotal: '992050', discount: '50000', discountType: 'fixed',
    tax: '0', total: '942050',
    amountPaid: '942050', balanceDue: '0',
    paymentMethod: 'bank-transfer',
    issueDate: '2024-12-28', status: 'paid',
    notes: 'VIP customer - loyalty discount applied',
    createdBy: 'Admin', createdByUserId: 'USR-01',
    createdAt: new Date('2024-12-28T10:30:00Z'),
  },
  {
    id: 'm-inv-00002', invoiceNumber: 'M00002',
    customerId: 'm-cus-00003', customerName: 'Kamal Dissanayake',
    customerPhone: '+94 76 456 7890', customerAddress: '156 Main Street, Galle',
    subtotal: '4226500', discount: '200000', discountType: 'fixed',
    tax: '0', total: '4026500',
    amountPaid: '2500000', balanceDue: '1526500',
    paymentMethod: 'credit',
    issueDate: '2024-12-29', dueDate: '2025-01-29', status: 'partial',
    notes: 'Wholesale order - partial payment received',
    createdBy: 'Admin', createdByUserId: 'USR-02',
    createdAt: new Date('2024-12-29T14:00:00Z'),
  },
  {
    id: 'm-inv-00003', invoiceNumber: 'M00003',
    customerId: 'm-cus-00002', customerName: 'Malini Fernando',
    customerPhone: '+94 71 345 6789', customerAddress: '78 Lake Drive, Colombo',
    subtotal: '464750', discount: '0',
    tax: '0', total: '464750',
    amountPaid: '0', balanceDue: '464750',
    paymentMethod: 'card',
    issueDate: '2024-12-30', dueDate: '2025-01-15', status: 'pending',
    notes: 'Engagement ring - customer to pick up',
    createdBy: 'Admin', createdByUserId: 'USR-01',
    createdAt: new Date('2024-12-30T09:15:00Z'),
  },
];

// ==========================================
// Invoice Items
// ==========================================

export const seedInvoiceItems: InvoiceItemInsert[] = [
  // m-inv-00001 items
  {
    id: 'm-inv-item-00001', invoiceId: 'm-inv-00001', productId: 'm-prod-00001',
    sku: 'M00001', productName: '22K Gold Traditional Necklace',
    metalType: 'gold', karat: '22K', metalWeight: '35.500',
    quantity: 1, unitPrice: '702250', total: '702250',
  },
  {
    id: 'm-inv-item-00002', invoiceId: 'm-inv-00001', productId: 'm-prod-00002',
    sku: 'M00002', productName: '18K Gold Diamond Earrings',
    metalType: 'gold', karat: '18K', metalWeight: '8.200',
    quantity: 1, unitPrice: '289800', total: '289800',
  },
  // m-inv-00002 items
  {
    id: 'm-inv-item-00003', invoiceId: 'm-inv-00002', productId: 'm-prod-00004',
    sku: 'M00004', productName: '22K Gold Bangles Set (6 pcs)',
    metalType: 'gold', karat: '22K', metalWeight: '72.000',
    quantity: 2, unitPrice: '1397000', total: '2794000',
  },
  {
    id: 'm-inv-item-00004', invoiceId: 'm-inv-00002', productId: 'm-prod-00006',
    sku: 'M00006', productName: '22K Gold Rope Chain 24"',
    metalType: 'gold', karat: '22K', metalWeight: '25.000',
    quantity: 3, unitPrice: '477500', total: '1432500',
  },
  // m-inv-00003 items
  {
    id: 'm-inv-item-00005', invoiceId: 'm-inv-00003', productId: 'm-prod-00003',
    sku: 'M00003', productName: '18K White Gold Solitaire Ring',
    metalType: 'white-gold', karat: '18K', metalWeight: '5.500',
    quantity: 1, unitPrice: '464750', total: '464750',
  },
];

// ==========================================
// Payments — initial payment records
// ==========================================

export const seedPayments: PaymentInsert[] = [
  {
    id: 'm-pay-00001', invoiceId: 'm-inv-00001',
    amount: '942050', method: 'bank-transfer',
    date: '2024-12-28', reference: 'BT-20241228-001',
    notes: 'Full payment via bank transfer',
  },
  {
    id: 'm-pay-00002', invoiceId: 'm-inv-00002',
    amount: '2500000', method: 'credit',
    date: '2024-12-29', reference: 'CR-20241229-001',
    notes: 'Initial payment - wholesale credit',
  },
];

// ==========================================
// Counters — Auto-increment sequences
// ==========================================

export const seedCounters: CounterInsert[] = [
  { id: 'counter-M-invoice', entityType: 'invoice', shopCode: 'M', prefix: 'INV', lastNumber: 3, paddingLength: 5 },
  { id: 'counter-M-clearance', entityType: 'clearance', shopCode: 'M', prefix: 'CLR', lastNumber: 7, paddingLength: 5 },
  { id: 'counter-M-product', entityType: 'product', shopCode: 'M', prefix: 'PROD', lastNumber: 10, paddingLength: 5 },
  { id: 'counter-M-category', entityType: 'category', shopCode: 'M', prefix: 'CAT', lastNumber: 14, paddingLength: 5 },
  { id: 'counter-M-customer', entityType: 'customer', shopCode: 'M', prefix: 'CUS', lastNumber: 5, paddingLength: 5 },
  // Shop T counters
  { id: 'counter-T-invoice', entityType: 'invoice', shopCode: 'T', prefix: 'INV', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-T-clearance', entityType: 'clearance', shopCode: 'T', prefix: 'CLR', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-T-product', entityType: 'product', shopCode: 'T', prefix: 'PROD', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-T-category', entityType: 'category', shopCode: 'T', prefix: 'CAT', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-T-customer', entityType: 'customer', shopCode: 'T', prefix: 'CUS', lastNumber: 0, paddingLength: 5 },
  // Shop D counters
  { id: 'counter-D-invoice', entityType: 'invoice', shopCode: 'D', prefix: 'INV', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-D-clearance', entityType: 'clearance', shopCode: 'D', prefix: 'CLR', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-D-product', entityType: 'product', shopCode: 'D', prefix: 'PROD', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-D-category', entityType: 'category', shopCode: 'D', prefix: 'CAT', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-D-customer', entityType: 'customer', shopCode: 'D', prefix: 'CUS', lastNumber: 0, paddingLength: 5 },
];

// ==========================================
// Clearances — clearance sale records
// ==========================================

export const seedClearances: ClearanceInsert[] = [
  {
    id: 'm-clr-00001', clearanceNumber: 'M00001',
    customerId: 'm-cus-00002', customerName: 'Malini Fernando',
    customerPhone: '+94 71 345 6789', customerAddress: '78 Lake Drive, Colombo',
    clearanceReason: 'Pawned for personal loan',
    monthlyInterestRate: '5.00', interestEnabled: true,
    pawnDate: '2025-01-10', customerNic: '896523451V',
    subtotal: '289800', discount: '0', discountType: 'fixed',
    tax: '0', total: '246330',
    amountPaid: '246330', balanceDue: '0',
    paymentMethod: 'cash',
    issueDate: '2025-01-10', status: 'paid',
    redemptionDate: '2025-02-10',
    notes: 'Redeemed after 1 month - paid principal + interest',
    createdBy: 'Admin', createdByUserId: 'USR-01',
    createdAt: new Date('2025-01-10T11:00:00Z'),
  },
  {
    id: 'm-clr-00002', clearanceNumber: 'M00002',
    customerId: 'm-cus-00003', customerName: 'Kamal Dissanayake',
    customerPhone: '+94 76 456 7890', customerAddress: '156 Main Street, Galle',
    clearanceReason: 'Pawned gold chain for business capital',
    monthlyInterestRate: '5.00', interestEnabled: true,
    pawnDate: '2025-01-15', customerNic: '823456789V',
    subtotal: '477500', discount: '0', discountType: 'fixed',
    tax: '0', total: '382000',
    amountPaid: '0', balanceDue: '382000',
    paymentMethod: 'credit',
    issueDate: '2025-01-15', status: 'pending',
    notes: 'Active pawn - gold rope chain',
    createdBy: 'Admin', createdByUserId: 'USR-02',
    createdAt: new Date('2025-01-15T14:30:00Z'),
  },
  {
    id: 'm-clr-00003', clearanceNumber: 'M00003',
    customerId: 'm-cus-00001', customerName: 'Chaminda Perera',
    customerPhone: '+94 77 234 5678', customerAddress: '45 Temple Road, Kandy',
    clearanceReason: 'Pawned bangles set for medical emergency',
    monthlyInterestRate: '5.00', interestEnabled: true,
    pawnDate: '2025-02-05', customerNic: '752345678V',
    subtotal: '1397000', discount: '0', discountType: 'fixed',
    tax: '0', total: '1117600',
    amountPaid: '1117600', balanceDue: '0',
    paymentMethod: 'bank-transfer',
    issueDate: '2025-02-05', status: 'paid',
    redemptionDate: '2025-03-20',
    notes: 'Redeemed - bangles returned to customer',
    createdBy: 'Admin', createdByUserId: 'USR-01',
    createdAt: new Date('2025-02-05T10:15:00Z'),
  },
  {
    id: 'm-clr-00004', clearanceNumber: 'M00004',
    customerId: 'm-cus-00004', customerName: 'Nirosha Wijesinghe',
    customerPhone: '+94 72 567 8901', customerAddress: '23 Hill Street, Nuwara Eliya',
    clearanceReason: 'Pawned earrings for home renovation',
    monthlyInterestRate: '5.00', interestEnabled: true,
    pawnDate: '2025-02-12', customerNic: '935678901V',
    subtotal: '120000', discount: '0', discountType: 'fixed',
    tax: '0', total: '90000',
    amountPaid: '0', balanceDue: '90000',
    paymentMethod: 'cash',
    issueDate: '2025-02-12', status: 'pending',
    notes: 'Active pawn - rose gold earrings',
    createdBy: 'Admin', createdByUserId: 'USR-01',
    createdAt: new Date('2025-02-12T15:45:00Z'),
  },
  {
    id: 'm-clr-00005', clearanceNumber: 'M00005',
    customerId: 'm-cus-00005', customerName: 'Ruwan Jayawardena',
    customerPhone: '+94 77 678 9012', customerAddress: '89 Station Road, Matara',
    clearanceReason: 'Pawned silver anklets',
    monthlyInterestRate: '5.00', interestEnabled: true,
    pawnDate: '2025-02-20', customerNic: '812345678V',
    subtotal: '25400', discount: '0', discountType: 'fixed',
    tax: '0', total: '20320',
    amountPaid: '0', balanceDue: '20320',
    paymentMethod: 'credit',
    issueDate: '2025-02-20', status: 'pending',
    notes: 'Active pawn - silver anklets',
    createdBy: 'Admin', createdByUserId: 'USR-02',
    createdAt: new Date('2025-02-20T09:30:00Z'),
  },
  {
    id: 'm-clr-00006', clearanceNumber: 'M00006',
    customerId: 'm-cus-00003', customerName: 'Kamal Dissanayake',
    customerPhone: '+94 76 456 7890', customerAddress: '156 Main Street, Galle',
    clearanceReason: 'Pawned gold ring & pendant for business',
    monthlyInterestRate: '5.00', interestEnabled: true,
    pawnDate: '2025-03-01', customerNic: '823456789V',
    subtotal: '728750', discount: '0', discountType: 'fixed',
    tax: '0', total: '583000',
    amountPaid: '0', balanceDue: '583000',
    paymentMethod: 'cash',
    issueDate: '2025-03-01', status: 'pending',
    notes: 'Active pawn - men\'s ring + ruby pendant',
    createdBy: 'Admin', createdByUserId: 'USR-01',
    createdAt: new Date('2025-03-01T13:00:00Z'),
  },
  {
    id: 'm-clr-00007', clearanceNumber: 'M00007',
    customerId: 'm-cus-00002', customerName: 'Malini Fernando',
    customerPhone: '+94 71 345 6789', customerAddress: '78 Lake Drive, Colombo',
    clearanceReason: 'Pawned men\'s gold ring',
    monthlyInterestRate: '5.00', interestEnabled: true,
    pawnDate: '2025-03-05', customerNic: '896523451V',
    subtotal: '289500', discount: '0', discountType: 'fixed',
    tax: '0', total: '217125',
    amountPaid: '217125', balanceDue: '0',
    paymentMethod: 'cash',
    issueDate: '2025-03-05', status: 'paid',
    redemptionDate: '2025-04-10',
    notes: 'Redeemed with interest - men\'s gold ring returned',
    createdBy: 'Admin', createdByUserId: 'USR-01',
    createdAt: new Date('2025-03-05T16:20:00Z'),
  },
];

// ==========================================
// Clearance Items
// ==========================================

export const seedClearanceItems: ClearanceItemInsert[] = [
  // m-clr-00001 items
  {
    id: 'm-clr-item-00001', clearanceId: 'm-clr-00001', productId: 'm-prod-00002',
    sku: 'M00002', productName: '18K Gold Diamond Earrings',
    metalType: 'gold', karat: '18K', metalWeight: '8.200',
    quantity: 1, unitPrice: '289800', total: '289800',
  },
  // m-clr-00002 items
  {
    id: 'm-clr-item-00002', clearanceId: 'm-clr-00002', productId: 'm-prod-00006',
    sku: 'M00006', productName: '22K Gold Rope Chain 24"',
    metalType: 'gold', karat: '22K', metalWeight: '25.000',
    quantity: 1, unitPrice: '477500', total: '477500',
  },
  // m-clr-00003 items
  {
    id: 'm-clr-item-00003', clearanceId: 'm-clr-00003', productId: 'm-prod-00004',
    sku: 'M00004', productName: '22K Gold Bangles Set (6 pcs)',
    metalType: 'gold', karat: '22K', metalWeight: '72.000',
    quantity: 1, unitPrice: '1397000', total: '1397000',
  },
  // m-clr-00004 items
  {
    id: 'm-clr-item-00004', clearanceId: 'm-clr-00004', productId: 'm-prod-00010',
    sku: 'M00010', productName: '18K Rose Gold Hoop Earrings',
    metalType: 'rose-gold', karat: '18K', metalWeight: '6.800',
    quantity: 1, unitPrice: '120000', total: '120000',
  },
  // m-clr-00005 items
  {
    id: 'm-clr-item-00005', clearanceId: 'm-clr-00005', productId: 'm-prod-00009',
    sku: 'M00009', productName: '925 Silver Anklet Pair',
    metalType: 'silver', metalWeight: '85.000',
    quantity: 2, unitPrice: '12700', total: '25400',
  },
  // m-clr-00006 items (2 items)
  {
    id: 'm-clr-item-00006', clearanceId: 'm-clr-00006', productId: 'm-prod-00007',
    sku: 'M00007', productName: '22K Gold Men\'s Ring',
    metalType: 'gold', karat: '22K', metalWeight: '15.000',
    quantity: 1, unitPrice: '289500', total: '289500',
  },
  {
    id: 'm-clr-item-00007', clearanceId: 'm-clr-00006', productId: 'm-prod-00005',
    sku: 'M00005', productName: '22K Gold Ruby Pendant',
    metalType: 'gold', karat: '22K', metalWeight: '12.500',
    quantity: 1, unitPrice: '439250', total: '439250',
  },
  // m-clr-00007 items
  {
    id: 'm-clr-item-00008', clearanceId: 'm-clr-00007', productId: 'm-prod-00007',
    sku: 'M00007', productName: '22K Gold Men\'s Ring',
    metalType: 'gold', karat: '22K', metalWeight: '15.000',
    quantity: 1, unitPrice: '289500', total: '289500',
  },
];

// ==========================================
// Clearance Payments
// ==========================================

export const seedClearancePayments: ClearancePaymentInsert[] = [
  {
    id: 'm-clr-pay-00001', clearanceId: 'm-clr-00001',
    amount: '246330', method: 'cash',
    date: '2025-01-10', reference: 'CLR-20250110-001',
    notes: 'Full payment - clearance sale',
  },
  {
    id: 'm-clr-pay-00002', clearanceId: 'm-clr-00002',
    amount: '200000', method: 'credit',
    date: '2025-01-15', reference: 'CLR-20250115-001',
    notes: 'Partial payment - wholesale clearance',
  },
  {
    id: 'm-clr-pay-00003', clearanceId: 'm-clr-00003',
    amount: '1117600', method: 'bank-transfer',
    date: '2025-02-05', reference: 'BT-20250205-CLR',
    notes: 'Full payment - VIP clearance sale',
  },
  {
    id: 'm-clr-pay-00004', clearanceId: 'm-clr-00004',
    amount: '90000', method: 'card',
    date: '2025-02-12', reference: 'CARD-20250212-CLR',
    notes: 'Full payment - display model clearance',
  },
  {
    id: 'm-clr-pay-00005', clearanceId: 'm-clr-00006',
    amount: '400000', method: 'bank-transfer',
    date: '2025-03-01', reference: 'BT-20250301-CLR',
    notes: 'Partial payment - bulk clearance order',
  },
  {
    id: 'm-clr-pay-00006', clearanceId: 'm-clr-00007',
    amount: '217125', method: 'cash',
    date: '2025-03-05', reference: 'CLR-20250305-001',
    notes: 'Full payment - scratch & dent clearance',
  },
];

// ==========================================
// Users — 3 admin users
// Password: onelka123 (bcrypt hash with 12 rounds)
// ==========================================

export const seedUsers: UserInsert[] = [
  {
    id: 'USR-01',
    username: 'onelka1',
    email: 'onelkajewellery95@gmail.com',
    passwordHash: '$2b$12$F/7wv6p7wlZMqeSqNq.IqOWLY7Lhc77IymHqYYTu7sAf6ztCs6nbS',
    fullName: 'onelka user 1',
    phone: '0770400789',
    role: 'admin',
    shopCode: 'M',
    isActive: true,
  },
  {
    id: 'USR-02',
    username: 'onelka2',
    email: 'onelkajewellery95+2@gmail.com',
    passwordHash: '$2b$12$F/7wv6p7wlZMqeSqNq.IqOWLY7Lhc77IymHqYYTu7sAf6ztCs6nbS',
    fullName: 'onelka user 2',
    phone: '0770400789',
    role: 'admin',
    shopCode: 'T',
    isActive: true,
  },
  {
    id: 'USR-03',
    username: 'onelka3',
    email: 'onelkajewellery95+3@gmail.com',
    passwordHash: '$2b$12$F/7wv6p7wlZMqeSqNq.IqOWLY7Lhc77IymHqYYTu7sAf6ztCs6nbS',
    fullName: 'onelka user 3',
    phone: '0770400789',
    role: 'admin',
    shopCode: 'D',
    isActive: true,
  },
];

// ==========================================
// Pawning Terms — 8 terms × 3 languages
// groupId: 1–8 (same term across languages)
// sortOrder: display order on receipt
// ==========================================

type PawningTermInsert = {
  id: string;
  groupId: number;
  sortOrder: number;
  language: 'en' | 'si' | 'ta';
  termText: string;
};

export const seedPawningTerms: PawningTermInsert[] = [
  // ── Term 1 ──────────────────────────────────────────────────────────────
  {
    id: 'pt-en-01', groupId: 1, sortOrder: 1, language: 'en',
    termText: 'The pawning advance is repayable within one year with due interest.',
  },
  {
    id: 'pt-si-01', groupId: 1, sortOrder: 1, language: 'si',
    termText: 'උකස් අත්තිකාරම් මුදල අදාළ පොළිය සමඟ වසරක් ඇතුළත ගෙවා බේරාගත යුතුය.',
  },
  {
    id: 'pt-ta-01', groupId: 1, sortOrder: 1, language: 'ta',
    termText: 'அடகு முன்பணத்தைக் குறித்த வட்டியுடன் சேர்த்து ஒரு வருடத்திற்குள் செலுத்திட வேண்டும்.',
  },

  // ── Term 2 ──────────────────────────────────────────────────────────────
  {
    id: 'pt-en-02', groupId: 2, sortOrder: 2, language: 'en',
    termText: 'The Bank/Institution has the right of sale of pawned articles under Sec. 85 of the Mortgage Act.',
  },
  {
    id: 'pt-si-02', groupId: 2, sortOrder: 2, language: 'si',
    termText: 'උකස් පනතේ 85 වැනි වගන්තිය ප්‍රකාරව, උකස් කළ භාණ්ඩ විකිණීමට බැංකුවට/ආයතනයට බලය ඇත.',
  },
  {
    id: 'pt-ta-02', groupId: 2, sortOrder: 2, language: 'ta',
    termText: 'அடகு சட்டத்தின் 85 ஆவது பிரிவின் கீழ் அடகு வைக்கப்பட்ட பொருட்களை விற்பதற்கு வங்கிக்கு அதிகாரமுண்டு.',
  },

  // ── Term 3 ──────────────────────────────────────────────────────────────
  {
    id: 'pt-en-03', groupId: 3, sortOrder: 3, language: 'en',
    termText: 'The pawn ticket must be surrendered to redeem the pawned articles.',
  },
  {
    id: 'pt-si-03', groupId: 3, sortOrder: 3, language: 'si',
    termText: 'උකස් කළ භාණ්ඩ බේරා ගැනීම සඳහා මෙම උකස් රිසිට්පත ඉදිරිපත් කළ යුතුය.',
  },
  {
    id: 'pt-ta-03', groupId: 3, sortOrder: 3, language: 'ta',
    termText: 'அடகு பொருட்களை மீட்டுக்கொள்வதற்கு அடகுச் சீட்டு சமர்ப்பிக்கப்பட வேண்டும்.',
  },

  // ── Term 4 ──────────────────────────────────────────────────────────────
  {
    id: 'pt-en-04', groupId: 4, sortOrder: 4, language: 'en',
    termText: 'An affidavit in a form approved by the Bank and other documents specified by the Bank must be submitted to redeem the articles where this ticket is lost and/or pawner is dead.',
  },
  {
    id: 'pt-si-04', groupId: 4, sortOrder: 4, language: 'si',
    termText: 'මෙම රිසිට්පත නැති වූ අවස්ථාවක හෝ උකස්කරු මියගිය අවස්ථාවක, ආයතනය විසින් අනුමත කරන ලද දිවුරුම් ප්‍රකාශයක් හෝ වෙනත් ලේඛන ඉදිරිපත් කළ යුතුය.',
  },
  {
    id: 'pt-ta-04', groupId: 4, sortOrder: 4, language: 'ta',
    termText: 'சீட்டு தொலைந்தாலோ அல்லது அடகு வைத்தவர் இறந்தாலோ வங்கி கோரும் சத்தியக்கடதாசி அல்லது ஏனைய ஆவணங்கள் சமர்ப்பிக்கப்பட வேண்டும்.',
  },

  // ── Term 5 ──────────────────────────────────────────────────────────────
  {
    id: 'pt-en-05', groupId: 5, sortOrder: 5, language: 'en',
    termText: 'Any notice under the Mortgage Act should be sent to the address given overleaf.',
  },
  {
    id: 'pt-si-05', groupId: 5, sortOrder: 5, language: 'si',
    termText: 'උකස් පනත යටතේ එවිය යුතු ඕනෑම දැනුම්දීමක් මෙහි සඳහන් කර ඇති ලිපිනයට එවනු ලැබේ.',
  },
  {
    id: 'pt-ta-05', groupId: 5, sortOrder: 5, language: 'ta',
    termText: 'அடகு சட்டத்தின் கீழ் அனுப்பப்பட வேண்டிய அறிவித்தல்கள் இதில் தரப்பட்டுள்ள முகவரிக்கு அனுப்பப்படும்.',
  },

  // ── Term 6 ──────────────────────────────────────────────────────────────
  {
    id: 'pt-en-06', groupId: 6, sortOrder: 6, language: 'en',
    termText: 'In the event of the advance is not settled / renewed at the end of the period agreed, a 2.0% additional penal rate is charged.',
  },
  {
    id: 'pt-si-06', groupId: 6, sortOrder: 6, language: 'si',
    termText: 'එකඟ වූ කාලසීමාව අවසානයේදී පියවා නොගන්නා හෝ අලුත් නොකරන උකස් සඳහා 2.0% ක අතිරේක දඩ පොළියක් අය කරනු ලැබේ.',
  },
  {
    id: 'pt-ta-06', groupId: 6, sortOrder: 6, language: 'ta',
    termText: 'காலம் முடிந்தும் மீட்கப்படாத அடகுகளுக்கு 2% மேலதிக தண்டப்பணம் வசூலிக்கப்படும்.',
  },

  // ── Term 7 ──────────────────────────────────────────────────────────────
  {
    id: 'pt-en-07', groupId: 7, sortOrder: 7, language: 'en',
    termText: 'The Bank reserves the right to add to or alter any of the above terms and conditions.',
  },
  {
    id: 'pt-si-07', groupId: 7, sortOrder: 7, language: 'si',
    termText: 'ඉහත කොන්දේසි ඕනෑම අවස්ථාවක වෙනස් කිරීමට හෝ අලුතින් ඇතුළත් කිරීමට බැංකුවට/ආයතනයට බලය ඇත.',
  },
  {
    id: 'pt-ta-07', groupId: 7, sortOrder: 7, language: 'ta',
    termText: 'மேலே உள்ள நிபந்தனைகளை மாற்றும் அதிகாரம் வங்கிக்கு உண்டு.',
  },

  // ── Term 8 ──────────────────────────────────────────────────────────────
  {
    id: 'pt-en-08', groupId: 8, sortOrder: 8, language: 'en',
    termText: 'In the event of a loss of an article, only the value of gold at the time of loss will be reimbursed by the Bank.',
  },
  {
    id: 'pt-si-08', groupId: 8, sortOrder: 8, language: 'si',
    termText: 'භාණ්ඩයක් නැති වූ අවස්ථාවකදී ගෙවනු ලබන්නේ එම අවස්ථාවේ පවතින රන්වල වටිනාකම පමණි.',
  },
  {
    id: 'pt-ta-08', groupId: 8, sortOrder: 8, language: 'ta',
    termText: 'பொருள் இழப்பு ஏற்பட்டால் இழப்பு ஏற்படும் நேரத்தில் நிலவும் தங்கத்தின் விலை மாத்திரமே வங்கி செலுத்தும்.',
  },
];
