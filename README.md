# Colinha Eleitoral — projeto Android (Capacitor)

Empacota o app web de [`colinha-eleitoral`](https://github.com/ramosbiro/colinha-eleitoral) como aplicativo Android.

- **Pacote:** `br.com.ramos.colinha` · **Capacitor 8** · `minSdk 24` · `targetSdk 36`
- **Plugins nativos próprios** (`android/app/src/main/java/br/com/ramos/colinha/`):
  - `PrintPlugin` — abre o gerenciador de impressão do Android (A4, margens ~10 mm)
  - `AppInfoPlugin` — informações do app e atualização interna por APK
- **Canais de build** (`productFlavors`): `sideload` (APK, com `REQUEST_INSTALL_PACKAGES`) e `play` (AAB, sem essa permissão)
- **Assinatura de release:** lida de `~/.colinha-keystore/key.properties` (fora do repositório; `*.jks` e `key.properties` estão no `.gitignore`)

## Uso
Normalmente via `build.sh` do repositório `colinha-eleitoral`. Manualmente:

```bash
npm install
npx cap sync android
cd android && ./gradlew clean assembleSideloadRelease   # APK
cd android && ./gradlew clean bundlePlayRelease         # AAB
```

O conteúdo web vem de `www/index.html` (copiado do repositório `colinha-eleitoral`).

`gerar_icones_correto.js` gera os ícones do launcher (requer `sharp`).
