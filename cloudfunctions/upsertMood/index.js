const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { date, mood, label, note = '' } = event;

  if (!date || !mood || !label) {
    throw new Error('参数不完整');
  }
  if (mood < 1 || mood > 5) {
    throw new Error('mood 必须为 1~5');
  }

  const now = new Date();
  const collection = db.collection('mood_records');
  const existed = await collection.where({ _openid: OPENID, date }).limit(1).get();

  if (existed.data.length > 0) {
    await collection.doc(existed.data[0]._id).update({
      data: {
        mood,
        label,
        note: String(note).slice(0, 100),
        updatedAt: now
      }
    });
  } else {
    await collection.add({
      data: {
        date,
        mood,
        label,
        note: String(note).slice(0, 100),
        createdAt: now,
        updatedAt: now
      }
    });
  }

  return { ok: true };
};
