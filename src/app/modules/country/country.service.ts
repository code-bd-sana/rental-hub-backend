import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';

const createCountry = async (payload: { name: string; target?: number }) => {
  const existing = await prisma.country.findUnique({
    where: { name: payload.name },
  });
  if (existing) {
    throw new AppError(400, 'Country already exists');
  }

  const result = await prisma.country.create({
    data: payload,
  });
  return result;
};

const getAllCountries = async () => {
  const countries = await prisma.country.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Calculate the loaded listings for each country
  // Group by country from Listing table where approvalStatus is APPROVED
  const listingsCount = await prisma.listing.groupBy({
    by: ['country'],
    where: { approvalStatus: 'APPROVED' },
    _count: { id: true },
  });

  const countMap: Record<string, number> = {};
  listingsCount.forEach((item) => {
    if (item.country) {
      countMap[item.country] = item._count.id;
    }
  });

  const formattedCountries = countries.map((country) => ({
    ...country,
    loaded: countMap[country.name] || 0,
  }));

  return formattedCountries;
};

const updateCountry = async (id: string, payload: { name?: string; target?: number }) => {
  const country = await prisma.country.findUnique({ where: { id } });
  if (!country) {
    throw new AppError(404, 'Country not found');
  }

  const result = await prisma.country.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteCountry = async (id: string) => {
  const country = await prisma.country.findUnique({ where: { id } });
  if (!country) {
    throw new AppError(404, 'Country not found');
  }

  await prisma.country.delete({
    where: { id },
  });
  return null;
};

export const CountryService = {
  createCountry,
  getAllCountries,
  updateCountry,
  deleteCountry,
};
