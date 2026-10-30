import { prisma } from '../lib/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';
import type { UpdateCompanyInput } from '../validators/company.ts';

function formatCompany(c: any) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    tagline: c.tagline,
    logo: c.logo,
    address: c.address,
    city: c.city,
    country: c.country,
    phone: c.phone,
    phone2: c.phone2,
    email: c.email,
    website: c.website,
    registrationNumber: c.registration_number,
    taxNumber: c.tax_number,
    defaultTaxRate: c.default_tax_rate,
    currency: c.currency,
    invoiceTerms: c.invoice_terms,
    clearanceTerms: c.clearance_terms,
    pawnTerms: c.pawn_terms,
    pawnInterestRate: c.pawn_interest_rate,
    pawnInterestEnabled: c.pawn_interest_enabled,
    updatedAt: c.updated_at,
  };
}

export class CompanyService {
  async get() {
    const company = await prisma.company_info.findUnique({
      where: { id: 'default' },
    });
    if (!company) throw new AppError(404, 'Company info not found');
    return formatCompany(company);
  }

  async update(input: UpdateCompanyInput) {
    const existing = await prisma.company_info.findUnique({
      where: { id: 'default' },
    });
    if (!existing) throw new AppError(404, 'Company info not found');

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.tagline !== undefined) updateData.tagline = input.tagline;
    if (input.logo !== undefined) updateData.logo = input.logo;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.country !== undefined) updateData.country = input.country;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.phone2 !== undefined) updateData.phone2 = input.phone2;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.website !== undefined) updateData.website = input.website;
    if (input.registrationNumber !== undefined) updateData.registration_number = input.registrationNumber;
    if (input.taxNumber !== undefined) updateData.tax_number = input.taxNumber;
    if (input.defaultTaxRate !== undefined) updateData.default_tax_rate = input.defaultTaxRate as any;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.invoiceTerms !== undefined) updateData.invoice_terms = input.invoiceTerms;
    if (input.clearanceTerms !== undefined) updateData.clearance_terms = input.clearanceTerms;
    if (input.pawnTerms !== undefined) updateData.pawn_terms = input.pawnTerms;
    if (input.pawnInterestRate !== undefined) updateData.pawn_interest_rate = input.pawnInterestRate as any;
    if (input.pawnInterestEnabled !== undefined) updateData.pawn_interest_enabled = input.pawnInterestEnabled;

    const updated = await prisma.company_info.update({
      where: { id: 'default' },
      data: updateData,
    });

    return formatCompany(updated);
  }
}

export const companyService = new CompanyService();
