import { Test, TestingModule } from '@nestjs/testing';
import { PagosService } from '../pagos.service';

// Este bloque agrupa las pruebas del método calcularMonto del servicio PagosService
describe('PagosService - calcularMonto (Dummy)', () => {
  let service: PagosService;

  // Antes de cada prueba se crea una nueva instancia del servicio
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagosService], // Registramos el servicio que vamos a probar
    }).compile();

    // Obtenemos la instancia del servicio
    service = module.get<PagosService>(PagosService);
  });

  // ESC00025 / CS00018 – Cobro de primera hora
  it('ESC00025 / CS00018 - Debe cobrar solo fracción para 1 hora o menos', () => {
    // Valores simples de prueba
    const precioFraccion = 5000;
    const precioHoraAdicional = 4000;

    // Probamos cuando el tiempo es exactamente 1 hora
    const resultado1 = (service as any).calcularMonto(1, precioFraccion, precioHoraAdicional);

    // Probamos cuando el tiempo es menor a 1 hora
    const resultado2 = (service as any).calcularMonto(0.5, precioFraccion, precioHoraAdicional);

    // En ambos casos debe cobrar solo el valor de la fracción
    expect(resultado1).toBe(5000);
    expect(resultado2).toBe(5000);
  });

  // ESC00026 / CS00019 – Cobro de horas adicionales
  it('ESC00026 / CS00019 - Debe calcular correctamente horas adicionales con precio adicional', () => {
    // Si son 3 horas:
    // - la primera se cobra como fracción: 5000
    // - las otras 2 como horas adicionales: 2 * 4000
    const resultado = (service as any).calcularMonto(3, 5000, 4000);

    // Total esperado: 5000 + 8000 = 13000
    expect(resultado).toBe(5000 + 2 * 4000);
  });

  // ESC00027 / CS00020 – Precio adicional no configurado
  it('ESC00027 / CS00020 - Debe usar precio fracción como adicional si no se especifica precio adicional', () => {
    // Aquí no se envía precioHoraAdicional
    // Entonces el método debe usar el mismo precioFraccion también para las horas extra
    const resultado = (service as any).calcularMonto(3, 5000);

    // Total esperado:
    // primera hora = 5000
    // 2 horas adicionales = 2 * 5000
    expect(resultado).toBe(5000 + 2 * 5000);
  });

  // ESC00028 / CS00021 – Redondeo de valores decimales
  it('ESC00028 / CS00021 - Debe calcular correctamente con valores límite (redondeo de horas)', () => {
    // Si el tiempo es 1.1 horas:
    // se cobra la primera hora/fracción = 1000
    // y el resto como adicional = 800
    const resultado = (service as any).calcularMonto(1.1, 1000, 800);

    // Total esperado = 1800
    expect(resultado).toBe(1800);
  });
});