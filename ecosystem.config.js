module.exports = {
  apps: [{
    name: 'notify-server',
    script: './bin/www',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',  // 降低内存限制到512MB
    node_args: '--max-old-space-size=512', // 设置Node.js堆内存限制
    env: {
      NODE_ENV: 'development',
      PORT: 6001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 6001
    },
    // 添加内存监控
    cron_restart: '0 0 * * *', // 每天重启一次以释放内存
    // 日志配置
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  },
  {
    name: 'okx-service',
    script: './bin/okx',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    node_args: '--max-old-space-size=512',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    // 日志配置
    error_file: './logs/okx-err.log',
    out_file: './logs/okx-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  },
  {
    name: 'play-music',
    script: 'npm',
    args: 'run play-music',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    // 日志配置
    error_file: './logs/music-err.log',
    out_file: './logs/music-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};