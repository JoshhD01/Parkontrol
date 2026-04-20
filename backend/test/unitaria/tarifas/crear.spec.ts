import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from './tarifas.service.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('TarifasService - crear', () => {

  const sandbox = sinon.createSandbox();

  // ── Teardown ──────────────────────────────────────────────────────────────
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // crear()
  // ==========================================================================
  describe('crear', () => {

    it('CS0001 - crea tarifa correctamente cuando tipoVehiculo existe', async () => {
      // Arrange
      const { service, tarifaRepository, tipoVehiculoRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero:      1,
        idTipoVehiculo:     1,
        precioFraccionHora: 1000,
        precioHoraAdicional: 500,
      };

      const parqueaderoMock   = { id: 1 };
      const tipoVehiculoMock  = { id: 1 };
      const tarifaMock        = { id: 10, parqueadero: parqueaderoMock, tipoVehiculo: tipoVehiculoMock, ...dto };

      parqueaderosService.findParqueaderoById.resolves(parqueaderoMock);
      tipoVehiculoRepository.findOne.resolves(tipoVehiculoMock);
      tarifaRepository.create.returns(tarifaMock);
      tarifaRepository.save.resolves(tarifaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(parqueaderosService.findParqueaderoById.calledWith(1)).to.be.true;

      expect(tipoVehiculoRepository.findOne.calledWith({ where: { id: 1 } })).to.be.true;

      expect(
        tarifaRepository.create.calledWith(
          sinon.match({
            parqueadero:         parqueaderoMock,
            tipoVehiculo:        tipoVehiculoMock,
            precioFraccionHora:  1000,
            precioHoraAdicional: 500,
          }),
        ),
      ).to.be.true;

      expect(tarifaRepository.save.calledWith(tarifaMock)).to.be.true;

      expect(result)
        .to.exist
        .and.to.equal(tarifaMock);
    });

    it('CS0002 - lanza NotFoundException cuando tipoVehiculo NO existe', async () => {
      // Arrange
      const { service, tarifaRepository, tipoVehiculoRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero:       1,
        idTipoVehiculo:      99,
        precioFraccionHora:  1000,
        precioHoraAdicional: 500,
      };

      const parqueaderoMock = { id: 1 };

      parqueaderosService.findParqueaderoById.resolves(parqueaderoMock);
      tipoVehiculoRepository.findOne.resolves(null);

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);

      expect(parqueaderosService.findParqueaderoById.calledWith(1)).to.be.true;

      expect(tipoVehiculoRepository.findOne.calledWith({ where: { id: 99 } })).to.be.true;

      expect(tarifaRepository.create.called).to.be.false;

      expect(tarifaRepository.save.called).to.be.false;
    });

  });

});