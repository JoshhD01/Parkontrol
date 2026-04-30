Feature: Vehiculos - creacion
  Como administrador
  Quiero registrar nuevos vehiculos
  Para mantener la base de datos de vehiculos actualizada

  Background:
    Given que he iniciado sesion como administrador
    And estoy en la pantalla de Vehiculos

  @ui @vehiculos
  Scenario: Crear vehiculo con placa valida
    When abro el modal de nuevo vehiculo
    And ingreso una placa valida
    Then el boton Crear debe estar habilitado
    When hago clic en Crear
    Then debo ver el vehiculo registrado en la lista

  @ui @vehiculos
  Scenario: No permitir crear vehiculo sin placa
    When abro el modal de nuevo vehiculo
    And dejo vacio el campo placa
    Then el boton Crear debe estar deshabilitado
