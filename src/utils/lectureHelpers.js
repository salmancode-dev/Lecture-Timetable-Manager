/**
 * Helpers for lecture numbering and validation
 */

/**
 * Calculate the next suggested lecture number for a subject (max lectureNumber + 1, default 1)
 */
export function getNextLectureNumber(subjectId, lectures) {
  if (!subjectId || !Array.isArray(lectures)) return 1;
  const subjectLectures = lectures.filter((l) => l.subjectId === subjectId);
  if (subjectLectures.length === 0) return 1;

  const maxNum = subjectLectures.reduce((max, l) => {
    const num = Number(l.lectureNumber);
    return !isNaN(num) && num > max ? num : max;
  }, 0);

  return maxNum + 1;
}

/**
 * Check if a lecture number is already taken by the same subject
 * excludeLectureId is used when editing an existing lecture
 */
export function isDuplicateLectureNumber(subjectId, lectureNumber, excludeLectureId, lectures) {
  if (!subjectId || !lectureNumber || !Array.isArray(lectures)) return false;
  const targetNum = Number(lectureNumber);
  if (isNaN(targetNum)) return false;

  return lectures.some(
    (l) =>
      l.subjectId === subjectId &&
      l.id !== excludeLectureId &&
      Number(l.lectureNumber) === targetNum
  );
}

/**
 * Filter and sort lectures utility
 */
export function filterAndSortLectures(lectures, {
  subjectId = 'all',
  month = 'all',
  status = 'all',
  search = '',
  sortOrder = 'asc',
  subjectsMap = {}
}) {
  if (!Array.isArray(lectures)) return [];

  const query = search.trim().toLowerCase();

  return lectures
    .filter((lec) => {
      // Subject filter
      if (subjectId !== 'all' && lec.subjectId !== subjectId) return false;

      // Month filter (YYYY-MM)
      if (month !== 'all' && (!lec.date || !lec.date.startsWith(month))) return false;

      // Status filter
      if (status !== 'all' && lec.status !== status) return false;

      // Search filter
      if (query) {
        const subject = subjectsMap[lec.subjectId];
        const subjectName = subject?.name?.toLowerCase() || '';
        const subjectCode = subject?.code?.toLowerCase() || '';
        const notes = lec.notes?.toLowerCase() || '';
        const numStr = String(lec.lectureNumber);
        const dateStr = lec.date || '';

        const matches =
          subjectName.includes(query) ||
          subjectCode.includes(query) ||
          notes.includes(query) ||
          numStr.includes(query) ||
          dateStr.includes(query);

        if (!matches) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by date primary
      if (a.date !== b.date) {
        return sortOrder === 'asc'
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
      // If dates are identical, sort by lectureNumber
      return sortOrder === 'asc'
        ? Number(a.lectureNumber) - Number(b.lectureNumber)
        : Number(b.lectureNumber) - Number(a.lectureNumber);
    });
}
