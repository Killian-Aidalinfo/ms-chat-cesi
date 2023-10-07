import mongoose from 'mongoose';

const DB_USER = process.env.DB_USER || 'rootme';
const DB_PASSWORD = process.env.DB_PASSWORD || 'defaultPassword';
const DB_HOST = process.env.DB_HOST || 'mongodb';
const DB_PORT = process.env.DB_PORT || '27017';
const DB_NAME = process.env.DB_NAME || 'ms-gptLink';

//add moogoose try with 5 attempts
let retryCount = 0;
const retryLimit = 5;
const retryInterval = 5000;
const MONGODB_URI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`;

const connectWithRetry = () => {
    console.log('MongoDB connection with retry');
    return mongoose.connect(MONGODB_URI, {
        dbName: DB_NAME,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
};

connectWithRetry()
    .then(() => {
        console.log('MongoDB is connected');
    })
    .catch(err => {
        console.error('MongoDB connection unsuccessful, retry after 5 seconds:', err);
        setTimeout(connectWithRetry, 5000);
    });
