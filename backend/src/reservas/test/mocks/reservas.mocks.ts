export const createReservaRepositoryMock = () => ({
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
});

export const createClienteFacturaRepositoryMock = () => ({
  findOne: jest.fn(),
});

export const createVehiculosServiceMock = () => ({
  findVehiculoById: jest.fn(),
  findByPlaca: jest.fn(),
  crear: jest.fn(),
});

export const createCeldasServiceMock = () => ({
  findCeldaById: jest.fn(),
  actualizarEstado: jest.fn(),
  findByParqueadero: jest.fn(),
});