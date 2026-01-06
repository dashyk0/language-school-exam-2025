import { loadAndRenderCourses } from './courses.js';
import { loadAndRenderTutors } from './tutors.js';


document.addEventListener('DOMContentLoaded', () => {
  console.log('Главная страница загружается...');
  loadAndRenderCourses();
  loadAndRenderTutors();
});