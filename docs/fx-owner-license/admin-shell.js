const body=document.body;
const toggle=document.querySelector('.admin-menu-toggle');
const sidebar=document.getElementById('adminSidebar');
function closeMenu(){body.classList.remove('admin-menu-open');toggle?.setAttribute('aria-expanded','false')}
toggle?.addEventListener('click',()=>{const open=!body.classList.contains('admin-menu-open');body.classList.toggle('admin-menu-open',open);toggle.setAttribute('aria-expanded',String(open))});
sidebar?.addEventListener('click',event=>{if(event.target.closest('a')&&matchMedia('(max-width:820px)').matches)closeMenu()});
addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
addEventListener('resize',()=>{if(innerWidth>820)closeMenu()},{passive:true});
