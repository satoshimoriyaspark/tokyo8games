// 役割と既存ファイル名を分離。RC03の造形・ファイル名は変更しない。
// surprisedは受領したRC04。未設定時のみneutralへフォールバック。
window.EMAMON_EXPRESSIONS={
 haru:{neutral:'haru_relieved_RC02.png',regret:'haru_thinking_RC03.png',relieved:'haru_relieved_RC02.png',surprised:'haru_surprised_RC04.png',celebrate:'haru_yosha_RC05.png'},
 sora:{neutral:'sora_relieved_RC02.png',regret:'sora_thinking_RC03.png',relieved:'sora_relieved_RC02.png',surprised:'sora_surprised_RC04.png',celebrate:'sora_yosha_RC05.png'}
};

// TOP専用背景の受領待ち。ファイル名を設定して差し替える。
window.EMAMON_TITLE_BACKGROUND='top_background_RC01.png';

// Shared across all four expressions. Facial contour (excluding hair/ears), supplied anchors.
window.EMAMON_FACE_ANCHORS={haru:{size:[1254,1254],faceBBox:[392,414,820,825],eye:[612,649]},sora:{size:[1024,1536],faceBBox:[463,314,739,577],eye:[600,448]}};
