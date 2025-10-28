import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

// Mock data simulating our database
const db = {
  user: [
    {
      id: 'user-1',
      email: 'user@test.com',
      name: 'Test User',
      role: UserRole.USER,
      passwordHash: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'owner-1',
      email: 'owner@test.com',
      name: 'Test Owner',
      role: UserRole.OWNER,
      passwordHash: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  resource: [
    {
      id: 'resource-1',
      name: 'Test Resource',
      description: 'A resource for testing',
      ownerId: 'owner-1',
      pricePerHour: { toNumber: () => 100 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  reservation: [],
  availability: [],
  blocked: [],
};

// Mock PrismaService
const mockPrismaService = {
  resource: {
    findUnique: jest.fn().mockResolvedValue(db.resource[0]),
  },
  reservation: {
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
  },
  availability: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  blocked: {
    findFirst: jest.fn().mockResolvedValue(null),
  },
};

describe('BookingService', () => {
  let service: BookingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a booking successfully', async () => {
      // Arrange
      const startTime = new Date('2025-12-01T10:00:00Z');
      const endTime = new Date('2025-12-01T12:00:00Z');
      const createBookingDto = {
        resourceId: 'resource-1',
        startTime,
        endTime,
      };
      const userId = 'user-1';

      // Mock the create function to return the created booking
      const expectedBooking = {
        id: 'booking-1',
        ...createBookingDto,
        userId,
        totalPrice: 200, // 2 hours * 100 pricePerHour
        status: 'PENDENTE',
      };
      jest
        .spyOn(prisma.reservation, 'create')
        .mockResolvedValue(expectedBooking as any);

      // Act
      const result = await service.create(createBookingDto, userId);

      // Assert
      expect(result).toEqual(expectedBooking);
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: 'resource-1' },
      });
      expect(prisma.reservation.create).toHaveBeenCalledWith({
        data: {
          startTime,
          endTime,
          resourceId: 'resource-1',
          userId: 'user-1',
          totalPrice: 200,
        },
      });
    });

    it('should throw ForbiddenException if booking conflicts with another reservation', async () => {
      // Arrange
      const startTime = new Date('2025-12-01T10:00:00Z');
      const endTime = new Date('2025-12-01T12:00:00Z');
      const createBookingDto = {
        resourceId: 'resource-1',
        startTime,
        endTime,
      };
      const userId = 'user-1';

      // Mock a conflicting booking
      jest.spyOn(prisma.reservation, 'findFirst').mockResolvedValue({
        id: 'existing-booking',
      } as any);

      // Act & Assert
      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
