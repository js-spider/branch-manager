
const { program } = require('commander');
const actions = require('./actions.js')
const PKG = require('../package.json');



program
  .version(PKG.version);

program
  .command('ls')
  .description('查看仓库列表')
  .action(actions.onList);

program
  .command('json')
  .description('获取本地维护的仓库JSON信息')
  .argument('[name]', '获取本地维护的仓库JSON信息')
  .action(actions.onJson);

program
  .command('add')
  .description('添加仓库 name:本地名称 repo: 仓库地址 expired: 过期时间包括[YyMmDdHhFf]代表[年月日时分] whiteList:白名单 如:[master,develop]')
  .argument('<name>', '定义仓库名称')
  .argument('<repo>', 'git远程仓库地址')
  .argument('[expired]', '指定过期时间,已过期的分支可以被删除')
  .argument('[whiteList...]', '指定不能被删除的特殊分支名')
  .action(actions.onAdd);

program
  .command('update')
  .description('修改仓库 包括白名单和过期时间 如果要修改name 和 repo 需要删除(rmr)再从新添加(add)')
  .argument('<name>', '定义仓库名称')
  .argument('[expired]', '指定过期时间,已过期的分支可以被删除')
  .argument('[whiteList...]', '指定不能被删除的特殊分支名')
  .action(actions.onUpdate);

program
  .command('check')
  .description('检查指定remote对应的过期分支列表')
  .argument('<name>', 'remote 名称')
  .action(actions.onSearch);

program
  .command('remove-remote')
  .description('删除本地remote,本地remote删除后将无法管理对应仓库')
  .argument('<name>', 'remote 名称')
  .action(actions.onDeleteRemote);

program
  .command('remove-branch')
  .description('删除分支, 可通过name指定仓库删除 或者name为空时根据本地配置的remote批量删除')
  .argument('[name]', '根据仓库名称删除对应分支')
  .action(actions.onDelete);


program
  .parse(process.argv);

if (process.argv.length === 2) {
  program.outputHelp();
}
