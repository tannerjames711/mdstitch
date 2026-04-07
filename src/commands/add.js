const { supabase } = require('../../src/lib/supabase');
const { writePackageFolder } = require('./add_helpers');

async function add(name) {
    const { data, error } = await supabase
        .from('packages')
        .select('name, content, type')
        .eq('name', name)
        .single();

    if (error || !data) {
        console.error(`Package "${name}" not found.`);
        process.exit(1);
    }

    const { data: refs, error: refsError } = await supabase
        .from('package_refs')
        .select('filename, content')
        .eq('package_name', name);

    if (refsError) {
        console.error(`Failed to fetch refs: ${refsError.message}`);
        process.exit(1);
    }

    writePackageFolder(data.name, data.content, data.type, refs || []);
    console.log(`Added "${data.name}/" to current folder.`);
}

module.exports = { add };
