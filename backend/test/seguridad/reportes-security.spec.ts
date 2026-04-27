import { ReportesController } from 'src/controller/reportes/reportes.controller';

describe('ReportesController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a report through the service', async () => {
    const reportesService = {
      crear: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new ReportesController(reportesService);

    const result = await controller.crear({} as any);

    expect(result).toEqual({ id: 1 });
    expect(reportesService.crear).toHaveBeenCalledWith({} as any);
  });

  it('should update report url through the service', async () => {
    const reportesService = {
      actualizarUrl: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new ReportesController(reportesService);

    const result = await controller.actualizarUrl(1, 'https://file');

    expect(result).toEqual({ id: 1 });
    expect(reportesService.actualizarUrl).toHaveBeenCalledWith(1, 'https://file');
  });
});
