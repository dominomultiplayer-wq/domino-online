import {auth,db,configured,signInAnonymously,onAuthStateChanged} from "./firebase.js";
import {createRoom,joinRoom,watchRoom,startGame,playTile,drawTile,passTurn,leaveRoom} from "./rooms.js";
import {canPlace} from "./domino.js";

const $=id=>document.getElementById(id);
let user=null,code=null,room=null,unsubscribe=null;
const say=(id,msg)=>$(id).textContent=msg;
const nickname=()=>($("nickname").value.trim().slice(0,18)||"Jugador");
function showGame(show){$("lobby").classList.toggle("hidden",show);$("game").classList.toggle("hidden",!show);}
function tileNode(tile,clickable=false,onClick=null){
  const b=document.createElement(clickable?"button":"div");
  b.className=clickable?"tile-button":"tile";
  const tileEl=document.createElement("div");tileEl.className="tile";
  for(const n of tile){const s=document.createElement("span");s.textContent=n;tileEl.append(s);}
  if(clickable){b.type="button";b.append(tileEl);b.onclick=onClick;}else b.append(tileEl);
  return b;
}
function render(){
  if(!room)return;
  $("roomLabel").textContent=code;
  const players=Object.values(room.players||{});
  $("players").replaceChildren();
  players.forEach(p=>{
    const card=document.createElement("div");card.className="player"+(room.turn===p.uid?" active":"");
    const name=document.createElement("strong");name.textContent=p.name+(p.uid===user.uid?" (tú)":"");
    const count=document.createElement("small");count.textContent=`${room.hands?.[p.uid]?.length??"—"} fichas`;
    card.append(name,count);$("players").append(card);
  });
  $("chain").replaceChildren();
  (room.board||[]).forEach(t=>$("chain").append(tileNode(t)));
  const hand=room.hands?.[user.uid]||[];
  $("hand").replaceChildren();
  hand.forEach((t,i)=>{
    const allowed=room.status==="playing"&&room.turn===user.uid&&canPlace(t,room.board||[]);
    $("hand").append(tileNode(t,allowed,async()=>{
      let side="right";
      if((room.board||[]).length){
        const left=(room.board[0][0]===t[0]||room.board[0][0]===t[1]);
        const right=(room.board.at(-1)[1]===t[0]||room.board.at(-1)[1]===t[1]);
        if(left&&right)side=confirm("Aceptar = colocar a la izquierda. Cancelar = derecha.")?"left":"right";
        else if(left&&!right)side="left";
      }
      try{await playTile(db,user,code,i,side);}catch(e){say("gameMessage",e.message);}
    }));
  });
  $("handCount").textContent=`${hand.length} fichas`;
  $("turnLabel").textContent=room.status==="playing"?(room.turn===user.uid?"Tu turno":"Turno de otro jugador"):room.status==="finished"?"Partida terminada":"Esperando inicio";
  say("gameMessage",room.message||"Comparte el código para invitar jugadores.");
  $("startGame").disabled=room.status!=="waiting"||players.length<2;
  $("startGame").textContent=players.length<2?"Esperando jugadores…":"Iniciar partida";
  $("drawTile").disabled=room.status!=="playing"||room.turn!==user.uid||!(room.stock||[]).length;
  $("passTurn").disabled=room.status!=="playing"||room.turn!==user.uid||(room.stock||[]).length>0;
}
function listen(codeValue){
  code=codeValue;showGame(true);$("roomLabel").textContent=code;
  if(unsubscribe)unsubscribe();
  unsubscribe=watchRoom(db,code,data=>{
    if(!data){say("gameMessage","La sala ya no existe.");return;}
    room=data;render();
  });
}
async function run(action){try{await action();}catch(e){say("lobbyMessage",e.message||"Ocurrió un error.");}}
$("createRoom").onclick=()=>run(async()=>{const c=await createRoom(db,user,nickname());listen(c);});
$("joinRoom").onclick=()=>run(async()=>{const c=$("roomCode").value.trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(c))throw new Error("Escribe un código válido de 6 caracteres.");await joinRoom(db,user,nickname(),c);listen(c);});
$("startGame").onclick=()=>run(()=>startGame(db,user,code));
$("drawTile").onclick=()=>run(()=>drawTile(db,user,code));
$("passTurn").onclick=()=>run(()=>passTurn(db,user,code));
$("leaveRoom").onclick=()=>run(async()=>{if(code)await leaveRoom(db,user,code);if(unsubscribe)unsubscribe();unsubscribe=null;code=null;room=null;showGame(false);});
$("copyCode").onclick=async()=>{try{await navigator.clipboard.writeText(code);say("gameMessage","Código copiado.");}catch{say("gameMessage",`Comparte este código: ${code}`);}};
if(!configured){
  $("connection").textContent="Falta configurar Firebase";
  say("lobbyMessage","Primero completa js/firebase.js con la configuración de tu proyecto Firebase.");
  ["createRoom","joinRoom"].forEach(id=>$(id).disabled=true);
}else{
  $("connection").textContent="Conectando…";
  signInAnonymously(auth).catch(e=>say("lobbyMessage",`Error de acceso: ${e.message}`));
  onAuthStateChanged(auth, u=>{user=u;$("connection").textContent=u?"Conectado":"Desconectado";});
}
