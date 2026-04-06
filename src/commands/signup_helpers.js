const { promptEmail, promptPassword } = require('./login_helpers');

function promptConfirmPassword() {
    return new Promise(resolve => {
        process.stdout.write('Confirm password: ');
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

module.exports = { promptEmail, promptPassword, promptConfirmPassword };
