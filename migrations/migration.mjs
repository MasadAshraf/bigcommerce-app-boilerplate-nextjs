import mysql from 'mysql2';
import util from 'util';
import 'dotenv/config'
import { readdir } from 'fs/promises';
import path from 'path';


const MYSQL_CONFIG = {

     host: process.env.MYSQL_HOST,
     database: process.env.MYSQL_DATABASE,
     user: process.env.MYSQL_USERNAME,
     password: process.env.MYSQL_PASSWORD,
     ...(process.env.MYSQL_PORT && { port: process.env.MYSQL_PORT }),
};


export class Migration {
     migrationTable = 'migrations';
     connection;
     query;

     constructor() {
          this.connection = mysql.createConnection(process.env.DATABASE_URL ? process.env.DATABASE_URL : MYSQL_CONFIG);
          this.query = util.promisify(this.connection.query.bind(this.connection));

     }

     getMigrationsTables = async () => {

          const results = await this.runMigration(`SELECT table_name FROM ${this.migrationTable}`);

          return results.length ? results : [];
     }

     runMigration = async (sql) => {
         return await this.query(sql)
     }

     closeConnection = () => {

          this.connection.end();
     }

     addNewMigration = async (table) => {
          await this.runMigration(`
            INSERT INTO ${this.migrationTable} (table_name, created_at)
            VALUES
            ('${table}', CURRENT_TIMESTAMP)
          `);
        }
        

}


export async function getAllFilesInFolder(folderPath = './migrations/tables') {
     try {
          const files = await readdir(folderPath);
          const fileNamesWithoutExtension = files.map(file => path.parse(file).name);
          return fileNamesWithoutExtension;

     } catch (error) {
          console.error('Error reading folder:', error);
          return [];
     }
}
