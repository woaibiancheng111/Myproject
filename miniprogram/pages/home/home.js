const { todayStr } = require('../../utils/date');

const moodEmoji = {
  1: '😭',
  2: '😣',
  3: '😐',
  4: '🙂',
  5: '😀'
};

Page({
  data: {
    today: todayStr(),
    streak: 0,
    advice: '今天也继续保持记录，观察自己的作息与情绪节奏。',
    summary: {
      sleep: null,
      mood: null
    }
  },

  onShow() {
    this.setData({ today: todayStr() });
    this.loadSummary();
  },

  async loadSummary() {
    wx.showLoading({ title: '加载中' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTodaySummary',
        data: { date: this.data.today }
      });
      const data = res.result || {};
      const sleep = data.sleep
        ? {
            ...data.sleep,
            durationHour: (data.sleep.durationMin / 60).toFixed(1)
          }
        : null;
      const mood = data.mood
        ? {
            ...data.mood,
            emoji: moodEmoji[data.mood.mood] || '😐'
          }
        : null;
      this.setData({
        streak: data.streak || 0,
        advice: data.advice || '今天也继续保持记录，观察自己的作息与情绪节奏。',
        summary: { sleep, mood }
      });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      console.error('getTodaySummary error', err);
    } finally {
      wx.hideLoading();
    }
  },

  goSleep() {
    wx.switchTab({ url: '/pages/sleep/sleep' });
  },

  goMood() {
    wx.navigateTo({ url: '/pages/mood/mood' });
  }
});
