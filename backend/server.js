
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ============ MIDDLEWARE ============

// الأمان
app.use(helmet());

// CORS
const corsOptions = {
    origin: ['*'], // يمكن التطبيق من أي مكان
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// حد الطلبات
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'عدد الطلبات كثير جداً، حاول لاحقاً'
});
app.use('/api/', limiter);

// تحليل JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============ MODELS ============
const LeagueModel = require('./models/LeagueModel');
const MatchModel = require('./models/MatchModel');

// ============ ROUTES ============

// اختبار السيرفر
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'السيرفر يعمل بشكل صحيح',
        timestamp: new Date()
    });
});

// -------- LEAGUES --------

// الحصول على جميع الدوريات
app.get('/api/leagues', async (req, res) => {
    try {
        const leagues = await LeagueModel.getAllLeagues();
        res.json({
            success: true,
            data: leagues,
            count: leagues.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الدوريات',
            error: error.message
        });
    }
});

// إضافة دوري جديد
app.post('/api/leagues', async (req, res) => {
    try {
        const league = await LeagueModel.createLeague(req.body);
        res.status(201).json({
            success: true,
            message: 'تم إضافة الدوري بنجاح',
            data: league
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'خطأ في إضافة الدوري',
            error: error.message
        });
    }
});

// -------- MATCHES --------

// الحصول على مباريات يوم معين
app.get('/api/matches/by-date/:date', async (req, res) => {
    try {
        const matches = await MatchModel.getMatchesByDate(req.params.date);
        res.json({
            success: true,
            data: matches,
            count: matches.length,
            date: req.params.date
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المباريات',
            error: error.message
        });
    }
});

// الحصول على المباريات الحية
app.get('/api/matches/live', async (req, res) => {
    try {
        const matches = await MatchModel.getLiveMatches();
        res.json({
            success: true,
            data: matches,
            count: matches.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المباريات الحية',
            error: error.message
        });
    }
});

// البحث عن مباريات
app.get('/api/matches/search/:teamName', async (req, res) => {
    try {
        const matches = await MatchModel.searchMatches(req.params.teamName);
        res.json({
            success: true,
            data: matches,
            count: matches.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في البحث',
            error: error.message
        });
    }
});

// الحصول على تفاصيل مباراة
app.get('/api/matches/:id', async (req, res) => {
    try {
        const match = await MatchModel.getMatchDetails(req.params.id);
        res.json({
            success: true,
            data: match
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب تفاصيل المباراة',
            error: error.message
        });
    }
});

// إضافة مباراة جديدة
app.post('/api/matches', async (req, res) => {
    try {
        const match = await MatchModel.createMatch(req.body);
        res.status(201).json({
            success: true,
            message: 'تم إضافة المباراة بنجاح',
            data: match
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'خطأ في إضافة المباراة',
            error: error.message
        });
    }
});

// تحديث حالة المباراة
app.put('/api/matches/:id', async (req, res) => {
    try {
        const match = await MatchModel.updateMatchStatus(req.params.id, req.body);
        res.json({
            success: true,
            message: 'تم تحديث المباراة بنجاح',
            data: match
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'خطأ في تحديث المباراة',
            error: error.message
        });
    }
});

// ============ ERROR HANDLING ============

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'المسار غير موجود'
    });
});

app.use((err, req, res, next) => {
    console.error('خطأ:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'خطأ في السيرفر'
    });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`\n✅ السيرفر يعمل على البورت ${PORT}`);
    console.log(`📁 البيئة: ${process.env.NODE_ENV}`);
    console.log(`🔥 متصل بـ Firebase\n`);
});

module.exports = app;
