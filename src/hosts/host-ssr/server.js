const path = require('path');
const fs = require('fs');
const os = require('os');
const winston = require('winston');

// Use a safe directory
const logPath = "C:/Workspace/eleoncore/client/angular/host-ssr/log.txt";
console.log('📝 Logging to:', logPath);

// Make sure directory exists
fs.mkdirSync(path.dirname(logPath), { recursive: true });

winston.configure({
  level: 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logPath })
  ]
});

winston.debug('🔥 IT WORKS!');
winston.debug('ON ' + logPath)