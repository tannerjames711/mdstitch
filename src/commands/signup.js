const { supabase } = require('../../src/lib/supabase');
const { promptEmail, promptPassword, promptConfirmPassword } = require('./signup_helpers');

async function signup() {
    const email = await promptEmail();
    const password = await promptPassword();
    const confirm = await promptConfirmPassword();

    if (password !== confirm) {
        console.error('Passwords do not match.');
        process.exit(1);
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        console.error(`Sign-up failed: ${error.message}`);
        process.exit(1);
    }

    console.log(`Account created for ${data.user.email}. Check your email to confirm your account.`);
}

module.exports = { signup };
