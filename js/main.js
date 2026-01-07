import { loadAndRenderCourses } from './courses.js';
import { loadAndRenderTutors } from './tutors.js';


document.addEventListener('DOMContentLoaded', () => {
  console.log('Главная страница загружается...');

  // Исчезновение статического приветственного уведомления через 5 секунд
  const welcomeAlert = document.querySelector('.alert.alert-info.alert-dismissible');
  if (welcomeAlert) {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(welcomeAlert);
      bsAlert.close();
    }, 5000);
  }

  loadAndRenderCourses();
  loadAndRenderTutors();
});
