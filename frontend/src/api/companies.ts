import {api} from '../lib/api';
import type {Company} from '../types/company';

export const getCompanies = async (): Promise<Company[]> => {
    const res = await api.get('/companies');
    return res.data;
};