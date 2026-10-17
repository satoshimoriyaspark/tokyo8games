// Event organizers can replace this data or edit the deck from the settings screen.
const CARDS=[
{id:'know-1',attribute:0,type:'select',title:'危険を見ぬけ！',prompt:'地震で倒れたり落ちたりしそうなものを、2つ選ぼう。',options:['固定していない高い本棚','床に置いたクッション','高い棚の上の花びん','壁に貼った紙'],answer:[0,2],hint:'高い所や倒れそうな物を見てみよう。',explain:'倒れる家具や落ちる物から離れることが大切だね。'},
{id:'know-2',attribute:0,type:'memory',title:'防災バッグ・記憶チャレンジ',prompt:'バッグに入っている3つの道具を覚えよう。「覚えた！」で隠れるよ。',options:['水','ライト','携帯トイレ','ゲーム機','花びん','フライパン'],answer:[0,1,2],hint:'飲む・照らす・トイレ。この3つを思い出そう。',explain:'まずは3つを覚えたね。実際の備えは家族に合わせて考えよう。'},
{id:'prepare-1',attribute:1,type:'select',title:'停電セットをそろえろ！',prompt:'停電中、火を使わず足元を照らしたい。必要な組み合わせを2つ選ぼう。',options:['電池式ライト','そのライトに合う電池','ろうそく','花火'],answer:[0,1],hint:'火を使わずに光る道具と、それを動かす物。',explain:'ライトと合う電池。ふだんから点灯するか確かめておこう。'},
{id:'prepare-2',attribute:1,type:'order',title:'ライト点検の作戦！',prompt:'ライトを備える手順を、順番にタップしよう。',options:['ライトと合う電池を用意','明るい場所で大人と点灯を確認','家族が分かる場所にしまう'],answer:[0,1,2],hint:'用意する → 試してみる → しまう。',explain:'しまう場所を家族で共有すると、いざというとき探しやすいね。'},
{id:'protect-1',attribute:2,type:'select',title:'頭を守るアイテム',prompt:'地震のとき、頭を守るために使える物を2つ選ぼう。手の届く所にある想定だよ。',options:['防災ずきん','丈夫なクッション','ガラスのコップ','重い植木鉢'],answer:[0,1],hint:'頭をおおえる物。割れたり、重くて危険な物は選ばない。',explain:'まず安全な場所で頭を守ろう。道具を探して危険な場所へ行かなくていい。'},
{id:'protect-2',attribute:2,type:'order',title:'安全確認の順番',prompt:'揺れがおさまったあと、床に割れた物が見える。行動を並べよう。',options:['その場で足元の危険を確認','近くの大人に知らせる','大人と安全な動き方を確認'],answer:[0,1,2],hint:'まず危険を見つける。1人で片づけなくていいよ。',explain:'割れた物は触らない。はだしで歩かず、大人と安全を確かめよう。'},
{id:'escape-1',attribute:3,type:'select',title:'通れる道はどこ？',prompt:'大人と避難するとき、避けるべき道を2つ選ぼう。',options:['水が流れている道路','崩れかけた塀のそば','大人が安全を確かめた道','通行止めではない安全確認済みの広場'],answer:[0,1],hint:'水の中の深さや足元は分からない。倒れそうな物にも注意。',explain:'近道でも危険な道には入らない。安全な道も状況が変わるので大人と確認しよう。'},
{id:'escape-2',attribute:3,type:'order',title:'迷ったときの作戦',prompt:'避難の途中、先の道が危なそう。どうする？ 順番にタップ。',options:['危険な場所に進まず安全な位置で止まる','一緒にいる大人に伝える','大人と安全な行き方を確認する'],answer:[0,1,2],hint:'進み続けなくてもいい。止まる・伝える・確認する。',explain:'1人で別の道へ行かず、周りの大人と一緒に考えよう。'},
{id:'help-1',attribute:4,type:'select',title:'助け合いのことば',prompt:'避難先で困っている友だちがいる。安全な行動を2つ選ぼう。',options:['「何に困っている？」と聞く','近くの大人に一緒に相談する','1人で外へ薬を探しに行く','困っていても我慢するように言う'],answer:[0,1],hint:'話を聞いて、大人につなごう。危険な救助をこどもが引き受けなくていい。',explain:'聞くこと・伝えることも助け合い。自分の安全を守ることも大切。'},
{id:'help-2',attribute:4,type:'memory',title:'伝言リレー',prompt:'相談するときに伝えたい3つを覚えよう。',options:['どこで','何に困っているか','誰に相談したいか','好きなゲーム','昨日のテレビ','好きな色'],answer:[0,1,2],hint:'場所・困りごと・相談相手。分からないことは無理に答えなくていい。',explain:'言葉で難しいときは、指さしやメモでも伝えられるよ。'},
...[
['real-know',0,'会場の安全探検','進行役と、安全な場所から見える危険を2つ探そう。高い所に上ったり物を動かしたりしません。','危険を2つ挙げた／大人に伝える方法を話した'],
['real-prepare',1,'実物バッグをつくろう','用意された安全な見本道具から3つを選び、必要な理由をチームで話そう。','道具を3つ選んだ／それぞれ理由を話した'],
['real-protect',2,'頭を守る練習','進行役が安全を確認した場所で、腕で頭を守る姿勢を試そう。無理な動きはせず、言葉で説明してもOK。','頭を守る方法を試した、または説明した／危険から離れることを話した'],
['real-escape',3,'ライトで道を照らそう','明るい安全な場所で、ライトを足元に向ける練習。人の目には向けません。暗闇を歩く必要はありません。','人の目に向けなかった／足元を照らす方法を試した'],
['real-help',4,'困ったことを伝えよう','相談する人と聞く人に分かれ、「トイレはどこ？」などの声かけを交代して練習しよう。','役を交代して試した／困ったら大人に相談することを話した']
].map(([id,attribute,title,prompt,criteria])=>({id,attribute,type:'physical',title,prompt,criteria:criteria.split('／'),hint:'危険な実演はしません。体を動かすのが難しいときは、指さしや説明で参加できます。',explain:'やってみたことを、家族や仲間にも伝えてみよう。'}))
];
const defaultDeck=()=>({enabled:CARDS.filter(c=>c.id.startsWith('visual-')).map(c=>c.id),edits:{}});
function cardById(id,config){const c=CARDS.find(c=>c.id===id);return c?{...c,...(config?.edits?.[id]||{})}:null}
function chooseCard(attribute,config,previous,random=Math.random){let pool=CARDS.filter(c=>c.attribute===attribute&&config.enabled.includes(c.id));if(pool.length>1)pool=pool.filter(c=>c.id!==previous);return pool.length?pool[Math.floor(random()*pool.length)].id:null}
function answerCorrect(card,answers){if(card.type==='physical')return card.criteria.every((_,i)=>answers.includes(i));if(card.type==='order')return JSON.stringify(answers)===JSON.stringify(card.answer);return answers.length===card.answer.length&&card.answer.every(i=>answers.includes(i))}
if(typeof module!=='undefined')module.exports={CARDS,defaultDeck,cardById,chooseCard,answerCorrect};
