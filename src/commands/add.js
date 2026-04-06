const { supabase } = require('../../src/lib/supabase');
const { writePackageFile } = require('./add_helpers');

async function add(name) {
    const { data, error } = await supabase
        .from('packages')
        .select('name, content')
        .eq('name', name)
        .single();

    if (error || !data) {
        console.error(`Package "${name}" not found.`);
        process.exit(1);
    }

    writePackageFile(data.name, data.content);
    console.log(`Added "${data.name}.md" to current folder.`);
}

module.exports = { add };
