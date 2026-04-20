import { Test, TestingModule } from '@nestjs/testing';
import { PagosService } from 'src/service/pagos/pagos.service';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('PagosService - calcularMonto', () => {

  let service: PagosService;

  // ── Setup ─────────────────────────────────────────────────────────────────
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagosService],
    }).compile();

    service = module.get<PagosService>(PagosService);
  });

  // ==========================================================================
  // calcularMonto()
  // ==========================================================================
  describe('calcularMonto', () => {

    it('ESC00025 / CS00018 - cobra solo fracción para 1 hora o menos', () => {
      // Arrange
      const precioFraccion      = 5000;
      const precioHoraAdicional = 4000;

      // Act
      const result1 = (service as any).calcularMonto(1,   precioFraccion, precioHoraAdicional);
      const result2 = (service as any).calcularMonto(0.5, precioFraccion, precioHoraAdicional);

      // Assert
      expect(result1).to.equal(5000);
      expect(result2).to.equal(5000);
    });

    it('ESC00026 / CS00019 - calcula correctamente horas adicionales con precio adicional', () => {
      // Arrange / Act
      const result = (service as any).calcularMonto(3, 5000, 4000);

      // Assert
      expect(result).to.equal(5000 + 2 * 4000);
    });

    it('ESC00027 / CS00020 - usa precio fracción como adicional si no se especifica precio adicional', () => {
      // Arrange / Act
      const result = (service as any).calcularMonto(3, 5000);

      // Assert
      expect(result).to.equal(5000 + 2 * 5000);
    });

    it('ESC00028 / CS00021 - calcula correctamente con valores límite (redondeo de horas)', () => {
      // Arrange / Act
      const result = (service as any).calcularMonto(1.1, 1000, 800);

      // Assert
      expect(result).to.equal(1800);
    });

  });

});