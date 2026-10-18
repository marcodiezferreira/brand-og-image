// node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { ALTO, ANCHO, generar, mezclarMarca, tamanoTitulo } from '../src/brand-og-image.mjs';

test('genera un JPEG de 1200×630 sin fondo', async () => {
  const buf = await generar({ titulo: 'Cómo automatizar tu correo con IA', etiqueta: 'Blog · IA', marca: { nombre: 'Prueba', dominio: 'prueba.es' } });
  const meta = await sharp(buf).metadata();
  assert.equal(meta.format, 'jpeg');
  assert.equal(meta.width, ANCHO);
  assert.equal(meta.height, ALTO);
});

test('genera PNG sobre una foto de fondo', async () => {
  const foto = await sharp({ create: { width: 800, height: 800, channels: 3, background: '#336699' } }).jpeg().toBuffer();
  const buf = await generar({ titulo: 'Título largo para comprobar que se ajusta bien a la imagen de fondo', fondo: foto, formato: 'png' });
  const meta = await sharp(buf).metadata();
  assert.equal(meta.format, 'png');
  assert.equal(meta.width, ANCHO);
});

test('sin título da error', async () => {
  await assert.rejects(() => generar({ titulo: '  ' }), /Falta el título/);
});

test('mezcla la marca sin perder los valores por defecto', () => {
  const m = mezclarMarca({ nombre: 'X', colores: { acento: '#00ff00' } });
  assert.equal(m.nombre, 'X');
  assert.equal(m.colores.acento, '#00ff00');
  assert.equal(m.colores.fondo, '#07070b');
});

test('el tamaño de letra baja con títulos largos', () => {
  assert.ok(tamanoTitulo('Corto') > tamanoTitulo('x'.repeat(95)));
});
