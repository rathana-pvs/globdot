module.exports = {
  apps: [
    {
      name: 'globdot',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000 -H 127.0.0.1',
      cwd: './',
      // Default to 1 instance to avoid memory duplication on low-spec VPS (e.g. 1-2GB RAM).
      // Can be overridden via PM2_INSTANCES=2 or 'max' on multi-core servers.
      instances: process.env.PM2_INSTANCES ? (isNaN(process.env.PM2_INSTANCES) ? process.env.PM2_INSTANCES : parseInt(process.env.PM2_INSTANCES)) : 1,
      exec_mode: process.env.PM2_INSTANCES && process.env.PM2_INSTANCES !== '1' ? 'cluster' : 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1536M',
      kill_timeout: 5000,
      listen_timeout: 10000,
      min_uptime: '10s',
      max_restarts: 10,
      time: true,
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
