import { $api } from './axios.instance';
import type { Employer, Vacancy } from '../types';

export const employerAPI = {
  getProfile: async (employerId: number): Promise<Employer> => {
    const response = await $api.get<Employer>(`/user/employer/${employerId}`);
    return response.data;
  },

  getVacancies: async (employerId: number): Promise<Vacancy[]> => {
    const response = await $api.get<Vacancy[]>(`/vacancies/employer/${employerId}`);
    return response.data;
  },
};