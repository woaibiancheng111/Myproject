const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { date, sleepTime, wakeTime } = event;

  if (!date || !sleepTime || !wakeTime) {
    throw new Error('参数不完整');
  }

  const sleepMin = parseTime(sleepTime);
  const wakeMin = parseTime(wakeTime);
  const durationMin = wakeMin >= sleepMin ? wakeMin - sleepMin : wakeMin + 24 * 60 - sleepMin;

  const now = new Date();
  const collection = db.collection('sleep_records');
  const existed = await collection.where({ _openid: OPENID, date }).limit(1).get();

  if (existed.data.length > 0) {
    await collection.doc(existed.data[0]._id).update({
      data: {
        sleepTime,
        wakeTime,
        durationMin,
        updatedAt: now
      }
    });
  } else {
    await collection.add({
      data: {
        date,
        sleepTime,
        wakeTime,
        durationMin,
        createdAt: now,
        updatedAt: now
      }
    });
  }

  return { ok: true };
};
