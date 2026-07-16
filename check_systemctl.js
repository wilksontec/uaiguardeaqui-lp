const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function checkStatus() {
    try {
        await ssh.connect({ host: '167.233.230.170', username: 'root', password: 'ATBaqws01597530!@' });
        const res = await ssh.execCommand('systemctl status pm2-uaiguardeaqui pm2-wilksontec pm2-uaiguardeaqui-lp || true');
        console.log(res.stdout || res.stderr);
        ssh.dispose();
    } catch(e) {}
}
checkStatus();
