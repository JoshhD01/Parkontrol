Feature: Facturacion - Gestion de facturas
  Como administrador del sistema
  Quiero generar y consultar facturas asociadas a pagos
  Para soportar el proceso de cobro y trazabilidad

  Background:
    Given que he iniciado sesion como administrador
    And estoy en la pantalla de Facturacion
    And estoy en la pestana "Facturas"

  @ui @facturas
  Scenario: Cerrar el modal de nueva factura sin registrar informacion
    When abro el modal de "Nueva Factura"
    And hago clic en "Cancelar"
    Then el modal de "Crear Factura" debe cerrarse
    And no debe mostrarse mensaje de exito de factura creada

  @ui @facturas
  Scenario: Intentar crear factura sin idPago
    When abro el modal de "Nueva Factura"
    And dejo vacio el campo idPago
    Then el boton "Aceptar" debe estar deshabilitado
    And no debe enviarse la solicitud de creacion de factura

  @ui @facturas
  Scenario: Rechazar idPago con formato no numerico
    When abro el modal de "Nueva Factura"
    And ingreso "abc" en el campo idPago
    Then debo ver el mensaje "El ID de pago debe ser numerico"
    And el boton "Aceptar" debe estar deshabilitado

  @api @facturas
  Scenario Outline: Consultar factura por idPago con formatos invalidos
    Given que tengo un token valido de operador
    When consulto GET "/invoicing/facturas/pago/<idPago>"
    Then la respuesta debe tener estado <statusCode>

    Examples:
      | idPago   | statusCode |
      | abc      | 400        |
      | 1.5      | 400        |
      | 99999999 | 404        |

  @api @facturas
  Scenario: Consultar facturas propias del cliente sin autenticacion
    When consulto GET "/invoicing/facturas/client/mias" sin token
    Then la respuesta debe reflejar el comportamiento actual del backend para autenticacion ausente
