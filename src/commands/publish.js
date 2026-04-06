const { supabase } = require('../lib/supabase');
const { loadSession } = require('../lib/session');
const { readPackageFile } = require('./publish_helpers');
const inquirer = require('inquirer');

async function publish(file) {
    const session = loadSession();
    if (!session) {
        console.error('Not logged in. Run: mdstitch login');
        process.exit(1);
    }

    const { content } = readPackageFile(file);

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Package name:',
            validate: (v) => v.trim() ? true : 'Name is required',
        },
        {
            type: 'input',
            name: 'description',
            message: 'Description:',
        },
        {
            type: 'list',
            name: 'type',
            message: 'Is this an agent or skill file?',
            choices: ['agent', 'skill'],
        },
    ]);

    await supabase.auth.setSession(session);

    const { error } = await supabase
        .from('packages')
        .insert({ name: answers.name, content, description: answers.description, type: answers.type, owner_id: session.user.id });

    if (error) {
        if (error.code === '23505') {
            console.error(`A package named "${answers.name}" already exists.`);
        } else {
            console.error(`Upload failed: ${error.message}`);
        }
        process.exit(1);
    }

    console.log(`Published "${answers.name}" successfully.`);
}

module.exports = { publish };
