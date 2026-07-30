

// models/MatchModel.js
const db = require('../config/firebase');

class MatchModel {
    // الحصول على مباريات يوم معين
    static async getMatchesByDate(dateString) {
        try {
            const snapshot = await db.ref('matches').once('value');
            const matches = [];

            snapshot.forEach((childSnapshot) => {
                const match = childSnapshot.val();
                const matchDate = new Date(match.match_date).toISOString().split('T')[0];

                if (matchDate === dateString) {
                    matches.push({
                        id: childSnapshot.key,
                        ...match
                    });
                }
            });

            // رتّب حسب الوقت
            matches.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));

            return matches;
        } catch (error) {
            console.error('خطأ في جلب مباريات اليوم:', error);
            throw error;
        }
    }

    // الحصول على المباريات الحية
    static async getLiveMatches() {
        try {
            const snapshot = await db.ref('matches').once('value');
            const liveMatches = [];

            snapshot.forEach((childSnapshot) => {
                const match = childSnapshot.val();
                if (match.status === 'live') {
                    liveMatches.push({
                        id: childSnapshot.key,
                        ...match
                    });
                }
            });

            return liveMatches;
        } catch (error) {
            console.error('خطأ في جلب المباريات الحية:', error);
            throw error;
        }
    }

    // الحصول على تفاصيل مباراة
    static async getMatchDetails(matchId) {
        try {
            const matchSnapshot = await db.ref(`matches/${matchId}`).once('value');

            if (!matchSnapshot.exists()) {
                throw new Error('المباراة غير موجودة');
            }

            const match = {
                id: matchSnapshot.key,
                ...matchSnapshot.val()
            };

            // جلب الأهداف
            const goalsSnapshot = await db.ref(`goals`).orderByChild('match_id').equalTo(matchId).once('value');
            const goals = [];

            goalsSnapshot.forEach((childSnapshot) => {
                goals.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // رتّب الأهداف حسب الدقيقة
            goals.sort((a, b) => a.minute - b.minute);

            return {
                ...match,
                goals: goals
            };
        } catch (error) {
            console.error('خطأ في جلب تفاصيل المباراة:', error);
            throw error;
        }
    }

    // إضافة مباراة جديدة
    static async createMatch(matchData) {
        try {
            const {
                league_id,
                round_name_ar,
                team1_id,
                team2_id,
                match_date,
                is_knockout
            } = matchData;

            const matchRef = db.ref('matches').push();

            const newMatch = {
                id: matchRef.key,
                league_id,
                round_name_ar,
                team1_id,
                team2_id,
                match_date,
                is_knockout: is_knockout || false,
                status: 'scheduled',
                team1_score: 0,
                team2_score: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await matchRef.set(newMatch);

            return newMatch;
        } catch (error) {
            console.error('خطأ في إضافة مباراة:', error);
            throw error;
        }
    }

    // تحديث حالة المباراة
    static async updateMatchStatus(matchId, statusData) {
        try {
            const updates = {
                ...statusData,
                updated_at: new Date().toISOString()
            };

            await db.ref(`matches/${matchId}`).update(updates);

            return {
                id: matchId,
                ...updates
            };
        } catch (error) {
            console.error('خطأ في تحديث المباراة:', error);
            throw error;
        }
    }

    // البحث عن مباريات
    static async searchMatches(teamName) {
        try {
            const snapshot = await db.ref('matches').once('value');
            const results = [];

            snapshot.forEach((childSnapshot) => {
                const match = childSnapshot.val();
                const now = new Date();
                const matchDate = new Date(match.match_date);

                // فقط المباريات الحالية والمستقبلية
                if (matchDate >= now) {
                    if (match.team1_name?.includes(teamName) || match.team2_name?.includes(teamName)) {
                        results.push({
                            id: childSnapshot.key,
                            ...match
                        });
                    }
                }
            });

            return results;
        } catch (error) {
            console.error('خطأ في البحث:', error);
            throw error;
        }
    }
}

module.exports = MatchModel;

