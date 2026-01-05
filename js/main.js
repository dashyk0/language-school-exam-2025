import { loadAndRenderCourses } from './courses.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('SpeakEasy: запуск главной страницы');
  loadAndRenderCourses();
});