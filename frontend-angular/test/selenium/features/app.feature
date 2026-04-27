Feature: Parkontrol E2E con Cucumber

  Scenario: Login exitoso
    Given que estoy en la página de login
    When ingreso correo "test@test.com" y contraseña "test@test.com"
    And selecciono iniciar sesión como cliente
    Then veo el dashboard de cliente

  Scenario: Login fallido
    Given que estoy en la página de login
    When ingreso correo "mal@test.com" y contraseña "wrongpass"
    And selecciono iniciar sesión como cliente
    Then sigo en la página de login con error de credenciales

  Scenario: Registro de usuario exitoso
    Given que estoy en la página de registro
    When ingreso tipo documento "CC" número "123456789" correo "nuevo@test.com" y contraseña "test@test.com"
    And envío el formulario de registro
    Then veo que la página redirige a login

  Scenario: Creación de tarifa
    Given que estoy autenticado como administrador
    When voy a la página de tarifas
    Then veo el botón "Nueva Tarifa"
    When abro el modal de nueva tarifa
    Then aparece el diálogo de creación de tarifa

  Scenario: Listar tarifas
    Given que estoy autenticado como administrador
    When voy a la página de tarifas
    Then veo la lista de tarifas
    And veo el botón "Editar"

  Scenario: Creación de parqueadero
    Given que estoy autenticado como administrador
    When voy a la página de parqueaderos
    Then veo el botón "Nuevo Parqueadero"
    When abro el modal de creación de parqueadero
    Then aparece el diálogo de creación de parqueadero

  Scenario: Listar parqueaderos
    Given que estoy autenticado como administrador
    When voy a la página de parqueaderos
    Then veo la lista de parqueaderos

  Scenario: Listar pagos
    Given que estoy autenticado como administrador
    When voy a la página de pagos
    Then veo el botón "Nuevo Pago"
    And veo la lista de pagos

  Scenario: Buscar factura por sus distintos métodos
    Given que estoy autenticado como administrador
    When voy a la página de facturación
    Then veo la pestaña "Clientes"
    And veo la pestaña "Facturas"
    When abro la pestaña "Facturas"
    Then veo el botón "Nueva Factura"

  Scenario: Crear, actualizar y buscar pagos, tarifas y parqueaderos
    Given que estoy autenticado como administrador
    When voy a la página de tarifas
    Then veo la lista de tarifas
    And abro el modal de nueva tarifa
    When voy a la página de parqueaderos
    Then veo la lista de parqueaderos
    And abro el modal de creación de parqueadero
    When voy a la página de pagos
    Then veo la lista de pagos
