const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function checkConfig() {
    try {
        await ssh.connect({ host: '167.233.230.170', username: 'root', password: 'ATBaqws01597530!@' });
        const res = await ssh.execCommand('grep -i "proxy_pass http://127.0.0.1:" /etc/nginx/sites-enabled/*');
        console.log("Portas configuradas no NGINX:\n", res.stdout);
        ssh.dispose();
    } catch(e) {}
}
checkConfig();
