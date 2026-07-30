

// models/LeagueModel.js
const db = require('../config/firebase');

class LeagueModel {
    // الحصول على جميع الدوريات
    static async getAllLeagues() {
        try {
            const snapshot = await db.ref('leagues').once('value');
            const leagues = [];
            
            snapshot.forEach((childSnapshot) => {
                leagues.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            return leagues;
        } catch (error) {
            console.error('خطأ في جلب الدوريات:', error);
            throw error;
        }
    }

    // إضافة دوري جديد
    static async createLeague(leagueData) {
        try {
            const { name_ar, name_en, type, season, country_ar, logo_base64 } = leagueData;

            // التحقق من البيانات
            if (!name_ar || !type || !season) {
                throw new Error('بيانات ناقصة');
            }

            const leagueRef = db.ref('leagues').push();
            const leagueId = leagueRef.key;

            const newLeague = {
                id: leagueId,
                name_ar,
                name_en,
                type,
                season,
                country_ar,
                logo_base64,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await leagueRef.set(newLeague);

            return newLeague;
        } catch (error) {
            console.error('خطأ في إضافة دوري:', error);
            throw error;
        }
    }

    // الحصول على دوري معين
    static async getLeagueById(leagueId) {
        try {
            const snapshot = await db.ref(`leagues/${leagueId}`).once('value');
            
            if (!snapshot.exists()) {
                return null;
            }

            return {
                id: snapshot.key,
                ...snapshot.val()
            };
        } catch (error) {
            console.error('خطأ في جلب الدوري:', error);
            throw error;
        }
    }

    // تحديث دوري
    static async updateLeague(leagueId, leagueData) {
        try {
            const updates = {
                ...leagueData,
                updated_at: new Date().toISOString()
            };

            await db.ref(`leagues/${leagueId}`).update(updates);

            return {
                id: leagueId,
                ...updates
            };
        } catch (error) {
            console.error('خطأ في تحديث الدوري:', error);
            throw error;
        }
    }
}

module.exports = LeagueModel;
