# VYRA

VYRA es una plataforma local-first de finanzas personales mensuales.

## Desarrollo local

```bash
npm install
npm run dev
```

En desarrollo, los datos de prueba se guardan en `db.json` mediante el middleware local de Vite. Ese archivo está excluido del repositorio público.

## Verificación

```bash
npm run check
```

Ejecuta los tests y la compilación de producción.

## Pre-release

GitHub Pages utiliza `sessionStorage` para una demostración temporal. El backend, la sincronización y el QR funcional todavía no están implementados.
