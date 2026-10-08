/**
 * EMAGUILD pure rules core — no card art or guessed effects.
 * Card object: {id,kind,power?} kind = gear|action|guardian|happening.
 * All card identities must be loaded from the approved card database.
 */
export const POWERS = Object.freeze(['しる','そなえる','みをまもる','にげる','たすけあう']);
export const MAX_HAND = 5;
export function assertDeck(cards) {
  const groups = {gear:24,action:8,guardian:10,happening:8,monster:4};
  const ids = new Set();
  for(const c of cards) {
    if(!c || !c.id || !Object.hasOwn(groups,c.kind)) throw new Error('Invalid card data');
    if(ids.has(c.id)) throw new Error('Duplicate card ID '+c.id);
    ids.add(c.id);
    if(c.kind==='gear' && !POWERS.includes(c.power)) throw new Error('Unknown gear power: '+c.id);
  }
  for(const [kind,expected] of Object.entries(groups))
    if(cards.filter(c=>c.kind===kind).length!==expected) throw new Error(kind+' card count must be '+expected);
  return true;
}
export function initialHands(deck,playerCount) {
  if(!Number.isInteger(playerCount)||playerCount<1||playerCount>4) throw new Error('1-4 players');
  if(deck.some(c=>!['gear','action'].includes(c.kind))) throw new Error('Only gear/action for initial deal');
  if(deck.length<3*playerCount) throw new Error('Insufficient initial cards');
  const hands=Array.from({length:playerCount},()=>[]);
  const remaining=[...deck];for(let i=0;i<3;i++)for(const hand of hands) hand.push(remaining.shift());
  return {hands,remaining};
}
export function makeState(playerCount,monsterIds) {
  if(!Number.isInteger(playerCount)||playerCount<1||playerCount>4)throw new Error('1-4 players');
  if(!Array.isArray(monsterIds)||monsterIds.length!==4||new Set(monsterIds).size!==4)throw new Error('Need four unique monsters');
  return {players:Array.from({length:playerCount},()=>({hand:[],guardian:null,guardianUsed:false})),turn:0,roundTurns:0,danger:1,monsterIndex:0,monsterIds:[...monsterIds],slots:{},discard:[],status:'playing'};
}
export function placeGear(state,card) {
  if(state.status!=='playing')throw new Error('Not in play');
  if(card.kind!=='gear'||!POWERS.includes(card.power))throw new Error('Invalid gear');
  if(state.slots[card.power])throw new Error('Slot occupied');
  return {...state,slots:{...state.slots,[card.power]:card}};
}
export function endTurn(state,{preventDanger=false}={}) {
  if(state.status!=='playing') return state;
  const turns=state.roundTurns+1,completed=turns===state.players.length;
  const danger=state.danger+(completed&&!preventDanger?1:0);
  return {...state,turn:(state.turn+1)%state.players.length,roundTurns:completed?0:turns,danger,status:danger>=7?'lost':'playing'};
}
export function seal(state) {
  if(!POWERS.every(p=>state.slots[p]))throw new Error('Five powers required');
  const discarded=POWERS.map(p=>state.slots[p]),completed=state.monsterIndex===3;
  return {...state,monsterIndex:completed?3:state.monsterIndex+1,slots:{},discard:[...state.discard,...discarded],danger:completed?state.danger:1,roundTurns:0,status:completed?'won':'playing',needsCarryover:!completed};
}
export function limitHand(hand,discardedIds) {
  const drops=new Set(discardedIds);
  if(drops.size!==discardedIds.length)throw new Error('Duplicate discards');
  if(hand.filter(c=>drops.has(c.id)).length!==drops.size)throw new Error('Cannot discard absent cards');
  const kept=hand.filter(c=>!drops.has(c.id));
  if(kept.length>MAX_HAND)throw new Error('Hand still exceeds five');
  return {hand:kept,discard:hand.filter(c=>drops.has(c.id))};
}
