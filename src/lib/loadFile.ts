import JSZip from 'jszip';
import type { HealthData, ProgressCallback } from '../types';
import { parseHealthXml } from './parseHealthXml';
import { hydrateHealthJson } from './parseHealthJson';

/** Load a health data file (ZIP, XML, or JSON), decompress if needed, and parse into HealthData. */
export async function loadFile(
  file: File,
  onProgress: ProgressCallback,
): Promise<HealthData> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.json')) {
    onProgress('zip', 'done', 'JSON');
    const raw = JSON.parse(await file.text());
    return hydrateHealthJson(raw);
  }

  onProgress('zip', 'active');
  let xmlText: string;

  if (name.endsWith('.zip')) {
    const zip = await JSZip.loadAsync(file);
    const xmlFile = Object.keys(zip.files).find(
      (f) =>
        f.endsWith('export.xml') ||
        f.endsWith('Export.xml') ||
        f.toLowerCase().includes('export.xml'),
    );
    const target =
      xmlFile ?? Object.keys(zip.files).find((f) => f.endsWith('.xml'));
    if (!target) throw new Error('No export.xml found in ZIP');
    xmlText = await zip.files[target].async('text');
  } else {
    xmlText = await file.text();
  }

  const fileSizeMB = (xmlText.length / 1024 / 1024).toFixed(0);
  onProgress('zip', 'done', `${fileSizeMB} MB`);

  return parseHealthXml(xmlText, onProgress);
}
