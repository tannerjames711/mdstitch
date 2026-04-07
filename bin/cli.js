#!/usr/bin/env node
const { program } = require('commander');

const { pretty } = require('../src/commands/pretty');
const { compress } = require('../src/commands/compress');
const { run } = require('../src/commands/run');

const pkg = require('../package.json');

//setup
program
  .name('mdstitch')
  .description('A CLI tool for agmod')
  .version(pkg.version); // enables: betterag --version

//Commands
program
  .command('pretty')
  .description('Format and prettify a agent.md file')
  .argument('<file>', 'The file to prettify')
  .action((file) => {
    pretty(file);
  });

// betterag compress <file>
program
  .command('compress')
  .description('Compress a file')
  .argument('<file>', 'The file to compress')
  .action((file) => {
    compress(file);
  });

// betterag run <file>
program
  .command('run')
  .description('Process @excel() references in a markdown file')
  .argument('<file>', 'The markdown file to process')
  .action((file) => {
    run(file);
  });

program
  .command('login')
  .description('Log in to mdstitch')
  .action(() => require('../src/commands/login').login());

program
  .command('signup')
  .description('Create a new mdstitch account')
  .action(() => require('../src/commands/signup').signup());

program
  .command('publish')
  .description('Publish an md file as a package')
  .argument('<file>', 'The md file to publish')
  .action((file) => require('../src/commands/publish').publish(file));

program
  .command('add')
  .description('Add a package to the current folder')
  .argument('<name>', 'The package name to add')
  .action((name) => require('../src/commands/add').add(name));

program
  .command('addref')
  .description('Add or update a reference file on a published package')
  .argument('<package>', 'The package name')
  .argument('<file>', 'The reference file to attach')
  .action((packageName, file) => require('../src/commands/addref').addref(packageName, file));

program
  .command('removeref')
  .description('Remove a reference file from a published package')
  .argument('<package>', 'The package name')
  .argument('<filename>', 'The filename to remove')
  .action((packageName, filename) => require('../src/commands/removeref').removeref(packageName, filename));

program
  .command('update')
  .description('Update a package you own')
  .argument('<file>', 'The md file to update')
  .option('-n, --name <name>', 'Package name to update (defaults to filename)')
  .action((file, options) => require('../src/commands/update').update(file, options.name));

// ─── Parse ──────────────────────────────────────────────────────────────────

// Reads what the user typed in the terminal and runs the matching command
// This must always be the last line
program.parse();
