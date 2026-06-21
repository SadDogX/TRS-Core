import { type PositionType, type ApiResponse, type BaseType, type EmployeeType, type TeamType } from "../type";

const API_URL = 'http://localhost:3000/api';

interface LoginResponse {
    token: string;
    user: EmployeeType;
}

export const api = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token: string) => localStorage.setItem('token', token),
    clearToken: () => localStorage.removeItem('token'),

    async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.error || 'Ошибка сервера')
        }
        return data;
    },

    // Auth
    login: (data: { employeeId: string; password: string }) =>
        api.request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    async getMe(): Promise<EmployeeType> {
        const token = api.getToken();
        if (!token) return Promise.reject('No token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const response = await api.request<EmployeeType>(`/employees/${payload.employeeId}`);
        return response.data || response as any
    },
    // Employees
    createEmployee: (data: any) => api.request<EmployeeType>('/employees', { method: 'POST', body: JSON.stringify(data) }),
    getEmployees: () => api.request<EmployeeType[]>('/employees'),
    getEmployee: (id: string) => api.request<EmployeeType>(`/employees/${id}`),
    updateEmployee: (id: string, data: any) => api.request<EmployeeType>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggleBlockEmployee: (id: string) => api.request<EmployeeType>(`/employees/${id}/toggle-block`, { method: "PATCH" }),
    deleteEmployee: (id: string) => api.request<EmployeeType>(`/employees/${id}/hard`, { method: "DELETE" }),
    //Base
    getBases: () => api.request<BaseType[]>('/bases'),
    //Position
    getPositions: () => api.request<PositionType[]>('/positions'),
    //Teams
    createTeam:(data:any)=>api.request<TeamType>('/team',{method:'POST',body:JSON.stringify(data)}),
    getTeams:() =>api.request<TeamType[]>('/team'),
    getTeam:(id:string) =>api.request<TeamType>(`/team/${id}`),
    updateTeam:(id: string, data: any) =>api.request<TeamType>(`/team/${id}`,{method:'PUT',body:JSON.stringify(data)}),
    deleteTeam:(id:string)=>api.request<TeamType>(`/team/${id}/hard`,{method:'DELETE'})
    
};