// Names, roles, traits and ace ratings transcribed from Drive spec v1 (2026-10-11).
const player = (name, role, trait, stats) => ({name, role, trait, stats});
export const TEAMS = [
 {id:'nekketsu',name:'熱血高校',label:'仲間を信じる、赤い闘志。',type:'バランス',color:'#ed525c',dark:'#761f33',sprite:'ryuji',special:'ファイヤーシュート',effect:'fire',players:[
 player('りゅうじ','LB','熱血万能エース',[4,4,4,4,4]),player('まさる','CB','正確なパス',[3,5,3,3,3]),player('たくみ','RB','ミドルシュート',[3,3,5,3,3]),player('しんじ','LW','素早いサイド攻撃',[5,3,3,2,3]),player('だいき','RW','ジャンプ力',[4,3,4,3,3]),player('けんた','PV','当たりの強さ',[2,3,3,5,4]),player('ひろし','GK','安定感',[3,3,2,4,4])]},
 {id:'hayate',name:'疾風高校',label:'一瞬の隙を、駆け抜けろ。',type:'スピード',color:'#51adff',dark:'#17467a',sprite:'hayato',special:'イナズマシュート',effect:'lightning',players:[
 player('はやと','CB','最速ドリブラー',[5,5,3,2,3]),player('しゅん','LB','高速ジャンプシュート',[5,3,4,2,3]),player('かける','RB','速攻',[5,3,3,3,3]),player('そうた','LW','サイド突破',[5,3,3,2,3]),player('ゆうき','RW','パスカット',[4,3,3,2,5]),player('あきら','PV','ポジション取り',[4,4,3,2,4]),player('なおき','GK','反応速度',[5,3,2,2,4])]},
 {id:'gouriki',name:'剛力高校',label:'力で切り拓く、勝利への道。',type:'パワー',color:'#65cf87',dark:'#226142',sprite:'gouta',special:'メガトンシュート',effect:'meteor',players:[
 player('ごうた','LB','怪力エース',[2,2,5,5,4]),player('てつや','CB','力強いパス',[2,4,3,5,3]),player('だいご','RB','ロングシュート',[2,2,5,4,3]),player('たけし','LW','強引な突破',[3,2,4,5,3]),player('まこと','RW','ブロック',[2,2,3,5,5]),player('げんき','PV','巨漢ポスト',[1,3,4,5,4]),player('いわお','GK','鉄壁',[2,2,2,5,5])]},
 {id:'shirasagi',name:'白鷺高校',label:'美しく、鮮やかに、決める。',type:'テクニック',color:'#c5a0ff',dark:'#634184',sprite:'ren',special:'ミラージュシュート',effect:'mirage',players:[
 player('れん','CB','天才司令塔',[4,5,4,2,3]),player('いつき','LB','変化球',[3,4,4,2,3]),player('せいや','RB','精密シュート',[3,4,5,2,3]),player('みなと','LW','フェイント',[4,4,3,2,3]),player('とうま','RW','ノールックパス',[3,5,3,2,4]),player('かずき','PV','スクリーン',[2,4,3,4,4]),player('しおん','GK','コース読み',[3,4,2,2,5])]}
];
export const SHOTS = ['ジャンプ','ステップ','ループ','サイド'];
