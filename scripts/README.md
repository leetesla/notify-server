# 脚本说明

## updateAlertExceptDetail.js

### 功能说明
此脚本用于根据Redis中ALERT_EXCEPT列表的token地址，从SQLite数据库中获取对应的token名称，并将格式化的信息保存到Redis的ALERT_EXCEPT_DETAIL列表中。

格式：`token名称 + 空格 + token地址`

### 使用方法
```bash
# 直接运行
node scripts/updateAlertExceptDetail.js

# 或使用npm脚本
npm run update-alert-except-detail
```

### 工作流程
1. 从Redis的ALERT_EXCEPT列表中获取所有token地址
2. 遍历每个token地址，在SQLite数据库中查询对应的token名称
3. 清空Redis中的ALERT_EXCEPT_DETAIL列表
4. 将格式化的信息（token名称 + 空格 + token地址）添加到ALERT_EXCEPT_DETAIL列表中
5. 显示处理结果

### 注意事项
- 脚本会清空原有的ALERT_EXCEPT_DETAIL列表内容
- 如果数据库中未找到token名称，则使用"Unknown"作为名称
- 脚本执行完毕后会自动关闭数据库连接