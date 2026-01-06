import { loadAndRenderCourses } from './courses.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Главная страница загружается...');
  loadAndRenderCourses();
});