import type { PositionType, ApiResponse, BaseType, EmployeeType, TeamType, WorkType, WorkListType, TeamMemberType, BusyEmployee } from "../type";

const API_URL = 'http://localhost:3000/api';

interface LoginResponse {
    id: string;
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
        // console.log("TOKEN:", token);
        // console.log("HEADERS:", headers);
        const res = await fetch(`${API_URL}${path}`, { ...options, headers });

        if (res.status === 401 && path !== '/auth/login') {
            this.clearToken();
        }
        const response = await res.json()
        if (!res.ok) {
            throw response
        }
        return response;
    },

    // Auth
    login: (data: { id: string; password: string; }) => {
        return api.request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) })
    },

    async getMe(): Promise<EmployeeType> {
        const token = api.getToken();
        if (!token) return Promise.reject('No token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        // console.log(payload)
        const response = await api.request<EmployeeType>(`/employees/${payload.id}`);
        return response.data || response as any
    },
    // Employees
    createEmployee: (data: any) => api.request<EmployeeType>('/employees', { method: 'POST', body: JSON.stringify(data) }),
    getEmployees: () => api.request<EmployeeType[]>('/employees'),
    getEmployee: (id: string) => api.request<EmployeeType>(`/employees/${id}`),
    updateEmployee: (id: string, data: any) => api.request<EmployeeType>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggleBlockEmployee: (id: string) => api.request<EmployeeType>(`/employees/${id}/toggle-block`, { method: "PATCH" }),
    deleteEmployee: (id: string) => api.request<EmployeeType>(`/employees/${id}/hard`, { method: "DELETE" }),

    getBusyEmployeeIds: () => api.request<BusyEmployee[]>('/employees/busy'),
    //Teams
    createTeam: (data: any) => api.request<TeamType>('/team', { method: 'POST', body: JSON.stringify(data) }),
    getTeams: () => api.request<TeamType[]>('/team'),
    getTeam: (id: string) => api.request<TeamType>(`/team/${id}`),
    updateTeam: (id: string, data: any) => api.request<TeamType>(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTeam: (id: string) => api.request<TeamType>(`/team/${id}/hard`, { method: 'DELETE' }),
    addTeamMember: (teamId: string, employeeId: string) => api.request<TeamMemberType>(`/team/${teamId}/members`, { method: 'POST', body: JSON.stringify({ employeeId }) }),

    updateMembersTeamById: (teamId: string, memberIds: string[]) => api.request(`/team/${teamId}/members`, { method: 'PATCH', body: JSON.stringify(memberIds) }),
    getMembersOfTeam: (teamId: string) => api.request(`/team/${teamId}/members`),
    assignTeam: (id: string, data: any) => api.request<TeamType>(`/team/${id}/assign`, { method: 'PATCH', body: JSON.stringify(data) }),
    unAssignTeam: (id: string, data: any) => api.request<TeamType>(`/team/${id}/unassign`, { method: 'PATCH', body: JSON.stringify(data) }),

    //Work
    createWork: (data: any) => api.request<WorkType>('/works', { method: 'POST', body: JSON.stringify(data) }),
    getWorks: () => api.request<WorkType[]>('/works'),
    getWorkTypes: () => api.request<WorkListType[]>('/works/types'),
    getWork: (id: string) => api.request<WorkType>(`/works/${id}`),
    updateWork: (id: string, data: any) => api.request<WorkType>(`/works/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteWork: (id: string) => api.request<WorkType>(`/works/${id}/hard`, { method: 'DELETE' }),
    //Base
    getBases: () => api.request<BaseType[]>('/bases'),
    //Position
    getPositions: () => api.request<PositionType[]>('/positions'),
};