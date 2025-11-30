import { $api } from './axios.instance';
import type { Vacancy } from '../types';

export const vacanciesAPI = {
  // Получить все вакансии с фильтрами
  getAll: async (filters?: {
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    employmentType?: string;
    level?: string;
    skills?: string[];
    search?: string;
  }): Promise<Vacancy[]> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await $api.get<Vacancy[]>(`/vacancies?${params.toString()}`);
    return response.data;
  },

  // Получить вакансию по ID
  getById: async (id: number): Promise<Vacancy> => {
    const response = await $api.get<Vacancy>(`/vacancies/${id}`);
    return response.data;
  },

  // Получить вакансии работодателя
  getEmployerVacancies: async (employerId: number): Promise<Vacancy[]> => {
    const response = await $api.get<Vacancy[]>(`/vacancies/employer/${employerId}`);
    return response.data;
  },

  // Создать вакансию
  create: async (data: Omit<Vacancy, 'id' | 'createdAt' | 'updatedAt' | 'employerId'>): Promise<Vacancy> => {
    const response = await $api.post<Vacancy>('/vacancies', data);
    return response.data;
  },

  // Обновить вакансию
  update: async (id: number, data: Partial<Vacancy>): Promise<Vacancy> => {
    const response = await $api.put<Vacancy>(`/vacancies/${id}`, data);
    return response.data;
  },

  // Удалить вакансию
  delete: async (id: number): Promise<void> => {
    await $api.delete(`/vacancies/${id}`);
  },

  // Переключить статус вакансии
  toggleStatus: async (id: number): Promise<Vacancy> => {
    const response = await $api.patch<Vacancy>(`/vacancies/${id}/toggle`);
    return response.data;
  },

  // Получить рекомендованные вакансии
  getRecommended: async (userId: number): Promise<Vacancy[]> => {
    const response = await $api.get<Vacancy[]>(`/vacancies/recommended/${userId}`);
    return response.data;
  }
};