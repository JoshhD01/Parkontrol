Feature: Vistas - historial de reservas
  Como administrador
  Quiero revisar el historial de reservas en la vista de datos
  Para analizar el uso y los tiempos de ocupación

  Background:
    Given que he iniciado sesion como administrador
    And estoy en la pantalla de Vistas

  @ui @vistas
  Scenario: Mostrar pestaña Historial de Reservas
    Then debo ver la pestaña "Historial de Reservas"

  @ui @vistas
  Scenario: Cargar contenido al seleccionar Historial de Reservas
    When selecciono la pestaña "Historial de Reservas"
    Then debe mostrarse el historial de reservas o un mensaje de sin datos

  @ui @vistas
  Scenario: Ver total de reservas en el panel de estadisticas
    Then debo ver el total de reservas en el panel de estadisticas
