import { Test, TestingModule } from '@nestjs/testing';
import { PagosService } from '../pagos.service';

// Prueba doble: Stub 

// Este bloque agrupa las pruebas del método calcularHoras de PagosService
describe('PagosService - calcularHoras (Stub)', () => {
  let service: PagosService;

  // Antes de cada prueba, crea una instancia nueva del servicio
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagosService], // Registramos el servicio que vamos a probar
    }).compile();

    // Obtenemos la instancia del servicio para usarla en las pruebas
    service = module.get<PagosService>(PagosService);
  });

  // ESC00021 / CS00014 – Horas exactas
  it('ESC00021 / CS00014 - Debe calcular horas exactas correctamente', () => {
    // Hora de entrada: 10:00 a.m.
    const entrada = new Date('2024-01-15T10:00:00');

    // Hora de salida: 2:00 p.m.
    const salida = new Date('2024-01-15T14:00:00');

    // Llamamos al método privado calcularHoras
    const resultado = (service as any).calcularHoras(entrada, salida);

    // Esperamos que el resultado sea 4 horas exactas
    expect(resultado).toBe(4);
  });

  // ESC00022 / CS00015 – Redondeo de fracción de hora
  it('ESC00022 / CS00015 - Debe redondear hacia arriba las fracciones de hora', () => {
    // Entrada a las 10:00 a.m.
    const entrada = new Date('2024-01-15T10:00:00');

    // Salida a las 2:30 p.m.
    const salida = new Date('2024-01-15T14:30:00');

    // Ejecutamos el cálculo de horas
    const resultado = (service as any).calcularHoras(entrada, salida);

    // Como hay 4 horas y media, debe redondear a 5
    expect(resultado).toBe(5);
  });

  // ESC00023 / CS00016 – Periodo menor a una hora
  it('ESC00023 / CS00016 - Debe calcular correctamente períodos de menos de 1 hora', () => {
    // Entrada a las 10:00 a.m.
    const entrada = new Date('2024-01-15T10:00:00');

    // Salida a las 10:45 a.m.
    const salida = new Date('2024-01-15T10:45:00');

    // Ejecutamos el cálculo
    const resultado = (service as any).calcularHoras(entrada, salida);

    // Aunque no completa 1 hora, debe cobrar al menos 1
    expect(resultado).toBe(1);
  });

  // ESC00024 / CS00017 – Periodo de varios días
  it('ESC00024 / CS00017 - Debe calcular correctamente períodos de múltiples días', () => {
    // Entrada el 15 de enero a las 10:00 a.m.
    const entrada = new Date('2024-01-15T10:00:00');

    // Salida el 17 de enero a las 3:30 p.m.
    const salida = new Date('2024-01-17T15:30:00');

    // Ejecutamos el cálculo
    const resultado = (service as any).calcularHoras(entrada, salida);

    // Debe calcular todas las horas transcurridas y redondear si hay fracción
    expect(resultado).toBe(54);
  });
});