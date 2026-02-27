function buildBar(value, symbol) {
  if (value === null || value === undefined) return '—';
  return symbol.repeat(Math.max(1, Math.round(value)));
}

Page({
  data: {
    rows: [],
    hasData: false
  },

  onShow() {
    this.loadWeekly();
  },

  async loadWeekly() {
    wx.showLoading({ title: '加载中' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'getWeeklyStats',
        data: {}
      });
      const { dates = [], sleepHours = [], moods = [] } = res.result || {};
      const rows = dates.map((date, idx) => {
        const sleep = sleepHours[idx];
        const mood = moods[idx];
        return {
          date,
          md: date.slice(5),
          sleepHoursText: sleep === null ? '无' : sleep.toFixed(1),
          moodText: mood === null ? '无' : String(mood),
          sleepSpark: sleep === null ? '—' : buildBar(sleep * 2, '▁'),
          moodBar: mood === null ? '—' : buildBar(mood, '█')
        };
      });
      this.setData({
        rows,
        hasData: rows.some((r) => r.sleepHoursText !== '无' || r.moodText !== '无')
      });
    } catch (err) {
      console.error('getWeeklyStats error', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
