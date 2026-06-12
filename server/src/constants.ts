
export const ROLES = {
    ADMIN: 'admin',
    COORDINATOR: 'coordinator',
    WORKER: 'worker',
    LEADER: 'leader'
} as const

export const ROLESNAME: Record<string,string> = {
    admin: 'Администратор',
    coordinator: 'Координатор',
    worker: 'Работник',
    leader: 'Лидер'
} 

export const WORK_STATUSES = {
    DRAFT: 'draft',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CLOSED: 'closed'
}

export const TEAM_STATUS = {
    FORMING: "forming",
    ACTIVE: "active",
    ARCHIVED: "archived",
    IDLE: "idle",
    MAINTENANCE: "maintenance"
}

export const ENTITY = {
    BASE: 'База',
    EMPLOYEE: 'Сотрудник',
    POSITION: 'Должность',
    TEAM: 'Бригада',
    WORK: 'Работа',
    WORK_ASSIGNMENT: 'Назначение на работу.'
}
//? * ----------------------------- STRING MESSAGES ---------------------------- */
export const MSG = {
    /* ---------------------------- DINAMIC CONSTANTS --------------------------- */

    ENTITY_NOT_FOUND_ID: (entity: string, id: string) => { `${entity} с  id:${id} не найдено.` },
    ENTITY_WAS_CREATED:(entity:string,id:string|number='')=>{`${entity} с id:${id} был создан.`},
    ENTITY_WAS_READ:(entity:string)=>{`Данные по ${entity} получены успешно.`},
    ENTITY_WAS_UPDATED:(entity:string,id:string|number)=>{`${entity} с id:${id} была обновлена.`},
    ENTITY_WAS_HARD_DELETED: (entity: string, id: string) => { `${entity} с  id:${id} был(а) удален(а).` },
    ENTITY_WAS_SOFT_DELETE: (entity: string, id: string) => { `${entity} с  id:${id} был(а) отмечен(а) на удаление.` },
    ENTITY_WAS_RESTORE: (entity: string, id: string) => { `${entity} с  id:${id} был(а) востановлен(а).` },
    ENTITY_ALREADY_HAVE: (entity: string, id: string) => { `${entity} с таким  id:${id} уже существует.` },
    ACCESS_DENIED: (entity: string) => { `${entity}(у) доступ запрещён.` },
    // DRAFT:(entity:string,id:string)=>{`${entity} ${id}`},
    /* -------------------------------- EMPLOYEE -------------------------------- */
    EMP_IS_BLOCKED: "Сотрудник заблокирован",
    /* ---------------------------------- TEAM ---------------------------------- */
    TEAM_ASSIGNED_TO_WORK: "Бригада назначена на работу.",
    TEAM_ALREADY_FREE: "Бригада уже свободна от работы.",
    TEAM_SUCCESSFULL_MOVED: "Бригада успешно перемещена в работу.",
    /* ---------------------------------- WORK ---------------------------------- */
    WORK_STATUS_IS_WRONG: "Не верный статус работы",
    /* ----------------------------- WORK_ASSIGNMENT ---------------------------- */
    WORK_ASSIGNMENT_ID_WRONG: "Отсутствует записть с текущим ID",
    WORK_ASSIGNMENT_OUT_ACCESS: " Доступ к данной записи запрещен",
    WORK_ASSIGNMENT_IS_CREATED: "Запись создана успешно",
    WORK_ASSIGNMENT_DATA_GET_OK: "Данные получены успешно.",
    WORK_ASSIGNMENT_UPDATE_OK: "Данные успешно обновлены.",
    WORK_ASSIGNMENT_ROLE_UPDATE_OK: "Новая роль успешно обновлена.",
    WORK_ASSIGNMENT_ALREADY_EXISTS: "Дублирующая запись.",
    WORK_ASSIGNMENT_IS_SOFTDELETED: "Запись уже помечена на удаление.",
    WORK_ASSIGNMENT_SOFT_DELETE: "Запись помечена на удаление.",
    WORK_ASSIGNMENT_RESTORE: "Запись востановлена.",
    WORK_ASSIGNMENT_EMPLOYEES_ENOUGHT: "Бригада укомплектована.",
    WORK_ASSIGNMENT_HARD_DELETE: "Запись удалена.",
    /* ------------------------------- VALIDATION ------------------------------- */
    SERVER_ERROR: "Ошибка сервера",

    WRONG_EMP_ID_OR_PASSWORD: 'Неверный EmployeeID или пароль',
    TBL_IS_EMPTY:(entity:string)=>{`Таблица ${entity} пуста.`},

    STR_MAIL_WRONG_FORMAT: 'Неверный формат EmployeeID (E + 6 цифр).',
    STR_PASSWORD_WRONG_FORMAT: 'Пароль минимум 6 символов.',
    STR_MAIL_ALREADY_HAVE: 'Email уже используется',
    /* ------------------------------ REQUIRE DATA ------------------------------ */
    REQ_CITY: "Название и город обязательны.",
    REQ_FIELD_PHONE: 'Телефон обязателен',
    REQ_EMP_ID_AND_PASSWORD: 'EmployeeID и пароль обязательны',
    REQ_POSITION: "Необходимо ввести должность.",


}

/* --------------------------------- Create --------------------------------- */
/* --------------------------------- Read By Id --------------------------------- */
/* -------------------------------- Read all -------------------------------- */
/* --------------------------------- Update --------------------------------- */
/* --------------------------------- Hard Delete --------------------------------- */
/* --------------------------------- Soft Delete --------------------------------- */
/* --------------------------------- Restore delete item --------------------------------- */