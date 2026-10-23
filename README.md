# Fair's Company

Sitio web corporativo de Fair's Company — catálogo de uniformes y panel de
administración. Producción: [fairscompany.com](https://fairscompany.com).

## Stack

| Capa | Tecnología |
| :--- | :--- |
| Frontend | Astro 7, componentes `.astro`, CSS plano (sin framework de UI) |
| Backend | La misma app Astro en modo SSR (`output: 'server'`) sobre `@astrojs/node` |
| Base de datos | SQLite vía `node:sqlite` (módulo nativo de Node), archivo en `data/` |
| Imágenes | `sharp` (optimización en build y en subida) |
| Despliegue | Docker Compose + Caddy (HTTPS automático) |

Requiere **Node >= 22.12.0** (`node:sqlite` es nativo a partir de esa versión).

## Puesta en marcha local

```sh
npm install
cp .env.example .env   # completar los valores
npm run dev
```

### Variables de entorno

| Variable | Descripción |
| :--- | :--- |
| `ADMIN_USER` | Usuario del panel de administración |
| `ADMIN_PASSWORD` | Contraseña del panel |
| `SESSION_SECRET` | Cadena aleatoria larga para firmar la cookie de sesión |

Generar un `SESSION_SECRET`:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Se leen con `process.env` en tiempo de request (no en build), para que en
producción provengan del entorno del contenedor y no del `.env` que existía al
construir la imagen.

## Comandos

| Comando | Acción |
| :--- | :--- |
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `npm run build` | Compila el sitio a `./dist/` |
| `npm run preview` | Previsualiza el build local |
| `node scripts/normalize-assets.mjs` | Regenera los assets web desde las carpetas de origen |

## Estructura

```text
src/
├── components/    Componentes de UI (.astro)
├── layouts/       Layout público y layout del admin
├── pages/         Rutas públicas, /admin y /api/admin
├── lib/           auth, catálogo, categorías, hero, uploads
├── db/            Cliente SQLite, esquema y datos semilla
├── img/           Imágenes optimizadas en build time
└── styles/        CSS global
data/              Base de datos SQLite (no versionada)
uploads/           Imágenes subidas desde el admin (no versionadas)
```

## Panel de administración

En `/admin`, protegido por `src/middleware.ts`: toda ruta bajo `/admin` o
`/api/admin` exige una cookie de sesión válida, salvo las de login. La sesión es
una cookie firmada con HMAC-SHA256, `SameSite=Strict`, con 8 horas de vigencia.

Desde ahí se editan los slides del hero, los productos de la galería y las
imágenes de categorías y líneas de producto.

## Imágenes

El proyecto maneja dos flujos distintos:

1. **Imágenes del catálogo** (`src/img/`): versionadas en el repo y procesadas
   por Astro con `sharp` **en build time**, que genera los WebP optimizados en
   `dist/client/_astro/`. `src/lib/catalog.ts` las indexa con `import.meta.glob`,
   así que agregar una foto no requiere tocar ninguna lista.

   Los originales sin procesar viven en `src/img/PRODUCTOS-todos/` y
   `src/img/CLIENTES-todos/` (no versionados, ~123 MB).
   `scripts/normalize-assets.mjs` los convierte en los assets definitivos.

2. **Imágenes subidas desde el admin** (`uploads/`): se re-comprimen a WebP
   (máx. 2400 px, calidad 80) al subirlas y se sirven en tiempo de ejecución por
   `src/pages/uploads/[...file].ts`. Van fuera de `public/` a propósito: Astro
   solo copia `public/` durante el build, no después.

## Despliegue

El servidor ejecuta Docker Compose con dos servicios: `web` (el servidor Node de
Astro, interno en el puerto 4321) y `caddy`, que termina HTTPS con Let's Encrypt
y hace de reverse proxy.

El build de producción ocurre **dentro del contenedor** (`RUN npm run build` en
el `Dockerfile`), por eso las imágenes de `src/img/` deben estar versionadas: son
el insumo del build.

### Primera instalación

```sh
git clone <repo> && cd fair-company
cp .env.example .env   # completar con los valores de producción
docker compose up -d --build
```

### Actualizaciones

Desde la máquina de desarrollo:

```sh
npm run build          # verificación previa (dist/ no se versiona)
git add . && git commit -m "..." && git push origin main
```

Y en el servidor:

```sh
cd ~/fair-company && git pull origin main && docker compose up -d --build
```

### Persistencia

`data/` y `uploads/` están montados como volúmenes bind en
`docker-compose.yml` y quedan fuera de Git. Sobreviven intactos a cada rebuild:
ahí viven la base de datos y las imágenes cargadas desde el panel.

> **Pendiente:** esas dos carpetas existen únicamente en el servidor y no
> cuentan con respaldo automático.
