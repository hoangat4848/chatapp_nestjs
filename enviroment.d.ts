declare namespace NodeJS {
  export interface ProcessEnv {
    ENVIRONMENT: string;
    PORT?: string;
    DB_TYPE?: 'mysql';
    MYSQL_DB_HOST?: string;
    MYSQL_DB_USERNAME?: string;
    MYSQL_DB_PASSWORD?: string;
    MYSQL_DB_PORT?: string;
    MYSQL_DB_DATABASE?: string;
    COOKIE_SECRET?: string;
  }
}
