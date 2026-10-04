const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG EXATAMENTE IGUAL AO DA INTERFACE DO APLICATIVO
const svgArteUrna = `
<svg width="512" height="512" viewBox="0 0 100 82" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Corpo da Urna estilizada -->
  <rect x="2" y="2" width="96" height="78" rx="18" fill="#0f172a" stroke="#3b82f6" stroke-width="3"/>
  
  <!-- Visor / Tela da Urna -->
  <rect x="9" y="10" width="34" height="62" rx="7" fill="#020617" stroke="#2563eb" stroke-width="2"/>
  
  <!-- Retângulo de Foto e linhas de candidato -->
  <rect x="14" y="16" width="14" height="18" rx="3.5" fill="#3b82f6"/>
  <circle cx="21" cy="22" r="3.8" fill="#0f172a"/>
  <path d="M15.5 32 C15.5 27, 26.5 27, 26.5 32" fill="#0f172a"/>
  
  <line x1="14" y1="41" x2="38" y2="41" stroke="#64748b" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="14" y1="48" x2="32" y2="48" stroke="#64748b" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="14" y1="55" x2="26" y2="55" stroke="#64748b" stroke-width="2.4" stroke-linecap="round"/>

  <!-- Teclado Numérico -->
  <g fill="#94a3b8">
    <rect x="50" y="12" width="10" height="8" rx="2.5"/>
    <rect x="64" y="12" width="10" height="8" rx="2.5"/>
    <rect x="78" y="12" width="10" height="8" rx="2.5"/>

    <rect x="50" y="24" width="10" height="8" rx="2.5"/>
    <rect x="64" y="24" width="10" height="8" rx="2.5"/>
    <rect x="78" y="24" width="10" height="8" rx="2.5"/>

    <rect x="50" y="36" width="10" height="8" rx="2.5"/>
    <rect x="64" y="36" width="10" height="8" rx="2.5"/>
    <rect x="78" y="36" width="10" height="8" rx="2.5"/>

    <rect x="64" y="48" width="10" height="8" rx="2.5"/>
  </g>

  <!-- Teclas Coloridas: Branco, Corrige, Confirma -->
  <rect x="48" y="60" width="11" height="9" rx="2.5" fill="#f8fafc"/>
  <rect x="62" y="59" width="12" height="10" rx="2.5" fill="#f97316"/>
  <rect x="77" y="56" width="14" height="13" rx="3.5" fill="#16a34a"/>
</svg>
`;

// Camada de foreground para Adaptive Icons (com margem de 108dp para launchers modernos)
const svgForeground = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(68, 68) scale(3.76)">
    <rect x="2" y="2" width="96" height="78" rx="18" fill="#0f172a" stroke="#3b82f6" stroke-width="3"/>
    <rect x="9" y="10" width="34" height="62" rx="7" fill="#020617" stroke="#2563eb" stroke-width="2"/>
    <rect x="14" y="16" width="14" height="18" rx="3.5" fill="#3b82f6"/>
    <circle cx="21" cy="22" r="3.8" fill="#0f172a"/>
    <path d="M15.5 32 C15.5 27, 26.5 27, 26.5 32" fill="#0f172a"/>
    <line x1="14" y1="41" x2="38" y2="41" stroke="#64748b" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="14" y1="48" x2="32" y2="48" stroke="#64748b" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="14" y1="55" x2="26" y2="55" stroke="#64748b" stroke-width="2.4" stroke-linecap="round"/>
    <g fill="#94a3b8">
      <rect x="50" y="12" width="10" height="8" rx="2.5"/>
      <rect x="64" y="12" width="10" height="8" rx="2.5"/>
      <rect x="78" y="12" width="10" height="8" rx="2.5"/>
      <rect x="50" y="24" width="10" height="8" rx="2.5"/>
      <rect x="64" y="24" width="10" height="8" rx="2.5"/>
      <rect x="78" y="24" width="10" height="8" rx="2.5"/>
      <rect x="50" y="36" width="10" height="8" rx="2.5"/>
      <rect x="64" y="36" width="10" height="8" rx="2.5"/>
      <rect x="78" y="36" width="10" height="8" rx="2.5"/>
      <rect x="64" y="48" width="10" height="8" rx="2.5"/>
    </g>
    <rect x="48" y="60" width="11" height="9" rx="2.5" fill="#f8fafc"/>
    <rect x="62" y="59" width="12" height="10" rx="2.5" fill="#f97316"/>
    <rect x="77" y="56" width="14" height="13" rx="3.5" fill="#16a34a"/>
  </g>
</svg>
`;

const resDir = path.join(__dirname, 'android/app/src/main/res');

const iconSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function executarSubstituicao() {
  const bufIcone = Buffer.from(svgArteUrna);
  const bufForeground = Buffer.from(svgForeground);

  for (const item of iconSizes) {
    const dir = path.join(resDir, item.folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // 1. Gera o ícone padrão legado
    await sharp(bufIcone).resize(item.size, item.size).png().toFile(path.join(dir, 'ic_launcher.png'));
    
    // 2. Gera o ícone circular
    await sharp(bufIcone).resize(item.size, item.size).png().toFile(path.join(dir, 'ic_launcher_round.png'));

    // 3. Gera o foreground do ícone adaptativo
    await sharp(bufForeground).resize(item.size * 2, item.size * 2).png().toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`[OK] Ícones gerados em: ${item.folder}`);
  }

  // 4. Garante que o fundo escuro exista no Android
  const colorXmlPath = path.join(resDir, 'values/ic_launcher_background.xml');
  const colorXmlContent = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#090d16</color>\n</resources>`;
  fs.writeFileSync(colorXmlPath, colorXmlContent);

  console.log('✓ Substituição total concluída!');
}

executarSubstituicao().catch(console.error);
