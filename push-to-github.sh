#!/bin/bash
# 推送项目到 GitHub 仓库

REPO_URL=https://github.com/Jerry910829/house.git
PROJECT_DIR=property-app

cd /mnt/data

# 初始化 Git 并推送到远程仓库
cd $PROJECT_DIR
git init
git remote add origin $REPO_URL
git add .
git commit -m "🚀 Initial commit - fullstack property app with backend, frontend and mobile (expo)"
git branch -M main
git push -u origin main
