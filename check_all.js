const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function check() {
    try {
        await ssh.connect({ host: '167.233.230.170', username: 'uaiguardeaqui-lp', password: 'ZxcAwss01597530!@' });
        
        console.log("=== PROCESSOS NODE RODANDO NO SERVIDOR ===");
        const res = await ssh.execCommand('ps auxww | grep -i node | grep -v grep');
        console.log(res.stdout || "Nenhum processo node rodando.");

        console.log("\n=== MEMÓRIA DA VPS ===");
        const res2 = await ssh.execCommand('free -m');
        console.log(res2.stdout);
        
        ssh.dispose();
    } catch(e) { console.error(e); }
}
check();
