// config/firebase.js
const admin = require('firebase-admin');

// متغيرات البيئة تأتي من Railway تلقائياً
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
};

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    console.log('✅ تم الاتصال بـ Firebase بنجاح');
} catch (error) {
    console.error('❌ فشل الاتصال بـ Firebase:', error.message);
    throw error;
}

const db = admin.database();

module.exports = db;
