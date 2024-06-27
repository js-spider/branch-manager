#!/usr/local/bin/node

const PKG = require('../package.json');
const { program } = require('commander');
const actions = require('../src/actions.js')


program
  .version(PKG.version);

program
  .command('ls')
  .description('查看仓库列表')
  .action(actions.onList);

program
  .command('add')
  .description('添加仓库')
  .argument('<name>', '定义仓库名称')
  .argument('<repo>', 'git远程仓库地址')
  .argument('[whiteList]', '指定不能被删除的特殊分支名')
  .argument('[expired]', '指定过期时间,已过期的分支可以被删除')
  .action(actions.onAdd);


program
  .command('rmr')
  .description('删除本地remote,本地remote删除后将无法管理对应仓库')
  .argument('<name>', 'remote 名称')
  .action(actions.onDeleteRemote);

program
  .command('rmb')
  .description('删除分支')
  .argument('[name]', '根据仓库名称删除对应分支')
  .action(actions.onDelete);


program
  .parse(process.argv);

if (process.argv.length === 2) {
  program.outputHelp();
}
