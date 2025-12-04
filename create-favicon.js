// Простой скрипт для создания PNG фавиконки из SVG
// Используем встроенные возможности Node.js
const fs = require('fs');
const { execSync } = require('child_process');

// Попробуем использовать ImageMagick или другой конвертер
try {
  // Проверяем наличие ImageMagick
  execSync('which convert', { stdio: 'ignore' });
  execSync('convert -background "#00a8c4" -fill "#0a0a0a" -font "Menlo-Regular" -pointsize 32 -gravity center label:"</>" public/favicon.png', { stdio: 'inherit' });
  console.log('PNG favicon created with ImageMagick');
} catch (e) {
  try {
    // Попробуем использовать rsvg-convert
    execSync('rsvg-convert -w 64 -h 64 public/favicon.svg -o public/favicon.png', { stdio: 'inherit' });
    console.log('PNG favicon created with rsvg-convert');
  } catch (e2) {
    console.log('No image converter found. Please convert favicon.svg to favicon.png manually or install ImageMagick/rsvg-convert');
    console.log('SVG favicon is available at public/favicon.svg');
  }
}
