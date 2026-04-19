const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '91.99.192.76',
      username: 'root',
      password: 'VJtxPFM4dLVK'
    });
    console.log('SSH connection established');
    
    // I7: Firewall & Fail2Ban
    const commands = [
      'apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y fail2ban ufw',
      'systemctl enable fail2ban && systemctl start fail2ban',
      'ufw --force enable',
      'ufw default deny incoming || true',
      'ufw default allow outgoing || true',
      'ufw allow 22/tcp',
      'ufw allow 80/tcp',
      'ufw allow 443/tcp',
      'ufw reload',
      'ufw status'
    ];
    
    for (const cmd of commands) {
      console.log(`Executing: ${cmd}`);
      const result = await ssh.execCommand(cmd);
      if (result.stdout) console.log('STDOUT:', result.stdout);
      if (result.stderr) console.error('STDERR:', result.stderr);
    }

    // I3: Deployment Flow
    console.log('--- DEPLOYMENT ---');
    const deployCmds = [
      'cd "/root/Diplomacy 2.0" || cd /root/diplomacy-2.0 || exit 1',
      'git pull origin main',
      'docker compose build',
      'docker compose up -d',
      'docker exec diplomacy2-api npx prisma migrate deploy',
      'curl -s http://localhost:4000/api || echo "API not responding"'
    ];

    for (const cmd of deployCmds) {
      console.log(`Executing: ${cmd}`);
      const result = await ssh.execCommand(cmd);
      if (result.stdout) console.log('STDOUT:', result.stdout);
      if (result.stderr) console.error('STDERR:', result.stderr);
    }
    
    console.log('Deployment cycle complete.');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    ssh.dispose();
  }
}

run();
