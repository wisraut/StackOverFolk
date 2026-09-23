import { CryptoOperationError } from './hash.js';

const IP = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
const FP = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
const E = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
const P = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
const PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4];
const PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];
const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];
const SBOXES = [
  [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],[4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]],
  [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],[0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]],
  [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],[13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]],
  [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],[10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]],
  [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],[4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]],
  [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],[9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]],
  [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],[1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]],
  [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],[1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],[7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]],
];

export const DEFAULT_DES_SETTINGS = Object.freeze({keyHex:'133457799BBCDFF1',ivHex:'0000000000000000'});
export const DEFAULT_3DES_SETTINGS = Object.freeze({keyHex:'0123456789ABCDEFFEDCBA98765432100011223344556677',ivHex:'0000000000000000'});

function fail(code,message){throw new CryptoOperationError(code,message);}
function permute(value,table,width){let out=0n;for(const position of table)out=(out<<1n)|((value>>BigInt(width-position))&1n);return out;}
function rotate28(value,amount){return((value<<BigInt(amount))|(value>>BigInt(28-amount)))&0xFFFFFFFn;}
function hex(value,width){return value.toString(16).toUpperCase().padStart(width,'0');}
function bufferToBigInt(buffer){return BigInt(`0x${buffer.toString('hex')||'0'}`);}
function bigIntToBuffer(value){return Buffer.from(hex(value,16),'hex');}
function xorBuffers(a,b){return Buffer.from(a.map((byte,index)=>byte^b[index]));}
function parseHex(value,bytes,label){const normalized=String(value??'').trim();if(!/^[0-9a-fA-F]+$/.test(normalized)||normalized.length!==bytes*2)fail('INVALID_HEX',`${label} must be exactly ${bytes*2} hexadecimal characters.`);return Buffer.from(normalized,'hex');}

function subkeys(key){const reduced=permute(bufferToBigInt(key),PC1,64);let c=(reduced>>28n)&0xFFFFFFFn;let d=reduced&0xFFFFFFFn;return SHIFTS.map((shift)=>{c=rotate28(c,shift);d=rotate28(d,shift);return permute((c<<28n)|d,PC2,56);});}
function feistel(right,key){const mixed=permute(right,E,32)^key;let substituted=0n;for(let index=0;index<8;index++){const chunk=Number((mixed>>BigInt((7-index)*6))&0x3Fn);const row=((chunk&0x20)>>4)|(chunk&1);const column=(chunk>>1)&0xF;substituted=(substituted<<4n)|BigInt(SBOXES[index][row][column]);}return permute(substituted,P,32);}

export function desBlock(block,key,decrypt=false){const keys=subkeys(key);if(decrypt)keys.reverse();const initial=permute(bufferToBigInt(block),IP,64);let left=(initial>>32n)&0xFFFFFFFFn;let right=initial&0xFFFFFFFFn;const rounds=[];for(let index=0;index<16;index++){const nextLeft=right;const nextRight=left^feistel(right,keys[index]);left=nextLeft;right=nextRight;rounds.push({round:index+1,left:hex(left,8),right:hex(right,8),subkey:hex(keys[index],12)});}return{buffer:bigIntToBuffer(permute((right<<32n)|left,FP,64)),rounds};}
export function desBlockHex(inputHex,keyHex,action='encrypt'){return desBlock(parseHex(inputHex,8,'block'),parseHex(keyHex,8,'DES key'),action==='decrypt').buffer.toString('hex').toUpperCase();}

function tripleBlock(block,keys,decrypt=false){const operations=decrypt?[[keys[2],true],[keys[1],false],[keys[0],true]]:[[keys[0],false],[keys[1],true],[keys[2],false]];let current=block;const stages=[];for(const[key,inverse]of operations){const result=desBlock(current,key,inverse);current=result.buffer;stages.push({action:inverse?'decrypt':'encrypt',output:current.toString('hex').toUpperCase(),rounds:result.rounds});}return{buffer:current,stages};}
export function tripleDesBlockHex(inputHex,keyHex,action='encrypt'){const key=parseHex(keyHex,24,'3DES key');return tripleBlock(parseHex(inputHex,8,'block'),[key.subarray(0,8),key.subarray(8,16),key.subarray(16,24)],action==='decrypt').buffer.toString('hex').toUpperCase();}

function pad(input){const count=8-(input.length%8);return Buffer.concat([input,Buffer.alloc(count,count)]);}
function unpad(input){const count=input.at(-1);if(!count||count>8||input.length<count||!input.subarray(-count).every((byte)=>byte===count))fail('INVALID_PADDING','Decrypted data has invalid PKCS#7 padding. Check the key, IV, and ciphertext.');return input.subarray(0,-count);}
function stage(id,title,received,operation,produced,explanation,details=explanation){return{id,title,received,operation,produced,explanation,summary:produced,details};}

export function createDesJourney(input,{algorithm='DES',action='encrypt',keyHex,ivHex}={}){
  const triple=String(algorithm).toUpperCase()==='3DES';const label=triple?'3DES':'DES';if(!['encrypt','decrypt'].includes(action))fail('INVALID_ACTION','Action must be encrypt or decrypt.');
  const defaults=triple?DEFAULT_3DES_SETTINGS:DEFAULT_DES_SETTINGS;const key=parseHex(keyHex??defaults.keyHex,triple?24:8,`${label} key`);const iv=parseHex(ivHex??defaults.ivHex,8,'IV');
  let source;if(action==='encrypt')source=pad(Buffer.from(String(input??''),'utf8'));else{const normalized=String(input??'').replace(/\s+/g,'');if(!normalized||normalized.length%16!==0||!/^[0-9a-fA-F]+$/.test(normalized))fail('INVALID_CIPHERTEXT','Ciphertext must be hexadecimal and contain complete 8-byte blocks.');source=Buffer.from(normalized,'hex');}
  const keys=triple?[key.subarray(0,8),key.subarray(8,16),key.subarray(16,24)]:[key];const blocks=[];let previous=iv;
  for(let offset=0;offset<source.length;offset+=8){const block=source.subarray(offset,offset+8);if(action==='encrypt'){const chained=xorBuffers(block,previous);const transformed=triple?tripleBlock(chained,keys):desBlock(chained,keys[0]);blocks.push({input:block.toString('hex').toUpperCase(),chained:chained.toString('hex').toUpperCase(),output:transformed.buffer.toString('hex').toUpperCase(),trace:transformed.rounds??transformed.stages});previous=transformed.buffer;}else{const transformed=triple?tripleBlock(block,keys,true):desBlock(block,keys[0],true);const plain=xorBuffers(transformed.buffer,previous);blocks.push({input:block.toString('hex').toUpperCase(),transformed:transformed.buffer.toString('hex').toUpperCase(),output:plain.toString('hex').toUpperCase(),trace:transformed.rounds??transformed.stages});previous=block;}}
  const joined=Buffer.concat(blocks.map((block)=>Buffer.from(block.output,'hex')));const resultBuffer=action==='decrypt'?unpad(joined):joined;const output=action==='encrypt'?resultBuffer.toString('hex').toUpperCase():resultBuffer.toString('utf8');const firstTrace=blocks[0]?.trace??[];
  const roundDetails=triple?firstTrace.map((entry,index)=>`Stage ${index+1} ${entry.action.toUpperCase()} -> ${entry.output}`).join('\n'):firstTrace.map((entry)=>`R${String(entry.round).padStart(2,'0')} L=${entry.left} R=${entry.right} K=${entry.subkey}`).join('\n');
  return{meta:{algorithm:label,action,mode:'CBC',padding:'PKCS#7',warning:`${label} is obsolete and included only for education. Do not protect real secrets with it.`},output,rawOutput:output,result:{value:output,encoding:action==='encrypt'?'hex':'utf8'},stages:[
    stage('input','Input',String(input??''),action==='encrypt'?'Encode UTF-8 text':'Decode hexadecimal ciphertext',`${source.length} byte(s)`,'The operation starts from bytes.'),
    stage('padding',action==='encrypt'?'PKCS#7 padding':'Ciphertext blocks',`${source.length} byte(s)`,action==='encrypt'?'Pad to an 8-byte boundary':'Validate complete 64-bit blocks',`${source.length/8} block(s)`,`${label} processes 64-bit blocks.`),
    stage('cbc','CBC chaining',`IV ${(ivHex??defaults.ivHex).toUpperCase()}`,action==='encrypt'?'XOR plaintext with IV/previous ciphertext':'Decrypt then XOR IV/previous ciphertext',blocks.map((block)=>block.output).join(' '),'CBC makes each block depend on the previous block.'),
    stage('rounds',triple?'EDE stages':'16 Feistel rounds',blocks[0]?.chained??blocks[0]?.input??'',triple?(action==='encrypt'?'Encrypt -> Decrypt -> Encrypt':'Decrypt -> Encrypt -> Decrypt'):'Apply initial permutation, 16 Feistel rounds, and final permutation',blocks[0]?.output??'',triple?'3DES composes three DES operations with independent keys.':'Each displayed L/R value is taken from the real first-block computation.',roundDetails),
    stage('output',action==='encrypt'?'Ciphertext':'Plaintext',`${blocks.length} processed block(s)`,action==='encrypt'?'Encode ciphertext as hexadecimal':'Validate and remove PKCS#7 padding',output,action==='encrypt'?'Hexadecimal is safe to copy through a terminal.':'The recovered bytes are decoded as UTF-8.'),
  ]};
}
