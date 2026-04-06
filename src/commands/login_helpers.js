const readline = require('readline');

function promptEmail() {
    return new Promise(resolve => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('Email: ', answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function promptPassword() {
    return new Promise(resolve => {
        process.stdout.write('Password: ');
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        let password = '';
        function handler(char) {
            if (char === '\n' || char === '\r' || char === '\u0004') {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeListener('data', handler);
                process.stdout.write('\n');
                resolve(password);
            } else if (char === '\u0003') {
                process.exit();
            } else if (char === '\u007f') {
                password = password.slice(0, -1);
            } else {
                password += char;
            }
        }
        process.stdin.on('data', handler);
    });
}

module.exports = { promptEmail, promptPassword };
