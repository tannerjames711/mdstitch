const { supabase } = require('../lib/supabase');
const { loadSession } = require('../lib/session');

async function removeref(packageName, filename) {
    const session = loadSession();
    if (!session) {
        console.error('Not logged in. Run: mdstitch login');
        process.exit(1);
    }

    const { error: sessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
    });

    if (sessionError) {
        console.error('Session expired. Please run: mdstitch login');
        process.exit(1);
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('package_refs')
        .delete()
        .eq('package_name', packageName)
        .eq('filename', filename)
        .eq('owner_id', user.id);

    if (error) {
        console.error(`Failed to remove ref: ${error.message}`);
        process.exit(1);
    }

    console.log(`Removed "${filename}" from "${packageName}".`);
}

module.exports = { removeref };
