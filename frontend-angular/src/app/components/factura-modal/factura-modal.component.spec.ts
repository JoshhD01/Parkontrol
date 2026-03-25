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
      expect(component.facturaForm.get('emitirElectronica')).toBeDefined();
      expect(component.facturaForm.get('cufe')).toBeDefined();
      expect(component.facturaForm.get('correoElectronico')).toBeDefined();
    });

    it('F2 debe exponer data inyectada del modal', () => {
      expect(component.data.idEmpresa).toBe(1);
      expect(component.data.clientes?.length).toBe(1);
    });

    it('F3 debe iniciar inválido por idPago requerido', () => {
      component.facturaForm.reset({
        idPago: null,
        idClienteFactura: null,
        emitirElectronica: false,
        cufe: '',
        correoElectronico: '',
      });
      expect(component.facturaForm.invalid).toBeTrue();
    });
  });

  describe('[INDEPENDENT] Validaciones dinámicas', () => {
    it('I1 debe hacer requeridos cufe y correoElectronico cuando emitirElectronica=true', () => {
      component.facturaForm.get('emitirElectronica')?.setValue(true);

      const cufe = component.facturaForm.get('cufe');
      const correo = component.facturaForm.get('correoElectronico');

      cufe?.setValue('');
      correo?.setValue('');

      expect(cufe?.hasError('required')).toBeTrue();
      expect(correo?.hasError('required')).toBeTrue();
    });

    it('I2 debe limpiar validadores y valores al desactivar emitirElectronica', () => {
      component.facturaForm.patchValue({
        emitirElectronica: true,
        cufe: 'ABC',
        correoElectronico: 'ok@test.com',
      });

      component.facturaForm.get('emitirElectronica')?.setValue(false);

      expect(component.facturaForm.get('cufe')?.value).toBe('');
      expect(component.facturaForm.get('correoElectronico')?.value).toBe('');
      expect(component.facturaForm.get('cufe')?.errors).toBeNull();
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
        emitirElectronica: false,
      });

      component.onSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        idPago: 123,
        idClienteFactura: undefined,
        emitirElectronica: false,
        cufe: undefined,
        correoElectronico: undefined,
      });
    });

    it('R3 debe cerrar el modal con dto electrónica cuando aplica', () => {
      component.facturaForm.patchValue({
        idPago: '44',
        idClienteFactura: '7',
        emitirElectronica: true,
        cufe: 'CUFE-XYZ',
        correoElectronico: 'cliente@test.com',
      });

      component.onSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        idPago: 44,
        idClienteFactura: 7,
        emitirElectronica: true,
        cufe: 'CUFE-XYZ',
        correoElectronico: 'cliente@test.com',
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
