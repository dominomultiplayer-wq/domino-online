import { ref, get, set, update, onValue, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { createDeck, canPlace, placeTile, pointsInHand } from "./domino.js";

const makeCode=()=>Math.random().toString(36).slice(2,8).toUpperCase();
const roomRef=(db,code)=>ref(db,`rooms/${code}`);

export async function createRoom(db,user,nickname){
  for(let attempt=0;attempt<5;attempt++){
    const code=makeCode(), r=roomRef(db,code);
    const snap=await get(r);
    if(snap.exists()) continue;
    const player={uid:user.uid,name:nickname,joinedAt:Date.now()};
    await set(r,{code,createdAt:serverTimestamp(),status:"waiting",players:{[user.uid]:player},turn:null,board:[],hands:{},stock:[],message:"Esperando jugadores…",winner:null});
    return code;
  }
  throw new Error("No se pudo generar un código. Inténtalo de nuevo.");
}
export async function joinRoom(db,user,nickname,code){
  const r=roomRef(db,code),snap=await get(r);
  if(!snap.exists()) throw new Error("No existe esa sala.");
  const data=snap.val(),players=Object.values(data.players||{});
  if(data.status==="playing") throw new Error("La partida ya comenzó.");
  if(data.players?.[user.uid]) return;
  if(players.length>=4) throw new Error("La sala está llena (4 jugadores).");
  await update(r,{[`players/${user.uid}`]:{uid:user.uid,name:nickname,joinedAt:Date.now()}});
}
export function watchRoom(db,code,callback){
  return onValue(roomRef(db,code),snap=>callback(snap.exists()?snap.val():null));
}
export async function startGame(db,user,code){
  const r=roomRef(db,code);
  await runTransaction(r,current=>{
    if(!current||current.status!=="waiting"||Object.keys(current.players||{}).length<2) return;
    const ids=Object.keys(current.players),deck=createDeck(),hands={};
    ids.forEach(id=>hands[id]=deck.splice(0,7));
    return {...current,status:"playing",board:[],hands,stock:deck,turn:ids[0],message:"Partida iniciada. ¡Suerte!",winner:null,passes:0};
  });
}
export async function playTile(db,user,code,index,side){
  const r=roomRef(db,code);
  const result=await runTransaction(r,current=>{
    if(!current||current.status!=="playing"||current.turn!==user.uid) return;
    const hand=current.hands?.[user.uid];
    if(!hand||!hand[index]) return;
    const tile=hand[index];
    if(!canPlace(tile,current.board||[])) return;
    let board;
    try{board=placeTile(tile,side,current.board||[]);}catch{return;}
    const hands={...current.hands,[user.uid]:hand.filter((_,i)=>i!==index)};
    const ids=Object.keys(current.players),pos=ids.indexOf(user.uid);
    const next=ids[(pos+1)%ids.length];
    const won=hands[user.uid].length===0;
    return {...current,board,hands,turn:won?null:next,status:won?"finished":"playing",winner:won?user.uid:null,message:won?`${current.players[user.uid].name} ganó la partida.`:`Turno de ${current.players[next].name}`,passes:0};
  },{applyLocally:false});
  if(!result.committed) throw new Error("No se pudo jugar: revisa el turno y la ficha.");
}
export async function drawTile(db,user,code){
  const r=roomRef(db,code);
  const result=await runTransaction(r,current=>{
    if(!current||current.status!=="playing"||current.turn!==user.uid||!current.stock?.length) return;
    const stock=[...current.stock],tile=stock.pop();
    const hands={...current.hands,[user.uid]:[...(current.hands[user.uid]||[]),tile]};
    return {...current,stock,hands,message:`${current.players[user.uid].name} robó una ficha.`};
  },{applyLocally:false});
  if(!result.committed) throw new Error("No puedes robar ahora o el pozo está vacío.");
}
export async function passTurn(db,user,code){
  const r=roomRef(db,code);
  const result=await runTransaction(r,current=>{
    if(!current||current.status!=="playing"||current.turn!==user.uid||current.stock?.length) return;
    const ids=Object.keys(current.players),pos=ids.indexOf(user.uid),next=ids[(pos+1)%ids.length];
    const passes=(current.passes||0)+1,blocked=passes>=ids.length;
    const winner=blocked?ids.reduce((best,id)=>pointsInHand(current.hands[id]||[])<pointsInHand(current.hands[best]||[])?id:best,ids[0]):null;
    return {...current,turn:blocked?null:next,passes,status:blocked?"finished":"playing",winner,message:blocked?`Juego cerrado. Gana ${current.players[winner].name} por menos puntos.`:`Turno de ${current.players[next].name}`};
  },{applyLocally:false});
  if(!result.committed) throw new Error("Solo puedes pasar cuando el pozo está vacío.");
}
export async function leaveRoom(db,user,code){
  const r=roomRef(db,code);
  await runTransaction(r,current=>{
    if(!current) return current;
    const players={...current.players};delete players[user.uid];
    if(!Object.keys(players).length) return null;
    return {...current,players};
  });
}
