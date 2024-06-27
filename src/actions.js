const chalk = require("chalk");
const gitCtr = require('./gitCtr')
const tools = require('./tools')



// 查看仓库列表
function onList(){
  const { list } = tools.getStashInfo()
  if(list.length){
    list.forEach(item =>{
      const formatName = new Array(20 - item.name.length).fill(' ').join('') + item.name
      console.log(chalk.greenBright(formatName), chalk.cyan(' >>> ' + item.repo))
    })
  }else{
    console.log(chalk.bgCyanBright('remote列表为空'))
  }
}
// 获取json 信息
function onJson(name){
  const { stash, list } = tools.getStashInfo()
  if(name){
    if(stash[name]){
      tools.outputJson(stash[name])
    }else{
      console.log(chalk.red(`name: ${name}不存在`));
    }
  }else{
    if(list.length){
      list.forEach(item => {
        tools.outputJson(item)
      })
    }else{
      console.log(chalk.bgCyanBright('JSON数据为空'))
    }
  }
}

// 添加仓库
function onAdd(name,repo, expired, whiteList){
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
  if(expired.startsWith('[')){
    whiteList.unshift(expired)
    whiteList = whiteList.join('')
    expired = undefined
  }
  if(Array.isArray(whiteList)){
    whiteList = whiteList.join('')
  }
  if(whiteList && whiteList !== '[]'){
    if(whiteList.startsWith('[') && whiteList.endsWith(']')){
      const str = whiteList.slice(1,-1)
      if(str && str.length){
        whiteList = str.split(',').map(item => item.trim())
      }
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
      console.log(chalk.cyan('添加成功,查看列表如下:'))
      onList()
    }else{
      console.log(chalk.red('未添加任何remote'))
    }
  })
}

// 修改仓库
function onUpdate(name, expired, whiteList){
  const {stash} = tools.getStashInfo()
  if(expired.startsWith('[')){
    whiteList.unshift(expired)
    whiteList = whiteList.join('')
    expired = undefined
  }
  if(Array.isArray(whiteList)){
    whiteList = whiteList.join('')
  }
  if(whiteList && whiteList !== '[]'){
    if(whiteList.startsWith('[') && whiteList.endsWith(']')){
      const str = whiteList.slice(1,-1)
      if(str && str.length){
        whiteList = str.split(',').map(item => item.trim())
      }
    }
   /* else if(whiteList.match(/^\d{1,2}[hHMmYydDFf]{1}$/)) {
      expired = whiteList
      whiteList = []
    }*/
  }else{
    whiteList = (stash[name] && stash[name].whiteList) || []
  }
  whiteList = Array.from( new Set(tools.defaultWhiteList.concat(whiteList)))
  expired = expired || ( stash[name] && stash[name].expired) || '3M'
  stash[name] = {
    ...stash[name],
    expired,
    whiteList
  }
  tools.writeJsonSync(stash)
  console.log(chalk.cyan('修改成功:'))
  tools.outputJson(stash[name])
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
          console.log(chalk.cyan(item.name))
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
  onJson,
  onAdd,
  onUpdate,
  onSearch,
  onDelete,
  onDeleteRemote
}
