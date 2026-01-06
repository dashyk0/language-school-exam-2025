import { getCourses } from './api.js';
import { filterTutorsByCourse, loadAndRenderTutors } from './tutors.js'; 

let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const PER_PAGE = 5;

const coursesList = document.getElementById('coursesList');
const coursesPagination = document.getElementById('coursesPagination');
const courseSearchName = document.getElementById('courseSearchName');
const courseSearchLevel = document.getElementById('courseSearchLevel');
const courseSearchBtn = document.getElementById('courseSearchBtn');
const requestBtn = document.getElementById('requestBtn');

export async function loadAndRenderCourses() {
  console.log('Начало загрузки курсов...');

  allCourses = await getCourses();
  filteredCourses = [...allCourses];

  if (allCourses.length === 0) {
    if (coursesList) coursesList.innerHTML = '<div class="text-danger p-3">Ошибка загрузки курсов</div>';
    return;
  }

  console.log('Курсы загружены:', allCourses.length);

  // Загружаем репетиторов один раз
  try {
    await loadAndRenderTutors();
    console.log('Репетиторы успешно загружены и отображены');
  } catch (err) {
    console.error('Ошибка при загрузке репетиторов:', err);
  }

  renderCourses();
  renderPagination();
}

function renderCourses() {
  if (!coursesList) return;

  coursesList.innerHTML = '';

  const start = (currentPage - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const pageCourses = filteredCourses.slice(start, end);

  if (pageCourses.length === 0) {
    coursesList.innerHTML = '<div class="text-muted">Курсы не найдены</div>';
    return;
  }

  pageCourses.forEach(course => {
    const div = document.createElement('div');
    div.className = 'border-bottom pb-2 mb-2 course-item';
    div.style.cursor = 'pointer';
    div.innerHTML = `${course.name}`;

    div.addEventListener('click', () => {
      // Снимаем выделение с других курсов
      document.querySelectorAll('.course-item').forEach(item => {
        item.classList.remove('bg-primary-subtle');
      });
      div.classList.add('bg-primary-subtle');

      // Сохраняем выбранный курс
      window.selectedCourse = course;
      const courseInput = document.getElementById('selectedCourse');
      if (courseInput) courseInput.value = course.name;

      // Сбрасываем выбор репетитора
      window.selectedTutor = null;
      const tutorInput = document.getElementById('selectedTutor');
      if (tutorInput) tutorInput.value = '';
      document.querySelectorAll('.tutor-item').forEach(item => {
        item.classList.remove('bg-primary-subtle');
      });

      // Деактивируем кнопку заявки
      if (requestBtn) requestBtn.disabled = true;

      // Главное — фильтруем репетиторов по языку курса
      filterTutorsByCourse(course);

      console.log('Клик по курсу:', course.name, '— фильтрация репетиторов запущена');
    });

    coursesList.appendChild(div);
  });
}

function renderPagination() {
  if (!coursesPagination) return;

  const totalPages = Math.ceil(filteredCourses.length / PER_PAGE);
  coursesPagination.innerHTML = '';

  if (totalPages <= 1) return;

  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center';

  const prev = document.createElement('li');
  prev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prev.innerHTML = '<a class="page-link" href="#">«</a>';
  prev.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderCourses();
    }
  });
  ul.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      currentPage = i;
      renderCourses();
    });
    ul.appendChild(li);
  }

  const next = document.createElement('li');
  next.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  next.innerHTML = '<a class="page-link" href="#">»</a>';
  next.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderCourses();
    }
  });
  ul.appendChild(next);

  coursesPagination.appendChild(ul);
}

// Поиск курсов
function applySearch() {
  const nameQuery = courseSearchName?.value.toLowerCase().trim() || '';
  const levelQuery = courseSearchLevel?.value || '';

  filteredCourses = allCourses.filter(course => {
    const nameMatch = course.name.toLowerCase().includes(nameQuery);
    const levelMatch = levelQuery === '' || levelQuery === 'All levels' || course.level === levelQuery;
    return nameMatch && levelMatch;
  });

  currentPage = 1;
  renderCourses();
  renderPagination();
}

courseSearchBtn?.addEventListener('click', applySearch);
courseSearchName?.addEventListener('input', applySearch);
courseSearchLevel?.addEventListener('change', applySearch);