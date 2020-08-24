const dayjs = require('dayjs');
const path = require('path');
const ci = require(
  path.join(
    process.execPath.replace(/bin\/node$/, ''),
    'lib/node_modules/miniprogram-ci',
  )
);

const robots = ['', 'staging', 'production'];

const config = {
  version: dayjs().format('YYMMDDTHH'),
  env: process.env.APP_ENV,
};

function getAppId() {
  return require('../project.config.json').appid;
}

async function upload(env = config.env, desc, version = config.version) {
  const desc_str = desc || env;
  const projectPath = path.resolve();
  const privateKeyPath = path.resolve('script/upload.key');
  const appid = getAppId();
  const robot = robots.indexOf(env);

  const project = new ci.Project({
    appid, type: 'miniProgram',
    projectPath, privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  await ci.upload({
    project, version,
    desc: desc_str,
    robot, onProgressUpdate: console.log,
  });
}

upload().catch(err => {
  console.error(err);
  process.exit(1);
});
