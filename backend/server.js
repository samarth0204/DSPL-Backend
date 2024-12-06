const app = require('./app');

const dotenv = require('dotenv');

const connectDatabase = require('./config/database');

// uncaught exceptions  handling
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shuting down the server due to uncaughtException`);
    process.exit(1);
});

//config

dotenv.config({path:"backend/config/config.env"});

// Connecting to Database

connectDatabase();


const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})

// Unhandled Promise Rejection Error Handling
process.on('unhandledRejection',err => {
    console.log(`Error: ${err.message}`);
    console.log(`Shuting down the server due to Unhandled Promise Rejection`);
    server.close(() => {
        process.exit(1);
    });
});