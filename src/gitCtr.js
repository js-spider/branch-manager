const simpleGit = require('simple-git');

const git = simpleGit({
  baseDir: __dirname,
});


// 初始化git
function initGit(){
  return git.raw(['init']).then(()=>{
    console.log('src/gitCtr.js/11 >>>>>> ',1232);
  })
}

// 添加remote
function addRemote(stash){
  const list = Object.values(stash)
  git.getRemotes().then((remoteList)=>{
    const needAdd = list.filter(item => {
      return !remoteList.find((it)=> it.name === item.name)
    })
    if(Array.isArray(needAdd) && needAdd.length){
      needAdd.forEach(item =>{
        git.addRemote(item.name,item.repo)
      })
    }
  })
}

// 获取本地所有remotes
function getRemotes(){
  return git.getRemotes()
}

// 获取远程分支带
function getBranchListWithDate(remote){
  return git.raw(['fetch', remote]).then((res)=>{
    return new Promise((resolve, reject)=>{
      git.raw(['for-each-ref','--sort=-committerdate',`refs/remotes/${remote}/`,'--format=%(committerdate:short) %(refname:short)',],(err,result)=>{
        if(err){
          reject(err)
        }
        const branchList = []
        if(result && result.trim()){
          const resultArr = result.trim().split('\n');
          resultArr.forEach(item =>{
            const [date, name] = item.split(' ')
            branchList.push({
              branch: name,
              date
            })
          })
        }
        resolve(branchList)
      })

    })
  })
}


// 删除远程分支
function deleteRemoteBranch(remote,name){
  return git.push(remote, `:${name}`)
}

// 删除本地remote
function deleteRemoteLocal(remote){
  return git.removeRemote(remote)
}

module.exports = {
  initGit,
  getRemotes,
  addRemote,
  getBranchListWithDate,
  deleteRemoteBranch,
  deleteRemoteLocal
}
