const { todayStr } = require('../../utils/date');

Page({
  data: {
    date: todayStr(),
    sleepTime: '23:30',
    wakeTime: '07:30',
    submitting: false
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },

  onSleepChange(e) {
    this.setData({ sleepTime: e.detail.value });
  },

  onWakeChange(e) {
    this.setData({ wakeTime: e.detail.value });
  },

  async submit() {
    if (this.data.submitting) return;
    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中' });
    try {
      await wx.cloud.callFunction({
        name: 'upsertSleep',
        data: {
          date: this.data.date,
          sleepTime: this.data.sleepTime,
          wakeTime: this.data.wakeTime
        }
      });
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' });
      }, 500);
    } catch (err) {
      console.error('upsertSleep error', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      wx.hideLoading();
      this.setData({ submitting: false });
    }
  }
});
