
import { createOrder } from './api.js';
import { Calculator } from './calculator.js'; // <-- КРИТИЧЕСКИЙ ИМПОРТ!

const requestForm = document.getElementById('requestForm');
const requestModal = document.getElementById('requestModal');

if (requestForm && requestModal) {
  // Функция расчёта стоимости
  function calculateCost() {
    if (!window.selectedCourse) return;

    const dateStart = document.getElementById('startDateSelect').value;
    const timeStart = document.getElementById('startTimeSelect').value;
    const studentsCount = Number(document.getElementById('studentsCount').value || 1);

    const formData = {
      date_start: dateStart,
      time_start: timeStart,
      students_count: studentsCount,
      supplementary: document.getElementById('supplementary')?.checked || false,
      personalized: document.getElementById('personalized')?.checked || false,
      excursions: document.getElementById('excursions')?.checked || false,
      assessment: document.getElementById('assessment')?.checked || false,
      interactive: document.getElementById('interactive')?.checked || false
    };

    const result = Calculator.calculateTotalCost(window.selectedCourse, formData);

    // Обновляем стоимость
    const totalCostEl = document.getElementById('totalCost');
    if (totalCostEl) {
      totalCostEl.textContent = `${result.totalCost} рублей`;
    }

    // Автоматические скидки/надбавки
    const discountsEl = document.getElementById('autoDiscounts');
    if (discountsEl) {
      let badges = '';
      if (result.earlyRegistration) {
        badges += '<span class="badge bg-success me-2">Early registration -10%</span>';
      }
      if (result.groupEnrollment) {
        badges += '<span class="badge bg-success me-2">Group discount -15%</span>';
      }
      if (result.intensiveCourse) {
        badges += '<span class="badge bg-info me-2">Intensive +20%</span>';
      }
      discountsEl.innerHTML = badges || '<span class="text-muted">No automatic discounts</span>';
    }
  }

  // Привязываем события после открытия модалки
  requestModal.addEventListener('shown.bs.modal', () => {
    const triggers = [
      document.getElementById('startDateSelect'),
      document.getElementById('startTimeSelect'),
      document.getElementById('studentsCount'),
      document.getElementById('supplementary'),
      document.getElementById('personalized'),
      document.getElementById('excursions'),
      document.getElementById('assessment'),
      document.getElementById('interactive')
    ];

    triggers.forEach(el => {
      if (el) {
        // Удаляем старые обработчики, чтобы не было дублирования
        el.removeEventListener('change', calculateCost);
        el.removeEventListener('input', calculateCost);
        el.addEventListener('change', calculateCost);
        if (el.type === 'number') el.addEventListener('input', calculateCost);
      }
    });

    // Первый расчёт сразу после открытия
    calculateCost();
  });

  // Отправка заявки
  requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!window.selectedCourse) {
      alert('Course not selected');
      return;
    }

    const dateStart = document.getElementById('startDateSelect').value;
    const timeStart = document.getElementById('startTimeSelect').value;
    if (!dateStart || !timeStart) {
      alert('Please select start date and time');
      return;
    }

    const totalCostText = document.getElementById('totalCost').textContent;
    const price = parseInt(totalCostText.replace(/[^0-9]/g, '')) || 0;

    const formData = {
      course_id: window.selectedCourse.id,
      date_start: dateStart,
      time_start: timeStart,
      persons: Number(document.getElementById('studentsCount').value),
      price: price,
      early_registration: document.querySelector('#autoDiscounts .bg-success')?.textContent.includes('-10%') || false,
      group_enrollment: document.querySelector('#autoDiscounts .bg-success')?.textContent.includes('-15%') || false,
      intensive_course: document.querySelector('#autoDiscounts .bg-info')?.textContent.includes('+20%') || false,
      supplementary: document.getElementById('supplementary').checked,
      personalized: document.getElementById('personalized').checked,
      excursions: document.getElementById('excursions').checked,
      assessment: document.getElementById('assessment').checked,
      interactive: document.getElementById('interactive').checked
    };

    const result = await createOrder(formData);

    if (result.success) {
      alert('Application submitted successfully!');
      bootstrap.Modal.getInstance(requestModal).hide();
      requestForm.reset();
      document.getElementById('totalCost').textContent = '0 рублей';
      document.getElementById('autoDiscounts').innerHTML = '<span class="text-muted">No automatic discounts</span>';
    } else {
      alert('Error: ' + (result.error || 'Unknown error'));
    }
  });
}
