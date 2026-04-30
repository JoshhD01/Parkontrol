Feature: Tarifa - modificacion
  Como administrador
  Quiero actualizar tarifas existentes
  Para corregir precios y condiciones

  Background:
    Given que he iniciado sesion como administrador
    And estoy en la pantalla de Tarifas

  @ui @tarifas
  Scenario: Modificar tarifa existente correctamente
    When selecciono una tarifa disponible
    And cambio el valor a un precio valido
    Then el boton Actualizar debe estar habilitado
    When hago clic en Actualizar
    Then debo ver un mensaje de exito

  @ui @tarifas
  Scenario: No permitir guardar tarifa con valor invalido
    When selecciono una tarifa disponible
    And cambio el valor a un precio negativo
    Then el boton Actualizar debe estar deshabilitado
