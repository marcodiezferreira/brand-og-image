// brand-og-image: imágenes para compartir (Open Graph, 1200×630) con tu marca, a partir de un título.
// Pinta el texto con satori (fuentes reales, sin navegador), lo rasteriza con resvg y lo compone con sharp
// sobre una foto o sobre un fondo de color. Pensado para webs estáticas, blogs y automatizaciones.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
export const ANCHO = 1200;
export const ALTO = 630;

/** Marca por defecto: se sobrescribe con un JSON (ver marca.ejemplo.json). */
export const MARCA_BASE = {
  nombre: 'Tu Marca',
  nombreCursiva: '',            // segunda palabra en cursiva serif (opcional), p. ej. el apellido
  dominio: 'tu-web.com',
  colores: { fondo: '#07070b', texto: '#f4f2ee', acento: '#ff3b47', luz1: 'rgba(64,110,255,0.55)', luz2: 'rgba(255,64,72,0.45)' },
  fuentes: {
    // Ficheros .woff/.ttf/.otf (no .woff2). Por defecto, Sora e Instrument Serif de @fontsource.
    texto: null,
    textoNegrita: null,
    cursiva: null,
  },
};

const fuenteFontsource = (paquete, fichero) => readFileSync(path.join(path.dirname(require.resolve(`${paquete}/package.json`)), 'files', fichero));

function cargarFuentes(marca) {
  const f = marca.fuentes || {};
  const leer = (ruta, defecto) => (ruta ? readFileSync(ruta) : defecto());
  return [
    { name: 'Marca', weight: 400, style: 'normal', data: leer(f.texto, () => fuenteFontsource('@fontsource/sora', 'sora-latin-400-normal.woff')) },
    { name: 'Marca', weight: 600, style: 'normal', data: leer(f.textoNegrita, () => fuenteFontsource('@fontsource/sora', 'sora-latin-600-normal.woff')) },
    { name: 'Cursiva', weight: 400, style: 'italic', data: leer(f.cursiva, () => fuenteFontsource('@fontsource/instrument-serif', 'instrument-serif-latin-400-italic.woff')) },
  ];
}

export function mezclarMarca(parcial = {}) {
  return {
    ...MARCA_BASE, ...parcial,
    colores: { ...MARCA_BASE.colores, ...(parcial.colores || {}) },
    fuentes: { ...MARCA_BASE.fuentes, ...(parcial.fuentes || {}) },
  };
}

// Mini «JSX» para satori: todos los bloques en flex (satori lo exige si hay varios hijos).
const h = (type, style, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children } });

/** Tamaño de letra según la longitud del título, para que quepa en 2-3 líneas. */
export function tamanoTitulo(titulo) {
  const n = titulo.length;
  return n > 90 ? 44 : n > 70 ? 50 : n > 50 ? 58 : 66;
}

function capa({ titulo, etiqueta, marca, conFoto }) {
  const c = marca.colores;
  // Posiciones absolutas: el reparto flex de satori puede sacar el título del recuadro.
  return h('div', {
    position: 'relative', width: ANCHO, height: ALTO, fontFamily: 'Marca', color: c.texto,
    backgroundImage: conFoto
      ? 'linear-gradient(180deg, rgba(7,7,11,0.55) 0%, rgba(7,7,11,0.35) 28%, rgba(7,7,11,0.82) 60%, rgba(7,7,11,0.97) 100%)'
      : `radial-gradient(circle at 12% 18%, ${c.luz1}, rgba(0,0,0,0) 46%), radial-gradient(circle at 92% 88%, ${c.luz2}, rgba(0,0,0,0) 50%), linear-gradient(135deg, ${c.fondo}, ${c.fondo})`,
  },
    h('div', { position: 'absolute', top: 52, left: 64, right: 64, alignItems: 'center', justifyContent: 'space-between' },
      etiqueta
        ? h('div', { alignItems: 'center', gap: 14 },
          h('div', { width: 12, height: 12, borderRadius: 12, backgroundColor: c.acento }),
          h('div', { fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.9 }, etiqueta))
        : h('div', {}, ''),
      h('div', { alignItems: 'baseline', gap: 9, fontSize: 30 },
        h('div', { fontWeight: 600 }, marca.nombre),
        ...(marca.nombreCursiva ? [h('div', { fontFamily: 'Cursiva', fontStyle: 'italic', fontSize: 36 }, marca.nombreCursiva)] : []))),
    h('div', { position: 'absolute', left: 64, right: 64, bottom: 50, flexDirection: 'column', gap: 24 },
      h('div', { fontSize: tamanoTitulo(titulo), fontWeight: 600, lineHeight: 1.12, letterSpacing: -1 }, titulo),
      h('div', { fontSize: 22, opacity: 0.72 }, marca.dominio)));
}

/**
 * Genera la imagen. Devuelve un Buffer (JPEG por defecto, o PNG con formato: 'png').
 * @param {{titulo: string, etiqueta?: string, fondo?: string, marca?: object, formato?: 'jpeg'|'png'}} op
 */
export async function generar({ titulo, etiqueta = '', fondo, marca = {}, formato = 'jpeg' }) {
  if (!titulo || !String(titulo).trim()) throw new Error('Falta el título');
  const m = mezclarMarca(marca);
  const svg = await satori(capa({ titulo: String(titulo).trim(), etiqueta, marca: m, conFoto: Boolean(fondo) }),
    { width: ANCHO, height: ALTO, fonts: cargarFuentes(m) });
  const texto = new Resvg(svg, { fitTo: { mode: 'width', value: ANCHO } }).render().asPng();
  const base = fondo
    ? sharp(fondo).resize(ANCHO, ALTO, { fit: 'cover', position: 'attention' })
    : sharp({ create: { width: ANCHO, height: ALTO, channels: 3, background: m.colores.fondo } });
  const img = base.composite([{ input: texto }]);
  return formato === 'png' ? img.png().toBuffer() : img.jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}
