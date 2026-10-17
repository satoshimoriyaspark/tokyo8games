/* Vector props: shared outline, clear silhouettes, no character redesign. */
const PROP_ART={
coat:'<path d="M21 17l11 7 11-7 12 13-9 8-4-7v25H22V31l-4 7-9-8Z" fill="#65b8df"/><path d="M32 24v32M22 42h8m5 0h7"/>',
raincoat:'<path d="M21 22q-2-18 11-18t11 18l13 16-9 6-5-9 3 23H19l3-23-5 9-9-6Z" fill="#ffe36a"/><path d="M23 21q9-8 18 0M32 24v34"/>',
sheet:'<path d="M12 12h33l8 10v31H12Z" fill="#c7dce8"/><path d="M45 12v11h8M18 20l23 25M19 34l12 13M31 19l15 15" stroke="#7c9caf"/>',
glove:'<path d="M17 33V17q0-7 6-3V9q4-6 8 0v3q6-5 9 1v6q7-4 8 3v17q0 17-18 17H18l-8-20q-2-7 4-7Z" fill="#eeac77"/>',
towel:'<path d="M12 13h34v40H12Z" fill="#fff"/><path d="M18 13h34v34H18Z" fill="#6fd3dd"/><path d="M23 19v22m6-22v22M12 47h34" stroke="#2e8498"/>',
bag:'<path d="M13 13h38v43H13Z" fill="#75cdb4"/><path d="M13 22h38M20 16h24"/><path d="M26 36l6-8 6 8q3 8-6 10-9-2-6-10Z" fill="#eafff8"/>',
ball:'<circle cx="32" cy="32" r="23" fill="white"/><path d="M32 21l11 8-4 13H25l-4-13Z" fill="#15364c"/><path d="M32 21V9m11 20 11-6M39 42l7 9M25 42l-8 9M21 29 9 23"/>',
vase:'<path d="M24 8h16l-2 15q18 28 3 33H23Q8 51 26 23Z" fill="#df9ab8"/><path d="M19 43h26M23 48h18M24 13h16"/>',
umbrella:'<path d="M7 29q25-40 50 0-8-7-17 0-8-7-16 0-9-7-17 0Z" fill="#efba51"/><path d="M32 8v43q0 10 10 4" fill="none"/>',
book:'<path d="M13 10h38v45H13q-7-3 0-9Z" fill="#e88d94"/><path d="M13 46h38M19 10v35M26 21h17m-17 8h12"/>',
glass:'<path d="M12 42l13-24 7 24Zm22 9 9-19 12 16ZM39 9l9 15-13 2Z" fill="#a9def1"/><path d="M7 54h49" stroke="#db775c"/>',
water:'<path d="M9 40q8-9 15-3 12-14 22-1 15 2 8 12-28 12-45 0Z" fill="#57c7e9"/><path d="M26 20l6-12 6 12q1 10-6 10t-6-10Z" fill="#a1e9fa"/>',
wire:'<path d="M7 44h13q16 0 16-11T21 22q-8 7 8 8h16" fill="none" stroke-width="5"/><rect x="43" y="22" width="12" height="16" rx="3" fill="#ffe36a"/><path d="M47 22v-8m5 8v-8"/>',
building:'<path d="M10 55V15h27v40m0-30h17v30Z" fill="#a8c5da"/><path d="M16 23h5m6 0h5m-16 9h5m6 0h5m-16 9h5m6 0h5m16-8h5m-5 9h5" stroke="#fff"/><path d="M22 55V46h8v9"/>',
barrier:'<path d="M15 49V22m34 27V22" stroke-width="5"/><rect x="7" y="22" width="50" height="17" rx="3" fill="#ffe36a"/><path d="m11 37 12-13m3 13 12-13m3 13 12-13" stroke-width="5"/>',
flag:'<path d="M18 56V8" stroke-width="4"/><path d="M20 10h33l-9 10 9 10H20Z" fill="#f08084"/><ellipse cx="20" cy="56" rx="12" ry="4" fill="#bed7e3"/>',
checkpoint:'<path d="M12 22q-2 30 30 30Z" fill="#00bedf"/><path d="m25 38 15-15m-12 29-5 8m17-8 4 8M37 8q19 0 19 19M38 15q11 0 11 11" fill="none"/><circle cx="40" cy="23" r="4" fill="#ffe36a"/>',
key:'<circle cx="23" cy="22" r="12" fill="#ffe36a"/><path d="m31 31 19 19m-8-8 6-6m-1 11 6-6" stroke="#b18423" stroke-width="7"/>',
pawn:'<ellipse cx="32" cy="54" rx="18" ry="5" fill="#bfd5de"/><path d="M20 49l5-20h14l5 20Z" fill="#00bedf"/><circle cx="32" cy="19" r="10" fill="#ffe36a"/>',
trail:'<circle cx="32" cy="32" r="7" fill="#32a5b6" stroke="none"/>'
};
const PROP_NAMES={'上着':'coat','厚い上着':'coat','防寒シート':'sheet','保温シート':'sheet','手袋':'glove','レインコート':'raincoat','雨具':'raincoat','タオル':'towel','防水袋':'bag','ボール':'ball','花びん':'vase','大型かさ':'umbrella','本':'book'};
function propArt(kind){return `<svg class="propArt" viewBox="0 0 64 64" aria-hidden="true"><g stroke="#15364c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="miter"><defs><filter id="propDepth"><feDropShadow dx="1" dy="2" stdDeviation="0" flood-color="#102344" flood-opacity=".22"/></filter></defs><g filter="url(#propDepth)">${PROP_ART[kind]||''}</g></g></svg>`}
// Pixel bounds follow the artwork, which is not a uniform 3-by-2 grid.
// A nested SVG clips the exact crop, including the outer viewport’s letterbox space.
// preserveAspectRatio keeps each item undistorted at every card/slot size.
const GUILD_PROPS={
 coat:[416,20,402,422],raincoat:[820,8,364,451],sheet:[10,452,398,321],
 glove:[408,441,377,333],towel:[785,461,405,317],
 bag:[78,13,308,378,2],ball:[439,46,320,319,2],vase:[841,15,292,376,2],
 umbrella:[24,394,379,365,2],book:[409,406,374,342,2]
};
function itemArt(name,fallback=''){const k=PROP_NAMES[name],p=GUILD_PROPS[k];return p?`<svg class="guildProp" viewBox="0 0 ${p[2]} ${p[3]}" width="72" height="72" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><svg viewBox="${p.slice(0,4).join(' ')}" width="${p[2]}" height="${p[3]}" overflow="hidden"><image href="assets/${p[4]===2?'guild-props-extra':'guild-props'}.webp" x="0" y="0" width="1200" height="800"/></svg></svg>`:k?propArt(k):fallback}

function mapArt(glyph){return propArt({'🧍':'pawn','📡':'checkpoint','🗝️':'key','🚩':'flag','🚧':'barrier','🏠':'building','💧':'water','🔌':'wire','🔺':'glass','●':'trail'}[glyph]||'')}

// These presentation keys are optional card data. Custom physical cards stay neutral.
// Art never depends on the answer, remembered objects, weather, or secret clues.
function missionCardArt(card,mission){
 const allowed=['room','supplies','floor','town','guardian'];
 const key=allowed.includes(card.illustration)?card.illustration:'guardian';
 // Decorative guardian backgrounds are shared; actual challenge scenes stay in their game components.
 const props=key==='supplies'?['上着','レインコート','タオル','防水袋','ボール','本'].map(name=>`<span>${itemArt(name)}</span>`).join(''):key==='floor'?['glass','water','wire'].map(kind=>`<span>${propArt(kind)}</span>`).join(''):'';
 return `<div class="missionArt missionArt-${key} guardianStage" aria-hidden="true" style="--mission-color:${mission.color}"><span class="missionArtHalo"></span><div class="missionArtProps">${props}</div><img class="missionArtGuardian" src="assets/${mission.art}.webp" alt=""><img class="missionArtBadge" src="assets/${mission.symbol}.webp" alt=""></div>`;
}
function missionCardBack(mission){return `<span class="cardBackBorder"><span class="cardBackLabel">LEADERS MISSION</span><span class="cardBackEmblem"><img src="assets/${mission.symbol}.webp" alt=""></span><span class="cardBackTitle">MISSION<br>CARD</span><span class="cardBackStars" aria-hidden="true">✦ · ✦ · ✦</span></span>`;}
