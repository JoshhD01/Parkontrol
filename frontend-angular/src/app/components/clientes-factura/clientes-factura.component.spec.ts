import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ClientesFacturaComponent } from './clientes-factura.component';
import { CrearClienteFacturaDto } from '../../models/facturacion.model';
import { of } from 'rxjs';

/**
 * Tests para ClientesFacturaComponent
 * Patrón AAA (Arrange, Act, Assert)
 * Principios FIRST con mocks de MatDialog
 */

describe('ClientesFacturaComponent', () => {
  let component: ClientesFacturaComponent;
  let fixture: ComponentFixture<ClientesFacturaComponent>;
  let matDialogMock: jasmine.SpyObj<MatDialog>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(async () => {
    // Arrange: Crear mocks para MatDialog y DialogRef
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      imports: [ClientesFacturaComponent],
      providers: [{ provide: MatDialog, useValue: matDialogMock }],
    });

    fixture = TestBed.createComponent(ClientesFacturaComponent);
    component = fixture.componentInstance;
    matDialogMock.open.and.returnValue(dialogRefMock);
  });

  describe('[FAST] Inicialización', () => {
    it('F1 debe inicializar con clientes vacía por defecto', () => {
      // Assert
      expect(component.clientes).toEqual([]);
    });

    it('F2 debe tener columnas correctas para tabla Material', () => {
      // Assert
      expect(component.displayedColumns).toContain('id');
      expect(component.displayedColumns).toContain('tipoDocumento');
      expect(component.displayedColumns).toContain('numeroDocumento');
      expect(component.displayedColumns).toContain('correo');
    });

    it('F3 debe tener EventEmitter clienteCreado', () => {
      // Assert
      expect(component.clienteCreado).toBeDefined();
      expect(component.clienteCreado.emit).toBeDefined();
    });
  });

  describe('[INDEPENDENT] abrirModalNuevoCliente', () => {
    it('I1 debe abrir modal de nuevo cliente con ancho correcto', () => {
      // Arrange
      dialogRefMock.afterClosed.and.returnValue(of(undefined));

      // Act
      component.abrirModalNuevoCliente();

      // Assert
      expect(matDialogMock.open).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          width: '500px',
          data: {},
        })
      );
    });

    it('I2 debe emitir evento cuando modal retorna DTO válido', (done) => {
      // Arrange
      const dtoEsperado: CrearClienteFacturaDto = {
        tipoDocumento: 'CC',
        numeroDocumento: '123456789',
        correo: 'cliente@test.com',
      };

      dialogRefMock.afterClosed.and.returnValue(of(dtoEsperado));
      const spyEmit = spyOn(component.clienteCreado, 'emit');

      // Act
      component.abrirModalNuevoCliente();

      // Assert
      setTimeout(() => {
        expect(spyEmit).toHaveBeenCalledWith(dtoEsperado);
        done();
      }, 0);
    });

    it('I3 no debe emitir si modal cierra sin datos (undefined)', (done) => {
      // Arrange
      dialogRefMock.afterClosed.and.returnValue(of(undefined));
      const spyEmit = spyOn(component.clienteCreado, 'emit');

      // Act
      component.abrirModalNuevoCliente();

      // Assert
      setTimeout(() => {
        expect(spyEmit).not.toHaveBeenCalled();
        done();
      }, 0);
    });

    it('I4 no debe emitir si modal es cancelado (null)', (done) => {
      // Arrange
      dialogRefMock.afterClosed.and.returnValue(of(null));
      const spyEmit = spyOn(component.clienteCreado, 'emit');

      // Act
      component.abrirModalNuevoCliente();

      // Assert
      setTimeout(() => {
        expect(spyEmit).not.toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('[REPEATABLE] Input Clientes', () => {
    it('R1 debe aceptar array de clientes por Input', () => {
      // Arrange
      const clientesFake = [
        {
          id: 1,
          tipoDocumento: 'CC',
          numeroDocumento: '111',
          correo: 'cliente1@test.com',
        },
        {
          id: 2,
          tipoDocumento: 'NIT',
          numeroDocumento: '222',
          correo: 'cliente2@test.com',
        },
      ] as any[];

      // Act
      component.clientes = clientesFake;

      // Assert
      expect(component.clientes.length).toBe(2);
      expect(component.clientes[0].tipoDocumento).toBe('CC');
      expect(component.clientes[1].numeroDocumento).toBe('222');
    });

    it('R2 debe renderizar correctamente clientes asignados', () => {
      // Arrange
      component.clientes = [
        {
          id: 5,
          tipoDocumento: 'CC',
          numeroDocumento: '555',
          correo: 'test@test.com',
        },
      ] as any[];

      fixture.detectChanges();

      // Assert
      expect(component.clientes).toHaveSize(1);
      expect(component.clientes[0].id).toBe(5);
    });
  });

  describe('[SELF-CHECKING] Modal Behavior', () => {
    it('S1 debe siempre pasar data: {} al abrir modal', () => {
      // Arrange
      dialogRefMock.afterClosed.and.returnValue(of(undefined));

      // Act
      component.abrirModalNuevoCliente();

      // Assert
      const callArgs = matDialogMock.open.calls.mostRecent().args[1] as any;
      expect(callArgs.data).toEqual({});
    });

    it('S2 debe verificar que result no sea falsy antes de emitir', (done) => {
      // Arrange
      dialogRefMock.afterClosed.and.returnValue(of(false));
      const spyEmit = spyOn(component.clienteCreado, 'emit');

      // Act
      component.abrirModalNuevoCliente();

      // Assert
      setTimeout(() => {
        expect(spyEmit).not.toHaveBeenCalled();
        done();
      }, 0);
    });

    it('S3 debe emitir exactamente una vez cuando DTO válido', (done) => {
      // Arrange
      const dto: CrearClienteFacturaDto = {
        tipoDocumento: 'CC',
        numeroDocumento: '999',
        correo: 'test@test.com',
      };

      dialogRefMock.afterClosed.and.returnValue(of(dto));
      const spyEmit = spyOn(component.clienteCreado, 'emit');

      // Act
      component.abrirModalNuevoCliente();

      // Assert
      setTimeout(() => {
        expect(spyEmit).toHaveBeenCalledTimes(1);
        expect(spyEmit).toHaveBeenCalledWith(dto);
        done();
      }, 0);
    });
  });

  describe('[TIMELY] Modal Lifecycle', () => {
    it('T1 debe suscribirse a afterClosed() después de open()', (done) => {
      // Arrange
      dialogRefMock.afterClosed.and.returnValue(of(undefined));

      // Act
      component.abrirModalNuevoCliente();

      // Assert
      setTimeout(() => {
        expect(dialogRefMock.afterClosed).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('T2 debe llamar next en eventEmitter cuando hay resultado', (done) => {
      // Arrange
      const dto: CrearClienteFacturaDto = {
        tipoDocumento: 'CC',
        numeroDocumento: '555',
        correo: 'new@test.com',
      };

      dialogRefMock.afterClosed.and.returnValue(of(dto));

      // Act & Assert
      component.clienteCreado.subscribe((result) => {
        expect(result).toEqual(dto);
        done();
      });

      component.abrirModalNuevoCliente();
    });
  });
});
