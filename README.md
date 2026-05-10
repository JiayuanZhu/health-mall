# Health Mall 健康医疗商城

一个全栈在线健康医疗商城，集成了药品购买、科室浏览、医生预约挂号等功能。

## 功能特性

### 用户端
- 🏠 首页轮播、热门药品推荐
- 💊 药品浏览、搜索、分类筛选
- 🏥 科室列表与详情
- 👨‍⚕️ 医生介绍与在线预约挂号
- 🛒 购物车、下单、订单管理
- 📋 我的预约记录
- 👤 用户注册、登录、个人信息管理

### 管理后台
- 📊 数据概览仪表盘
- 📦 商品管理（增删改查）
- 📝 订单管理（状态流转）
- 🗓️ 预约管理
- 👥 用户管理

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + Vite + Tailwind CSS |
| 路由 | React Router v6 |
| HTTP | Axios |
| UI 图标 | Lucide React |
| 通知 | React Hot Toast |
| 后端 | Express.js |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | JWT + bcryptjs |
| 文件上传 | Multer |

## 快速开始

### 方式一：打包发布（推荐给非开发人员）

使用打包脚本生成"解压即用"的完整包（自带 Node.js，无需安装任何东西）：

```bash
# 打包 Linux 版
./build-scripts/build-linux.sh

# 打包 Windows 版
./build-scripts/build-windows.sh
```

打包产出：
- `health-mall-linux-x64.tar.gz` — Linux 用户解压后运行 `./start.sh`
- `health-mall-windows-x64.zip` — Windows 用户解压后双击 `start.bat`

### 方式二：开发者本地运行

前置条件：Node.js >= 18

```bash
# 安装依赖
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# 同时启动前后端
npm run dev
```

- 前端: http://localhost:5173
- 后端 API: http://localhost:3001

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | user1 | 123456 |

管理后台: http://localhost:5173/admin

## 项目结构

```
health-mall/
├── build-scripts/          # 打包脚本
│   ├── build-linux.sh      # 打包 Linux 解压即用版
│   └── build-windows.sh    # 打包 Windows 解压即用版
├── client/                 # 前端 (Vite + React)
│   ├── public/images/      # 静态图片资源
│   ├── src/
│   │   ├── components/     # 公共组件 (Layout, AdminLayout)
│   │   ├── contexts/       # React Context (Auth, Cart)
│   │   ├── pages/          # 页面组件
│   │   │   ├── admin/      # 管理后台页面
│   │   │   └── *.jsx       # 用户端页面
│   │   ├── utils/          # 工具函数 (api.js)
│   │   ├── App.jsx         # 路由配置
│   │   └── main.jsx        # 入口
│   ├── tailwind.config.js
│   └── vite.config.js      # Vite 配置 + API 代理
├── server/                 # 后端 (Express)
│   ├── routes/             # API 路由
│   │   ├── auth.js         # 注册/登录
│   │   ├── products.js     # 药品
│   │   ├── departments.js  # 科室
│   │   ├── doctors.js      # 医生
│   │   ├── cart.js         # 购物车
│   │   ├── orders.js       # 订单
│   │   ├── appointments.js # 预约
│   │   ├── banners.js      # 轮播图
│   │   └── admin.js        # 管理后台 API
│   ├── middleware/auth.js  # JWT 认证中间件
│   ├── db.js              # 数据库初始化 + 种子数据
│   └── index.js           # Express 入口
└── package.json           # 根 monorepo 脚本
```

## API 接口

所有 API 以 `/api` 为前缀：

| 模块 | 路径 | 说明 |
|------|------|------|
| 认证 | `/api/auth` | 注册、登录 |
| 药品 | `/api/products` | 列表、详情、分类 |
| 科室 | `/api/departments` | 列表、详情 |
| 医生 | `/api/doctors` | 列表、详情 |
| 购物车 | `/api/cart` | 增删改查 |
| 订单 | `/api/orders` | 创建、列表、详情 |
| 预约 | `/api/appointments` | 创建、列表 |
| 轮播 | `/api/banners` | 首页轮播图 |
| 管理 | `/api/admin` | 后台管理接口 |

## 开发说明

- 数据库文件 `server/health-mall.db` 首次启动时自动创建并填充示例数据
- 前端开发服务通过 Vite proxy 将 `/api` 请求代理到后端 3001 端口
- 图片资源存放在 `client/public/images/`
- 打包脚本使用 Node.js v20 LTS + better-sqlite3 prebuilt binary，确保跨平台兼容

## License

MIT
