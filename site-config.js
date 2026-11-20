/**
 * ============================================================================
 *  BALACLAVA — CONFIGURACIÓN CENTRAL DEL SITIO WEB
 * ============================================================================
 *  Edita este único archivo para conectar tu enlace real de descarga,
 *  mirror, peso o fecha de lanzamiento
 *  sin tocar el HTML ni el CSS.
 * ============================================================================
 */
window.BALACLAVA_SITE_CONFIG = {
  // 1. Enlace principal de descarga directa (GitHub Releases)
  downloadUrl: 'https://github.com/LalleL/balaclava-web/releases/download/v1.3.2-beta/Balaclava.exe',

  // 2. Enlace alternativo / mirror opcional (déjalo vacío '' si no usas mirror)
  mirrorUrl: '',

  // 3. Versión actual mostrada en badges, hero y tarjetas de descarga
  version: 'Beta 1.3.2',
  versionLabel: 'Beta 1.3.2',

  // 4. Datos técnicos del archivo descargable
  fileName: 'Balaclava.exe',
  fileSizeEs: '31.94 MB',
  fileSizeEn: '31.94 MB',
  releaseDateEs: '19 Nov 2026',
  releaseDateEn: 'Nov 19, 2026',
  platformLabel: 'Windows 10 / 11 (64-bit · Tauri 2)',

  // 5. Enlaces oficiales de comunidad y apoyo
  downloadBaseOffset: 15,
  githubRepo: 'LalleL/balaclava-web',
  discordUrl: 'https://discord.gg/8wrsjRSMY2',
  kofiUrl: 'https://ko-fi.com/balaclava'
};
