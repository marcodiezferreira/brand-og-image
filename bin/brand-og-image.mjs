#!/usr/bin/env node
// Línea de comandos de brand-og-image. Ejemplos:
//   brand-og-image --titulo "Cómo automatizar tu correo con IA" --etiqueta "Blog · IA" --salida og.jpg
//   brand-og-image --titulo "Novedades de octubre" --fondo foto.jpg --marca marca.json --salida og.jpg
//   brand-og-image --lote posts.json --marca marca.json --carpeta salida/
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { generar } from '../src/brand-og-image.mjs';

const AYUDA = `brand-og-image: imágenes para compartir (1200×630) con tu marca.

  --titulo "..."      título (obligatorio si no usas --lote)
  --etiqueta "..."    texto pequeño arriba a la izquierda (p. ej. "Blog · IA")
  --fondo foto.jpg    foto de fondo (opcional; sin ella, fondo de color)
  --marca marca.json  tu marca: nombre, dominio, colores y fuentes (ver marca.ejemplo.json)
  --salida og.jpg     fichero de salida (.jpg o .png)
  --lote posts.json   varias imágenes: [{ "slug", "titulo", "etiqueta", "fondo" }, ...]
  --carpeta salida/   carpeta para el lote (por defecto ./salida)
`;

const { values: v } = parseArgs({
  options: {
    titulo: { type: 'string' }, etiqueta: { type: 'string', default: '' }, fondo: { type: 'string' },
    marca: { type: 'string' }, salida: { type: 'string', default: 'og.jpg' }, lote: { type: 'string' },
    carpeta: { type: 'string', default: 'salida' }, ayuda: { type: 'boolean', short: 'h' },
  },
});

if (v.ayuda || (!v.titulo && !v.lote)) {
  console.log(AYUDA);
  process.exit(v.ayuda ? 0 : 1);
}
const marca = v.marca ? JSON.parse(readFileSync(v.marca, 'utf8')) : {};

if (v.lote) {
  const items = JSON.parse(readFileSync(v.lote, 'utf8'));
  mkdirSync(v.carpeta, { recursive: true });
  for (const it of items) {
    const destino = path.join(v.carpeta, `${it.slug}.jpg`);
    writeFileSync(destino, await generar({ titulo: it.titulo, etiqueta: it.etiqueta, fondo: it.fondo, marca }));
    console.log('✓', destino);
  }
} else {
  const formato = v.salida.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
  writeFileSync(v.salida, await generar({ titulo: v.titulo, etiqueta: v.etiqueta, fondo: v.fondo, marca, formato }));
  console.log('✓', v.salida);
}
