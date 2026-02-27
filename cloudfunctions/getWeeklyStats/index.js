const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftDate(dateStr, offset) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + offset);
  return formatDate(d);
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const endDate = event.endDate || formatDate(new Date());

  const dates = Array.from({ length: 7 }).map((_, i) => shiftDate(endDate, i - 6));

  const [sleepRes, moodRes] = await Promise.all([
    db.collection('sleep_records').where({ _openid: OPENID, date: db.command.in(dates) }).get(),
    db.collection('mood_records').where({ _openid: OPENID, date: db.command.in(dates) }).get()
  ]);

  const sleepMap = new Map(sleepRes.data.map((item) => [item.date, item.durationMin / 60]));
  const moodMap = new Map(moodRes.data.map((item) => [item.date, item.mood]));

  const sleepHours = dates.map((d) => (sleepMap.has(d) ? Number(sleepMap.get(d).toFixed(1)) : null));
  const moods = dates.map((d) => (moodMap.has(d) ? moodMap.get(d) : null));

  let totalDays = 0;
  if (event.includeTotalDays) {
    const [allSleep, allMood] = await Promise.all([
      db.collection('sleep_records').where({ _openid: OPENID }).field({ date: true }).get(),
      db.collection('mood_records').where({ _openid: OPENID }).field({ date: true }).get()
    ]);
    const set = new Set([
      ...allSleep.data.map((x) => x.date),
      ...allMood.data.map((x) => x.date)
    ]);
    totalDays = set.size;
  }

  return {
    dates,
    sleepHours,
    moods,
    totalDays
  };
};
