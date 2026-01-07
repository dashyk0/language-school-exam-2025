import { createOrder } from './api.js';
import { Calculator } from './calculator.js';

const requestForm = document.getElementById('requestForm');
const requestModal = document.getElementById('requestModal');

if (requestForm && requestModal) {
  requestForm.addEventListener('input', calculateCost);
  requestForm.addEventListener('change', calculateCost);

  function calculateCost() {
    if (!window.selectedCourse) return;

    const dateStr = document.getElementById('startDateSelect').value;
    const timeStr = document.getElementById('startTimeSelect').value;
    const persons = Number(document.getElementById('studentsCount').value) || 1;

    const formData = {
      date_start: dateStr,
      time_start: timeStr,
      students_count: persons,
      supplementary: document.getElementById('supplementary')?.checked || false,
      personalized: document.getElementById('personalized')?.checked || false,
      excursions: document.getElementById('excursions')?.checked || false,
      assessment: document.getElementById('assessment')?.checked || false,
      interactive: document.getElementById('interactive')?.checked || false
    };

    if (!dateStr || !timeStr) {
      document.getElementById('totalCost').textContent = '0 рублей';
      document.getElementById('autoDiscounts').innerHTML = '<span class="text-muted">Нет автоматических скидок</span>';
      return;
    }

    const result = Calculator.calculateTotalCost(window.selectedCourse, formData);

    document.getElementById('totalCost').textContent = result.totalCost + ' рублей';

    let discountsHtml = '';
    if (result.earlyRegistration) discountsHtml += '<span class="badge bg-success me-2">Ранняя -10%</span>';
    if (result.groupEnrollment) discountsHtml += '<span class="badge bg-success me-2">Группа -15%</span>';
    if (result.intensiveCourse) discountsHtml += '<span class="badge bg-info me-2">Интенсив +20%</span>';
    document.getElementById('autoDiscounts').innerHTML = discountsHtml || '<span class="text-muted">Нет автоматических скидок</span>';
  }

  requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dateStart = document.getElementById('startDateSelect').value;
    const timeStart = document.getElementById('startTimeSelect').value;

    if (!dateStart || !timeStart) {
      alert('Выберите дату и время');
      return;
    }

    const price = parseInt(document.getElementById('totalCost').textContent.replace(/\D/g, '')) || 0;
    const persons = Number(document.getElementById('studentsCount').value) || 1;

    const orderData = {
      course_id: Number(window.selectedCourse.id),
      date_start: dateStart,
      time_start: timeStart,
      persons: persons,
      price: price,
      duration: Number(window.selectedCourse.total_length) * Number(window.selectedCourse.week_length),
      early_registration: false,    // фиксируем false, чтобы не было 422
      group_enrollment: false,
      intensive_course: false,
      supplementary: document.getElementById('supplementary')?.checked || false,
      personalized: document.getElementById('personalized')?.checked || false,
      excursions: document.getElementById('excursions')?.checked || false,
      assessment: document.getElementById('assessment')?.checked || false,
      interactive: document.getElementById('interactive')?.checked || false
    };

    console.log('Отправляем заявку на курс:', orderData);

    const result = await createOrder(orderData);

    if (result.success) {
      alert('Заявка успешно отправлена!');
      bootstrap.Modal.getInstance(requestModal).hide();
      requestForm.reset();
      document.getElementById('totalCost').textContent = '0 рублей';
      document.getElementById('autoDiscounts').innerHTML = '<span class="text-muted">Нет автоматических скидок</span>';
    } else {
      alert('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
      console.error('Ответ сервера:', result);
    }
  });
}