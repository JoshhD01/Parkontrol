Feature: Tarifa - buscar parqueadero
  Como usuario
  Quiero buscar tarifas por modo de vehiculo y placa
  Para encontrar el precio correcto del servicio

  Background:
    Given que he iniciado sesion como usuario
    And estoy en la pantalla de Tarifas

  @ui @tarifas
  Scenario: Buscar tarifas con datos validos
    When selecciono el modo de vehiculo
    And ingreso una placa valida
    Then debo ver resultados que coincidan con la placa

  @ui @tarifas
  Scenario: Mostrar error cuando la placa esta vacia
    When dejo vacio el campo placa
    Then debo ver un mensaje de placa requerida
