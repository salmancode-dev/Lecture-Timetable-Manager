/**
 * Export and Import utilities for timetable data
 */

export function exportDataAsJSON({ subjects, lectures, settings }) {
  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings: settings || {},
    subjects: subjects || [],
    lectures: lectures || [],
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportPayload, null, 2)
  )}`;
  
  const downloadAnchor = document.createElement('a');
  const fileName = `timetable-backup-${new Date().toISOString().slice(0, 10)}.json`;
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function validateImportData(json) {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid JSON format.');
  }

  if (!Array.isArray(json.subjects)) {
    throw new Error('File is missing a valid "subjects" list.');
  }

  if (!Array.isArray(json.lectures)) {
    throw new Error('File is missing a valid "lectures" list.');
  }

  // Validate subject items
  for (const s of json.subjects) {
    if (!s.id || !s.name) {
      throw new Error(`Malformed subject found: ${JSON.stringify(s)}`);
    }
  }

  // Validate lecture items
  for (const l of json.lectures) {
    if (!l.id || !l.subjectId || l.lectureNumber === undefined || !l.date) {
      throw new Error(`Malformed lecture found: ${JSON.stringify(l)}`);
    }
  }

  return {
    subjects: json.subjects,
    lectures: json.lectures,
    settings: json.settings || {},
  };
}
