export function createDeck(){
  const deck=[];
  for(let a=0;a<=6;a++) for(let b=a;b<=6;b++) deck.push([a,b]);
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck;
}
export function canPlace(tile, board){
  if(!board.length) return true;
  const left=board[0][0], right=board[board.length-1][1];
  return tile[0]===left||tile[1]===left||tile[0]===right||tile[1]===right;
}
export function placeTile(tile, side, board){
  const next=board.map(t=>[...t]);
  if(!next.length){next.push([...tile]);return next;}
  const left=next[0][0],right=next[next.length-1][1];
  if(side==="left"){
    if(tile[1]===left) next.unshift([...tile]);
    else if(tile[0]===left) next.unshift([tile[1],tile[0]]);
    else throw new Error("La ficha no encaja en la izquierda.");
  }else{
    if(tile[0]===right) next.push([...tile]);
    else if(tile[1]===right) next.push([tile[1],tile[0]]);
    else throw new Error("La ficha no encaja en la derecha.");
  }
  return next;
}
export function pointsInHand(hand){return hand.reduce((sum,t)=>sum+t[0]+t[1],0);}
