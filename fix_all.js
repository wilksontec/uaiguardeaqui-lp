const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fix() {
    try {
        await ssh.connect({ host: '167.233.230.170', username: 'root', password: 'ATBaqws01597530!@' });
        
        const users = [
            { user: 'uaiguardeaqui-lp', domain: 'lp.uaiguardeaqui.com.br' },
            { user: 'uaiguardeaqui', domain: 'uaiguardeaqui.com.br' },
            { user: 'wilksontec', domain: 'google.andrewilkson.com.br' }
        ];

        for (let u of users) {
            console.log(`\n--- RECUPERANDO SITES DO USUÁRIO ${u.user} ---`);
            const cmd = `su - ${u.user} -c "source ~/.nvm/nvm.sh && cd ~/htdocs/${u.domain} && npm install -g pm2 2>/dev/null; pm2 start server.js --name ${u.domain} 2>/dev/null || pm2 start index.js --name ${u.domain} 2>/dev/null || npm start; pm2 save"`;
            
            const res = await ssh.execCommand(cmd);
            console.log("Resultado:\n", res.stdout);
            if(res.stderr) console.log("Erros:\n", res.stderr);
        }

        console.log("\nReiniciando NGINX por precaução...");
        await ssh.execCommand('systemctl restart nginx');

        ssh.dispose();
    } catch(e) { console.error(e); }
}
fix();
