const path = require('path');

function run() {
	const runAll = require('npm-run-all');

	const [, , ...args] = process.argv;

	const root = path.resolve(__dirname, '..');
	const allWorkspaces = require('../package.json').workspaces;
	const scriptname = args[0];
	if (!scriptname || allWorkspaces.includes(scriptname)) {
		throw new Error('The first arg must be the script name');
	}

	const workspaces = allWorkspaces.filter((workspace) => {
		// Filter out all workspaces that not contain the specified script
		return !!require(path.resolve(root, workspace, 'package.json')).scripts?.[scriptname];
	});

	const commands = [];

	let parallel = true;
	let hasFramework = false;
	const restParams = [];
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (workspaces.indexOf(arg) > -1) {
			commands.push(`${scriptname} -w ${arg}`);
			hasFramework = true;
		} else if (arg === 'serial') {
			parallel = false;
		} else if (i > 0) {
			restParams.push(arg);
		}
	}

	if (!hasFramework) {
		commands.push(...workspaces.map((workspace) => `${scriptname} -w ${workspace}`));
	}

	if (restParams.length) {
		const restParamsStr = ` -- ${restParams.join(' ')}`;
		for (let i = 0; i < commands.length; i++) {
			commands[i] += restParamsStr;
		}
	}

	try {
		console.log('npm scripts : ', commands);
		runAll(commands, {parallel, printName: true, printLabel: true, stdout: process.stdout, stderr: process.stderr, stdin: process.stdin});
	} catch (e) {
		console.log(e);
		process.exit(-1);
	}
}

run();
