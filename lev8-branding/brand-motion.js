(() => {
 const container = document.getElementById('character-animation');
 const toggle = document.getElementById('animation-toggle');
 if (!container || !window.lottie) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let paused = reduced.matches, visible = false, ready = false;
 const animation = lottie.loadAnimation({container, renderer:'svg', loop:true, autoplay:false, path:'../assets/brand/signal-loading.json'});
 const sync = () => { if (!ready) return; visible && !paused && !document.hidden ? animation.play() : animation.pause(); toggle.textContent = paused ? 'Play animation' : 'Pause animation'; };
 animation.addEventListener('DOMLoaded', () => {ready=true;animation.goToAndStop(0,true);toggle.hidden=false;sync();});
 animation.addEventListener('data_failed', () => {container.textContent='Animation unavailable. Please reload to try again.';});
 new IntersectionObserver(entries => {visible=entries[0].isIntersecting;sync();},{threshold:.1}).observe(container);
 toggle.addEventListener('click',()=>{paused=!paused;sync();});
 reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
 document.addEventListener('visibilitychange',sync);
})();
