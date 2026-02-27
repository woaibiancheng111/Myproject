const { todayStr } = require('../../utils/date');

Page({
  data: {
    date: todayStr(),
    moods: [
      { value: 1, emoji: '😭', label: '崩了' },
      { value: 2, emoji: '😣', label: '难受' },
      { value: 3, emoji: '😐', label: '一般' },
      { value: 4, emoji: '🙂', label: '还行' },
      { value: 5, emoji: '😀', label: '不错' }
    ],
    selectedMood: 3,
    label: '一般',
    note: '',
    submitting: false
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },

  chooseMood(e) {
    this.setData({
      selectedMood: Number(e.currentTarget.dataset.value),
      label: e.currentTarget.dataset.label
    });
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value });
  },

  async submit() {
    if (this.data.submitting) return;
    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中' });
    try {
      await wx.cloud.callFunction({
        name: 'upsertMood',
        data: {
          date: this.data.date,
          mood: this.data.selectedMood,
          label: this.data.label,
          note: this.data.note
        }
      });
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' });
      }, 500);
    } catch (err) {
      console.error('upsertMood error', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      wx.hideLoading();
      this.setData({ submitting: false });
    }
  }
});
