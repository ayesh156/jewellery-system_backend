import type {
  categories,
  goldTypeConfigs,
  goldRates,
  companyInfo,
  counters,
  users,
} from '../db/schema.ts';

type CategoryInsert = typeof categories.$inferInsert;
type GoldTypeInsert = typeof goldTypeConfigs.$inferInsert;
type GoldRateInsert = typeof goldRates.$inferInsert;
type CompanyInfoInsert = typeof companyInfo.$inferInsert;
type CounterInsert = typeof counters.$inferInsert;
type UserInsert = typeof users.$inferInsert;

// ==========================================
// 1. Company Info (ආයතනික තොරතුරු)
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
// 2. Categories (ප්‍රධාන කාණ්ඩ 14)
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
// 3. Gold Type Configurations
// ==========================================
export const seedGoldTypes: GoldTypeInsert[] = [
  { id: 'gold-24k', karat: '24K', purityPercentage: '99.90', description: 'Pure gold - coins & bars', isActive: true, defaultWastagePercentage: '5.00', color: '#FFD700' },
  { id: 'gold-22k', karat: '22K', purityPercentage: '91.67', description: 'Traditional Sri Lankan jewellery', isActive: true, defaultWastagePercentage: '8.00', color: '#FFC125' },
  { id: 'gold-21k', karat: '21K', purityPercentage: '87.50', description: 'Middle Eastern jewellery', isActive: true, defaultWastagePercentage: '8.00', color: '#FFB347' },
  { id: 'gold-18k', karat: '18K', purityPercentage: '75.00', description: 'Gemstone & designer pieces', isActive: true, defaultWastagePercentage: '10.00', color: '#DAA520' },
  { id: 'gold-14k', karat: '14K', purityPercentage: '58.30', description: 'Everyday wear jewellery', isActive: true, defaultWastagePercentage: '10.00', color: '#CD853F' },
  { id: 'gold-10k', karat: '10K', purityPercentage: '41.70', description: 'Affordable gold option', isActive: false, defaultWastagePercentage: '12.00', color: '#B8860B' },
  { id: 'gold-9k',  karat: '9K',  purityPercentage: '37.50', description: 'Entry-level gold jewellery', isActive: false, defaultWastagePercentage: '12.00', color: '#A0522D' },
];

// ==========================================
// 4. Default Base Gold Rates
// ==========================================
export const seedGoldRates: GoldRateInsert[] = [
  { id: 'rate-24k', karat: '24K', buyingRate: '28500.00', sellingRate: '29000.00', date: new Date().toISOString().split('T')[0], updatedBy: 'system' },
  { id: 'rate-22k', karat: '22K', buyingRate: '26100.00', sellingRate: '26600.00', date: new Date().toISOString().split('T')[0], updatedBy: 'system' },
  { id: 'rate-21k', karat: '21K', buyingRate: '24900.00', sellingRate: '25400.00', date: new Date().toISOString().split('T')[0], updatedBy: 'system' },
  { id: 'rate-18k', karat: '18K', buyingRate: '21400.00', sellingRate: '21900.00', date: new Date().toISOString().split('T')[0], updatedBy: 'system' },
  { id: 'rate-14k', karat: '14K', buyingRate: '16600.00', sellingRate: '17100.00', date: new Date().toISOString().split('T')[0], updatedBy: 'system' },
  { id: 'rate-10k', karat: '10K', buyingRate: '11900.00', sellingRate: '12400.00', date: new Date().toISOString().split('T')[0], updatedBy: 'system' },
  { id: 'rate-9k',  karat: '9K',  buyingRate: '10700.00', sellingRate: '11200.00', date: new Date().toISOString().split('T')[0], updatedBy: 'system' },
];

// ==========================================
// 5. Clean Counters (අංකනය 0 සිට ආරම්භ වන පරිදි)
// ==========================================
export const seedCounters: CounterInsert[] = [
  { id: 'counter-M-invoice', entityType: 'invoice', shopCode: 'M', prefix: 'INV', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-M-clearance', entityType: 'clearance', shopCode: 'M', prefix: 'CLR', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-M-product', entityType: 'product', shopCode: 'M', prefix: 'PROD', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-M-category', entityType: 'category', shopCode: 'M', prefix: 'CAT', lastNumber: 14, paddingLength: 5 },
  { id: 'counter-M-customer', entityType: 'customer', shopCode: 'M', prefix: 'CUS', lastNumber: 0, paddingLength: 5 },
  // Shop T
  { id: 'counter-T-invoice', entityType: 'invoice', shopCode: 'T', prefix: 'INV', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-T-clearance', entityType: 'clearance', shopCode: 'T', prefix: 'CLR', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-T-product', entityType: 'product', shopCode: 'T', prefix: 'PROD', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-T-category', entityType: 'category', shopCode: 'T', prefix: 'CAT', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-T-customer', entityType: 'customer', shopCode: 'T', prefix: 'CUS', lastNumber: 0, paddingLength: 5 },
  // Shop D
  { id: 'counter-D-invoice', entityType: 'invoice', shopCode: 'D', prefix: 'INV', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-D-clearance', entityType: 'clearance', shopCode: 'D', prefix: 'CLR', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-D-product', entityType: 'product', shopCode: 'D', prefix: 'PROD', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-D-category', entityType: 'category', shopCode: 'D', prefix: 'CAT', lastNumber: 0, paddingLength: 5 },
  { id: 'counter-D-customer', entityType: 'customer', shopCode: 'D', prefix: 'CUS', lastNumber: 0, paddingLength: 5 },
];

// ==========================================
// 6. Users (පද්ධති පිවිසුම් ගිණුම්)
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
// 7. Pawning Terms (උකස් රිසිට්පත් කොන්දේසි)
// ==========================================
type PawningTermInsert = {
  id: string;
  groupId: number;
  sortOrder: number;
  language: 'en' | 'si' | 'ta';
  termText: string;
};

export const seedPawningTerms: PawningTermInsert[] = [
  { id: 'pt-en-01', groupId: 1, sortOrder: 1, language: 'en', termText: 'The pawning advance is repayable within one year with due interest.' },
  { id: 'pt-si-01', groupId: 1, sortOrder: 1, language: 'si', termText: 'උකස් අත්තිකාරම් මුදල අදාළ පොළිය සමඟ වසරක් ඇතුළත ගෙවා බේරාගත යුතුය.' },
  { id: 'pt-ta-01', groupId: 1, sortOrder: 1, language: 'ta', termText: 'அடகு முன்பணத்தைக் குறித்த வட்டியுடன் சேர்த்து ஒரு வருடத்திற்குள் செலுத்திட வேண்டும்.' },
  { id: 'pt-en-02', groupId: 2, sortOrder: 2, language: 'en', termText: 'The Bank/Institution has the right of sale of pawned articles under Sec. 85 of the Mortgage Act.' },
  { id: 'pt-si-02', groupId: 2, sortOrder: 2, language: 'si', termText: 'උකස් පනතේ 85 වැනි වගන්තිය ප්‍රකාරව, උකස් කළ භාණ්ඩ විකිණීමට බැංකුවට/ආයතනයට බලය ඇත.' },
  { id: 'pt-ta-02', groupId: 2, sortOrder: 2, language: 'ta', termText: 'அடகு சட்டத்தின் 85 ஆவது பிரிவின் கீழ் அடகு வைக்கப்பட்ட பொருட்களை விற்பதற்கு வங்கிக்கு அதிகாரமுண்டு.' },
  { id: 'pt-en-03', groupId: 3, sortOrder: 3, language: 'en', termText: 'The pawn ticket must be surrendered to redeem the pawned articles.' },
  { id: 'pt-si-03', groupId: 3, sortOrder: 3, language: 'si', termText: 'උකස් කළ භාණ්ඩ බේරා ගැනීම සඳහා මෙම උකස් රිසිට්පත ඉදිරිපත් කළ යුතුය.' },
  { id: 'pt-ta-03', groupId: 3, sortOrder: 3, language: 'ta', termText: 'அடகு பொருட்களை மீட்டுக்கொள்வதற்கு அடகுச் சீட்டு சமர்ப்பிக்கப்பட வேண்டும்.' },
  { id: 'pt-en-04', groupId: 4, sortOrder: 4, language: 'en', termText: 'An affidavit approved by the Bank must be submitted to redeem articles where this ticket is lost.' },
  { id: 'pt-si-04', groupId: 4, sortOrder: 4, language: 'si', termText: 'මෙම රිසිට්පත නැති වූ අවස්ථාවක ආයතනය විසින් අනුමත කරන ලද දිවුරුම් ප්‍රකාශයක් ඉදිරිපත් කළ යුතුය.' },
  { id: 'pt-ta-04', groupId: 4, sortOrder: 4, language: 'ta', termText: 'சீட்டு தொலைந்தாலோ வங்கி கோரும் சத்தியக்கடதாசி சமர்ப்பிக்கப்பட வேண்டும்.' },
  { id: 'pt-en-05', groupId: 5, sortOrder: 5, language: 'en', termText: 'Any notice under the Mortgage Act should be sent to the address given overleaf.' },
  { id: 'pt-si-05', groupId: 5, sortOrder: 5, language: 'si', termText: 'උකස් පනත යටතේ එවිය යුතු ඕනෑම දැනුම්දීමක් මෙහි සඳහන් කර ඇති ලිපිනයට එවනු ලැබේ.' },
  { id: 'pt-ta-05', groupId: 5, sortOrder: 5, language: 'ta', termText: 'அடகு சட்டத்தின் கீழ் அனுப்பப்பட வேண்டிய அறிவித்தல்கள் இதில் தரப்பட்டுள்ள முகவரிக்கு அனுப்பப்படும்.' },
  { id: 'pt-en-06', groupId: 6, sortOrder: 6, language: 'en', termText: 'In the event the advance is not settled at the end of the period, a 2.0% additional penal rate is charged.' },
  { id: 'pt-si-06', groupId: 6, sortOrder: 6, language: 'si', termText: 'එකඟ වූ කාලසීමාව අවසානයේදී පියවා නොගන්නා උකස් සඳහා 2.0% ක අතිරේක දඩ පොළියක් අය කරනු ලැබේ.' },
  { id: 'pt-ta-06', groupId: 6, sortOrder: 6, language: 'ta', termText: 'காலம் முடிந்தும் மீட்கப்படாத அடகுகளுக்கு 2% மேலதிக தண்டப்பணம் வசூலிக்கப்படும்.' },
  { id: 'pt-en-07', groupId: 7, sortOrder: 7, language: 'en', termText: 'The Institution reserves the right to add to or alter any of the above terms and conditions.' },
  { id: 'pt-si-07', groupId: 7, sortOrder: 7, language: 'si', termText: 'ඉහත කොන්දේසි ඕනෑම අවස්ථාවක වෙනස් කිරීමට ආයතනයට බලය ඇත.' },
  { id: 'pt-ta-07', groupId: 7, sortOrder: 7, language: 'ta', termText: 'மேலே உள்ள நிபந்தனைகளை மாற்றும் அதிகாரம் நிறுவனத்திற்கு உண்டு.' },
  { id: 'pt-en-08', groupId: 8, sortOrder: 8, language: 'en', termText: 'In the event of loss of an article, only the value of gold at the time of loss will be reimbursed.' },
  { id: 'pt-si-08', groupId: 8, sortOrder: 8, language: 'si', termText: 'භාණ්ඩයක් නැති වූ අවස්ථාවකදී ගෙවනු ලබන්නේ එම අවස්ථාවේ පවතින රන්වල වටිනාකම පමණි.' },
  { id: 'pt-ta-08', groupId: 8, sortOrder: 8, language: 'ta', termText: 'பொருள் இழப்பு ஏற்பட்டால் இழப்பு நேரத்தில் நிலவும் தங்கத்தின் விலை மாத்திரமே செலுத்தப்படும்.' },
];