// Scan indexed tracked + untracked source filenames; never print matching credential values.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const files=[...new Set(execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{encoding:'utf8'}).split('\0').filter(Boolean))];
const findings=[];
for(const file of files){
 if(!fs.existsSync(file)||!fs.statSync(file).isFile())continue;
 if(/(^|\/)(\.env(?!\.example$)(?:\.|$)|database-(?:export|structure)|private-trial-env|.*\.(?:p12|p8|jks|keystore)$)/.test(file)){findings.push(`${file}: private configuration or database export filename`);continue;}
 if(fs.statSync(file).size>2000000||/lock\.(?:yaml|json)$/.test(file)||/\.svg$/.test(file))continue;
 const data=fs.readFileSync(file,'utf8');
 if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(data)||/\b(?:[sr]k_(?:live|test)_[A-Za-z0-9]{24,}|whsec_[A-Za-z0-9]{24,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{60,}|sk-proj-[A-Za-z0-9_-]{40,}|AKIA[A-Z0-9]{16})\b/.test(data))findings.push(`${file}: credential-shaped value`);
}
if(findings.length){console.error(findings.join('\n'));process.exitCode=1;}else console.log(`Repository safety scan passed (${files.length} files; credential values never logged).`);
