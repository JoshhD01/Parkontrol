Feature: Reserva - vehiculo existente
  Como usuario
  Quiero crear reservas usando un vehiculo existente
  Para aprovechar datos de vehiculos ya registrados

  Background:
    Given que he iniciado sesion como usuario
    And estoy en la pantalla de Reservas

  @ui @reservas
  Scenario: Crear reserva con vehiculo existente
    When abro el modal de nueva reserva
    And selecciono un vehiculo existente
    And ingreso fechas validas
    Then debo ver un estado de reserva activa

  @ui @reservas
  Scenario: No permitir reserva con fecha de fin anterior a inicio
    When abro el modal de nueva reserva
    And selecciono un vehiculo existente
    And ingreso fechas invalidas
    Then debo ver un mensaje de error de fecha
