App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请升级基础库至 2.2.3 及以上以使用云开发');
      return;
    }

    wx.cloud.init({
      env: 'your-cloud-env-id', // 部署时替换为你的云开发环境 ID
      traceUser: true
    });
  }
});
