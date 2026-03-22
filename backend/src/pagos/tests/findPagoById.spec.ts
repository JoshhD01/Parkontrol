import { NotFoundException } from '@nestjs/common';
import { PagosService } from '../pagos.service';
import { createTestingModule } from './pagos.service.spec';

//Prueba doble: Mock 

//Esto agrupa todas las pruebas del método findPagoById().
describe('PagosService - findPagoById (Mock)', () => {
  let service: PagosService;//Servicio real 
  let pagoRepository: any;//repositorio falso

  //Se ejecuta antes de cada prueba. Crea el entorno de prueba, obtener el servicio, repositorio simulado 
  beforeEach(async () => {
    const module = await createTestingModule();
    service = module.service;
    pagoRepository = module.pagoRepository;
  });

  it('ESC00029 / CS00022 - Debe encontrar un pago por ID cuando existe', async () => {
    const mockPago = { id: 1, monto: 5000, fechaPago: new Date() };//Crea un pago falso
    pagoRepository.findOne.mockResolvedValue(mockPago);// Obliga al repositorio falso a devolver el pago falso

    const resultado = await service.findPagoById(1);//lama al metodo real 

    expect(resultado).toBe(mockPago);// Comprueban que el método devolvió el pago esperado
    expect(pagoRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: expect.arrayContaining(['reserva', 'metodoPago']),
    });// Aquí revisan que el servicio haya buscado el pago
  });

  it('ESC00030 / CS00023 - Debe lanzar NotFoundException si el pago no existe', async () => {
    pagoRepository.findOne.mockResolvedValue(null);// Simula que no encontro nada 

    await expect(service.findPagoById(999)).rejects.toThrow(NotFoundException);// Verifica que lanza error 
    // Esperan que además diga exactamente ese mensaje.
    await expect(service.findPagoById(999)).rejects.toThrow('No existe pago con id: 999');
  });

  it('ESC00031 / CS00024 - Debe propagar error si la consulta falla', async () => {
    const error = new Error('Error de base de datos');// Error en la BD 
    pagoRepository.findOne.mockRejectedValue(error);

    await expect(service.findPagoById(1)).rejects.toThrow('Error de base de datos');
  });
});