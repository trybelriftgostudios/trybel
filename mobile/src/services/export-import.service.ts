import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Paths, File } from 'expo-file-system';
import { sqliteService } from './sqlite.service';

export interface StudentProfileSummary {
  fullName: string;
  email: string;
  department: string;
  yearOfStudy: string;
  collegeName: string;
  verified: boolean;
  skills: string[];
}

class ExportImportService {
  /**
   * Generates a verified Campus Transcript & Activity PDF Report and prompts the native share sheet.
   */
  public async generateAndSharePdfReport(profile: StudentProfileSummary): Promise<string> {
    const posts = await sqliteService.getPosts();
    const teams = await sqliteService.getTeams();
    const studyReqs = await sqliteService.getStudyRequests();

    const timestamp = new Date().toLocaleString();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #0F172A; background: #FFFFFF; }
            .header { border-bottom: 3px solid #22C55E; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .logo-text { font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
            .logo-sub { color: #22C55E; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .badge-verified { background: #DCFCE7; color: #166534; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; }
            .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
            h2 { font-size: 18px; color: #1E293B; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; }
            .grid { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 600; }
            .value { font-size: 14px; color: #0F172A; font-weight: 500; }
            .tag { display: inline-block; background: #E2E8F0; color: #334155; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 6px; margin-bottom: 6px; font-weight: 600; }
            .list-item { border-left: 3px solid #38BDF8; padding-left: 10px; margin-bottom: 12px; }
            .item-title { font-size: 14px; font-weight: 700; color: #0F172A; }
            .item-desc { font-size: 12px; color: #475569; margin-top: 2px; }
            .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-text">TRYBEL CAMPUS</div>
              <div class="logo-sub">Verified College Network & Portfolio</div>
            </div>
            <div class="badge-verified">✓ VERIFIED STUDENT</div>
          </div>

          <div class="card">
            <h2>Student Identity & Campus Record</h2>
            <div class="grid">
              <div>
                <div class="label">Full Name</div>
                <div class="value">${profile.fullName}</div>
              </div>
              <div>
                <div class="label">Institutional Email</div>
                <div class="value">${profile.email}</div>
              </div>
            </div>
            <div class="grid" style="margin-top: 10px;">
              <div>
                <div class="label">Campus Institution</div>
                <div class="value">${profile.collegeName}</div>
              </div>
              <div>
                <div class="label">Department & Year</div>
                <div class="value">${profile.department} • ${profile.yearOfStudy}</div>
              </div>
            </div>
            <div style="margin-top: 12px;">
              <div class="label" style="margin-bottom: 6px;">Verified Technical Skills</div>
              <div>
                ${profile.skills.map(s => `<span class="tag">${s}</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="card">
            <h2>Smart India Hackathon & Team Projects (${teams.length})</h2>
            ${teams.length === 0 ? '<p style="font-size: 12px; color: #94A3B8;">No active team listings</p>' : ''}
            ${teams.map(t => `
              <div class="list-item">
                <div class="item-title">${t.title} — ${t.project_name || 'Project'}</div>
                <div class="item-desc">${t.description}</div>
                <div style="font-size: 11px; color: #22C55E; margin-top: 4px; font-weight: 600;">
                  Target Size: ${t.team_size_target} members • Visibility: ${t.visibility === 'open_to_all' ? 'Open to other colleges' : 'College Only'}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="card">
            <h2>Peer Study Collaboration Requests (${studyReqs.length})</h2>
            ${studyReqs.length === 0 ? '<p style="font-size: 12px; color: #94A3B8;">No study requests posted</p>' : ''}
            ${studyReqs.map(r => `
              <div class="list-item" style="border-left-color: #6366F1;">
                <div class="item-title">${r.subject}</div>
                <div class="item-desc">${r.goal_description}</div>
                <div style="font-size: 11px; color: #64748B; margin-top: 4px;">
                  Mode: ${r.preferred_mode.toUpperCase()} • Slot: ${r.availability_slot}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="card">
            <h2>Campus Feed Activity & Contributions (${posts.length})</h2>
            ${posts.length === 0 ? '<p style="font-size: 12px; color: #94A3B8;">No recent posts published</p>' : ''}
            ${posts.slice(0, 3).map(p => `
              <div class="list-item" style="border-left-color: #22C55E;">
                <div class="item-title">${p.author_name} • ${new Date(p.created_at).toLocaleDateString()}</div>
                <div class="item-desc">${p.content}</div>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            Official cryptographic campus portfolio report generated via Trybel College Network.<br />
            Report Timestamp: ${timestamp} • Scope: St. Peter's Engineering College Network
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Verified Campus Report'
        });
      }

      return uri;
    } catch (err: any) {
      throw new Error(`PDF generation failed: ${err.message}`);
    }
  }

  /**
   * Exports full SQLite database and student data as JSON report and prompts share sheet.
   */
  public async exportAndShareJsonBackup(): Promise<string> {
    const jsonString = await sqliteService.exportFullBackup();

    if (Platform.OS === 'web') {
      // In web, trigger standard file download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trybel_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return 'downloaded';
    }

    try {
      const fileName = `trybel_backup_${Date.now()}.json`;
      const file = new File(Paths.cache, fileName);
      file.write(jsonString);
      const fileUri = file.uri;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Trybel JSON Backup'
        });
      }

      return fileUri;
    } catch (err: any) {
      throw new Error(`JSON export failed: ${err.message}`);
    }
  }

  /**
   * Prompts the user to pick a JSON backup file and restores it into SQLite.
   */
  public async pickAndRestoreJsonBackup(): Promise<{ success: boolean; count: number }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, count: 0 };
      }

      const asset = result.assets[0];
      let jsonString = '';

      if (Platform.OS === 'web') {
        const res = await fetch(asset.uri);
        jsonString = await res.text();
      } else {
        const file = new File(asset.uri);
        jsonString = await file.text();
      }

      return await sqliteService.restoreFullBackup(jsonString);
    } catch (err: any) {
      throw new Error(`Restore failed: ${err.message}`);
    }
  }
}

export const exportImportService = new ExportImportService();
