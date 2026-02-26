# ParkControl - Sistema de Gestion de Parqueaderos

## Descripcion

ParkControl es un sistema web para la gestion integral de parqueaderos. Permite a empresas administrar sus parqueaderos, celdas, reservas, pagos, facturacion y reportes. El sistema maneja tres tipos de usuario: administradores, operadores y clientes.

## Tecnologias

| Capa       | Tecnologia                              |
|------------|-----------------------------------------|
| Frontend   | Angular 20, Angular Material, SCSS      |
| Backend    | NestJS, TypeORM, class-validator, bcrypt|
| Base datos | PostgreSQL (Supabase)                   |
| Auth       | JWT (JSON Web Tokens)                   |

## Estructura del Proyecto

```
parkontrol_web/
  backend/          -> API REST (NestJS + TypeORM + PostgreSQL)
  frontend-angular/ -> SPA (Angular + Angular Material)
```

## Requisitos Previos

- Node.js (v18 o superior)
- npm
- Cuenta de Supabase con base de datos PostgreSQL configurada

## Instalacion

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd parkontrol_web

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend-angular
npm install
```

## Configuracion

Crear un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```
SUPABASE_DB_URL=postgresql://usuario:contrasena@host:puerto/basedatos
DB_SYNC=false
JWT_SECRET=clave_secreta
```

## Ejecucion

### Backend (puerto 3000)

```bash
cd backend
npm run start:dev
```

### Frontend (puerto 4200)

```bash
cd frontend-angular
npm start
```

### Seed de Datos Iniciales

Para poblar la base de datos con la informacion inicial (empresa, roles, usuario administrador, parqueaderos, tipos de celda, sensores, tipos de vehiculo, tarifas, metodos de pago y periodos):

```bash
cd backend
npx ts-node src/seeds/seed.ts
```

## Funcionalidades Principales

- **Autenticacion**: Registro de clientes, inicio de sesion diferenciado por rol (administrador, operador, cliente) con JWT.
- **Parqueaderos**: Creacion y consulta de parqueaderos con generacion automatica de celdas.
- **Celdas**: Gestion de estados (libre, ocupada, mantenimiento).
- **Vehiculos**: Registro manual y automatico de vehiculos por placa.
- **Tarifas**: Configuracion de precios por parqueadero y tipo de vehiculo.
- **Reservas**: Creacion, finalizacion y sincronizacion automatica de estados cada 30 segundos.
- **Pagos**: Procesamiento con calculo automatico segun tarifas.
- **Facturacion**: Emision de facturas electronicas y gestion de clientes de facturacion.
- **Reportes**: Generacion de reportes operativos por parqueadero y periodo.
- **Analisis**: Dashboard con ocupacion, historial de reservas, ingresos mensuales y facturacion.

## Documentacion

La documentacion detallada del proyecto (modulos, funcionalidades, historias de usuario, requisitos funcionales, endpoints y modelo de datos) se encuentra en el archivo [DOCUMENTACION.md](DOCUMENTACION.md).

## Licencia

Ver archivo [LICENSE](LICENSE).
