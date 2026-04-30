Feature: Login usuario y cierre de sesion
  Como usuario registrado
  Quiero iniciar sesion y cerrar sesion
  Para proteger el acceso a mi cuenta

  Background:
    Given que estoy en la pagina de login

  @ui @login
  Scenario: Iniciar sesion como usuario y cerrar sesion
    When ingreso un correo valido de usuario
    And ingreso la contrasena correcta
    And hago clic en el boton de login
    Then debo ver la opcion de cerrar sesion
    When hago clic en cerrar sesion
    Then debo regresar a la pagina de login

  @ui @login
  Scenario: No existe opcion de cerrar sesion antes de iniciar sesion
    Then no debo ver la opcion de cerrar sesion
