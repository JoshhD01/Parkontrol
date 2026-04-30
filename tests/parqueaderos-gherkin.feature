Feature: Parqueaderos - gestion
  Como administrador
  Quiero crear y validar datos de parqueaderos
  Para asegurar registros correctos en el sistema

  Background:
    Given que he iniciado sesion como administrador
    And estoy en la pantalla de Parqueaderos

  @ui @parqueaderos
  Scenario: Crear parqueadero correctamente
    When abro el modal de nuevo parqueadero
    And ingreso nombre, ubicacion y capacidad validos
    Then el boton de crear debe estar habilitado
    When hago clic en crear
    Then debo ver el nuevo parqueadero en la lista

  @ui @parqueaderos
  Scenario: No permitir crear sin nombre
    When abro el modal de nuevo parqueadero
    And dejo vacio el campo nombre
    Then el boton de crear debe estar deshabilitado

  @ui @parqueaderos
  Scenario: No permitir crear sin ubicacion
    When abro el modal de nuevo parqueadero
    And dejo vacio el campo ubicacion
    Then el boton de crear debe estar deshabilitado

  @ui @parqueaderos
  Scenario: No permitir crear con capacidad negativa
    When abro el modal de nuevo parqueadero
    And ingreso capacidad negativa
    Then debo ver un mensaje de validacion
