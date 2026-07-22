import prisma from '../../utils/prisma';

interface LoadDirectoryPayload {
  country: string;
  businessName: string;
  businessNumber: string;
  address: string;
  primaryImage: string;
  loadedById: string;
}

const loadDirectory = async (payload: LoadDirectoryPayload) => {
  return await prisma.directoryListing.create({
    data: payload
  });
};

const getAllDirectories = async () => {
  return await prisma.directoryListing.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      loadedBy: {
        select: { name: true, email: true }
      }
    }
  });
};

const updateDirectory = async (id: string, payload: Partial<LoadDirectoryPayload>) => {
  return await prisma.directoryListing.update({
    where: { id },
    data: payload
  });
};

const deleteDirectory = async (id: string) => {
  return await prisma.directoryListing.delete({
    where: { id }
  });
};

export const DirectoryService = {
  loadDirectory,
  getAllDirectories,
  updateDirectory,
  deleteDirectory
};
