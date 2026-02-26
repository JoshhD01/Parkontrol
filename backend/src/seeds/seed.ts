import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import {
  DataSource,
  DataSourceOptions,
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
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
import { ClienteAuth } from '../auth/entities/cliente-auth.entity';
import { Periodo } from '../shared/entities/periodo.entity';
import { Reporte } from '../reportes/entities/reporte.entity';

const supabaseDbUrl = process.env.SUPABASE_DB_URL;

if (!supabaseDbUrl) {
  throw new Error(
    'Falta SUPABASE_DB_URL. El seed está configurado únicamente para Postgres/Supabase.',
  );
}

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: supabaseDbUrl,
  synchronize: false,
  logging: false,
  ssl: { rejectUnauthorized: false },
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
    ClienteAuth,
    FacturaElectronica,
    Periodo,
    Reporte,
  ],
};

const dataSource = new DataSource(dataSourceOptions);

async function findOrCreate<T extends ObjectLiteral>(
  repo: Repository<T>,
  where: FindOptionsWhere<T>,
  payload: DeepPartial<T>,
): Promise<T> {
  const existing = await repo.findOne({ where });
  if (existing) return existing;
  const entity = repo.create(payload);
  return await repo.save(entity);
}

async function hash(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function run(): Promise<void> {
  console.log('Inicializando conexión para seed...');
  await dataSource.initialize();

  const empresaRepo = dataSource.getRepository(Empresa);
  const rolRepo = dataSource.getRepository(Rol);
  const usuarioRepo = dataSource.getRepository(Usuario);
  const parqueRepo = dataSource.getRepository(Parqueadero);
  const tipoCeldaRepo = dataSource.getRepository(TipoCelda);
  const sensorRepo = dataSource.getRepository(Sensor);
  const celdaRepo = dataSource.getRepository(Celda);
  const tipoVehRepo = dataSource.getRepository(TipoVehiculo);
  const vehiculoRepo = dataSource.getRepository(Vehiculo);
  const tarifaRepo = dataSource.getRepository(Tarifa);
  const reservaRepo = dataSource.getRepository(Reserva);
  const metodoPagoRepo = dataSource.getRepository(MetodoPago);
  const pagoRepo = dataSource.getRepository(Pago);
  const clienteRepo = dataSource.getRepository(ClienteFactura);
  const clienteAuthRepo = dataSource.getRepository(ClienteAuth);
  const facturaRepo = dataSource.getRepository(FacturaElectronica);
  const periodoRepo = dataSource.getRepository(Periodo);
  const reporteRepo = dataSource.getRepository(Reporte);

  const empresa1 = await findOrCreate(empresaRepo, { nombre: 'PARK ALFA' }, { nombre: 'PARK ALFA' });
  const empresa2 = await findOrCreate(empresaRepo, { nombre: 'PARK BETA' }, { nombre: 'PARK BETA' });
  const empresa3 = await findOrCreate(empresaRepo, { nombre: 'PARK GAMA' }, { nombre: 'PARK GAMA' });

  const rolAdmin = await findOrCreate(rolRepo, { nombre: RoleEnum.ADMIN }, { nombre: RoleEnum.ADMIN });
  const rolOperador = await findOrCreate(rolRepo, { nombre: RoleEnum.OPERADOR }, { nombre: RoleEnum.OPERADOR });

  const admin1 = await findOrCreate(
    usuarioRepo,
    { correo: 'admin1@parkontrol.com' },
    {
      nombre: 'Admin Uno',
      correo: 'admin1@parkontrol.com',
      contrasena: await hash('Admin1234'),
      rol: rolAdmin,
      empresa: empresa1,
    },
  );
  await findOrCreate(
    usuarioRepo,
    { correo: 'operador1@parkontrol.com' },
    {
      nombre: 'Operador Uno',
      correo: 'operador1@parkontrol.com',
      contrasena: await hash('Oper1234'),
      rol: rolOperador,
      empresa: empresa1,
    },
  );
  await findOrCreate(
    usuarioRepo,
    { correo: 'operador2@parkontrol.com' },
    {
      nombre: 'Operador Dos',
      correo: 'operador2@parkontrol.com',
      contrasena: await hash('Oper1234'),
      rol: rolOperador,
      empresa: empresa2,
    },
  );

  const parque1 = await findOrCreate(
    parqueRepo,
    { nombre: 'ALFA CENTRO' },
    { nombre: 'ALFA CENTRO', capacidadTotal: 80, ubicacion: 'Centro', empresa: empresa1 },
  );
  const parque2 = await findOrCreate(
    parqueRepo,
    { nombre: 'BETA NORTE' },
    { nombre: 'BETA NORTE', capacidadTotal: 60, ubicacion: 'Norte', empresa: empresa2 },
  );
  const parque3 = await findOrCreate(
    parqueRepo,
    { nombre: 'GAMA SUR' },
    { nombre: 'GAMA SUR', capacidadTotal: 40, ubicacion: 'Sur', empresa: empresa3 },
  );

  const tipoCelda1 = await findOrCreate(tipoCeldaRepo, { nombre: 'PARTICULAR' }, { nombre: 'PARTICULAR' });
  const tipoCelda2 = await findOrCreate(tipoCeldaRepo, { nombre: 'MOTO' }, { nombre: 'MOTO' });
  const tipoCelda3 = await findOrCreate(tipoCeldaRepo, { nombre: 'DISCAPACITADO' }, { nombre: 'DISCAPACITADO' });

  const sensor1 = await findOrCreate(sensorRepo, { descripcion: 'Sensor A1' }, { descripcion: 'Sensor A1' });
  const sensor2 = await findOrCreate(sensorRepo, { descripcion: 'Sensor B1' }, { descripcion: 'Sensor B1' });
  const sensor3 = await findOrCreate(sensorRepo, { descripcion: 'Sensor C1' }, { descripcion: 'Sensor C1' });

  const celda1 = await findOrCreate(
    celdaRepo,
    { parqueadero: { id: parque1.id }, sensor: { id: sensor1.id } },
    {
      estado: 'LIBRE',
      ultimoCambioEstado: new Date(),
      parqueadero: parque1,
      tipoCelda: tipoCelda1,
      sensor: sensor1,
    },
  );
  const celda2 = await findOrCreate(
    celdaRepo,
    { parqueadero: { id: parque2.id }, sensor: { id: sensor2.id } },
    {
      estado: 'LIBRE',
      ultimoCambioEstado: new Date(),
      parqueadero: parque2,
      tipoCelda: tipoCelda2,
      sensor: sensor2,
    },
  );
  const celda3 = await findOrCreate(
    celdaRepo,
    { parqueadero: { id: parque3.id }, sensor: { id: sensor3.id } },
    {
      estado: 'LIBRE',
      ultimoCambioEstado: new Date(),
      parqueadero: parque3,
      tipoCelda: tipoCelda3,
      sensor: sensor3,
    },
  );

  const tipoVeh1 = await findOrCreate(tipoVehRepo, { nombre: 'PARTICULAR' }, { nombre: 'PARTICULAR' });
  const tipoVeh2 = await findOrCreate(tipoVehRepo, { nombre: 'MOTO' }, { nombre: 'MOTO' });
  const tipoVeh3 = await findOrCreate(tipoVehRepo, { nombre: 'CAMIONETA' }, { nombre: 'CAMIONETA' });

  const veh1 = await findOrCreate(vehiculoRepo, { placa: 'AAA111' }, { placa: 'AAA111', tipoVehiculo: tipoVeh1 });
  const veh2 = await findOrCreate(vehiculoRepo, { placa: 'BBB222' }, { placa: 'BBB222', tipoVehiculo: tipoVeh2 });
  const veh3 = await findOrCreate(vehiculoRepo, { placa: 'CCC333' }, { placa: 'CCC333', tipoVehiculo: tipoVeh3 });

  await findOrCreate(
    tarifaRepo,
    { parqueadero: { id: parque1.id }, tipoVehiculo: { id: tipoVeh1.id } },
    {
      precioFraccionHora: 3000,
      precioHoraAdicional: 2500,
      parqueadero: parque1,
      tipoVehiculo: tipoVeh1,
    },
  );
  await findOrCreate(
    tarifaRepo,
    { parqueadero: { id: parque2.id }, tipoVehiculo: { id: tipoVeh2.id } },
    {
      precioFraccionHora: 1800,
      precioHoraAdicional: 1500,
      parqueadero: parque2,
      tipoVehiculo: tipoVeh2,
    },
  );
  await findOrCreate(
    tarifaRepo,
    { parqueadero: { id: parque3.id }, tipoVehiculo: { id: tipoVeh3.id } },
    {
      precioFraccionHora: 4000,
      precioHoraAdicional: 3500,
      parqueadero: parque3,
      tipoVehiculo: tipoVeh3,
    },
  );

  const cliente1 = await findOrCreate(
    clienteRepo,
    { numeroDocumento: '1001001' },
    {
      tipoDocumento: 'CC',
      numeroDocumento: '1001001',
      correo: 'cliente1@parkontrol.com',
      usuario: admin1,
    },
  );
  const cliente2 = await findOrCreate(
    clienteRepo,
    { numeroDocumento: '2002002' },
    {
      tipoDocumento: 'CC',
      numeroDocumento: '2002002',
      correo: 'cliente2@parkontrol.com',
    },
  );
  const cliente3 = await findOrCreate(
    clienteRepo,
    { numeroDocumento: '3003003' },
    {
      tipoDocumento: 'NIT',
      numeroDocumento: '3003003',
      correo: 'cliente3@parkontrol.com',
    },
  );

  await findOrCreate(
    clienteAuthRepo,
    { correo: 'cliente1@parkontrol.com' },
    {
      clienteFactura: cliente1,
      correo: 'cliente1@parkontrol.com',
      contrasenaHash: await hash('Cliente1234'),
      activo: true,
    },
  );
  await findOrCreate(
    clienteAuthRepo,
    { correo: 'cliente2@parkontrol.com' },
    {
      clienteFactura: cliente2,
      correo: 'cliente2@parkontrol.com',
      contrasenaHash: await hash('Cliente1234'),
      activo: true,
    },
  );
  await findOrCreate(
    clienteAuthRepo,
    { correo: 'cliente3@parkontrol.com' },
    {
      clienteFactura: cliente3,
      correo: 'cliente3@parkontrol.com',
      contrasenaHash: await hash('Cliente1234'),
      activo: true,
    },
  );

  const fechaBase = new Date('2026-02-20T08:00:00.000Z');

  const reserva1 = await findOrCreate(
    reservaRepo,
    { vehiculo: { id: veh1.id }, fechaEntrada: fechaBase },
    {
      fechaEntrada: fechaBase,
      fechaSalida: null as unknown as Date,
      estado: 'ABIERTA',
      vehiculo: veh1,
      celda: celda1,
      clienteFactura: cliente1,
    },
  );

  const reserva2Fecha = new Date('2026-02-20T10:00:00.000Z');
  const reserva2 = await findOrCreate(
    reservaRepo,
    { vehiculo: { id: veh2.id }, fechaEntrada: reserva2Fecha },
    {
      fechaEntrada: reserva2Fecha,
      fechaSalida: new Date('2026-02-20T12:00:00.000Z'),
      estado: 'CERRADA',
      vehiculo: veh2,
      celda: celda2,
      clienteFactura: cliente2,
    },
  );

  const reserva3Fecha = new Date('2026-02-20T14:00:00.000Z');
  const reserva3 = await findOrCreate(
    reservaRepo,
    { vehiculo: { id: veh3.id }, fechaEntrada: reserva3Fecha },
    {
      fechaEntrada: reserva3Fecha,
      fechaSalida: new Date('2026-02-20T15:30:00.000Z'),
      estado: 'CERRADA',
      vehiculo: veh3,
      celda: celda3,
      clienteFactura: cliente3,
    },
  );

  const metodo1 = await findOrCreate(metodoPagoRepo, { nombre: 'EFECTIVO' }, { nombre: 'EFECTIVO' });
  const metodo2 = await findOrCreate(metodoPagoRepo, { nombre: 'TARJETA' }, { nombre: 'TARJETA' });
  const metodo3 = await findOrCreate(metodoPagoRepo, { nombre: 'TRANSFERENCIA' }, { nombre: 'TRANSFERENCIA' });

  const pago1 = await findOrCreate(
    pagoRepo,
    { reserva: { id: reserva1.id }, metodoPago: { id: metodo1.id } },
    {
      monto: 8000,
      fechaPago: new Date('2026-02-20T09:10:00.000Z'),
      reserva: reserva1,
      metodoPago: metodo1,
    },
  );
  const pago2 = await findOrCreate(
    pagoRepo,
    { reserva: { id: reserva2.id }, metodoPago: { id: metodo2.id } },
    {
      monto: 11000,
      fechaPago: new Date('2026-02-20T12:10:00.000Z'),
      reserva: reserva2,
      metodoPago: metodo2,
    },
  );
  const pago3 = await findOrCreate(
    pagoRepo,
    { reserva: { id: reserva3.id }, metodoPago: { id: metodo3.id } },
    {
      monto: 14500,
      fechaPago: new Date('2026-02-20T15:40:00.000Z'),
      reserva: reserva3,
      metodoPago: metodo3,
    },
  );

  await findOrCreate(
    facturaRepo,
    { cufe: 'CUFE-SEED-001' },
    {
      cufe: 'CUFE-SEED-001',
      urlPdf: 'https://example.com/facturas/seed-1.pdf',
      enviada: 'Y',
      fechaCreacion: new Date('2026-02-20T09:20:00.000Z'),
      pago: pago1,
      clienteFactura: cliente1,
    },
  );
  await findOrCreate(
    facturaRepo,
    { cufe: 'CUFE-SEED-002' },
    {
      cufe: 'CUFE-SEED-002',
      urlPdf: 'https://example.com/facturas/seed-2.pdf',
      enviada: 'N',
      fechaCreacion: new Date('2026-02-20T12:20:00.000Z'),
      pago: pago2,
      clienteFactura: cliente2,
    },
  );
  await findOrCreate(
    facturaRepo,
    { cufe: 'CUFE-SEED-003' },
    {
      cufe: 'CUFE-SEED-003',
      urlPdf: 'https://example.com/facturas/seed-3.pdf',
      enviada: 'Y',
      fechaCreacion: new Date('2026-02-20T15:50:00.000Z'),
      pago: pago3,
      clienteFactura: cliente3,
    },
  );

  const periodo1 = await findOrCreate(periodoRepo, { nombre: 'DIARIO' }, { nombre: 'DIARIO' });
  const periodo2 = await findOrCreate(periodoRepo, { nombre: 'SEMANAL' }, { nombre: 'SEMANAL' });
  const periodo3 = await findOrCreate(periodoRepo, { nombre: 'MENSUAL' }, { nombre: 'MENSUAL' });

  await findOrCreate(
    reporteRepo,
    { urlArchivo: 'https://example.com/reportes/reporte-seed-1.pdf' },
    {
      urlArchivo: 'https://example.com/reportes/reporte-seed-1.pdf',
      parqueadero: parque1,
      periodo: periodo1,
    },
  );
  await findOrCreate(
    reporteRepo,
    { urlArchivo: 'https://example.com/reportes/reporte-seed-2.pdf' },
    {
      urlArchivo: 'https://example.com/reportes/reporte-seed-2.pdf',
      parqueadero: parque2,
      periodo: periodo2,
    },
  );
  await findOrCreate(
    reporteRepo,
    { urlArchivo: 'https://example.com/reportes/reporte-seed-3.pdf' },
    {
      urlArchivo: 'https://example.com/reportes/reporte-seed-3.pdf',
      parqueadero: parque3,
      periodo: periodo3,
    },
  );

  console.log('✅ Seed completado con mínimo 3 registros por módulo clave.');
  console.log('Credenciales de prueba:');
  console.log('- Admin: admin1@parkontrol.com / Admin1234');
  console.log('- Operador: operador1@parkontrol.com / Oper1234');
  console.log('- Cliente: cliente1@parkontrol.com / Cliente1234');

  await dataSource.destroy();
}

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('❌ Error ejecutando seed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  });
