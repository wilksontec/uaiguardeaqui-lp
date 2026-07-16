const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function checkLogs() {
    await ssh.connect({ host: '167.233.230.170', username: 'root', password: 'ATBaqws01597530!@' });
    const res = await ssh.execCommand('su - uaiguardeaqui -c "source ~/.nvm/nvm.sh && pm2 logs uaiguardeaqui.com.br --lines 100 --nostream"');
    console.log(res.stdout);
    console.log(res.stderr);
    ssh.dispose();
}
checkLogs();
