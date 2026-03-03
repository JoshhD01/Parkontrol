import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CrearFacturaElectronicaDto } from '../../models/facturacion.model';

@Component({
	selector: 'app-factura-modal',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatIconModule,
		MatDialogModule,
	],
	templateUrl: './factura-modal.component.html',
    styleUrls: ['./factura-modal.component.scss']
})
export class FacturaModalComponent {
	facturaForm: any;

	constructor(
		private fb: FormBuilder,
		private dialogRef: MatDialogRef<FacturaModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { idEmpresa?: number; clientes?: any[] }
	) {
			this.facturaForm = this.fb.group({
				idPago: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
				idClienteFactura: [null],
				emitirElectronica: [false],
				cufe: [''],
				correoElectronico: [''],
			});

			this.facturaForm.get('emitirElectronica')?.valueChanges.subscribe((value: boolean) => {
				const cufeControl = this.facturaForm.get('cufe');
				const correoControl = this.facturaForm.get('correoElectronico');
				if (!cufeControl || !correoControl) return;

				if (value) {
					cufeControl.setValidators([Validators.required]);
					correoControl.setValidators([Validators.required, Validators.email]);
				} else {
					cufeControl.clearValidators();
					cufeControl.setValue('');
					correoControl.clearValidators();
					correoControl.setValue('');
				}

				cufeControl.updateValueAndValidity();
				correoControl.updateValueAndValidity();
			});
	}

	cancelar() {
		this.dialogRef.close();
	}

	onSubmit() {
		if (this.facturaForm.invalid) return;
		const idCliente = this.facturaForm.value.idClienteFactura;
		const dto: CrearFacturaElectronicaDto = {
			idPago: Number(this.facturaForm.value.idPago),
			idClienteFactura: idCliente ? Number(idCliente) : undefined,
			emitirElectronica: Boolean(this.facturaForm.value.emitirElectronica),
			cufe: this.facturaForm.value.emitirElectronica
				? this.facturaForm.value.cufe
				: undefined,
			correoElectronico: this.facturaForm.value.emitirElectronica
				? this.facturaForm.value.correoElectronico
				: undefined,
		};
		this.dialogRef.close(dto);
	}
}
