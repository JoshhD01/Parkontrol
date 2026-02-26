import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Rol, RoleEnum } from '../shared/entities/rol.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Parqueadero } from '../parqueaderos/entities/parqueadero.entity';
import { TipoCelda } from '../shared/entities/tipo-celda.entity';
import { Sensor } from '../shared/entities/sensor.entity';
import { Celda } from '../celdas/entities/celda.entity';
import { TipoVehiculo } from '../shared/entities/tipo-vehiculo.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { Tarifa } from '../tarifas/entities/tarifa.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { MetodoPago } from '../shared/entities/metodo-pago.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { ClienteFactura } from '../facturacion/entities/cliente-factura.entity';
import { FacturaElectronica } from '../facturacion/entities/factura-electronica.entity';
import { Periodo } from '../shared/entities/periodo.entity';
import { Reporte } from '../reportes/entities/reporte.entity';

const dataSource = new DataSource({
  type: 'oracle',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 1521,
  username: process.env.DB_USERNAME || 'parkontrol',
  password: process.env.DB_PASSWORD || 'parkontrol',
  sid: process.env.DB_SID || 'XE',
  synchronize: false,
  logging: false,
  entities: [
    Empresa,
    Rol,
    Usuario,
    Parqueadero,
    TipoCelda,
    Sensor,
    Celda,
    TipoVehiculo,
    Vehiculo,
    Tarifa,
    Reserva,
    MetodoPago,
    Pago,
    ClienteFactura,
    FacturaElectronica,
    Periodo,
    Reporte,
  ],
  extra: { poolMin: 1, poolMax: 2 },
});

async function saveMany<T>(repo: any, items: T[]) {
  for (const it of items) {
    await repo.save(it);
  }
}

async function run() {
  console.log('Initializing datasource...');
  await dataSource.initialize();
  console.log('Datasource initialized. Seeding data...');

  // Repositories
  const empresaRepo = dataSource.getRepository(Empresa);
  const rolRepo = dataSource.getRepository(Rol);
  const usuarioRepo = dataSource.getRepository(Usuario);
  const parqueRepo = dataSource.getRepository(Parqueadero);
  const tipoCeldaRepo = dataSource.getRepository(TipoCelda);
  const sensorRepo = dataSource.getRepository(Sensor);
  const celdaRepo = dataSource.getRepository(Celda);
  const tipoVehRepo = dataSource.getRepository(TipoVehiculo);
  const vehRepo = dataSource.getRepository(Vehiculo);
  const tarifaRepo = dataSource.getRepository(Tarifa);
  const reservaRepo = dataSource.getRepository(Reserva);
  const metodoPagoRepo = dataSource.getRepository(MetodoPago);
  const pagoRepo = dataSource.getRepository(Pago);
  const clienteRepo = dataSource.getRepository(ClienteFactura);
  const facturaRepo = dataSource.getRepository(FacturaElectronica);
  const periodoRepo = dataSource.getRepository(Periodo);
  const reporteRepo = dataSource.getRepository(Reporte);

  // 1) Empresas (3)
  const empresas: Empresa[] = [
    empresaRepo.create({ nombre: 'Empresa Alpha' }),
    empresaRepo.create({ nombre: 'Empresa Beta' }),
    empresaRepo.create({ nombre: 'Empresa Gamma' }),
  ];
  await saveMany(empresaRepo, empresas);

  // 2) Roles (3) - third role cast to any to bypass enum typing
  const roles: Rol[] = [
    rolRepo.create({ nombre: RoleEnum.ADMIN }),
    rolRepo.create({ nombre: RoleEnum.OPERADOR }),
    rolRepo.create({ nombre: 'GUEST' as any }),
  ];
  await saveMany(rolRepo, roles);

  // 3) Usuarios (3)
  const usuarios: Usuario[] = [
    usuarioRepo.create({
      nombre: 'Admin One',
      correo: 'admin1@example.com',
      contrasena: 'AdminPass1',
      rol: roles[0],
      empresa: empresas[0],
    }),
    usuarioRepo.create({
      nombre: 'Operator One',
      correo: 'operator1@example.com',
      contrasena: 'OperPass1',
      rol: roles[1],
      empresa: empresas[0],
    }),
    usuarioRepo.create({
      nombre: 'Operator Two',
      correo: 'operator2@example.com',
      contrasena: 'OperPass2',
      rol: roles[1],
      empresa: empresas[1],
    }),
  ];
  await saveMany(usuarioRepo, usuarios);

  // 4) MetodoPago (3)
  const metodos = [
    metodoPagoRepo.create({ nombre: 'CREDIT_CARD' }),
    metodoPagoRepo.create({ nombre: 'CASH' }),
    metodoPagoRepo.create({ nombre: 'MOBILE' }),
  ];
  await saveMany(metodoPagoRepo, metodos);

  // 5) TipoCelda (3)
  const tiposCelda = [
    tipoCeldaRepo.create({ nombre: 'NORMAL' }),
    tipoCeldaRepo.create({ nombre: 'VIP' }),
    tipoCeldaRepo.create({ nombre: 'MOTORBIKE' }),
  ];
  await saveMany(tipoCeldaRepo, tiposCelda);

  // 6) Sensors (3)
  const sensors = [
    sensorRepo.create({ descripcion: 'Sensor A' }),
    sensorRepo.create({ descripcion: 'Sensor B' }),
    sensorRepo.create({ descripcion: 'Sensor C' }),
  ];
  await saveMany(sensorRepo, sensors);

  // 7) Periodos (3)
  const periodos = [
    periodoRepo.create({ nombre: 'DAILY' }),
    periodoRepo.create({ nombre: 'WEEKLY' }),
    periodoRepo.create({ nombre: 'MONTHLY' }),
  ];
  await saveMany(periodoRepo, periodos);

  // 8) Parqueaderos (3)
  const parques = [
    parqueRepo.create({
      nombre: 'Central Lot',
      capacidadTotal: 100,
      ubicacion: 'Center St',
      empresa: empresas[0],
    }),
    parqueRepo.create({
      nombre: 'North Lot',
      capacidadTotal: 50,
      ubicacion: 'North Ave',
      empresa: empresas[0],
    }),
    parqueRepo.create({
      nombre: 'South Lot',
      capacidadTotal: 30,
      ubicacion: 'South Blvd',
      empresa: empresas[1],
    }),
  ];
  await saveMany(parqueRepo, parques);

  // 9) Celdas (3)
  const celdas = [
    celdaRepo.create({
      estado: 'DISPONIBLE',
      ultimoCambioEstado: new Date(),
      parqueadero: parques[0],
      tipoCelda: tiposCelda[0],
      sensor: sensors[0],
    }),
    celdaRepo.create({
      estado: 'OCUPADA',
      ultimoCambioEstado: new Date(),
      parqueadero: parques[0],
      tipoCelda: tiposCelda[1],
      sensor: sensors[1],
    }),
    celdaRepo.create({
      estado: 'DISPONIBLE',
      ultimoCambioEstado: new Date(),
      parqueadero: parques[1],
      tipoCelda: tiposCelda[2],
      sensor: sensors[2],
    }),
  ];
  await saveMany(celdaRepo, celdas);

  // 10) TipoVehiculo (3)
  const tiposVeh = [
    tipoVehRepo.create({ nombre: 'CAR' }),
    tipoVehRepo.create({ nombre: 'MOTORBIKE' }),
    tipoVehRepo.create({ nombre: 'TRUCK' }),
  ];
  await saveMany(tipoVehRepo, tiposVeh);

  // 11) Vehiculos (3)
  const vehs = [
    vehRepo.create({ placa: 'ABC123', tipoVehiculo: tiposVeh[0] }),
    vehRepo.create({ placa: 'XYZ789', tipoVehiculo: tiposVeh[1] }),
    vehRepo.create({ placa: 'TRK555', tipoVehiculo: tiposVeh[2] }),
  ];
  await saveMany(vehRepo, vehs);

  // 12) Tarifas (3)
  const tarifas = [
    tarifaRepo.create({
      precioFraccionHora: 2.5,
      precioHoraAdicional: 2.0,
      parqueadero: parques[0],
      tipoVehiculo: tiposVeh[0],
    }),
    tarifaRepo.create({
      precioFraccionHora: 1.5,
      precioHoraAdicional: 1.0,
      parqueadero: parques[0],
      tipoVehiculo: tiposVeh[1],
    }),
    tarifaRepo.create({
      precioFraccionHora: 5.0,
      precioHoraAdicional: 4.0,
      parqueadero: parques[2],
      tipoVehiculo: tiposVeh[2],
    }),
  ];
  await saveMany(tarifaRepo, tarifas);

  // 13) Reservas (3)
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000); // +1h
  const reservas = [
    reservaRepo.create({
      fechaEntrada: now,
      estado: 'ABIERTA',
      vehiculo: vehs[0],
      celda: celdas[0],
    } as any),
    reservaRepo.create({
      fechaEntrada: now,
      fechaSalida: later,
      estado: 'CERRADA',
      vehiculo: vehs[1],
      celda: celdas[1],
    } as any),
    reservaRepo.create({
      fechaEntrada: now,
      estado: 'ABIERTA',
      vehiculo: vehs[2],
      celda: celdas[2],
    } as any),
  ];
  await saveMany(reservaRepo, reservas);

  // 14) Pagos (3)
  const pagos = [
    pagoRepo.create({
      monto: 5.0,
      fechaPago: new Date(),
      reserva: reservas[1],
      metodoPago: metodos[0],
    } as any),
    pagoRepo.create({
      monto: 2.5,
      fechaPago: new Date(),
      reserva: reservas[1],
      metodoPago: metodos[1],
    } as any),
    pagoRepo.create({
      monto: 10.0,
      fechaPago: new Date(),
      reserva: reservas[2],
      metodoPago: metodos[2],
    } as any),
  ];
  await saveMany(pagoRepo, pagos);

  // 15) ClienteFactura (3)
  const clientes = [
    clienteRepo.create({
      tipoDocumento: 'CC',
      numeroDocumento: '1001',
      correo: 'c1@example.com',
    }),
    clienteRepo.create({
      tipoDocumento: 'NIT',
      numeroDocumento: '2002',
      correo: 'c2@example.com',
    }),
    clienteRepo.create({
      tipoDocumento: 'CC',
      numeroDocumento: '3003',
      correo: 'c3@example.com',
    }),
  ];
  await saveMany(clienteRepo, clientes);

  // 16) Facturas (3)
  const facturas = [
    facturaRepo.create({
      cufe: 'CUFE1',
      urlPdf: 'http://example.com/f1.pdf',
      enviada: 'Y',
      fechaCreacion: new Date(),
      pago: pagos[0],
      clienteFactura: clientes[0],
    } as any),
    facturaRepo.create({
      cufe: 'CUFE2',
      urlPdf: 'http://example.com/f2.pdf',
      enviada: 'N',
      fechaCreacion: new Date(),
      pago: pagos[1],
      clienteFactura: clientes[1],
    } as any),
    facturaRepo.create({
      cufe: 'CUFE3',
      urlPdf: 'http://example.com/f3.pdf',
      enviada: 'Y',
      fechaCreacion: new Date(),
      pago: pagos[2],
      clienteFactura: clientes[2],
    } as any),
  ];
  await saveMany(facturaRepo, facturas);

  // 17) Reportes (3)
  const reportes = [
    reporteRepo.create({
      urlArchivo: 'http://example.com/r1.pdf',
      parqueadero: parques[0],
      periodo: periodos[0],
    }),
    reporteRepo.create({
      urlArchivo: 'http://example.com/r2.pdf',
      parqueadero: parques[1],
      periodo: periodos[1],
    }),
    reporteRepo.create({
      urlArchivo: 'http://example.com/r3.pdf',
      parqueadero: parques[2],
      periodo: periodos[2],
    }),
  ];
  await saveMany(reporteRepo, reportes);

  console.log('Seeding finished.');
  await dataSource.destroy();
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
