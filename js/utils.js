/**
 * Определяет язык по названию курса
 * @param {string} courseName - название курса
 * @returns {string} - название языка в нижнем регистре (english, spanish, french и т.д.) или пустая строка, если не найден
 */
export function getLanguageFromCourse(courseName) {
  if (typeof courseName !== 'string') return '';

  const lower = courseName.toLowerCase();

  if (lower.includes('english') || lower.includes('ielts') || lower.includes('toefl')) {
    return 'english';
  }
  if (lower.includes('spanish')) {
    return 'spanish';
  }
  if (lower.includes('french')) {
    return 'french';
  }
  if (lower.includes('german')) {
    return 'german';
  }
  if (lower.includes('italian')) {
    return 'italian';
  }
  if (lower.includes('japanese')) {
    return 'japanese';
  }
  if (lower.includes('chinese') || lower.includes('mandarin')) {
    return 'chinese';
  }
  if (lower.includes('russian')) {
    return 'russian';
  }

  return '';
}