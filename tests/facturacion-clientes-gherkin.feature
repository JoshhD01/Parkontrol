Feature: Facturacion - Gestion de clientes
  Como administrador del sistema
  Quiero gestionar clientes de facturacion
  Para asegurar datos correctos antes de emitir facturas

  Background:
    Given que he iniciado sesion como administrador
    And estoy en la pantalla de Facturacion

  @ui @clientes
  Scenario: Cerrar el modal de nuevo cliente sin guardar
    When abro el modal de "Nuevo Cliente"
    And hago clic en "Cancelar"
    Then el modal de "Crear Cliente" debe cerrarse
    And no debe mostrarse mensaje de exito de creacion

  @ui @clientes
  Scenario: Validar correo con formato invalido y luego corregirlo
    When abro el modal de "Nuevo Cliente"
    And ingreso "10293847" en el campo numero de identificacion
    And ingreso "cliente-invalido" en el campo correo
    Then debo ver el mensaje "Correo invalido"
    And el boton "Aceptar" debe estar deshabilitado
    When corrijo el correo a "cliente.valido@e2e.test"
    Then el boton "Aceptar" debe estar habilitado

  @ui @clientes
  Scenario: Crear dos clientes seguidos con datos distintos
    When creo un cliente con numero de identificacion unico y correo unico
    Then debo ver un mensaje de exito de cliente creado
    When creo otro cliente con un numero de identificacion diferente y correo diferente
    Then debo ver nuevamente un mensaje de exito de cliente creado

  @ui @clientes
  Scenario: Impedir creacion con numero de identificacion alfanumerico en tipo CC
    When abro el modal de "Nuevo Cliente"
    And selecciono tipo de documento "CC"
    And ingreso "ABC123" en el campo numero de identificacion
    And ingreso "cliente.cc@e2e.test" en el campo correo
    Then debo ver validacion de "CC: solo numeros (6 a 10 digitos)"
    And el boton "Aceptar" debe estar deshabilitado
