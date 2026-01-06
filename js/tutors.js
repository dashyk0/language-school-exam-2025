// js/tutors.js

import { getTutors } from './api.js';
import { getLanguageFromCourse } from './utils.js';

let allTutors = [];
let filteredTutors = [];
let currentPage = 1;
const PER_PAGE = 5;

const tutorsList = document.getElementById('tutorsList');
const tutorsPagination = document.getElementById('tutorsPagination');
const tutorQualification = document.getElementById('tutorQualification');
const tutorExperience = document.getElementById('tutorExperience');
const tutorSearchBtn = document.getElementById('tutorSearchBtn');
const requestBtn = document.getElementById('requestBtn');

// Функция фильтрации по языку курса (languages_offered содержит массив)
export function filterTutorsByCourse(course) {
  if (!course || allTutors.length === 0) {
    filteredTutors = [...allTutors];
  } else {
    const language = getLanguageFromCourse(course.name);
    if (language === '') {
      filteredTutors = [...allTutors];
    } else {
      filteredTutors = allTutors.filter(tutor => {
        return tutor.languages_offered && tutor.languages_offered.some(lang => 
          lang.toLowerCase().includes(language)
        );
      });
    }
  }
  currentPage = 1;
  renderTutors();
  renderPagination();
}

export async function loadAndRenderTutors() {
  console.log('Загрузка репетиторов...');
  
  if (allTutors.length === 0) {
    allTutors = await getTutors();
    console.log('Репетиторы загружены:', allTutors.length);
    if (allTutors.length === 0) {
      if (tutorsList) tutorsList.innerHTML = '<div class="text-danger p-3">Ошибка загрузки репетиторов</div>';
      return;
    }
    filteredTutors = [...allTutors];
  }
  
  renderTutors();
  renderPagination();
}

function renderTutors() {
  if (!tutorsList) return;

  tutorsList.innerHTML = '';

  const start = (currentPage - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const pageTutors = filteredTutors.slice(start, end);

  if (pageTutors.length === 0) {
    tutorsList.innerHTML = '<div class="text-muted p-3">Репетиторы не найдены</div>';
    return;
  }

  pageTutors.forEach(tutor => {
    const div = document.createElement('div');
    div.className = 'border p-3 mb-3 tutor-item';
    div.style.cursor = 'pointer';
    
    // Реальные поля из API
    const languages = tutor.languages_offered ? tutor.languages_offered.join(', ') : '—';
    
    div.innerHTML = `
      <strong>${tutor.name}</strong><br>
      Level: ${tutor.language_level || '—'}<br>
      Experience: ${tutor.work_experience || 0} years<br>
      Languages offered: ${languages}<br>
      Price: ${tutor.price_per_hour || 0} ₽/hour
    `;

    div.addEventListener('click', () => {
      document.querySelectorAll('.tutor-item').forEach(el => el.classList.remove('bg-primary-subtle'));
      div.classList.add('bg-primary-subtle');

      window.selectedTutor = tutor;
      
      const input = document.getElementById('selectedTutor');
      if (input) input.value = tutor.name;

      if (requestBtn) requestBtn.disabled = false;
      
      console.log('Выбран репетитор:', tutor.name);
    });

    tutorsList.appendChild(div);
  });
}

function renderPagination() {
  if (!tutorsPagination) return;

  const totalPages = Math.ceil(filteredTutors.length / PER_PAGE);
  tutorsPagination.innerHTML = '';

  if (totalPages <= 1) return;

  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center';

  // Previous
  const prev = document.createElement('li');
  prev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prev.innerHTML = '<a class="page-link" href="#">Previous</a>';
  prev.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderTutors();
    }
  });
  ul.appendChild(prev);

  // Номера страниц
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      currentPage = i;
      renderTutors();
    });
    ul.appendChild(li);
  }

  // Next
  const next = document.createElement('li');
  next.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  next.innerHTML = '<a class="page-link" href="#">Next</a>';
  next.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderTutors();
    }
  });
  ul.appendChild(next);

  tutorsPagination.appendChild(ul);
}

function applyFilters() {
  let baseList = allTutors; // если курс не выбран — от всех
  if (window.selectedCourse) {
    // Если курс выбран — берём уже отфильтрованный по языку список как основу
    const language = getLanguageFromCourse(window.selectedCourse.name).toLowerCase();
    if (language !== '') {
      baseList = allTutors.filter(tutor =>
        tutor.languages_offered && tutor.languages_offered.some(lang => 
          lang.toLowerCase().includes(language)
        )
      );
    }
  }

  const levelFilter = tutorQualification?.value || '';
  const expMin = tutorExperience?.value ? Number(tutorExperience.value) : 0;

  filteredTutors = baseList.filter(tutor => {
    let match = true;
    if (levelFilter) match = match && tutor.language_level === levelFilter;
    if (expMin > 0) match = match && tutor.work_experience >= expMin;
    return match;
  });

  currentPage = 1;
  renderTutors();
  renderPagination();
}

// События
tutorSearchBtn?.addEventListener('click', applyFilters);
tutorQualification?.addEventListener('change', applyFilters);
tutorExperience?.addEventListener('input', applyFilters);