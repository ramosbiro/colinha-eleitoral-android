const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG perfeitamente centralizado em base quadrada 512x512
// Proporção ideal dentro da zona de segurança do Android (área central de 380x380)
const svgUrnaCentralizada = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Fundo preto escuro preenchendo o ícone todo -->
  <rect width="512" height="512" fill="#090d16"/>

  <!-- Grupo perfeitamente centralizado no eixo X (56) e Y (86) -->
  <g transform="translate(56, 86)">
    <!-- Corpo da Urna com borda azul vibrante (400 x 340) -->
    <rect x="0" y="0" width="400" height="340" rx="68" fill="#0f172a" stroke="#3b82f6" stroke-width="14"/>

    <!-- Ecrã / Tela da Urna (150 x 270) -->
    <rect x="28" y="35" width="150" height="270" rx="28" fill="#020617" stroke="#2563eb" stroke-width="9"/>

    <!-- Avatar e Linhas da Tela -->
    <rect x="52" y="60" width="58" height="74" rx="14" fill="#3b82f6"/>
    <circle cx="81" cy="86" r="15" fill="#0f172a"/>
    <path d="M58 126 C58 106, 104 106, 104 126" fill="#0f172a"/>

    <line x1="50" y1="172" x2="156" y2="172" stroke="#64748b" stroke-width="11" stroke-linecap="round"/>
    <line x1="50" y1="206" x2="132" y2="206" stroke="#64748b" stroke-width="11" stroke-linecap="round"/>
    <line x1="50" y1="240" x2="110" y2="240" stroke="#64748b" stroke-width="11" stroke-linecap="round"/>

    <!-- Teclado Numérico com respiro calibrado -->
    <g fill="#94a3b8">
      <rect x="212" y="44" width="44" height="36" rx="10"/>
      <rect x="272" y="44" width="44" height="36" rx="10"/>
      <rect x="332" y="44" width="44" height="36" rx="10"/>

      <rect x="212" y="96" width="44" height="36" rx="10"/>
      <rect x="272" y="96" width="44" height="36" rx="10"/>
      <rect x="332" y="96" width="44" height="36" rx="10"/>

      <rect x="212" y="148" width="44" height="36" rx="10"/>
      <rect x="272" y="148" width="44" height="36" rx="10"/>
      <rect x="332" y="148" width="44" height="36" rx="10"/>

      <rect x="272" y="200" width="44" height="36" rx="10"/>
    </g>

    <!-- Teclas Oficiais: Branco, Corrige, Confirma -->
    <rect x="204" y="254" width="48" height="40" rx="10" fill="#f8fafc"/>
    <rect x="264" y="248" width="54" height="46" rx="12" fill="#f97316"/>
    <rect x="330" y="238" width="58" height="56" rx="14" fill="#16a34a"/>
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
  const bufIcone = Buffer.from(svgUrnaCentralizada);

  for (const item of iconSizes) {
    const dir = path.join(resDir, item.folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Ícone legado quadrado/arredondado
    await sharp(bufIcone).resize(item.size, item.size).png().toFile(path.join(dir, 'ic_launcher.png'));
    
    // Ícone circular
    await sharp(bufIcone).resize(item.size, item.size).png().toFile(path.join(dir, 'ic_launcher_round.png'));

    // Foreground para Adaptive Icons (tamanho 108dp equivalente)
    await sharp(bufIcone).resize(Math.round(item.size * 1.5), Math.round(item.size * 1.5)).png().toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`[OK] Ícone perfeitamente centralizado em: ${item.folder}`);
  }
}

executarSubstituicao().catch(console.error);
