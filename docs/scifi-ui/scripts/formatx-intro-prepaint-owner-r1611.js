(() => {
  'use strict';
  const root=document.documentElement;
  const params=new URLSearchParams(location.search);
  const force=params.get('intro')==='1'||params.get('visualintro')==='1';
  let seen=false;
  try{seen=sessionStorage.getItem('formatx:mag-birth-live-r533-seen')==='1';}catch(_){}
  const show=force||!seen;
  root.dataset.fxIntroPrepaintR1611=show?'show':'skip';
  root.dataset.fxIntroPrepaintOwnerR1611=show
    ? (force?'forced-intro':'first-real-visit')
    : 'session-skip';
})();
