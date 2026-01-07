import { getCourses } from './api.js';
import { filterTutorsByCourse } from './tutors.js';

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
  allCourses = await getCourses();
  filteredCourses = [...allCourses];

  if (allCourses.length === 0) {
    if (coursesList) coursesList.innerHTML = '<div class="text-danger p-3">Ошибка загрузки курсов</div>';
    return;
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
    coursesList.innerHTML = '<div class="text-muted p-3">No courses found</div>';
    return;
  }

  pageCourses.forEach(course => {
    const div = document.createElement('div');
    div.className = 'border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center course-item';
    div.style.cursor = 'pointer';

    div.innerHTML = `
      <div>
        ${course.name}<br>
        <small class="text-muted">Level: ${course.level} • Teacher: ${course.teacher}</small>
      </div>
      <button class="btn btn-primary btn-sm enroll-btn">
        Enroll
      </button>
    `;

    // Клик по блоку — выделение
    div.addEventListener('click', (e) => {
      if (e.target.classList.contains('enroll-btn')) return;

      document.querySelectorAll('.course-item').forEach(item => item.classList.remove('bg-primary-subtle'));
      div.classList.add('bg-primary-subtle');

      window.selectedCourse = course;
    });

    // Клик по кнопке Enroll
    div.querySelector('.enroll-btn').addEventListener('click', (e) => {
      e.stopPropagation();

      window.selectedCourse = course;

      document.getElementById('selectedCourseName').value = course.name;
      document.getElementById('selectedTeacher').value = course.teacher || 'Не указан';
      document.getElementById('courseDuration').value = `${course.total_length} недель`;

      const dateSelect = document.getElementById('startDateSelect');
      const timeSelect = document.getElementById('startTimeSelect');
      dateSelect.innerHTML = '<option value="">Loading dates...</option>';
      timeSelect.innerHTML = '<option value="">Select date first</option>';
      timeSelect.disabled = true;
      document.getElementById('totalCost').textContent = '0 рублей';
      document.getElementById('autoDiscounts').innerHTML = '';
      document.getElementById('studentsCount').value = '1';
      document.querySelectorAll('#requestForm input[type="checkbox"]').forEach(cb => cb.checked = false);

      const modal = new bootstrap.Modal(document.getElementById('requestModal'));
      modal.show();

      populateStartDates(course);
    });

    coursesList.appendChild(div);
  });
}

function populateStartDates(course) {
  const dateSelect = document.getElementById('startDateSelect');
  dateSelect.innerHTML = '<option value="">Select data</option>';

  const uniqueDates = [...new Set(course.start_dates.map(dt => dt.split('T')[0]))];
  uniqueDates.forEach(dateStr => {
    const option = document.createElement('option');
    option.value = dateStr;
    option.textContent = new Date(dateStr).toLocaleDateString('ru-RU');
    dateSelect.appendChild(option);
  });

  dateSelect.addEventListener('change', () => {
    const timeSelect = document.getElementById('startTimeSelect');
    timeSelect.innerHTML = '<option value="">Select time</option>';
    timeSelect.disabled = false;

    const selectedDate = dateSelect.value;
    const times = course.start_dates
      .filter(dt => dt.split('T')[0] === selectedDate)
      .map(dt => dt.split('T')[1].slice(0, 5));

    times.forEach(time => {
      const option = document.createElement('option');
      option.value = time;
      option.textContent = time;
      timeSelect.appendChild(option);
    });
  });
}

function renderPagination() {
  if (!coursesPagination) return;

  coursesPagination.innerHTML = '';

  const totalPages = Math.ceil(filteredCourses.length / PER_PAGE);
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
    li.innerHTML = '<a class="page-link" href="#">' + i + '</a>';
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