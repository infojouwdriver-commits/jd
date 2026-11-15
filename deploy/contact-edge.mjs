import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export function allowContactSubmission(config) {
  const site='jouww.com, www.jouww.com {';
  const start=config.indexOf('\n'+site);
  if(start===-1||config.indexOf('\n'+site,start+1)!==-1)throw Error('Unique marketing host required');
  const marker='\n  @unsafe not method GET HEAD';
  const end=config.indexOf('\n}',start);
  const at=config.indexOf(marker,start);
  if(end===-1||at===-1||at>=end||config.slice(start,end).includes('@public_contact'))
    throw Error('Reviewed marketing method guard required');
  const exception=`
  @public_contact {
    path /contact/submit
    method POST
  }
  handle @public_contact {
    request_body {
      max_size 16KB
    }
    import jouww_proxy
  }
`;
  return config.slice(0,at)+exception.trimEnd()+config.slice(at);
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url) {
  const path=process.argv[2];
  if(!path)throw Error('Caddyfile required');
  fs.writeFileSync(path,allowContactSubmission(fs.readFileSync(path,'utf8')));
}
