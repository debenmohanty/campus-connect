const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function cleanDatabase() {
    // Create database connection
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'placement_management'
    });

    try {
        console.log('Connected to database. Starting cleanup...');
        
        // Begin transaction
        await connection.query('START TRANSACTION');
        
        try {
            // Drop tables in the correct order (respecting foreign key constraints)
            const tables = [
                'student_stats',
                'applications',
                'jobs',
                'company_profiles',
                'users'
            ];
            
            for (const table of tables) {
                console.log(`Dropping table: ${table}...`);
                await connection.query(`DROP TABLE IF EXISTS ${table}`);
            }
            
            // Commit the transaction
            await connection.query('COMMIT');
            console.log('Database cleanup completed successfully.');
        } catch (error) {
            // Rollback the transaction if any error occurs
            await connection.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error during database cleanup:', error);
    } finally {
        // Close the database connection
        await connection.end();
        console.log('Database connection closed.');
    }
}

// Execute the function
cleanDatabase().then(() => {
    console.log('Script execution completed.');
    process.exit(0);
}).catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
}); 