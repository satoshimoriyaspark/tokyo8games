// Code-native pixel artwork; reproduce the transparent 16px, four-frame glint sheet.
const {createCanvas}=require('@napi-rs/canvas');
const fs=require('node:fs'),path=require('node:path');
const canvas=createCanvas(64,16),g=canvas.getContext('2d');
const inset=[5,3,2,1,1,0,0,0,0,0,0,1,1,2,3,5];
for(let f=0;f<4;f++){
 const px=(x,y,c)=>{g.fillStyle=c;g.fillRect(f*16+x,y,1,1)};
 for(let y=0;y<16;y++)for(let x=inset[y];x<16-inset[y];x++){
  const edge=x===inset[y]||x===15-inset[y]||y===0||y===15;
  const bevel=x<=inset[y]+2||x>=13-inset[y]||y<3||y>12;
  px(x,y,edge?'#69421e':bevel?(x+y<16?'#fff0a2':'#ba7424'):(y<8?'#ffe576':'#f6bf40'));
 }
 // Inset question mark, deliberately stationary through every glint frame.
 const mark=['.###.','##.##','...##','..##.','..#..','.....','..#..'];
 for(let y=0;y<7;y++)for(let x=0;x<5;x++)if(mark[y][x]==='#')px(5+x,4+y,'#633918');
 if(f>0){const points=[[],[[3,4],[4,3],[5,2]],[[6,1],[7,1],[8,1],[9,1]],[[11,2],[12,3],[13,4]]][f];for(const [x,y] of points)px(x,y,'#fffbed')}
}
fs.writeFileSync(path.join(__dirname,'../assets/hatena-chip.png'),canvas.toBuffer('image/png'));
