const { readFileSync } = require('fs');
const { join } = require('path');

module.exports.caddyFile = readFileSync(join(__dirname, 'caddy-config', 'Caddyfile'), { encoding: 'utf-8'}).replace(/\n/g, "\\n");
module.exports.caddyService = readFileSync(join(__dirname, 'caddy-config', 'caddy.service'), { encoding: 'utf-8'}).replace(/\n/g, "\\n");
