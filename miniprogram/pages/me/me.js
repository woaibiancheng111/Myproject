const { todayStr } = require('../../utils/date');

Page({
  data: {
    totalDays: 0,
    streak: 0
  },

  onShow() {
    this.loadStats();
  },

  async loadStats() {
    wx.showLoading({ title: '加载中' });
    try {
      const [summaryRes, weeklyRes] = await Promise.all([
        wx.cloud.callFunction({
          name: 'getTodaySummary',
          data: { date: todayStr() }
        }),
        wx.cloud.callFunction({
          name: 'getWeeklyStats',
          data: { includeTotalDays: true }
        })
      ]);
      this.setData({
        streak: summaryRes.result?.streak || 0,
        totalDays: weeklyRes.result?.totalDays || 0
      });
    } catch (err) {
      console.error('load me stats error', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
