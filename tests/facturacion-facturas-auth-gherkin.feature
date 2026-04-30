Feature: Facturacion - Autenticacion de facturas
  Como consumidor de la API de facturacion
  Quiero validar el acceso a los recursos de facturas
  Para proteger la informacion de facturas y el proceso de cobro

  @api @facturas
  Scenario: Obtener factura por idPago sin autenticacion
    When consulto GET "/invoicing/facturas/pago/1" sin token
    Then la respuesta debe indicar falta de autenticacion

  @api @facturas
  Scenario: Obtener factura por idPago con token invalido
    Given que tengo un token invalido
    When consulto GET "/invoicing/facturas/pago/1"
    Then la respuesta debe ser 401 o 403

  @api @facturas
  Scenario: Obtener factura con token de cliente
    Given que tengo un token valido de cliente
    When consulto GET "/invoicing/facturas/pago/1"
    Then la respuesta debe reflejar el acceso de cliente

  @api @facturas
  Scenario: Obtener factura con token de admin
    Given que tengo un token valido de admin
    When consulto GET "/invoicing/facturas/pago/1"
    Then la respuesta debe ser 200 cuando exista la factura

  @api @facturas
  Scenario: Obtener factura con token de operador
    Given que tengo un token valido de operador
    When consulto GET "/invoicing/facturas/pago/1"
    Then la respuesta debe estar de acuerdo con los permisos de operador
