const childProcess = require('child_process');
const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const util = require('util');

async function spawn(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const proc = childProcess.spawn(cmd, args, options);
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(code);
      } else {
        resolve();
      }
    });
  });
}

const parseArgs = (rawArgs) => {
  const args = {};
  let i = 2;
  while (i < rawArgs.length) {
    const arg = rawArgs[i];
    let value = '';
    if (rawArgs[i + 1]) {
      value = rawArgs[i + 1].startsWith('--') ? '' : rawArgs[i + 1];
    }
    args[arg] = value;
    if (value === '') {
      i = i + 1;
    } else {
      i = i + 2;
    }
  }
  return {
    bundle: args['--bundle'] === '' || args['--bundle'] === 'true' || false,
    build: args['--build'] === '' || args['--build'] === 'true' || false,
    link: args['--link'] === '' || args['--link'] === 'true' || false,
    unlink: args['--unlink'] === '' || args['--unlink'] === 'true' || false,
    publish: args['--publish'] === '' || args['--publish'] === 'true' || false,
  };
};
/**
 * @param {Array<{
 *  title: string;
 *  task: () => Promise<void>;
 * }>} tasks
 */
const Tasks = (tasks) => {
  return {
    run: async () => {
      for (let i = 0; i < tasks.length; i = i + 1) {
        const t = tasks[i];
        console.log(`${i + 1}. ${t.title}`);
        try {
          await t.task();
          console.log(`✓`);
        } catch (error) {
          console.log(`⨉`);
          throw error;
        }
      }
    },
  };
};
const bundle = async () => {
  const tasks = Tasks([
    {
      title: 'Check code',
      task: async () => {
        await spawn('npm', ['run', 'lint'], {
          stdio: 'inherit',
        });
        await spawn('npm', ['run', 'check'], {
          stdio: 'inherit',
        });
      },
    },
    {
      title: 'Remove old bundle.',
      task: async () => {
        await fse.remove(path.join(__dirname, 'dist'));
      },
    },
    {
      title: 'Compile TypeScript',
      task: async () => {
        await spawn('npm', ['run', 'build:src'], {
          stdio: 'inherit',
        });
        await fse.copy(
          path.join(__dirname, 'src', 'components'),
          path.join(__dirname, 'dist', 'components')
        );
      },
    },
    {
      title: 'Copy package.json',
      task: async () => {
        const data = JSON.parse(
          (
            await util.promisify(fs.readFile)(
              path.join(__dirname, 'package.json')
            )
          ).toString()
        );
        data.devDependencies = undefined;
        data.nodemonConfig = undefined;
        await util.promisify(fs.writeFile)(
          path.join(__dirname, 'dist', 'package.json'),
          JSON.stringify(data, null, '  ')
        );
      },
    },
    {
      title: 'Copy LICENSE',
      task: async () => {
        await fse.copy(
          path.join(__dirname, 'LICENSE'),
          path.join(__dirname, 'dist', 'LICENSE')
        );
      },
    },
    {
      title: 'Copy README.md',
      task: async () => {
        await fse.copy(
          path.join(__dirname, 'README.md'),
          path.join(__dirname, 'dist', 'README.md')
        );
      },
    },
  ]);
  try {
    await tasks.run();
  } catch (error) {
    console.error(error);
  }
};
const build = async () => {
  const tasks = Tasks([
    {
      title: 'Copy files',
      task: async () => {
        await fse.remove(path.join(__dirname, 'dist', 'src'));
        await fse.copy(
          path.join(__dirname, 'src'),
          path.join(__dirname, 'dist', 'src')
        );
      },
    },
  ]);
  await tasks.run();
};
const publish = async () => {
  if (
    await util.promisify(fs.exists)(
      path.join(__dirname, 'dist', 'node_modules')
    )
  ) {
    throw new Error(
      `Please remove "${path.join(__dirname, 'dist', 'node_modules')}"`
    );
  }
  await spawn('npm', ['publish', '--access=public'], {
    cwd: path.join(process.cwd(), 'dist'),
    stdio: 'inherit',
  });
};

async function main() {
  const options = parseArgs(process.argv);
  if (options.bundle === true) {
    await bundle();
  } else if (options.build === true) {
    await build();
  } else if (options.link === true) {
    await spawn('npm', ['i'], {
      cwd: path.join(process.cwd(), 'dist'),
      stdio: 'inherit',
    });
    await spawn('sudo', ['npm', 'link'], {
      cwd: path.join(process.cwd(), 'dist'),
      stdio: 'inherit',
    });
  } else if (options.unlink === true) {
    await spawn('sudo', ['npm', 'unlink'], {
      cwd: path.join(process.cwd(), 'dist'),
      stdio: 'inherit',
    });
  } else if (options.publish === true) {
    await publish();
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
