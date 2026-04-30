Feature: Reservas - filtro por parqueadero
  Como administrador
  Quiero buscar reservas por parqueadero
  Para verificar disponibilidad de espacios

  Background:
    Given que he iniciado sesion como administrador
    And estoy en la pantalla de Reservas

  @ui @reservas
  Scenario: Mostrar filtro de parqueadero en la pantalla
    Then debo ver el filtro de parqueadero

  @ui @reservas
  Scenario: No mostrar tabla antes de seleccionar parqueadero
    Then no debe mostrarse la tabla de reservas antes de seleccionar un parqueadero

  @ui @reservas
  Scenario: Filtrar reservas por Parqueadero Centro
    When selecciono el parqueadero "Parqueadero Centro"
    Then la lista de reservas debe cargar para ese parqueadero
