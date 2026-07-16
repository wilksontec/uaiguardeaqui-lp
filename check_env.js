const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function checkEnv() {
    await ssh.connect({ host: '167.233.230.170', username: 'root', password: 'ATBaqws01597530!@' });
    const res = await ssh.execCommand('cat /home/uaiguardeaqui/htdocs/uaiguardeaqui.com.br/.env');
    console.log(res.stdout);
    ssh.dispose();
}
checkEnv();
