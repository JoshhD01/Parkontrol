import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PagosService } from '../pagos.service';
import { MetodoPago } from 'src/shared/entities/metodo-pago.entity';
import { ReservasService } from 'src/reservas/reservas.service';
import { TarifasService } from 'src/tarifas/tarifas.service';
import { Pago } from '../entities/pago.entity';

//Prueba doble utilizada: Fake

class FakePagoRepository {
  private pagos: any[] = [];// guardar los pagos falsos en un arreglo 

  async findOne(condition: any) {
    const id = condition?.where?.id;
    return this.pagos.find(p => p.id === id) || null;
  } // Busca un pago por id desntro del arreglo(si lo encuentra lo devuelve si no devuelve null)  

  create(data: any) {
    return { id: Date.now(), ...data };
  }//Simula crear un nuevo pago.le asigna el id usando la fecha actual 

  async save(pago: any) {
    this.pagos.push(pago);
    return pago;
  }// Simula guardar el pago en la “base de datos”, aquí realmente lo mete al arreglo.

  getPagos() { return this.pagos; }
}// Sirve para mirar cuántos pagos se guardaron.

class FakeMetodoPagoRepository {
  private metodos = [{ id: 1, nombre: 'Efectivo' }];// Arranca con un método de pago ya existente(efectivo).

  async findOne(condition: any) {
    const id = condition?.where?.id;
    return this.metodos.find(m => m.id === id) || null;
  }// Busca un método de pago por id. 

  setMetodos(metodos: any[]) { this.metodos = metodos; }
}// Permite cambiar la lista de métodos de pago en una prueba.

class FakeReservasService {
  private reservas = new Map<number, any>();// Guarda las reservas falsas en memoria 

  constructor() {
    this.reservas.set(1, {
      id: 1,
      estado: 'ABIERTA',
      fechaEntrada: new Date('2024-01-15T10:00:00'),
      fechaSalida: new Date('2024-01-15T14:30:00'),
      celda: { id: 1, parqueadero: { id: 1 } },
      vehiculo: { id: 1, tipoVehiculo: { id: 1 } },
    });// Crea una reserva valida 
  }

  async findReservaById(id: number) {
    return this.reservas.get(id) || null;// Busca una reserva por id.
  }

  async finalizarReserva(id: number) {
    const reserva = this.reservas.get(id);
    if (!reserva) return null;
    if (!reserva.fechaSalida) reserva.fechaSalida = new Date();
    return reserva;
  }// Si la reserva no tiene fecha de salida, se la pone.

  setReserva(id: number, data: any) { this.reservas.set(id, data); }
}// Permite modificar una reserva para una prueba.(cambiar el estado, quitar la fecha de salida)

class FakeTarifasService {
  private tarifas = new Map<string, any>();

  constructor() {
    this.tarifas.set('1-1', { id: 1, precioFraccionHora: 5000, precioHoraAdicional: 4000 });
  }//Significa que existe una tarifa para el parqueadero 1 y tipo de vehiculo 1 

  async findByParqueaderoYTipo(parqueaderoId: number, tipoVehiculoId: number) {
    const key = `${parqueaderoId}-${tipoVehiculoId}`;
    return this.tarifas.get(key) || null;
  }// Busca la tarifa utilizando el parquedero y el tipo de vehiculo 

  setTarifa(key: string, tarifa: any) { this.tarifas.set(key, tarifa); }
}// Permite cambiar o borrar una tarifa para probar errores.

describe('PagosService - crear (Fake)', () => {// Ese bloque agrupa todas las pruebas del método crear() del servicio de pagos.
  let service: PagosService;//El servicio real 
  let fakePagoRepo: FakePagoRepository;//Repositorio y servicios falsos 
  let fakeMetodoPagoRepo: FakeMetodoPagoRepository;
  let fakeReservasService: FakeReservasService;
  let fakeTarifasService: FakeTarifasService;
  // Aqui se guarda lo que se va a usar en cada prueba.
  
  beforeEach(async () => {//Aqui se le dice que antes de cada prueba vuelve a prepara todo desde cero 
    fakePagoRepo = new FakePagoRepository();// volver a crear los Repositorio y servicios falsos 
    fakeMetodoPagoRepo = new FakeMetodoPagoRepository();
    fakeReservasService = new FakeReservasService();
    fakeTarifasService = new FakeTarifasService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [//Aqui nest crea el entorno para las pruebas 
        PagosService,// Este es el entorno real, pero lo que el servicio necesita es "falso"
        { provide: getRepositoryToken(Pago), useValue: fakePagoRepo },
        { provide: getRepositoryToken(MetodoPago), useValue: fakeMetodoPagoRepo },
        { provide: ReservasService, useValue: fakeReservasService },
        { provide: TarifasService, useValue: fakeTarifasService },
      ],
    }).compile();

    //Ya esta listo el servicio para ser probado
    service = module.get<PagosService>(PagosService);
    // Aqui no calculamos de verdad cada uno devuelve un numero(por que aqui solo importa el metodo crear)
    jest.spyOn(service as any, 'calcularHoras').mockReturnValue(5);// Devuelve 5
    jest.spyOn(service as any, 'calcularMonto').mockReturnValue(21000);// Devuelve 21000
  });

  // ESC00014 / CS00007 – Pago exitoso(camino feliz)
  it('ESC00014 / CS00007 - Debe crear un pago exitosamente', async () => {
    const dto = { idReserva: 1, idMetodoPago: 1 };//reserva y metodo valido 

    const resultado = await service.crear(dto);// Se llama al servicio 

    expect(resultado).toBeDefined();// verifica que si haya resultado 
    expect(resultado.monto).toBe(21000);// verifica que el monto si sea 21000
    expect(fakePagoRepo.getPagos().length).toBe(1);// pago si se guardo 
  });

  // ESC00015 / CS00008 – Reserva en estado inválido
  it('ESC00015 / CS00008 - Debe lanzar BadRequestException si la reserva no está ABIERTA', async () => {
    //Cambian el estado de la reserva a "cerrada"
    fakeReservasService.setReserva(1, { ...(await fakeReservasService.findReservaById(1)), estado: 'CERRADA' });
    const dto = { idReserva: 1, idMetodoPago: 1 };//metodo valido 

    await expect(service.crear(dto)).rejects.toThrow(BadRequestException);
    await expect(service.crear(dto)).rejects.toThrow('La reserva debe estar en estado ABIERTA');
    expect(fakePagoRepo.getPagos().length).toBe(0);// No guarde el pago 
  });

  // ESC00016 / CS00009 – Reserva sin fecha de salida
  it('ESC00016 / CS00009 - Debe lanzar BadRequestException si la reserva no tiene fecha de salida', async () => {
    //Cambian la fecha de salida a null 
    fakeReservasService.setReserva(1, { ...(await fakeReservasService.findReservaById(1)), fechaSalida: null });
    jest.spyOn(fakeReservasService, 'finalizarReserva').mockResolvedValue({ id: 1, fechaSalida: null });
    const dto = { idReserva: 1, idMetodoPago: 1 };

    await expect(service.crear(dto)).rejects.toThrow(BadRequestException);
    await expect(service.crear(dto)).rejects.toThrow('La reserva debe estar finalizada');
    expect(fakePagoRepo.getPagos().length).toBe(0);
  });

  // ESC00017 / CS00010 – Pago duplicado
  it('ESC00017 / CS00010 - Debe lanzar BadRequestException si ya existe un pago para la reserva', async () => {
    await fakePagoRepo.save({ id: 1, reserva: { id: 1 } });// Aquí meten manualmente un pago ya existente.
    const dto = { idReserva: 1, idMetodoPago: 1 };  

    await expect(service.crear(dto)).rejects.toThrow(BadRequestException);
    await expect(service.crear(dto)).rejects.toThrow('Ya existe un pago registrado para esta reserva');
    expect(fakePagoRepo.getPagos().length).toBe(1);
  });

  // ESC00018 / CS00011 – Método de pago inexistente
  it('ESC00018 / CS00011 - Debe lanzar NotFoundException si el método de pago no existe', async () => {
    fakeMetodoPagoRepo.setMetodos([]);// Vacian la lista de metodos de pago 
    const dto = { idReserva: 1, idMetodoPago: 999 };

    await expect(service.crear(dto)).rejects.toThrow(NotFoundException);
    await expect(service.crear(dto)).rejects.toThrow('No existe método de pago con id: 999');
    expect(fakePagoRepo.getPagos().length).toBe(0);
  });

  // ESC00019 / CS00012 – Tarifa inexistente
  it('ESC00019 / CS00012 - Debe lanzar NotFoundException si no existe tarifa configurada', async () => {
    fakeTarifasService.setTarifa('1-1', null);// Aquí hacen que no exista tarifa para ese parqueadero y tipo de vehículo.
    const dto = { idReserva: 1, idMetodoPago: 1 };

    await expect(service.crear(dto)).rejects.toThrow(NotFoundException);
    await expect(service.crear(dto)).rejects.toThrow('No existe tarifa configurada');
    expect(fakePagoRepo.getPagos().length).toBe(0);
  });

  // ESC00020 / CS00013 – Error al consultar reserva
  it('ESC00020 / CS00013 - Debe propagar error si falla la consulta de reserva', async () => {
    //Simula que fallo la busqueda en la BD 
    jest.spyOn(fakeReservasService, 'findReservaById').mockRejectedValue(new Error('Error DB'));
    const dto = { idReserva: 1, idMetodoPago: 1 };

    await expect(service.crear(dto)).rejects.toThrow('Error DB');
    expect(fakePagoRepo.getPagos().length).toBe(0);
  });
});