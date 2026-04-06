#!/usr/bin/env node
require('dotenv').config();
const { program } = require('commander');

const { pretty } = require('../src/commands/pretty');
const { compress } = require('../src/commands/compress');
const { run } = require('../src/commands/run');
const { login } = require('../src/commands/login');
const { signup } = require('../src/commands/signup');
const { publish } = require('../src/commands/publish');
const { add } = require('../src/commands/add');
const { update } = require('../src/commands/update');

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
  .action(() => login());

program
  .command('signup')
  .description('Create a new mdstitch account')
  .action(() => signup());

program
  .command('publish')
  .description('Publish an md file as a package')
  .argument('<file>', 'The md file to publish')
  .action((file) => publish(file));

program
  .command('add')
  .description('Add a package to the current folder')
  .argument('<name>', 'The package name to add')
  .action((name) => add(name));

program
  .command('update')
  .description('Update a package you own')
  .argument('<file>', 'The md file to update')
  .option('-n, --name <name>', 'Package name to update (defaults to filename)')
  .action((file, options) => update(file, options.name));

// ─── Parse ──────────────────────────────────────────────────────────────────

// Reads what the user typed in the terminal and runs the matching command
// This must always be the last line
program.parse();
