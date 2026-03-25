import { PagosService } from '../pagos.service';
import { createTestingModule } from './pagos.service.spec';

// pruba doble: Spy

//Esto agrupa todas las pruebas relacionadas con findByCliente()
describe('PagosService - findByCliente (Spy)', () => {
  let service: PagosService;// Servicio real 
  let pagoRepository: any;// Repositorio falsos 
  let queryBuilder: any;// query falso a la BD 
  let leftJoinAndSelectSpy: jest.SpyInstance;
  let leftJoinSpy: jest.SpyInstance;
  let whereSpy: jest.SpyInstance;
  let orWhereSpy: jest.SpyInstance;
  let orderBySpy: jest.SpyInstance;
  let getManySpy: jest.SpyInstance;

  //Aquí se crea el entorno de prueba y se obtiene: el servicio, el repositorio de pagos
  beforeEach(async () => {
    const module = await createTestingModule();
    service = module.service;
    pagoRepository = module.pagoRepository;

    // Esto simula el QueryBuilder de TypeORM: Es un objeto falso que imita cosas como: hacer joins, poner condiciones where, 
    // ordenar, obtener resultados
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    // cuando el servicio llame createQueryBuilder(), en vez del real, devuelve este objeto falso.
    pagoRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    // Crea espias para revisar si los metodos se  llamaron, cuantas veces, argumentos, en que orden 
    leftJoinAndSelectSpy = jest.spyOn(queryBuilder, 'leftJoinAndSelect');
    leftJoinSpy = jest.spyOn(queryBuilder, 'leftJoin');
    whereSpy = jest.spyOn(queryBuilder, 'where');
    orWhereSpy = jest.spyOn(queryBuilder, 'orWhere');
    orderBySpy = jest.spyOn(queryBuilder, 'orderBy');
    getManySpy = jest.spyOn(queryBuilder, 'getMany');
  });

  it('ESC00032 / CS00025 - Debe encontrar pagos por ID de cliente y correo', async () => {
    await service.findByCliente(1, 'test@test.com');// llama al metodo con el id cliente = 1 y su correo 

    //Esto verifica que el servicio inició la consulta sobre la tabla pago.
    expect(pagoRepository.createQueryBuilder).toHaveBeenCalledWith('pago');
    //Esto verifica que hizo 6 joins con selección.
    expect(leftJoinAndSelectSpy).toHaveBeenCalledTimes(6);
    //Aquí verifica que se haya unido la tabla o relación de clienteFactura.
    expect(leftJoinSpy).toHaveBeenCalledWith('reserva.clienteFactura', 'clienteFactura');
    //Esto verifica que la consulta filtre por el id del cliente.
    expect(whereSpy).toHaveBeenCalledWith(
      'clienteFactura.ID_CLIENTE_FACTURA = :idClienteFactura',
      { idClienteFactura: 1 },
    );
    //Verifica que busque tambien por el correo 
    expect(orWhereSpy).toHaveBeenCalled();
    //Esto verifica que ordene los pagos por fecha, del más reciente al más antiguo. 
    expect(orderBySpy).toHaveBeenCalledWith('pago.FECHA_PAGO', 'DESC');
    //Esto revisa que al final sí ejecute la consulta para traer muchos resultados.
    expect(getManySpy).toHaveBeenCalled();
  });

  it('ESC00033 / CS00026 - Debe normalizar el correo (trim y lowercase) para la búsqueda', async () => {
    await service.findByCliente(1, '  TEST@TEST.COM  ');//Correo invalido 

    expect(orWhereSpy).toHaveBeenCalledWith(
      'LOWER(TRIM(clienteFactura.CORREO)) = LOWER(TRIM(:correoNormalizado))',
      { correoNormalizado: 'test@test.com' },//Debe convertir el correo a uno valido 
    );
  });

  it('ESC00034 / CS00027 - Debe retornar array vacío si no hay pagos para el usuario', async () => {
    const resultado = await service.findByCliente(999, 'noexiste@test.com');
    expect(resultado).toEqual([]);
    expect(getManySpy).toHaveBeenCalled();
  });// Aquí simulan que no se encontró nada.Debe fallar 

  it('ESC00035 / CS00028 - Debe propagar error si la consulta falla', async () => {
    getManySpy.mockRejectedValue(new Error('Error DB'));
    // Error en la base de datos 
    await expect(service.findByCliente(1, 'test@test.com')).rejects.toThrow('Error DB');
  });

  it('ESC00036 / CS00029 - Debe construir correctamente la consulta SQL para buscar pagos', async () => {
    await service.findByCliente(1, 'test@test.com');

    // Verificamos el orden exacto de los joins
    expect(leftJoinAndSelectSpy).toHaveBeenNthCalledWith(1, 'pago.reserva', 'reserva');
    expect(leftJoinAndSelectSpy).toHaveBeenNthCalledWith(2, 'reserva.vehiculo', 'vehiculo');
    expect(leftJoinAndSelectSpy).toHaveBeenNthCalledWith(3, 'vehiculo.tipoVehiculo', 'tipoVehiculo');
    expect(leftJoinAndSelectSpy).toHaveBeenNthCalledWith(4, 'reserva.celda', 'celda');
    expect(leftJoinAndSelectSpy).toHaveBeenNthCalledWith(5, 'celda.parqueadero', 'parqueadero');
    expect(leftJoinAndSelectSpy).toHaveBeenNthCalledWith(6, 'pago.metodoPago', 'metodoPago');
    expect(leftJoinSpy).toHaveBeenCalledWith('reserva.clienteFactura', 'clienteFactura');
    expect(orderBySpy).toHaveBeenCalledWith('pago.FECHA_PAGO', 'DESC');
  });
});