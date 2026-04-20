import { Test, TestingModule } from '@nestjs/testing';
import { PagosService } from 'src/service/pagos/pagos.service';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('PagosService - calcularHoras', () => {

  let service: PagosService;

  // ── Setup ─────────────────────────────────────────────────────────────────
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagosService],
    }).compile();

    service = module.get<PagosService>(PagosService);
  });

  // ==========================================================================
  // calcularHoras()
  // ==========================================================================
  describe('calcularHoras', () => {

    it('ESC00021 / CS00014 - calcula horas exactas correctamente', () => {
      // Arrange
      const entrada = new Date('2024-01-15T10:00:00');
      const salida  = new Date('2024-01-15T14:00:00');

      // Act
      const result = (service as any).calcularHoras(entrada, salida);

      // Assert
      expect(result).to.equal(4);
    });

    it('ESC00022 / CS00015 - redondea hacia arriba las fracciones de hora', () => {
      // Arrange
      const entrada = new Date('2024-01-15T10:00:00');
      const salida  = new Date('2024-01-15T14:30:00');

      // Act
      const result = (service as any).calcularHoras(entrada, salida);

      // Assert
      expect(result).to.equal(5);
    });

    it('ESC00023 / CS00016 - calcula correctamente períodos de menos de 1 hora', () => {
      // Arrange
      const entrada = new Date('2024-01-15T10:00:00');
      const salida  = new Date('2024-01-15T10:45:00');

      // Act
      const result = (service as any).calcularHoras(entrada, salida);

      // Assert
      expect(result).to.equal(1);
    });

    it('ESC00024 / CS00017 - calcula correctamente períodos de múltiples días', () => {
      // Arrange
      const entrada = new Date('2024-01-15T10:00:00');
      const salida  = new Date('2024-01-17T15:30:00');

      // Act
      const result = (service as any).calcularHoras(entrada, salida);

      // Assert
      expect(result).to.equal(54);
    });

  });

});