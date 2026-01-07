export const Calculator = {
  holidays: [
    '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05',
    '2026-01-06', '2026-01-07', '2026-01-08',
    '2026-02-23', '2026-03-08',
    '2026-05-01', '2026-05-09',
    '2026-06-12',
    '2026-11-04'
  ],

  isWeekend(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6;
  },

  isHoliday(dateStr) {
    return this.holidays.includes(dateStr);
  },

  getMorningSurcharge(timeStr) {
    const hour = parseInt(timeStr.split(':')[0]);
    return (hour >= 9 && hour < 12) ? 400 : 0;
  },

  getEveningSurcharge(timeStr) {
    const hour = parseInt(timeStr.split(':')[0]);
    return (hour >= 18 && hour <= 20) ? 1000 : 0;
  },

  calculateTotalCost(course, formData) {
    const courseFeePerHour = course.course_fee_per_hour;
    const totalWeeks = course.total_length;
    const hoursPerWeek = course.week_length;
    const studentsNumber = formData.students_count || 1;

    // 1. Базовая стоимость за весь курс
    let baseCost = courseFeePerHour * totalWeeks * hoursPerWeek * studentsNumber;

    // 2. Надбавка за день (выходной/праздник) — применяется к базовой
    const dayMultiplier = (this.isHoliday(formData.date_start) || this.isWeekend(formData.date_start)) ? 1.5 : 1;
    baseCost *= dayMultiplier;

    // 3. Надбавка за время начала — фиксированная, один раз (как у друга!)
    baseCost += this.getMorningSurcharge(formData.time_start) * studentsNumber;
    baseCost += this.getEveningSurcharge(formData.time_start) * studentsNumber;

    // 4. Дополнительные опции
    if (formData.supplementary) {
      baseCost += 2000 * studentsNumber;
    }
    if (formData.personalized) {
      baseCost += 1500 * totalWeeks;
    }
    if (formData.assessment) {
      baseCost += 300;
    }
    if (formData.excursions) {
      baseCost *= 1.25;
    }
    if (formData.interactive) {
      baseCost *= 1.5;
    }

    // 5. Автоматические скидки/надбавки
    let earlyRegistration = false;
    let groupEnrollment = false;
    let intensiveCourse = false;

    const today = new Date();
    const startDate = new Date(formData.date_start);
    const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays >= 30) {
      earlyRegistration = true;
      baseCost *= 0.9;
    }

    if (studentsNumber >= 5) {
      groupEnrollment = true;
      baseCost *= 0.85;
    }

    if (hoursPerWeek > 20) {
      intensiveCourse = true;
      baseCost *= 1.2;
    }

    return {
      totalCost: Math.round(baseCost),
      earlyRegistration,
      groupEnrollment,
      intensiveCourse
    };
  }
};