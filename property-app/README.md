# 🏠 Property App 全栈项目 (Expo + EAS + GitHub Actions)

这是一个基于 Expo 构建的 React Native 项目，结合 Node.js 后端与 MySQL 数据库。支持自动从 GitHub Actions 构建 Android APK，并上传下载链接或发送 Slack 通知。

---

## 📦 技术栈

- **前端移动端**：React Native (Expo)
- **后端服务**：Node.js + Express
- **数据库**：MySQL
- **前端管理后台**：React.js (Web)
- **自动构建**：GitHub Actions + EAS
- **通知集成**：Slack（可选）

---

## 🚀 项目功能

- 用户注册，授权通讯录 & 相册权限
- 上传数据到后端服务器
- 后台管理查看通讯录和照片
- 自动化构建 APK / iOS 版本（使用 EAS）

---

## ⚙️ 快速开始

```bash
cd app
npm install
npx expo start
```

---

## 🤖 GitHub Actions 自动构建 APK / iOS

### ✅ 配置方式

1. 生成 [Expo Access Token](https://expo.dev/accounts/me/access-tokens)
2. 添加到 GitHub Secrets：
   - 名称：`EXPO_TOKEN`
3. 自动触发：每次 `main` 分支推送会构建 APK / iOS

```yaml
eas build -p android --profile production
eas build -p ios --profile production
```

📍 构建日志中会输出下载链接（也可设置自动上传）

---

## 🔔 Slack 通知支持（可选）

1. 在 Slack 创建 webhook 并添加到 GitHub Secrets：

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX
```

2. 修改 `build-apk.yml`，添加以下步骤：

```yaml
- name: 🔔 Slack Notify
  run: curl -X POST -H 'Content-type: application/json' --data '{"text":"✅ Expo APK 构建完成！"}' ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 🍏 构建 iOS 版本（需 Apple Developer 帐号）

```bash
eas build -p ios --profile production
```

---

## 🛡 安全建议

- 所有密码均应加密存储（使用 bcrypt）
- 使用 JWT 实现用户登录验证
- 图片上传可用 S3 或 Cloudinary 存储

---

## 📮 联系与支持

如需帮助或建议，请提交 Issues 或 PR！

> © 2025 Property App. Created with ❤️ by [Your Name]
