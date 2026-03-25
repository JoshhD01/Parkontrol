import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FacturasListaComponent } from './facturas-lista.component';
import { CrearFacturaElectronicaDto } from '../../models/facturacion.model';
import { of } from 'rxjs';

/**
 * Tests para FacturasListaComponent
 * Patrón AAA (Arrange, Act, Assert)
 * Principios FIRST con mocks de MatDialog
 */

describe('FacturasListaComponent', () => {
  let component: FacturasListaComponent;
  let fixture: ComponentFixture<FacturasListaComponent>;
  let matDialogMock: jasmine.SpyObj<MatDialog>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(async () => {
    // Arrange: Crear mocks para MatDialog
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [FacturasListaComponent],
    })
      .overrideProvider(MatDialog, { useValue: matDialogMock })
      .compileComponents();

    fixture = TestBed.createComponent(FacturasListaComponent);
    component = fixture.componentInstance;
    matDialogMock.open.and.returnValue(dialogRefMock);
  });

  describe('[FAST] Inicialización', () => {
    it('F1 debe inicializar con facturas, idEmpresa y clientes vacíos por defecto', () => {
      // Assert
      expect(component.facturas).toEqual([]);
      expect(component.idEmpresa).toBeNull();
      expect(component.clientes).toEqual([]);
    });

    it('F2 debe tener columnas correctas para tabla Material', () => {
      // Assert
      expect(component.displayedColumns).toContain('id');
      expect(component.displayedColumns).toContain('idPago');
      expect(component.displayedColumns).toContain('cufe');
      expect(component.displayedColumns).toContain('enviada');
    });
  });

  describe('[INDEPENDENT] abrirModalNuevaFactura', () => {
    it('I1 debe abrir modal con datos de empresa y clientes', () => {
      // Arrange
      component.idEmpresa = 5;
      component.clientes = [{ id: 1, correo: 'test@test.com' }];
      dialogRefMock.afterClosed.and.returnValue(of(undefined));

      // Act
      component.abrirModalNuevaFactura();

      // Assert
      expect(matDialogMock.open).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          width: '600px',
          data: {
            idEmpresa: 5,
            clientes: component.clientes,
          },
        })
      );
    });

    it('I2 debe emitir evento cuando modal retorna DTO válido', (done) => {
      // Arrange
      const dtoEsperado: CrearFacturaElectronicaDto = {
        idPago: 100,
        idClienteFactura: 5,
        emitirElectronica: true,
        cufe: 'NF-100-123',
      };

      dialogRefMock.afterClosed.and.returnValue(of(dtoEsperado));
      const spyEmit = spyOn(component.crearFactura, 'emit');

      // Act
      component.abrirModalNuevaFactura();

      // Assert
      setTimeout(() => {
        expect(spyEmit).toHaveBeenCalledWith(dtoEsperado);
        done();
      }, 0);
    });

    it('I3 no debe emitir si modal cierra sin datos', (done) => {
      // Arrange
      dialogRefMock.afterClosed.and.returnValue(of(undefined));
      const spyEmit = spyOn(component.crearFactura, 'emit');

      // Act
      component.abrirModalNuevaFactura();

      // Assert
      setTimeout(() => {
        expect(spyEmit).not.toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('[REPEATABLE] Inputs y Outputs', () => {
    it('R1 debe aceptar array de facturas por Input', () => {
      // Arrange
      const facturasFake = [
        { id: 1, idPago: 10 },
        { id: 2, idPago: 11 },
      ] as any[];

      // Act
      component.facturas = facturasFake;

      // Assert
      expect(component.facturas.length).toBe(2);
      expect(component.facturas[0].idPago).toBe(10);
    });

    it('R2 debe aceptar idEmpresa por Input', () => {
      // Act
      component.idEmpresa = 999;

      // Assert
      expect(component.idEmpresa).toBe(999);
    });

    it('R3 Output crearFactura debe ser EventEmitter', () => {
      // Assert
      expect(component.crearFactura).toBeDefined();
      expect(component.crearFactura.emit).toBeDefined();
    });
  });

  describe('[SELF-CHECKING] Modal Data Passing', () => {
    it('S1 debe pasar idEmpresa null si no está definido', () => {
      // Arrange
      component.idEmpresa = null;
      component.clientes = [];
      dialogRefMock.afterClosed.and.returnValue(of(undefined));

      // Act
      component.abrirModalNuevaFactura();

      // Assert
      const callArgs = matDialogMock.open.calls.mostRecent().args[1] as any;
      expect(callArgs.data.idEmpresa).toBeNull();
    });

    it('S2 debe pasar clientes en data del modal', () => {
      // Arrange
      const clientesFake = [
        { id: 1, nombre: 'Cliente A' },
        { id: 2, nombre: 'Cliente B' },
      ];
      component.clientes = clientesFake;
      component.idEmpresa = 1;
      dialogRefMock.afterClosed.and.returnValue(of(undefined));

      // Act
      component.abrirModalNuevaFactura();

      // Assert
      const callArgs = matDialogMock.open.calls.mostRecent().args[1] as any;
      expect(callArgs.data.clientes).toEqual(clientesFake);
    });
  });
});
