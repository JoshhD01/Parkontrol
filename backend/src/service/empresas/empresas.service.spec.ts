import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmpresasService } from './empresas.service';
import { Empresa } from 'src/entities/empresas/entities/empresa.entity';
import { EmpresaResponseDto } from 'src/controller/empresas/dto/empresa-response.dto';

describe('EmpresasService', () => {
  let service: EmpresasService;

  let empresaRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOneBy: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    empresaRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresasService,
        { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
      ],
    }).compile();

    service = module.get<EmpresasService>(EmpresasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const empresaMock = { id: 1, nombre: 'Empresa Test' };

  describe('crear', () => {

    it('CS0001 - crea y guarda empresa correctamente', async () => {

      // Arrange
      const dto = { nombre: 'Empresa Test' };

      empresaRepository.create.mockReturnValue(empresaMock);
      empresaRepository.save.mockResolvedValue(empresaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(empresaRepository.create).toHaveBeenCalledWith(dto);
      expect(empresaRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(EmpresaResponseDto);
    });

  });

  describe('findEmpresaById', () => {

    it('CS0001 - empresa no existe', async () => {

      // Arrange
      empresaRepository.findOneBy.mockResolvedValue(null);

      // Act
      const action = service.findEmpresaById(1);

      // Assert
      await expect(action).rejects.toThrow(
        'Empresa con id: 1 no existe',
      );
    });

    it('CS0002 - empresa existe', async () => {

      // Arrange
      empresaRepository.findOneBy.mockResolvedValue(empresaMock);

      // Act
      const result = await service.findEmpresaById(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

  });

  describe('findAll', () => {

    it('CS0001 - retorna lista de empresas', async () => {

      // Arrange
      empresaRepository.find.mockResolvedValue([empresaMock]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(EmpresaResponseDto);
    });

    it('CS0002 - retorna lista vacía', async () => {

      // Arrange
      empresaRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });

  });

  describe('obtenerDetalle', () => {

    it('CS0001 - empresa existe', async () => {

      // Arrange
      jest.spyOn(service, 'findEmpresaById').mockResolvedValue(empresaMock as any);

      // Act
      const result = await service.obtenerDetalle(1);

      // Assert
      expect(result).toBeInstanceOf(EmpresaResponseDto);
    });

    it('CS0002 - empresa no existe', async () => {

      // Arrange
      jest
        .spyOn(service, 'findEmpresaById')
        .mockRejectedValue(new Error('Empresa con id: 1 no existe'));

      // Act
      const action = service.obtenerDetalle(1);

      // Assert
      await expect(action).rejects.toThrow();
    });

  });

  describe('obtenerTodas', () => {

    it('CS0001 - retorna lista de empresas', async () => {

      // Arrange
      jest.spyOn(service, 'findAll').mockResolvedValue([{} as any]);

      // Act
      const result = await service.obtenerTodas();

      // Assert
      expect(result).toHaveLength(1);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('CS0002 - retorna lista vacía', async () => {

      // Arrange
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      // Act
      const result = await service.obtenerTodas();

      // Assert
      expect(result).toHaveLength(0);
    });

  });

});