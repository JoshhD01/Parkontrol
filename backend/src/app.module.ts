import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EmpresasModule } from './entities/empresas/empresas.module';
import { UsuariosModule } from './entities/usuarios/usuarios.module';
import { ParqueaderosModule } from './entities/parqueaderos/parqueaderos.module';
import { SharedModule } from './entities/shared/shared.module';
import { AuthModule } from './entities/auth/auth.module';
import { CeldasModule } from './entities/celdas/celdas.module';
import { VehiculosModule } from './entities/vehiculos/vehiculos.module';
import { ReservasModule } from './entities/reservas/reservas.module';
import { TarifasModule } from './entities/tarifas/tarifas.module';
import { PagosModule } from './entities/pagos/pagos.module';
import { FacturacionModule } from './entities/facturacion/facturacion.module';
import { ReportesModule } from './entities/reportes/reportes.module';
import { VistasModule } from './entities/vistas/vistas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const supabaseDbUrl = configService.get<string>('SUPABASE_DB_URL');
        const dbSync = configService.get<string>('DB_SYNC') === 'true';

        if (!supabaseDbUrl) {
          throw new Error(
            'Falta SUPABASE_DB_URL en variables de entorno. Este proyecto usa únicamente Postgres/Supabase.',
          );
        }

        return {
          type: 'postgres',
          url: supabaseDbUrl,
          synchronize: dbSync,
          autoLoadEntities: true,
          logging: true,
          retryAttempts: 20,
          retryDelay: 3000,
          connectTimeoutMS: 15000,
          ssl: { rejectUnauthorized: false },
          extra: {
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
            connectionTimeoutMillis: 15000,
          },
        };
      },
    }),
    SharedModule,
    AuthModule,
    EmpresasModule,
    UsuariosModule,
    ParqueaderosModule,
    CeldasModule,
    VehiculosModule,
    TarifasModule,
    ReservasModule,
    PagosModule,
    FacturacionModule,
    ReportesModule,
    VistasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
