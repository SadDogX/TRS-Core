
export const ROLES ={
    
    ADMIN :'admin',
    COORDINATOR:'coordinator',
    WORKER : 'worker',
    LEADER : 'leader'
} as const

export const WORK_STATUSES=['draft', 'in_progress', 'completed', 'submitted', 'approved', 'rejected', 'closed']

export const TEAM_STATUS ={
    FORMING:"forming",
    ACTIVE:"active",
    ARCHIVED:"archived",
    IDLE:"idle",
    MAINTENANCE:"maintenance"
}
//? * ----------------------------- STRING MESSAGES ---------------------------- */
export const MSG = {
    /* ---------------------------------- BASE ---------------------------------- */
    // EXAMPLE:(id:string)=>`Строка с ${id} не напйдена` console.log(EXAMPLE(id)),
    BASE_ID_WRONG:"База с данным ID не найдена.",
    BASE_IS_DELETED: "База удалена",
    BASE_IS_CHECK_DELETED:"База помечена на удаление.",

    /* -------------------------------- EMPLOYEE -------------------------------- */
    EMP_ID_WRONG :"Сотрудник с данным ID не найден",
    EMP_ID_ALREADY_HAVE :'Сотрудник с таким EmployeeID уже существует' ,
    EMP_ALREADY_IN_TEAM: "Сотрудник уже в бригаде",
    EMP_NOT_FOUND: "Сотрудник не найден",
    EMP_IS_BLOCKED: "Сотрудник заблокирован",
    EMP_IS_CHECK_DELETED: "Сотрудник помечен на удаление",
    EMP_IS_DELETED: "Сотрудник удален.",
    EMP_OUT_OF_TEAM : "Сотрудник вне бригады",
    /* -------------------------------- POSITION -------------------------------- */
    POS_ID_WRONG :'Должность c данным ID не найдена',
    POS_IS_CHECK_DELETED: "Должность помечена на удаление.",
    POS_IS_DELETED: "Должность удалена",
    /* ---------------------------------- TEAM ---------------------------------- */
    TEAM_SET_ERROR:"Ошибка в назначении бригады",
    TEAM_SET_ALREADY:"Бригада уже назначена на работу.",
    TEAM_ID_WRONG:"Бригада с данным ID не найдена.",
    TEAM_IS_RESTORED: "Бригада восстановлена.",
    TEAM_ASSIGNED_TO_WORK: "Бригада назначена на работу.",
    TEAM_ASSIGNED_ALREADY: "Брагада уже назначена на данную работу.",
    TEAM_ALREADY_FREE:"Брагада уже свободна от работы.",
    TEAM_IS_DELETED_SOFT: "Бригада помечена на удаление.",
    TEAM_IS_DELETED: "Бригада удалена.",
    TEAM_IS_CREATED: "Бригада создана.",
    /* ---------------------------------- WORK ---------------------------------- */
    WORK_ID_WRONG : "Отсутствует работа с данным ID",
    WORK_OUT_ACCESS :" Доступ к данной работе запрещен",
    WORK_IS_CREATED :"Работа создана успешно",
    WORK_STATUS_IS_WRONG:"Не верный статус работы",
    WORK_DATA_GET_OK:"Данные по работе получены успешно.",
    WORK_ROLE_INVALID:"Нет доступа, не та роль.",
    WORK_UPDATE_OK:"Данные успешно обновлены.",
    WORK_IS_DELETED:"Работа удалена безвозвратно.",
    WORK_IS_SOFTDELETED:"Работа уже помечена на удаление.",
    WORK_SOFT_DELETE:"Работа помечена на удаление.",
    WORK_RESTORE:"Работа востановлена.",
    /* ----------------------------- WORK_ASSIGNMENT ---------------------------- */
    WORK_ASSIGNMENT_ID_WRONG : "Отсутствует записть с текущим ID",
    WORK_ASSIGNMENT_OUT_ACCESS :" Доступ к данной записи запрещен",
    WORK_ASSIGNMENT_IS_CREATED :"Запись создана успешно",
    WORK_ASSIGNMENT_DATA_GET_OK:"Данные получены успешно.",
    WORK_ASSIGNMENT_UPDATE_OK:"Данные успешно обновлены.",
    WORK_ASSIGNMENT_ALREADY_EXISTS:"Дублирующая запись.",
    WORK_ASSIGNMENT_IS_SOFTDELETED:"Запись уже помечена на удаление.",
    WORK_ASSIGNMENT_SOFT_DELETE:"Запись помечена на удаление.",
    WORK_ASSIGNMENT_RESTORE:"Запись востановлена.",
    WORK_ASSIGNMENT_EMPLOYEES_ENOUGHT:"Бригада укомплектована.",
    /* ------------------------------- VALIDATION ------------------------------- */
    SERVER_ERROR: "Ошибка сервера",
    ACCESS_DENIED: "Доступ запрещен",

    WRONG_EMP_ID_OR_PASSWORD :'Неверный EmployeeID или пароль',
    TBL_IS_EMPTY: "В таблице нет данных",
    
    STR_MAIL_WRONG_FORMAT :'Неверный формат EmployeeID (E + 6 цифр)' ,
    STR_PASSWORD_WRONG_FORMAT :'Пароль минимум 6 символов' ,
    STR_MAIL_ALREADY_HAVE:'Email уже используется',
    /* ------------------------------ REQUIRE DATA ------------------------------ */
    REQ_CITY: "Название и город обязательны.",
    REQ_FIELD_PHONE:'Телефон обязателен',
    REQ_EMP_ID_AND_PASSWORD:'EmployeeID и пароль обязательны',
    REQ_POSITION:"Необходимо ввести должность",
    /* ------------------------------ RESPONSE DATA ----------------------------- */
    RES_STATUS_OK : "Запрос выполнен успешно",
    RES_STATUS_UPDATE : "Данные обновлены",

}

/* --------------------------------- Create --------------------------------- */
/* --------------------------------- Read By Id --------------------------------- */
/* -------------------------------- Read all -------------------------------- */
/* --------------------------------- Update --------------------------------- */
/* --------------------------------- Hard Delete --------------------------------- */
/* --------------------------------- Soft Delete --------------------------------- */
/* --------------------------------- Restore delete item --------------------------------- */