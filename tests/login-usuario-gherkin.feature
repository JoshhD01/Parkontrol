Feature: Login de usuario
  Como usuario
  Quiero iniciar sesion usando credenciales validas
  Para acceder a las funciones de cliente

  Background:
    Given que estoy en la pagina de login

  @ui @login
  Scenario: Iniciar sesion como usuario correctamente
    When ingreso un correo valido de usuario
    And ingreso la contrasena correcta
    And hago clic en el boton de login
    Then debo ver la pantalla principal de usuario

  @ui @login
  Scenario: No iniciar sesion con correo invalido
    When ingreso un correo invalido
    And ingreso una contrasena valida
    Then debo seguir en la pagina de login

  @ui @login
  Scenario: No iniciar sesion sin contraseña
    When ingreso un correo valido de usuario
    And dejo vacio el campo contrasena
    Then el boton de login debe estar deshabilitado
