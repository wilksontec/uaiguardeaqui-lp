const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function check() {
    try {
        await ssh.connect({ host: '167.233.230.170', username: 'uaiguardeaqui-lp', password: 'ZxcAwss01597530!@' });
        const cmd = 'bash -lc "pm2 start server.js --name lp.uaiguardeaqui.com.br && pm2 save"';
        const res = await ssh.execCommand(cmd);
        console.log(res.stdout || res.stderr);
        ssh.dispose();
    } catch(e) { console.error(e); }
}
check();
