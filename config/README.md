# 配置管理

本目录用于集中管理应用的所有配置。

## 配置文件说明

- `index.js`: 主配置文件，导出所有配置项
- `.env`: 环境变量文件，存放敏感信息和环境相关配置

## 使用方法

在应用中通过以下方式引入配置：

```javascript
const config = require('./config');
console.log(config.port);
```

## 配置项

目前支持的配置项：
- `port`: 服务监听端口