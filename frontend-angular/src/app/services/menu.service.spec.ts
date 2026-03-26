import { MenuService, ElementoMenu } from './menu.service';
import { RolUsuario } from '../models/shared.model';

describe('MenuService', () => {
	let service: MenuService;

	beforeEach(() => {
		service = new MenuService();
	});

	describe('obtenerTodosLosElementos', () => {
		it('debe retornar todos los elementos del menú (AAA, FIRST)', () => {
			// Arrange & Act
			const elementos = service.obtenerTodosLosElementos();
			// Assert
			expect(Array.isArray(elementos)).toBe(true);
			expect(elementos.length).toBeGreaterThan(0);
			// Inmutabilidad
			elementos.push({ etiqueta: 'Fake', ruta: '/fake', icono: 'fake', roles: [RolUsuario.ADMINISTRADOR] });
			expect(service.obtenerTodosLosElementos().find(e => e.ruta === '/fake')).toBeUndefined();
		});
	});

	describe('obtenerMenuPorRol', () => {
		it('debe retornar solo los menús permitidos para ADMINISTRADOR', () => {
			// Arrange
			const rol = RolUsuario.ADMINISTRADOR;
			// Act
			const menu = service.obtenerMenuPorRol(rol);
			// Assert
			expect(menu.every(e => e.roles.includes(rol))).toBe(true);
			// Debe incluir Dashboard Administrador
			expect(menu.some(e => e.ruta === '/dashboard')).toBe(true);
		});

		it('debe retornar solo los menús permitidos para OPERADOR', () => {
			// Arrange
			const rol = RolUsuario.OPERADOR;
			// Act
			const menu = service.obtenerMenuPorRol(rol);
			// Assert
			expect(menu.every(e => e.roles.includes(rol))).toBe(true);
			// Debe incluir Dashboard Operador
			expect(menu.some(e => e.ruta === '/operador-dashboard')).toBe(true);
			// No debe incluir Usuarios
			expect(menu.some(e => e.ruta === '/usuarios')).toBe(false);
		});

		it('debe retornar array vacío para CLIENTE', () => {
			// Arrange
			const rol = RolUsuario.CLIENTE;
			// Act
			const menu = service.obtenerMenuPorRol(rol);
			// Assert
			expect(menu).toEqual([]);
		});
	});

	describe('obtenerElementoPorRuta', () => {
		it('debe retornar el elemento correcto por ruta existente', () => {
			// Arrange
			const ruta = '/parqueaderos';
			// Act
			const elemento = service.obtenerElementoPorRuta(ruta);
			// Assert
			expect(elemento).toBeDefined();
			expect(elemento?.ruta).toBe(ruta);
		});

		it('debe retornar undefined para ruta inexistente', () => {
			// Arrange
			const ruta = '/no-existe';
			// Act
			const elemento = service.obtenerElementoPorRuta(ruta);
			// Assert
			expect(elemento).toBeUndefined();
		});
	});

	describe('obtenerEtiquetaPorRuta', () => {
		it('debe retornar la etiqueta correcta para ruta existente', () => {
			// Arrange
			const ruta = '/tarifas';
			// Act
			const etiqueta = service.obtenerEtiquetaPorRuta(ruta);
			// Assert
			expect(etiqueta).toBe('Tarifas');
		});

		it('debe retornar "Dashboard" para ruta inexistente', () => {
			// Arrange
			const ruta = '/no-existe';
			// Act
			const etiqueta = service.obtenerEtiquetaPorRuta(ruta);
			// Assert
			expect(etiqueta).toBe('Dashboard');
		});
	});
});
