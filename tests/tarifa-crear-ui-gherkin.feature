Feature: Tarifa - creacion
  Como administrador
  Quiero crear nuevas tarifas desde la interfaz
  Para mantener precios actualizados

  Background:
    Given que he iniciado sesion como administrador
    And estoy en la pantalla de Tarifas

  @ui @tarifas
  Scenario: Crear tarifa con valores validos
    When abro el modal de nueva tarifa
    And ingreso los valores de precio correctos
    Then el boton Crear debe estar habilitado
    When hago clic en Crear
    Then debo ver un mensaje de exito

  @ui @tarifas
  Scenario: No permitir crear tarifa sin valores
    When abro el modal de nueva tarifa
    Then el boton Crear debe estar deshabilitado

  @ui @tarifas
  Scenario: No permitir crear tarifa con precio negativo
    When abro el modal de nueva tarifa
    And ingreso un precio negativo
    Then el boton Crear debe estar deshabilitado
