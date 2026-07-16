const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function debug() {
    try {
        await ssh.connect({
            host: '167.233.230.170',
            username: 'root',
            password: 'ATBaqws01597530!@'
        });

        console.log("=== STATUS DOS PROCESSOS NODE ===");
        const pNode = await ssh.execCommand('ps auxww | grep -i node | grep -v grep');
        console.log(pNode.stdout || "Nenhum processo node rodando.");

        console.log("\n=== PORTAS ABERTAS ===");
        const ports = await ssh.execCommand('netstat -tulpn | grep -E "node|pm2|4000|3000"');
        console.log(ports.stdout || "Nenhuma porta node encontrada.");

        console.log("\n=== LOGS DE ERRO DO NGINX (GERAL) ===");
        const nginxErr = await ssh.execCommand('tail -n 20 /var/log/nginx/error.log 2>/dev/null');
        console.log(nginxErr.stdout || "Vazio");

        console.log("\n=== LOGS DE ERRO DOS SITES NO CLOUDPANEL ===");
        const siteErrs = await ssh.execCommand('tail -n 10 /home/*/logs/*error.log 2>/dev/null');
        console.log(siteErrs.stdout || "Vazio");

        console.log("\n=== STATUS DO PM2 (wilksontec) ===");
        const pm2Status1 = await ssh.execCommand('su - wilksontec -c "pm2 status 2>/dev/null"');
        console.log(pm2Status1.stdout || "Vazio");

        console.log("\n=== STATUS DO PM2 (uaiguardeaqui) ===");
        const pm2Status2 = await ssh.execCommand('su - uaiguardeaqui -c "pm2 status 2>/dev/null"');
        console.log(pm2Status2.stdout || "Vazio");
        
        console.log("\n=== STATUS DO PM2 (uaiguardeaqui-lp) ===");
        const pm2Status3 = await ssh.execCommand('su - uaiguardeaqui-lp -c "pm2 status 2>/dev/null"');
        console.log(pm2Status3.stdout || "Vazio");

        ssh.dispose();
    } catch (e) {
        console.error("Erro na conexão:", e);
    }
}
debug();
