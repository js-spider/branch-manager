const fs = require("fs-extra");
const path = require('path')
const moment = require("moment");
const gitCtr = require("./gitCtr");
const chalk = require("chalk");


const defaultWhiteList = ['master', 'test', 'develop']
const dateMapping = {
  'M': 'month',
  'Y': 'year',
  'D': 'day'
}


// 获取已有仓库列表
function getStashInfo(){
  const stash = require('./stash.json')
  const stashList = Object.values(stash)
  return {
    stash,
    list: stashList
  }
}

// 写文件
function writeJsonSync(stash){
  fs.writeJsonSync(path.resolve(__dirname, './stash.json'), stash, {spaces: 2})
}

//处理过期时间
function expiredFormat(str){
  const num = str.slice(0,-1)
  const dateStr = str.slice(-1).toUpperCase()
  return moment().subtract(num, dateMapping[dateStr]);
}

function nextStep(arr, onDelete){
  const nextRemote = arr.shift()
  nextRemote && onDelete(nextRemote).then(()=>{
    nextStep(arr, onDelete)
  })
}

function deleteSingle(remote, stash){
  const current = stash[remote]
  if(current){
    const whiteList = current.whiteList.map(item => `${remote}/${item}`)
    const expiredDate = expiredFormat(current.expired)
    return new Promise((resolve)=>{
      gitCtr.getBranchListWithDate(remote).then((res)=>{
        const list = res.filter(({ branch, date }) => {
          const expired = moment(date).isBefore(expiredDate)
          if(whiteList.includes(branch)){
            return false
          }else if(expired){
            return true
          }
          return false
        })
        if(list.length){
          const promiseArr = []
          console.log(chalk.blue('删除分支列表:'))
          list.forEach((item)=>{
            console.log(chalk.blue(item.date), '::::', chalk.blue(item.branch))
            const branchName = item.branch.replace(`${remote}/`, '')
            promiseArr.push(gitCtr.deleteRemoteBranch(remote,branchName).then(res =>{
              console.log(chalk.green(`${remote}的远程分支${branchName}已删除`))
            }))
          })
          Promise.all(promiseArr).then(()=>{
            resolve()
          })
        }else{
          console.log(chalk.bgGreenBright(`${remote}无过期分支`))
          resolve()
        }
      })
    })
  }else{
    return Promise.resolve()
  }
}


module.exports = {
  defaultWhiteList,
  deleteSingle,
  nextStep,
  writeJsonSync,
  getStashInfo
}
