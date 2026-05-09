import {api} from '../lib/api';
import type {Company} from '../types/company';

export const getCompanies = async (): Promise<Company[]> => {
    const res = await api.get('/companies/');
    return res.data;
};

export const createCompany = async (name: string): Promise<Company> => {
    const res = await api.post('/companies/', { name });
    return res.data;
};

export const updateCompany = async (id: number, name: string): Promise<Company> => {
    const res = await api.put(`/companies/${id}/`, { name });
    return res.data;
};

export const deleteCompany = async (id: number): Promise<void> => {
    await api.delete(`/companies/${id}/`);
};