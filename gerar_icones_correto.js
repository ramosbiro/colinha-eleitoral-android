const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG calibrado especificamente para a "Safe Zone" do Android Adaptive Icon
// O Android corta qualquer coisa fora dos 66% centrais. Aqui a urna ocupa exatamente a zona de segurança.
const svgForegroundAdaptive = `
<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <!-- Grupo da Urna proporcionalmente reduzida (220 x 180) e perfeitamente centrada em X=106, Y=126 -->
  <g transform="translate(106, 126)">
    <!-- Corpo da Urna com borda azul vibrante -->
    <rect x="0" y="0" width="220" height="180" rx="36" fill="#0f172a" stroke="#3b82f6" stroke-width="8"/>

    <!-- Ecrã / Tela da Urna (82 x 142) -->
    <rect x="15" y="19" width="82" height="142" rx="15" fill="#020617" stroke="#2563eb" stroke-width="5"/>

    <!-- Foto e Linhas do Candidato -->
    <rect x="28" y="32" width="32" height="40" rx="8" fill="#3b82f6"/>
    <circle cx="44" cy="47" r="8" fill="#0f172a"/>
    <path d="M31 68 C31 57, 57 57, 57 68" fill="#0f172a"/>

    <line x1="26" y1="92" x2="84" y2="92" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
    <line x1="26" y1="110" x2="72" y2="110" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
    <line x1="26" y1="128" x2="60" y2="128" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>

    <!-- Teclado Numérico com respiro calibrado -->
    <g fill="#94a3b8">
      <rect x="117" y="24" width="24" height="19" rx="5"/>
      <rect x="150" y="24" width="24" height="19" rx="5"/>
      <rect x="183" y="24" width="24" height="19" rx="5"/>

      <rect x="117" y="52" width="24" height="19" rx="5"/>
      <rect x="150" y="52" width="24" height="19" rx="5"/>
      <rect x="183" y="52" width="24" height="19" rx="5"/>

      <rect x="117" y="80" width="24" height="19" rx="5"/>
      <rect x="150" y="80" width="24" height="19" rx="5"/>
      <rect x="183" y="80" width="24" height="19" rx="5"/>

      <rect x="150" y="108" width="24" height="19" rx="5"/>
    </g>

    <!-- Teclas Oficiais: Branco, Corrige, Confirma -->
    <rect x="112" y="136" width="26" height="22" rx="5" fill="#f8fafc"/>
    <rect x="145" y="133" width="30" height="25" rx="6" fill="#f97316"/>
    <rect x="181" y="127" width="32" height="31" rx="8" fill="#16a34a"/>
  </g>
</svg>
`;

// Ícone completo com fundo escuro para dispositivos legados
const svgFullIcon = `
<svg width="512" height="512" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <rect width="432" height="432" fill="#090d16"/>
  <g transform="translate(106, 126)">
    <rect x="0" y="0" width="220" height="180" rx="36" fill="#0f172a" stroke="#3b82f6" stroke-width="8"/>
    <rect x="15" y="19" width="82" height="142" rx="15" fill="#020617" stroke="#2563eb" stroke-width="5"/>
    <rect x="28" y="32" width="32" height="40" rx="8" fill="#3b82f6"/>
    <circle cx="44" cy="47" r="8" fill="#0f172a"/>
    <path d="M31 68 C31 57, 57 57, 57 68" fill="#0f172a"/>
    <line x1="26" y1="92" x2="84" y2="92" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
    <line x1="26" y1="110" x2="72" y2="110" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
    <line x1="26" y1="128" x2="60" y2="128" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
    <g fill="#94a3b8">
      <rect x="117" y="24" width="24" height="19" rx="5"/>
      <rect x="150" y="24" width="24" height="19" rx="5"/>
      <rect x="183" y="24" width="24" height="19" rx="5"/>
      <rect x="117" y="52" width="24" height="19" rx="5"/>
      <rect x="150" y="52" width="24" height="19" rx="5"/>
      <rect x="183" y="52" width="24" height="19" rx="5"/>
      <rect x="117" y="80" width="24" height="19" rx="5"/>
      <rect x="150" y="80" width="24" height="19" rx="5"/>
      <rect x="183" y="80" width="24" height="19" rx="5"/>
      <rect x="150" y="108" width="24" height="19" rx="5"/>
    </g>
    <rect x="112" y="136" width="26" height="22" rx="5" fill="#f8fafc"/>
    <rect x="145" y="133" width="30" height="25" rx="6" fill="#f97316"/>
    <rect x="181" y="127" width="32" height="31" rx="8" fill="#16a34a"/>
  </g>
</svg>
`;

const resDir = path.join(__dirname, 'android/app/src/main/res');

const iconConfig = [
  { folder: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
];

async function gerar() {
  const bufFull = Buffer.from(svgFullIcon);
  const bufFg = Buffer.from(svgForegroundAdaptive);

  for (const item of iconConfig) {
    const dir = path.join(resDir, item.folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Ícones legados (com fundo escuro)
    await sharp(bufFull).resize(item.size, item.size).png().toFile(path.join(dir, 'ic_launcher.png'));
    await sharp(bufFull).resize(item.size, item.size).png().toFile(path.join(dir, 'ic_launcher_round.png'));

    // Foreground do Adaptive Icon (camada superior com transparência e urna perfeitamente centrada)
    await sharp(bufFg).resize(item.fgSize, item.fgSize).png().toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`✓ Gerado para ${item.folder}: base=${item.size}px, foreground=${item.fgSize}px`);
  }

  // Fundo do Adaptive Icon
  const valuesDir = path.join(resDir, 'values');
  if (!fs.existsSync(valuesDir)) fs.mkdirSync(valuesDir, { recursive: true });
  fs.writeFileSync(
    path.join(valuesDir, 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#090d16</color>\n</resources>\n`
  );
  console.log('✓ ic_launcher_background.xml atualizado');
}

gerar().catch(console.error);
