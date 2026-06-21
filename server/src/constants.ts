
export const ROLES = {
    ADMIN: 'admin',
    COORDINATOR: 'coordinator',
    WORKER: 'worker',
    LEADER: 'leader'
} as const



export const ASSIGNMENT_ROLES = {
    WORKER: 'worker',
    SUPERVISOR: 'supervisor',
} as const;

export const ROLESNAME: Record<string, string> = {
    admin: 'Администратор',
    coordinator: 'Координатор',
    worker: 'Работник',
    leader: 'Лидер'
} as const

export const WORK_STATUSES = {
    DRAFT: 'draft',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CLOSED: 'closed'
} as const
export const WORK_TYPES = {
    CASING: 'Casing',
    TUBING: 'Tubing',
    LINER: 'Liner',
    LOWER_COMPLETION: 'Lower completion',
    UPPER_COMPLETION: 'Upper completion',
} as const;
export const TEAM_STATUS = {
    FORMING: "forming",
    ACTIVE: "active",
    ARCHIVED: "archived",
    IDLE: "idle",
    MAINTENANCE: "maintenance"
} as const

export const TEAM_STATUS_COLOR:Record<string, { bg: string; color: string }> = {
    forming: { bg: '#f1f5f9', color: '#333' },
    active: { bg: 'var(--color-success)', color: '#fff' },
    idle: { bg: '#3498db', color: '#fff' },
    maintenance: { bg: 'var(--color-warning)', color: '#fff' },
    archived: { bg: '#95a5a6', color: '#fff' },
}

export const ENTITY = {
    BASE: 'База',
    EMPLOYEE: 'Сотрудник',
    POSITION: 'Должность',
    TEAM: 'Бригада',
    WORK: 'Работа',
    WORK_ASSIGNMENT: 'Назначение на работу'
} as const
//? * ----------------------------- STRING MESSAGES ---------------------------- */
export const MSG = {
    /* ---------------------------- DINAMIC CONSTANTS --------------------------- */

    ENTITY_NOT_FOUND_ID: (entity: string, id: string) => { return `${entity} с  id:${id} не найдено.` },
    ENTITY_WAS_CREATED: (entity: string, id: string | number = '') => { return `${entity} с id:${id} был создан.` },
    ENTITY_WAS_READ: (entity: string) => { return `Данные по ${entity} получены успешно.` },
    ENTITY_WAS_UPDATED: (entity: string, id: string | number) => { return `${entity} с id:${id} была обновлена.` },
    ENTITY_WAS_HARD_DELETED: (entity: string, id: string) => { return `${entity} с  id:${id} был(а) удален(а).` },
    ENTITY_WAS_SOFT_DELETE: (entity: string, id: string) => { return `${entity} с  id:${id} был(а) отмечен(а) на удаление.` },
    ENTITY_WAS_RESTORE: (entity: string, id: string) => { return `${entity} с  id:${id} был(а) востановлен(а).` },
    ENTITY_ALREADY_HAVE: (entity: string, id: string) => { return `${entity} с таким  id:${id} уже существует.` },
    ACCESS_DENIED: (entity: string) => { return `${entity}(у) доступ запрещён.` },
    TBL_IS_EMPTY: (entity: string) => { return `Таблица ${entity} пуста.` },
    // DRAFT:(entity:string,id:string)=>{`${entity} ${id}`},
    /* -------------------------------- EMPLOYEE -------------------------------- */
    EMP_IS_BLOCKED: "Сотрудник заблокирован",
    /* ---------------------------------- TEAM ---------------------------------- */
    TEAM_ASSIGNED_TO_WORK: "Бригада назначена на работу.",
    TEAM_ALREADY_FREE: "Бригада уже свободна от работы.",
    TEAM_SUCCESSFULL_MOVED: "Бригада успешно перемещена в работу.",
    /* ---------------------------------- WORK ---------------------------------- */
    WORK_STATUS_IS_WRONG: "Не верный статус работы",
    WORK_ROLE_INVALID: "Данной роли не существует.",
    /* ----------------------------- WORK_ASSIGNMENT ---------------------------- */
    WORK_ASSIGNMENT_ALREADY_EXISTS: "Дублирующая запись.",
    WORK_ASSIGNMENT_EMPLOYEES_ENOUGHT: "Бригада укомплектована.",
    /* ------------------------------- VALIDATION ------------------------------- */
    SERVER_ERROR: "Ошибка сервера",

    WRONG_EMP_ID_OR_PASSWORD: 'Неверный EmployeeID или пароль',

    STR_MAIL_WRONG_FORMAT: 'Неверный формат EmployeeID (E + 6 цифр).',
    STR_PASSWORD_WRONG_FORMAT: 'Пароль минимум 6 символов.',
    STR_MAIL_ALREADY_HAVE: 'Email уже используется',
    /* ------------------------------ REQUIRE DATA ------------------------------ */
    REQ_CITY: "Название и город обязательны.",
    REQ_FIELD_PHONE: 'Телефон обязателен',
    REQ_EMP_ID_AND_PASSWORD: 'EmployeeID и пароль обязательны',
    REQ_POSITION: "Необходимо ввести должность.",


} as const

/* --------------------------------- Create --------------------------------- */
/* --------------------------------- Read By Id --------------------------------- */
/* -------------------------------- Read all -------------------------------- */
/* --------------------------------- Update --------------------------------- */
/* --------------------------------- Hard Delete --------------------------------- */
/* --------------------------------- Soft Delete --------------------------------- */
/* --------------------------------- Restore delete item --------------------------------- */