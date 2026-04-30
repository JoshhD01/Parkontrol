Feature: Reservas - creación
  Como administrador
  Quiero crear reservas desde la interfaz
  Para confirmar ocupación y facturación correcta

  Background:
    Given que he iniciado sesion como administrador
    And estoy en la pantalla de Reservas

  @ui @reservas
  Scenario: Crear reserva con datos validos
    When abro el modal de "Nueva Reserva"
    And ingreso placa valida
    And selecciono una celda disponible
    And completo hora de inicio y hora de fin validas
    Then el boton "Crear Reserva" debe estar habilitado
    When hago clic en "Crear Reserva"
    Then debo ver un mensaje de exito de reserva

  @ui @reservas
  Scenario: No permitir crear reserva sin placa
    When abro el modal de "Nueva Reserva"
    And dejo vacio el campo placa
    Then el boton "Crear Reserva" debe estar deshabilitado

  @ui @reservas
  Scenario: No permitir crear reserva con hora fin anterior a hora inicio
    When abro el modal de "Nueva Reserva"
    And ingreso placa valida
    And selecciono una celda disponible
    And ingreso una hora fin anterior a la hora inicio
    Then el boton "Crear Reserva" debe estar deshabilitado
