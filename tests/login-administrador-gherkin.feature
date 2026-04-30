Feature: Login administrador
  Como administrador
  Quiero iniciar sesion en la aplicacion
  Para acceder a las funcionalidades de administracion

  Background:
    Given que estoy en la pagina de login

  @ui @login
  Scenario: Iniciar sesion como administrador correctamente
    When ingreso un correo valido de administrador
    And ingreso la contrasena correcta
    And hago clic en el boton de login
    Then debo ver el dashboard de administrador

  @ui @login
  Scenario: No iniciar sesion con contraseña incorrecta
    When ingreso un correo valido de administrador
    And ingreso una contrasena incorrecta
    Then debo seguir en la pagina de login

  @ui @login
  Scenario: No iniciar sesion sin correo
    When dejo vacio el campo correo
    And ingreso la contrasena correcta
    Then el boton de login debe estar deshabilitado
