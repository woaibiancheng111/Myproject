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

async function calcStreak(openid, startDate) {
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const day = shiftDate(startDate, -i);
    const [sleep, mood] = await Promise.all([
      db.collection('sleep_records').where({ _openid: openid, date: day }).limit(1).get(),
      db.collection('mood_records').where({ _openid: openid, date: day }).limit(1).get()
    ]);
    if (sleep.data.length || mood.data.length) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

async function buildAdvice(openid, date, todaySleep, todayMood) {
  const dates = Array.from({ length: 7 }).map((_, idx) => shiftDate(date, -idx)).reverse();
  const [sleepRes, moodRes] = await Promise.all([
    db.collection('sleep_records').where({ _openid: openid, date: db.command.in(dates) }).get(),
    db.collection('mood_records').where({ _openid: openid, date: db.command.in(dates) }).get()
  ]);

  const sleepMap = new Map(sleepRes.data.map((x) => [x.date, x]));
  const moodMap = new Map(moodRes.data.map((x) => [x.date, x]));
  const sleepHours = dates.map((d) => (sleepMap.get(d) ? sleepMap.get(d).durationMin / 60 : null)).filter((x) => x !== null);
  const moods = dates.map((d) => (moodMap.get(d) ? moodMap.get(d).mood : null));

  if (!todaySleep && !todayMood) return '今天还没有记录，先完成一次睡眠或情绪打卡吧。';
  if (todaySleep && todaySleep.durationMin < 360) return '你昨晚睡眠不足 6 小时，建议今晚尽量提前 20~30 分钟休息。';
  if (todaySleep && todaySleep.durationMin > 540) return '你昨晚睡眠超过 9 小时，今天可安排轻量活动，保持白天节律。';
  if (todayMood && todayMood.mood <= 2) return '今天情绪有些低落，建议做一次 10 分钟散步或深呼吸。';

  const last3Moods = moods.slice(-3).filter((x) => x !== null);
  if (last3Moods.length === 3 && last3Moods.every((m) => m <= 2)) return '你已连续 3 天情绪偏低，建议联系朋友聊聊并保持规律作息。';

  if (sleepHours.length >= 3) {
    const max = Math.max(...sleepHours);
    const min = Math.min(...sleepHours);
    if (max - min >= 2.5) return '最近睡眠波动较大，建议固定起床时间，逐步稳定作息。';
  }

  const noRecordDays = dates.filter((d) => !sleepMap.get(d) && !moodMap.get(d)).length;
  if (noRecordDays >= 4) return '最近记录较少，建议每天花 1 分钟打卡，方便观察变化趋势。';

  return '状态保持不错，继续坚持“睡眠+情绪”双记录。';
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const date = event.date || formatDate(new Date());

  const [sleepRes, moodRes] = await Promise.all([
    db.collection('sleep_records').where({ _openid: OPENID, date }).limit(1).get(),
    db.collection('mood_records').where({ _openid: OPENID, date }).limit(1).get()
  ]);

  const sleep = sleepRes.data[0] || null;
  const mood = moodRes.data[0] || null;
  const streak = await calcStreak(OPENID, date);
  const advice = await buildAdvice(OPENID, date, sleep, mood);

  return {
    sleep,
    mood,
    streak,
    advice
  };
};
