Feature: Reserva - vehiculo nuevo
  Como usuario
  Quiero crear reservas registrando un vehiculo nuevo
  Para usar el sistema con placas nuevas

  Background:
    Given que he iniciado sesion como usuario
    And estoy en la pantalla de Reservas

  @ui @reservas
  Scenario: Crear reserva con vehiculo nuevo
    When abro el modal de nueva reserva
    And ingreso una placa nueva
    And ingreso fechas validas
    Then debo ver un estado de reserva activa

  @ui @reservas
  Scenario: No permitir reserva con placa vacia
    When abro el modal de nueva reserva
    And dejo vacio el campo placa
    Then el boton Crear Reserva debe estar deshabilitado
