const { supabase } = require('../../src/lib/supabase');
const { saveSession } = require('../../src/lib/session');
const { promptEmail, promptPassword } = require('./login_helpers');

async function login() {
    const email = await promptEmail();
    const password = await promptPassword();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        console.error(`Login failed: ${error.message}`);
        process.exit(1);
    }

    saveSession(data.session);
    console.log(`Logged in as ${data.user.email}`);
}

module.exports = { login };
