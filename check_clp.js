const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function check() {
    try {
        await ssh.connect({ host: '167.233.230.170', username: 'uaiguardeaqui-lp', password: 'ZxcAwss01597530!@' });
        const res = await ssh.execCommand('sudo /usr/bin/clpctlWrapper --help || sudo /usr/bin/clpctlWrapper');
        console.log(res.stdout || res.stderr);
        ssh.dispose();
    } catch(e) { console.error(e); }
}
check();
