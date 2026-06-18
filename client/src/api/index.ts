import { type PositionType, type ApiResponse, type BaseType, type EmployeeType } from "../type";

const API_URL = 'http://localhost:3000/api';

export const api = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token: string) => localStorage.setItem('token', token),
    clearToken: () => localStorage.removeItem('token'),

    async request<T>(path: string, options: RequestInit = {}):Promise<ApiResponse<T>>{
        const token = this.getToken();
        const headers: any = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };
        const res = await fetch(`${API_URL}${path}`, { ...options, headers });
        if (res.status === 401) {
            this.clearToken();
            window.location.href = '/login';
        }
        const data  = await res.json()
        if (!res.ok){
            throw new Error(data.error||'Ошибка сервера')
        }
        return data;
    },

    // Auth
    login: (data: { employeeId: string; password: string }) =>
        api.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    
    async getMe(): Promise<EmployeeType> {
        const token = api.getToken();
        if (!token) return Promise.reject('No token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const response =await api.request<EmployeeType>(`/employees/${payload.employeeId}`);
        return  response.data||response as any
    },
    // Employees
    getEmployees: () => api.request<EmployeeType[]>('/employees'),
    getEmployee: (id: string) => api.request<EmployeeType>(`/employees/${id}`),
    createEmployee: (data: any) => api.request<EmployeeType>('/employees', { method: 'POST', body: JSON.stringify(data) }),
    updateEmployee: (id: string, data: any) => api.request<EmployeeType>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteEmployee:(id:string)=>api.request<EmployeeType>(`/employees/${id}/hard`,{method:"DELETE"}),
    toggleBlockEmployee:(id:string)=>api.request<EmployeeType>(`/employees/${id}/toggle-block`,{method:"PATCH"}),
    //Base
    getBases:()=> api.request<BaseType[]>('/bases'),
    //Position
    getPositions:()=> api.request<PositionType[]>('/positions')
};