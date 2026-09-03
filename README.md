# Prueba Técnica Bolívar – Frontend

Aplicación Angular para la gestión de facturas (creación, listado, detalle) con autenticación JWT, control de acceso por roles y un dashboard con indicadores de facturación. Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) v21 y usa **componentes standalone**, **signals** y el runner de pruebas **Vitest**.

## Tabla de contenido

- [Arquitectura](#arquitectura)
- [Funcionalidades](#funcionalidades)
- [Rutas y control de acceso](#rutas-y-control-de-acceso)
- [Configuración de entorno](#configuración-de-entorno)
- [Requisitos previos](#requisitos-previos)
- [Comandos disponibles](#comandos-disponibles)
- [Pruebas unitarias](#pruebas-unitarias)
- [Estructura del proyecto](#estructura-del-proyecto)

## Arquitectura

El proyecto sigue una organización por capas dentro de `src/app`:

- **`core/`**: infraestructura transversal de la aplicación.
  - `auth/services/auth.ts`: servicio de autenticación (`login`, `logout`, `getToken`, `getCurrentUser`, `isAuthenticated`), persiste el token y el usuario en `localStorage`.
  - `auth/guards/`: guards funcionales (`CanActivateFn`) para proteger rutas:
    - `auth.guard.ts`: exige sesión iniciada, si no redirige a `/home`.
    - `guest.guard.ts`: exige que NO haya sesión iniciada (para `/login`), si ya hay sesión redirige a `/dashboard`.
    - `role.guard.ts`: exige que el usuario autenticado tenga alguno de los roles definidos en `route.data['roles']`, si no redirige a `/403` (o `/login` si no hay usuario).
  - `interceptors/jwt-interceptor.ts`: interceptor HTTP funcional que añade el header `Authorization: Bearer <token>` a las peticiones salientes cuando existe un token almacenado.
- **`features/`**: módulos de negocio, cada uno con sus propios componentes, modelos y servicios.
  - `login/`: formulario reactivo de inicio de sesión.
  - `home/`: landing page tras iniciar sesión.
  - `dashboard/`: indicadores de facturación por tipo (Nacional, Exportación, Gubernamental) con gráfico de barras (`ng2-charts` / `chart.js`).
  - `invoices/`: gestión de facturas (crear, listar con paginación/búsqueda, ver detalle), con modelos (`Invoice`, `InvoiceRequest`) y servicio HTTP (`InvoiceService`).
- **`shared/components/`**: componentes de layout reutilizables (`layout`, `navbar`, `sidebar`) que dependen del estado de sesión para mostrar/ocultar opciones según el rol del usuario.

Todos los componentes son **standalone** (sin `NgModule`), usan formularios reactivos y la nueva sintaxis de control de flujo (`@if`, `@for`). El acceso a servicios se hace con la función `inject()` en lugar de inyección por constructor.

## Funcionalidades

- **Autenticación**: login contra el backend (`POST /auth/login`), token JWT persistido en `localStorage` y adjuntado automáticamente a cada petición HTTP mediante interceptor.
- **Control de acceso por rol**: las rutas de creación de facturas (`ROLE_OPERADOR`) y del dashboard (`ROLE_AUDITOR`) están protegidas con `roleGuard`.
- **Gestión de facturas**:
  - Creación con validación reactiva según el tipo de factura (el campo *código aduanero* es obligatorio, alfanumérico y de máximo 20 caracteres solo para facturas de **Exportación**).
  - Listado paginado con búsqueda por texto.
  - Detalle de una factura por id, con manejo de errores (`404`, `403` y errores genéricos).
- **Dashboard**: totales de facturación por tipo de factura, mostrados en tarjetas resumen y un gráfico de barras.

## Rutas y control de acceso

| Ruta               | Componente      | Guard                              |
|---------------------|-----------------|-------------------------------------|
| `/login`            | `Login`         | `guestGuard`                        |
| `/home`             | `Home`          | `authGuard`                         |
| `/invoices`         | `InvoiceList`   | `authGuard`                         |
| `/invoices/new`     | `InvoiceCreate` | `authGuard` + `roleGuard` (`ROLE_OPERADOR`) |
| `/invoices/:id`     | `InvoiceDetail` | `authGuard`                         |
| `/dashboard`        | `Dashboard`     | `authGuard` + `roleGuard` (`ROLE_AUDITOR`) |
| `''` / `**`         | —               | Redirige a `/home`                  |

## Configuración de entorno

La URL base de la API se define en `src/environments/`:

```ts
// environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8090/api'
};
```

Ajusta `apiUrl` según la URL donde esté corriendo el backend.

## Requisitos previos

- Node.js y npm (ver `packageManager` en [package.json](package.json) para la versión recomendada de npm).
- Backend de la prueba técnica corriendo y accesible en la `apiUrl` configurada.

Instala las dependencias con:

```bash
npm install
```

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Levanta el servidor de desarrollo (`ng serve`) en `http://localhost:4200/`. |
| `npm run build` | Compila la aplicación para desarrollo en `dist/`. |
| `npm run build:prod` | Compila la aplicación optimizada para producción. |
| `npm run watch` | Compila en modo desarrollo y reconstruye ante cambios. |
| `npm test` | Ejecuta la suite de pruebas unitarias una sola vez (Vitest). |
| `npm run test:watch` | Ejecuta las pruebas en modo watch, útil durante el desarrollo. |

También puedes usar el CLI de Angular directamente, por ejemplo `ng generate component <nombre>` para generar nuevos componentes, o `ng test --include='**/algun-archivo.spec.ts'` para ejecutar un único spec.

## Pruebas unitarias

El proyecto usa el runner **Vitest** (integrado vía `@angular/build:unit-test`), no Karma/Jasmine. Actualmente cuenta con **18 archivos de specs y 93 pruebas**, cubriendo:

- Guards (`authGuard`, `guestGuard`, `roleGuard`).
- Servicios (`Auth`, `InvoiceService`, `DashboardService`) usando `HttpTestingController`.
- El interceptor JWT.
- Todos los componentes de `features` (`Login`, `Home`, `Dashboard`, `InvoiceList`, `InvoiceDetail`, `InvoiceCreate`) y `shared/components` (`Layout`, `Navbar`, `Sidebar`), incluyendo casos de éxito, error y validaciones de formulario.

Para ejecutar toda la suite:

```bash
npm test
```

Para ejecutar un único archivo de pruebas:

```bash
ng test --watch=false --include='**/invoice-create.spec.ts'
```

> Nota: al usar mocks manuales, usa `vi.fn()` (de `vitest`) y matchers como `toBe(true)`/`toBe(false)` en lugar de la sintaxis de Jasmine (`jasmine.createSpyObj`, `toBeTrue()`).

## Estructura del proyecto

```
src/app/
  core/
    auth/
      guards/       # authGuard, guestGuard, roleGuard
      models/        # LoginRequest, AuthResponse
      services/      # Auth
    interceptors/     # jwtInterceptor
  features/
    dashboard/        # Indicadores de facturación
    home/              # Landing page
    invoices/          # Crear, listar y ver detalle de facturas
    login/             # Autenticación
  shared/
    components/
      layout/          # Layout principal (navbar + sidebar + router-outlet)
      navbar/
      sidebar/
    pipes/
```

## Recursos adicionales

Para más información sobre Angular CLI, consulta la [documentación oficial de Angular CLI](https://angular.dev/tools/cli).

