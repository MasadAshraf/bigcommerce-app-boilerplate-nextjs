import { Migration, getAllFilesInFolder } from "./migration.mjs";

const migrationObj = new Migration();
const tables = await migrationObj.getMigrationsTables();
const migratedTables = tables.map(t => t.table_name);

try {
    const files = await getAllFilesInFolder();
    if (files.length < 1){
        console.log('\x1b[35m','No Migrations Found')
    }

    for (const file of files) {
        if (!migratedTables.includes(file)) {

            const module = await import(`./tables/${file}.mjs`);

            const desiredFunction = module[file];

            if (typeof desiredFunction === 'function') {
                await migrationObj.runMigration(desiredFunction());
                console.log('\x1b[32m',`\"${file}"\ migration run successfully`);
                await migrationObj.addNewMigration(file);
            } else {
                console.error(`Function '${file}' not found.`);
            }
        }else{
            console.log('\x1b[33m',`\"${file}"\ migration already exists`);
        }
    }
}
catch (error) {
    console.error('An error occurred:', error.message);
}

migrationObj.closeConnection();


