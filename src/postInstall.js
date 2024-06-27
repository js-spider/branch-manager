const { exec } = require('child_process');
const path = require('path')

exec('git init ',{cwd: path.resolve(__dirname,'../')}, (error, stdout, stderr) => {
  if (error) {
    console.error(`执行的错误: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  if (stderr) {
    console.log(`stderr: ${stderr}`);
  }
});
