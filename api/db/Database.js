// db/Database.js
require('dotenv').config();
const mongoose = require('mongoose');

let instance = null;

class Database {
    constructor() {
        if (!instance) {
            this.mongoConnection = null;
            instance = this;
        }
        return instance;
    }

    async connect() {
        const uri = process.env.MONGO_URI || process.env.CONNECTION_STRING;
        if (!uri) {
            console.error('❌ MONGO_URI (veya CONNECTION_STRING) .env içinde tanımlı değil.');
            throw new Error('Missing Mongo URI');
        }

        // Loglar
        mongoose.connection.on('connecting', () => console.log('🟡 DB connecting...'));
        mongoose.connection.on('connected',  () => console.log('🟢 DB connected'));
        mongoose.connection.on('disconnected', () => console.warn('🛑 DB disconnected'));
        mongoose.connection.on('error', err => console.error('🔴 DB error:', err.message));

        // Kuyruk büyümesin:
        mongoose.set('bufferCommands', false);

        // Tek sefer bağlan
        if (this.mongoConnection) return this.mongoConnection;

        this.mongoConnection = await mongoose.connect(uri, {});
        return this.mongoConnection;
    }
}

module.exports = new Database();
