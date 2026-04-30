Feature: Pago - Creacion de pago
  Como administrador
  Quiero crear pagos desde la interfaz
  Para procesar cobros asociados a reservas

  Background:
    Given que he iniciado sesion como administrador
    And estoy en la pantalla de Pagos

  @ui @pagos
  Scenario: Crear pago con datos validos
    When abro el modal de nuevo pago
    And selecciono una reserva valida
    And ingreso una cantidad valida
    Then el boton de procesar pago debe estar habilitado
    When hago clic en procesar pago
    Then debo ver un mensaje de exito

  @ui @pagos
  Scenario: No permitir crear pago sin reserva seleccionada
    When abro el modal de nuevo pago
    And ingreso una cantidad valida
    Then el boton de procesar pago debe estar deshabilitado

  @ui @pagos
  Scenario: No permitir crear pago con cantidad cero
    When abro el modal de nuevo pago
    And selecciono una reserva valida
    And ingreso "0" en la cantidad
    Then el boton de procesar pago debe estar deshabilitado
