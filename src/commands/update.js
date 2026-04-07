const { supabase } = require('../../src/lib/supabase');
const { loadSession } = require('../../src/lib/session');
const { readPackageFile } = require('./publish_helpers');

async function update(packageName, file) {
    const session = loadSession();
    if (!session) {
        console.error('Not logged in. Run: mdstitch login');
        process.exit(1);
    }

    await supabase.auth.setSession(session);

    const { content } = readPackageFile(file);
    const name = packageName;

    const { error } = await supabase
        .from('packages')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('name', name)
        .eq('owner_id', session.user.id);

    if (error) {
        console.error(`Update failed: ${error.message}`);
        process.exit(1);
    }

    console.log(`Updated "${name}" successfully.`);
}

module.exports = { update };
