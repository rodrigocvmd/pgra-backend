import { Test, TestingModule } from '@nestjs/testing';
import { ResourceService } from './resource.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

// Mock data
const mockUser = {
  id: 'user-1',
  role: UserRole.USER,
};

const mockOwner = {
  id: 'owner-1',
  role: UserRole.OWNER,
};

const mockResource = {
  id: 'resource-1',
  name: 'New Resource',
  description: 'A cool new resource',
  pricePerHour: 150,
  ownerId: 'user-1',
};

// Mock PrismaService with transaction support
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  resource: {
    create: jest.fn().mockResolvedValue(mockResource),
  },
  $transaction: jest.fn().mockImplementation(async (callback) => {
    // This mock simulates the transaction by simply executing the callback
    // with the same mockPrismaService object.
    return await callback(mockPrismaService);
  }),
};

describe('ResourceService', () => {
  let service: ResourceService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test to ensure isolation
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should promote a USER to OWNER when they create their first resource', async () => {
      // Arrange
      const createDto = {
        name: 'New Resource',
        description: 'A cool new resource',
        pricePerHour: 150,
      };
      const userId = 'user-1';

      // Mock the user find operation to return a USER
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(result).toEqual(mockResource);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { role: 'OWNER' },
      });
      expect(prisma.resource.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          owner: { connect: { id: userId } },
        },
      });
    });

    it('should not update user role if user is already an OWNER', async () => {
      // Arrange
      const createDto = {
        name: 'Another Resource',
        description: 'From an existing owner',
        pricePerHour: 200,
      };
      const ownerId = 'owner-1';

      // Mock the user find operation to return an OWNER
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockOwner as any);

      // Act
      await service.create(createDto, ownerId);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: ownerId },
      });
      // Crucial check: ensure the update method was NOT called
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.resource.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          owner: { connect: { id: ownerId } },
        },
      });
    });
  });
});
