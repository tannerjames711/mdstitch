const fs = require('fs');
const path = require('path');
const { supabase } = require('../lib/supabase');
const { loadSession } = require('../lib/session');

async function addref(packageName, file) {
    const session = loadSession();
    if (!session) {
        console.error('Not logged in. Run: mdstitch login');
        process.exit(1);
    }

    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
    }

    const filename = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    const { error: sessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
    });

    if (sessionError) {
        console.error('Session expired. Please run: mdstitch login');
        process.exit(1);
    }

    const { data: { user } } = await supabase.auth.getUser();

    await supabase
        .from('package_refs')
        .delete()
        .eq('package_name', packageName)
        .eq('filename', filename)
        .eq('owner_id', user.id);

    const { error } = await supabase
        .from('package_refs')
        .insert({ package_name: packageName, filename, content, owner_id: user.id });

    if (error) {
        console.error(`Failed to upload ref: ${error.message}`);
        process.exit(1);
    }

    console.log(`Added "${filename}" as a reference for "${packageName}".`);
}

module.exports = { addref };
