const chalk = require("chalk");
const gitCtr = require('./gitCtr')
const tools = require('./tools')



// 查看仓库列表
function onList(){
  const { list } = tools.getStashInfo()
  list.forEach(item =>{
    const formatName = new Array(20 - item.name.length).fill(' ').join('') + item.name
    console.log(chalk.greenBright(formatName), chalk.green(' >>> ' + item.repo))
  })
}

// 添加仓库
function onAdd(name,repo,whiteList,expired){
  const {stash, list} = tools.getStashInfo()
  if(stash[name]){
    console.log(chalk.red(`仓库名称重复: 已存在仓库<${name}>:[${stash[name].repo}]`))
    return ;
  }
  const repoExist = list.find(item => item.repo === repo)
  if(repoExist){
    console.log(chalk.red(`仓库repo重复: 已存在仓库<${repoExist.name}>:[${repoExist}]`))
    return ;
  }
  if(whiteList && whiteList !== '[]'){
    if(whiteList.startsWith('[') && whiteList.endsWith(']')){
      const str = whiteList.slice(1,-1)
      if(str && str.length){
        whiteList = str.split(',').map(item => item.trim())
      }
    }else if(whiteList.match(/^\d{1,2}[hHMmYydD]{1}$/)) {
      expired = whiteList
      whiteList = []
    }
  }else{
    whiteList = []
  }
  whiteList = Array.from( new Set(tools.defaultWhiteList.concat(whiteList)))
  expired = expired || '3M'

  stash[name] = {
    name,
    repo,
    expired,
    whiteList
  }
  tools.writeJsonSync(stash)
  gitCtr.addRemote(stash).then((added)=>{
    if(Array.isArray(added) && added.length){
      console.log(chalk.green('添加成功,查看列表如下:'))
      onList()
    }else{
      console.log(chalk.red('未添加任何remote'))
    }
  })
}

// 删除分支
function onDelete(remote){
  const { stash } = tools.getStashInfo()
  if(remote){
    console.log(chalk.cyan(`正在检查${remote}的过期分支 ...`))
    return tools.deleteSingle(remote, stash)
  }else{
    console.log(chalk.cyan(`检查本地所有remotes...`))
    return gitCtr.getRemotes().then(res =>{
      if(Array.isArray(res)){
        let arr = []
        res.forEach(item =>{
          console.log(chalk.green(item.name))
          arr.push(item.name)
        })
        tools.nextStep(arr, onDelete)
      }
    })
  }
}

// 删除分支
function onSearch(remote){
  const { stash } = tools.getStashInfo()
  if(remote){
    console.log(chalk.cyan(`正在检查${remote}的过期分支 ...`))
    return tools.searchSingle(remote, stash)
  }
}

// 删除本地仓库
function onDeleteRemote(remote){

  gitCtr.deleteRemoteLocal(remote).then(res =>{
    const {stash} = tools.getStashInfo()
    delete stash[remote]
    tools.writeJsonSync(stash)
    console.log(chalk.red(`本地remote ${remote} 删除成功`))
  })
}

module.exports = {
  onList,
  onAdd,
  onSearch,
  onDelete,
  onDeleteRemote
}
