// require('dotenv').config(); // this is important!

module.exports = {
    development:
    {
        username: "postgres",
        password: "user",
        database: "mrm",
        host: "localhost",
        dialect: "postgres",
        port: 5432,
        logging: true
    },
    test: 
    { 
        username: process.env.DB_TEST_USERNAME || 'postgres', 
        password: process.env.DB_TEST_PASSWORD || "user", 
        database: process.env.DB_TEST_DATABASE || "mrm", 
        host: process.env.DATABASE_HOST || "localhost", 
        dialect: "postgres", 
        port: 5432, 
        logging: true,
        rejectUnauthorized: false
    },     
    production: 
    { 
        username: process.env.DB_PROD_USERNAME || 'postgres', 
        password: process.env.DB_PROD_PASSWORD || "user", 
        database: process.env.DB_PROD_DATABASE || "mrm", 
        host: process.env.DATABASE_HOST || "localhost", 
        dialect: "postgres", 
        port: 5432, 
        logging: true 
    }
}
