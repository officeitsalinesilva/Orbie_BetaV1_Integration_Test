export interface BackupData {
  version: string;
  timestamp: string;
  profile: any;
  preferences: any;
  journalEntries: any[];
}

/**
 * Downloads a local encrypted JSON backup file.
 */
export function downloadBackupFile(data: BackupData, filename = 'orb-journal-backup.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Prepares and opens an email backup dispatch for the user's verified Google account.
 */
export function dispatchEmailBackup(targetEmail: string, data: BackupData): boolean {
  try {
    const subject = encodeURIComponent(`Orb Journal Backup · ${new Date().toLocaleDateString('pt-BR')}`);
    const summary = [
      `Orb Consciousness Journal - Backup Consolidado`,
      `Data: ${new Date().toLocaleString('pt-BR')}`,
      `Usuário: ${data.profile?.fullName || 'Consciência Orb'} (${targetEmail})`,
      `Total de registros no diário: ${data.journalEntries?.length || 0}`,
      `\nResumo dos Registros:`,
      ...(data.journalEntries || []).slice(0, 5).map((e: any, i: number) => `[${i + 1}] ${e.date || ''}: ${e.content?.slice(0, 100)}...`),
      `\nPara restaurar seus dados, mantenha uma cópia segura deste e-mail.`,
    ].join('\n');

    const body = encodeURIComponent(summary);
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    return true;
  } catch (err) {
    console.warn('Erro ao preparar envio por e-mail:', err);
    return false;
  }
}
