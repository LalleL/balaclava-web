/**
 * ============================================================================
 *  BALACLAVA — CONFIGURACIÓN CENTRAL DEL SITIO WEB
 * ============================================================================
 *  Edita este único archivo para conectar tu enlace real de descarga,
 *  mirror, peso del instalador, fecha de lanzamiento o checksum
 *  sin tocar el HTML ni el CSS.
 * ============================================================================
 */
window.BALACLAVA_SITE_CONFIG = {
  // 1. Enlace principal de descarga (ej. GitHub Releases, itch.io, Cloudflare R2, Drive...)
  //    Mientras mantenga '#pon-tu-link-de-descarga-aqui' o empiece por '#',
  //    la web mostrará el aviso configurable en lugar de lanzar una descarga rota.
  downloadUrl: '#pon-tu-link-de-descarga-aqui',

  // 2. Enlace alternativo / mirror opcional (déjalo vacío '' si no usas mirror)
  mirrorUrl: '',

  // 3. Versión actual mostrada en badges, hero y tarjetas de descarga
  version: 'Beta 1.3.0',
  versionLabel: 'Beta 1.3.0',

  // 4. Datos técnicos del archivo descargable (edítalos con los valores reales de tu build)
  fileName: 'Balaclava_Beta_1.3.0_Setup_x64.exe',
  fileSizeEs: 'Por definir (~140 MB)',
  fileSizeEn: 'TBD (~140 MB)',
  releaseDateEs: 'Noviembre 2026',
  releaseDateEn: 'November 2026',
  platformLabel: 'Windows 10 / 11 (64-bit · Tauri 2)',
  checksumSha256Es: 'Se publicará junto al instalador oficial (SHA-256)',
  checksumSha256En: 'Published alongside the official installer (SHA-256)',

  // 5. Enlace oficial de comunidad en Discord
  discordUrl: 'https://discord.gg/8wrsjRSMY2'
};
