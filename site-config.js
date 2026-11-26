/**
 * ============================================================================
 *  ABYSSEA — CONFIGURACIÓN CENTRAL DEL SITIO WEB
 * ============================================================================
 *  Edita este único archivo para conectar tu enlace real de descarga,
 *  mirror, peso o fecha de lanzamiento
 *  sin tocar el HTML ni el CSS.
 * ============================================================================
 */
window.BALACLAVA_SITE_CONFIG = {
  // 1. Enlace principal de descarga directa (GitHub Releases)
  downloadUrl: 'https://github.com/LalleL/balaclava-web/releases/download/2.0.0-rc2/abyssea.exe',

  // 2. Enlace alternativo / mirror opcional (déjalo vacío '' si no usas mirror)
  mirrorUrl: '',

  // 3. Versión actual mostrada en badges, hero y tarjetas de descarga
  version: 'Beta 2.0.0 RC2',
  versionLabel: 'Beta 2.0.0 RC2',

  // 4. Datos técnicos del archivo descargable
  fileName: 'abyssea.exe',
  fileSizeEs: '86.12 MB',
  fileSizeEn: '86.12 MB',
  releaseDateEs: '26 Nov 2026',
  releaseDateEn: 'Nov 26, 2026',
  platformLabel: 'Windows 10 / 11 (64-bit · Tauri 2)',

  // 5. Enlaces oficiales de comunidad y apoyo
  downloadBaseOffset: 15,
  githubRepo: 'LalleL/balaclava-web',
  webPlayersCounterUrl: 'https://balaclava-counter.000lallel.workers.dev',
  discordUrl: 'https://discord.gg/8wrsjRSMY2',
  kofiUrl: 'https://ko-fi.com/balaclava',

  // 6. Modo mantenimiento (pon true para pausar descargas y /play/, false para volver a abrir)
  maintenanceMode: false,
  maintenanceTitleEn: 'Update in Progress',
  maintenanceTitleEs: 'Actualización en Curso',
  maintenanceMsgEn: 'We are currently uploading a new Abyssea update. Downloads and browser play are temporarily paused — please check back in a few minutes!',
  maintenanceMsgEs: 'Estamos subiendo una nueva actualización de Abyssea. Las descargas y el juego en navegador están pausados temporalmente — ¡vuelve en unos minutos!'
};
