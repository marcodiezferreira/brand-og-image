# brand-og-image

**Genera la imagen para compartir de cada página o artículo con tu marca**, a partir de su título. Es la imagen que aparece al pegar un enlace en WhatsApp, LinkedIn, X o Slack.

![Ejemplo](ejemplos/sin-foto.jpg)

Por qué existe:
- Una imagen genérica igual para todas las páginas pasa desapercibida. Una con el título y tu marca se reconoce al momento.
- Hacerlas a mano en Canva no escala cuando publicas cada semana.
- Las soluciones habituales lanzan un navegador entero (Puppeteer). Esto pinta el texto directamente con fuentes reales: es rápido y funciona en cualquier servidor o en CI.

## Instalación

```bash
npm install
```

## Línea de comandos

```bash
node bin/brand-og-image.mjs --titulo "Cómo automatizar tu correo con IA" --etiqueta "Blog · IA" --marca marca.ejemplo.json --salida og.jpg
```

Con una foto de fondo (se recorta sola al 1200×630 y se oscurece para que el texto se lea):

```bash
node bin/brand-og-image.mjs --titulo "Novedades de octubre" --fondo foto.jpg --marca marca.json --salida og.jpg
```

Muchas imágenes de una vez:

```bash
node bin/brand-og-image.mjs --lote posts.json --marca marca.json --carpeta salida/
```

`posts.json`:

```json
[
  { "slug": "automatizar-correo", "titulo": "Cómo automatizar tu correo con IA", "etiqueta": "Blog · IA" },
  { "slug": "novedades-octubre", "titulo": "Novedades de octubre", "fondo": "fotos/octubre.jpg" }
]
```

## Tu marca

Copia `marca.ejemplo.json` y cambia nombre, dominio y colores:

```json
{
  "nombre": "Marco",
  "nombreCursiva": "Díez",
  "dominio": "marcodiez.es",
  "colores": { "fondo": "#07070b", "texto": "#f4f2ee", "acento": "#ff3b47",
               "luz1": "rgba(64,110,255,0.55)", "luz2": "rgba(255,64,72,0.45)" },
  "fuentes": { "texto": null, "textoNegrita": null, "cursiva": null }
}
```

- `nombreCursiva` (opcional) se pinta en cursiva serif al lado del nombre.
- `fuentes`: rutas a tus ficheros `.woff`, `.ttf` u `.otf` (no `.woff2`). Si las dejas en `null`, usa Sora e Instrument Serif.

## Como librería (Astro, Next, scripts…)

```js
import { writeFileSync } from 'node:fs';
import { generar } from 'brand-og-image';

const jpeg = await generar({
  titulo: 'Cómo automatizar tu correo con IA',
  etiqueta: 'Blog · IA',
  fondo: 'portada.jpg',         // opcional: ruta o Buffer
  marca: { nombre: 'Tu Marca', dominio: 'tu-web.com' },
  formato: 'jpeg',              // o 'png'
});
writeFileSync('og.jpg', jpeg);
```

En Astro, por ejemplo, un endpoint `src/pages/og/[slug].jpg.ts` que llame a `generar()` con el título de cada post crea todas las imágenes al construir la web.

## Pruebas

```bash
npm test
```

## Autor

Hecho por [Marco Díez](https://marcodiez.es): apps y automatizaciones con IA, marketing digital y SEO.
¿Lo quieres integrado en tu web o en tu flujo de publicación? [Escríbeme](https://marcodiez.es/contacto/).

Licencia MIT. Las fuentes Sora e Instrument Serif tienen licencia SIL Open Font License.
