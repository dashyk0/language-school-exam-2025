const Calculator = {
  // Праздники 2026 года (по заданию)
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
    return day === 0 || day === 6; // воскресенье или суббота
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
    const durationInHours = totalWeeks * hoursPerWeek;
    const studentsNumber = formData.students_count;

    let baseCost = durationInHours * courseFeePerHour * studentsNumber;

    // Надбавка за выходные/праздники
    let dayMultiplier = 1;
    if (this.isHoliday(formData.date_start) || this.isWeekend(formData.date_start)) {
      dayMultiplier = 1.5;
    }
    baseCost *= dayMultiplier;

    // Утренние и вечерние надбавки
    baseCost += this.getMorningSurcharge(formData.time_start) * studentsNumber;
    baseCost += this.getEveningSurcharge(formData.time_start) * studentsNumber;

    // Дополнительные опции (пользовательские)
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

    // Автоматические скидки и надбавки
    let earlyRegistration = false;
    let groupEnrollment = false;
    let intensiveCourse = false;

    // Ранняя регистрация (за месяц и более)
    const today = new Date();
    const startDate = new Date(formData.date_start);
    const diffTime = Math.abs(startDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 30) {
      earlyRegistration = true;
      baseCost *= 0.9; // -10%
    }

    // Групповая скидка (5+ студентов)
    if (studentsNumber >= 5) {
      groupEnrollment = true;
      baseCost *= 0.85; // -15%
    }

    // Интенсивный курс (week_length > 20 часов в неделю)
    if (hoursPerWeek > 20) {
      intensiveCourse = true;
      baseCost *= 1.2; // +20%
    }

    return {
      totalCost: Math.round(baseCost),
      earlyRegistration,
      groupEnrollment,
      intensiveCourse
    };
  }
};

  calculateTutorCost(tutor, formData) {
    const pricePerHour = tutor.price_per_hour;
    const duration = formData.duration || 1; // в часах
    const studentsNumber = formData.students_count;

    let baseCost = pricePerHour * duration * studentsNumber;

    // Надбавка за выходные/праздники
    let dayMultiplier = 1;
    if (this.isHoliday(formData.date_start) || this.isWeekend(formData.date_start)) {
      dayMultiplier = 1.5;
    }
    baseCost *= dayMultiplier;

    // Утренние и вечерние надбавки (за час * duration * students)
    baseCost += this.getMorningSurcharge(formData.time_start) * duration * studentsNumber;
    baseCost += this.getEveningSurcharge(formData.time_start) * duration * studentsNumber;

    // Дополнительные опции (адаптировано: personalized для недель? Но для tutors - по duration недель? Упрощаем как для курсов, totalWeeks = 1)
    if (formData.supplementary) {
      baseCost += 2000 * studentsNumber;
    }
    if (formData.personalized) {
      baseCost += 1500 * 1; // фиксировано за "неделю"
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

    // Автоматические
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

    if (duration > 20) {
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