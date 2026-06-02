# 双城记

一个给异地恋情侣使用的私密小网站原型。

## 功能

- 双方城市天气
- 在一起天数
- 下次见面倒计时
- 留言
- 日常记录
- 心愿清单
- 回忆时间线
- 本地访问密码

## 说明

默认情况下，数据保存在浏览器本地存储中。配置 Supabase 后，可以让两个人在不同设备上共享同一份留言、日常、心愿和回忆。

## 接入 Supabase

1. 在 Supabase 创建一个项目。
2. 打开项目的 SQL Editor，执行 `supabase-setup.sql`。
3. 在项目设置里找到 Project URL 和 anon public key。
4. 填入 `config.js`：

```js
window.DC_CONFIG = {
  supabaseUrl: "https://你的项目.supabase.co",
  supabaseAnonKey: "你的 anon public key",
  spaceId: "default",
};
```

5. 重新提交并部署。

配置完成后，两个人打开同一个网址并输入同一个访问密码，就会读写同一份云端数据。
