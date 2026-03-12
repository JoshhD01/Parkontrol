import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EmpresasModule } from './empresas/empresas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ParqueaderosModule } from './parqueaderos/parqueaderos.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { CeldasModule } from './celdas/celdas.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { ReservasModule } from './reservas/reservas.module';
import { TarifasModule } from './tarifas/tarifas.module';
import { PagosModule } from './pagos/pagos.module';
import { FacturacionModule } from './facturacion/facturacion.module';
import { ReportesModule } from './reportes/reportes.module';
import { VistasModule } from './vistas/vistas.module';

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
          ssl: { rejectUnauthorized: false },
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
