import { Test, TestingModule } from '@nestjs/testing';
import { UnitsService } from './units.service';
import { PrismaService } from '../../../prisma';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

const mockPrismaService = () => ({
  unitOfMeasure: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

type MockPrismaService = ReturnType<typeof mockPrismaService>;

describe('UnitsService', () => {
  let service: UnitsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated units with summary', async () => {
      const mockUnits = [
        { id: '1', name: 'Unit 1', baseUnit: null },
        { id: '2', name: 'Unit 2', baseUnit: { id: '1' } },
      ];

      // Mock findAll counts
      prisma.unitOfMeasure.count.mockResolvedValueOnce(2); // total for pagination
      prisma.unitOfMeasure.findMany.mockResolvedValueOnce(mockUnits);

      // Mock buildSummary counts
      prisma.unitOfMeasure.count.mockResolvedValueOnce(10); // total units
      prisma.unitOfMeasure.count.mockResolvedValueOnce(3); // base units
      prisma.unitOfMeasure.count.mockResolvedValueOnce(7); // derived units

      const result = await service.findAll({ page: 1, pageSize: 10 });

      expect(prisma.unitOfMeasure.findMany).toHaveBeenCalled();
      expect(result.data).toEqual(mockUnits);
      expect(result.meta.totalItems).toEqual(2);
      expect(result.summary).toEqual({
        totalUnits: 10,
        baseUnits: 3,
        derivedUnits: 7,
      });
    });
  });

  describe('create', () => {
    it('should create a new unit', async () => {
      const dto = { name: 'New Unit', symbol: 'nu' };
      prisma.unitOfMeasure.findFirst.mockResolvedValue(null); // No existing unit
      prisma.unitOfMeasure.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto, 'user-id');

      expect(prisma.unitOfMeasure.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result.data.name).toEqual('New Unit');
    });

    it('should throw ConflictException if unit name exists', async () => {
      const dto = { name: 'Existing Unit', symbol: 'eu' };
      prisma.unitOfMeasure.findFirst.mockResolvedValue({ id: '1', ...dto });

      await expect(service.create(dto, 'user-id')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if base unit not found', async () => {
      const dto = { name: 'Derived', symbol: 'd', baseUnitId: 'invalid' };
      prisma.unitOfMeasure.findFirst.mockResolvedValue(null); // Name ok
      prisma.unitOfMeasure.findUnique.mockResolvedValue(null); // Base unit not found

      await expect(service.create(dto, 'user-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update unit successfully', async () => {
      const existing = { id: '1', name: 'Old Name', symbol: 'old' };
      const dto = { name: 'New Name' };

      prisma.unitOfMeasure.findUnique.mockResolvedValue(existing);
      prisma.unitOfMeasure.findFirst.mockResolvedValue(null); // Name unique check
      prisma.unitOfMeasure.update.mockResolvedValue({ ...existing, ...dto });

      const result = await service.update('1', dto, 'user-id');
      expect(result.data.name).toEqual('New Name');
    });

    it('should throw ConflictException if new name exists', async () => {
      const existing = { id: '1', name: 'Old Name', symbol: 'old' };
      const dto = { name: 'Duplicate Name' };

      prisma.unitOfMeasure.findUnique.mockResolvedValue(existing);
      prisma.unitOfMeasure.findFirst.mockResolvedValue({
        id: '2',
        name: 'Duplicate Name',
      });

      await expect(service.update('1', dto, 'user-id')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('delete', () => {
    it('should delete unit if no dependencies', async () => {
      const unit = {
        id: '1',
        _count: { products: 0, derivedUnits: 0 },
      };
      prisma.unitOfMeasure.findUnique.mockResolvedValue(unit);

      await service.delete('1', 'user-id');

      expect(prisma.unitOfMeasure.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should fail if unit has products', async () => {
      const unit = {
        id: '1',
        _count: { products: 1, derivedUnits: 0 },
      };
      prisma.unitOfMeasure.findUnique.mockResolvedValue(unit);

      await expect(service.delete('1', 'user-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
