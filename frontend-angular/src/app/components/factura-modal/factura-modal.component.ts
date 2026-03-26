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
		private readonly fb: FormBuilder,
		private readonly dialogRef: MatDialogRef<FacturaModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { idEmpresa?: number; clientes?: any[] }
	) {
			this.facturaForm = this.fb.group({
				idPago: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
				idClienteFactura: [null],
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
		};
		this.dialogRef.close(dto);
	}
}
