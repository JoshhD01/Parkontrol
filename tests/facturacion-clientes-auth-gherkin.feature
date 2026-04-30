Feature: Facturacion - Autenticacion de clientes
  Como consumidor de la API de facturacion
  Quiero validar el acceso a los recursos de clientes
  Para proteger la informacion de clientes y el sistema

  @api @clientes
  Scenario: Consultar clientes sin autenticacion
    When consulto GET "/invoicing/clientes" sin token
    Then la respuesta debe indicar falta de autenticacion

  @api @clientes
  Scenario: Consultar clientes con token invalido
    Given que tengo un token invalido
    When consulto GET "/invoicing/clientes"
    Then la respuesta debe ser 401 o 403

  @api @clientes
  Scenario: Consultar clientes con token de cliente
    Given que tengo un token valido de cliente
    When consulto GET "/invoicing/clientes"
    Then la respuesta debe reflejar permisos de cliente

  @api @clientes
  Scenario: Consultar clientes con token de admin
    Given que tengo un token valido de admin
    When consulto GET "/invoicing/clientes"
    Then la respuesta debe ser 200 y mostrar la lista de clientes

  @api @clientes
  Scenario: Consultar clientes con token de operador
    Given que tengo un token valido de operador
    When consulto GET "/invoicing/clientes"
    Then la respuesta debe ser 200 o 403 segun permisos actuales
