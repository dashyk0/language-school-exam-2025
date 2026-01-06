// js/courses.js

import { getCourses } from './api.js';

let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const PER_PAGE = 5;

const coursesList = document.getElementById('coursesList');
const coursesPagination = document.getElementById('coursesPagination');
const courseSearchName = document.getElementById('courseSearchName');
const courseSearchLevel = document.getElementById('courseSearchLevel');
const courseSearchBtn = document.getElementById('courseSearchBtn');

export async function loadAndRenderCourses() {
  console.log('Начало загрузки курсов...');

  allCourses = await getCourses();
  filteredCourses = [...allCourses];

  if (allCourses.length === 0) {
    console.error('Курсы не загрузились или пустой массив');
    if (coursesList) coursesList.innerHTML = '<div class="text-danger p-3">Ошибка загрузки курсов. Проверьте консоль.</div>';
    return;
  }

  console.log('Курсы успешно загружены:', allCourses.length, 'штук');
  renderCourses();
  renderPagination();
}

function renderCourses() {
  if (!coursesList) {
    console.error('Элемент #coursesList не найден');
    return;
  }

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
      document.querySelectorAll('.course-item').forEach(item => item.classList.remove('bg-primary-subtle'));
      div.classList.add('bg-primary-subtle');
      window.selectedCourse = course;
      const input = document.getElementById('selectedCourse');
      if (input) input.value = course.name;
      if (requestBtn) requestBtn.disabled = true; // Деактивируем, пока репетитор не выбран
      console.log('Выбран курс:', course.name);
    });

    coursesList.appendChild(div);
  });

  console.log('Отрисовано курсов на странице:', pageCourses.length);
}

function renderPagination() {
  if (!coursesPagination) return;

  const totalPages = Math.ceil(filteredCourses.length / PER_PAGE);
  coursesPagination.innerHTML = '';

  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center';

  // Previous
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

  // Next
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

// Функция поиска
function applySearch() {
  console.log('Поиск запущен');

  const nameQuery = courseSearchName.value.toLowerCase().trim();
  const levelQuery = courseSearchLevel.value;

  filteredCourses = allCourses.filter(course => {
    const nameMatch = course.name.toLowerCase().includes(nameQuery);
    const levelMatch = levelQuery === 'All levels' || course.level === levelQuery;
    return nameMatch && levelMatch;
  });

  currentPage = 1;
  renderCourses();
  renderPagination();
}

// Подключение событий для поиска
courseSearchBtn.addEventListener('click', applySearch);
courseSearchName.addEventListener('input', applySearch);
courseSearchLevel.addEventListener('change', applySearch);