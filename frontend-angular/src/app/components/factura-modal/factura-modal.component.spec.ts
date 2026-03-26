import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FacturaModalComponent } from './factura-modal.component';

describe('FacturaModalComponent', () => {
  let component: FacturaModalComponent;
  let fixture: ComponentFixture<FacturaModalComponent>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<any>>;

  const mockDialogData = {
    idEmpresa: 1,
    clientes: [{ id: 10, numeroDocumento: '123', correo: 'x@test.com' }],
  };

  beforeEach(async () => {
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [FacturaModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FacturaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('[FAST] Inicialización', () => {
    it('F1 debe crear facturaForm con estructura esperada', () => {
      expect(component.facturaForm).toBeDefined();
      expect(component.facturaForm.get('idPago')).toBeDefined();
      expect(component.facturaForm.get('idClienteFactura')).toBeDefined();
    });

    it('F2 debe exponer data inyectada del modal', () => {
      expect(component.data.idEmpresa).toBe(1);
      expect(component.data.clientes?.length).toBe(1);
    });

    it('F3 debe iniciar inválido por idPago requerido', () => {
      component.facturaForm.reset({
        idPago: null,
        idClienteFactura: null,
      });
      expect(component.facturaForm.invalid).toBeTrue();
    });
  });

  describe('[REPEATABLE] onSubmit', () => {
    it('R1 no debe cerrar el modal si el formulario es inválido', () => {
      component.facturaForm.patchValue({
        idPago: null,
      });

      component.onSubmit();

      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });

    it('R2 debe cerrar el modal con dto mínimo válido', () => {
      component.facturaForm.patchValue({
        idPago: '123',
        idClienteFactura: null,
      });

      component.onSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        idPago: 123,
        idClienteFactura: undefined,
      });
    });

    it('R3 debe cerrar el modal con idClienteFactura numérico cuando aplica', () => {
      component.facturaForm.patchValue({
        idPago: '44',
        idClienteFactura: '7',
      });

      component.onSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        idPago: 44,
        idClienteFactura: 7,
      });
    });
  });

  describe('[SELF-CHECKING] cancelar', () => {
    it('S1 debe cerrar el modal sin payload', () => {
      component.cancelar();
      expect(dialogRefMock.close).toHaveBeenCalledWith();
    });
  });
});
