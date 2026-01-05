
const API_BASE_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api';
const API_KEY = '2d451ee9-0077-47ae-9708-61c16e452353';
export async function getCourses() {
  try {
    const response = await fetch(`${API_BASE_URL}/courses?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error);
    return [];
  }
}