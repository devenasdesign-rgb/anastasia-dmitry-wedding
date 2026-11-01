(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('animate' in Element.prototype) || !('IntersectionObserver' in window)) return;
  const hero = document.querySelector('.couple-scene');
  const dinner = document.querySelector('.dinner-scene');
  if (!hero || !dinner) return;
  const animations = [];
  function add(element, frames, scene) {
    const animation = element.animate(frames, {duration: 1000, fill: 'both', easing: 'ease-in-out'});
    animation.pause();
    animations.push({animation, scene});
  }
  add(hero.querySelector('.couple-bride'), [
    {transform:'rotate(0deg) translateX(0)'},
    {transform:'rotate(4deg) translateX(1%)',offset:.6},
    {transform:'rotate(3.2deg) translateX(.8%)'}
  ], hero);
  add(hero.querySelector('.couple-groom'), [
    {transform:'rotate(0deg) translateX(0)'},
    {transform:'rotate(-4deg) translateX(-1%)',offset:.6},
    {transform:'rotate(-3.2deg) translateX(-.8%)'}
  ], hero);
  for(const [index, heart] of [...hero.querySelectorAll('.scene-heart')].entries()) {
    add(heart,[{opacity:0,transform:'translateY(10px) scale(.6)',offset:0},
      {opacity:0,transform:'translateY(0) scale(.8)',offset:.25+index*.1},
      {opacity:.8,transform:'translateY(-15px) scale(1)',offset:.7},
      {opacity:0,transform:'translateY(-40px) scale(1.1)'}],hero);
  }
  add(dinner.querySelector('.toast-couple'), [{transform:'rotate(-.4deg) translateY(1px)'},{transform:'rotate(.8deg) translateY(-3px)',offset:.55},{transform:'rotate(0deg) translateY(0)'}],dinner);
  add(dinner.querySelector('.toast-left'), [{transform:'rotate(-.3deg)'},{transform:'rotate(.7deg)',offset:.55},{transform:'rotate(0deg)'}],dinner);
  add(dinner.querySelector('.toast-right'), [{transform:'rotate(.3deg)'},{transform:'rotate(-.7deg)',offset:.55},{transform:'rotate(0deg)'}],dinner);
  const active = new Set();
  const visibility = new IntersectionObserver(entries => {
    for(const entry of entries) {
      entry.target.classList.toggle('scene-in-view',entry.isIntersecting);
      if(entry.isIntersecting) active.add(entry.target); else active.delete(entry.target);
    }
    update();
  });
  for(const scene of [hero,dinner]) {
    const image = scene.querySelector('.scene-fallback');
    const ready=()=>{if(image.naturalWidth)scene.classList.add('scene-ready');};
    if(image.complete)ready();else image.addEventListener('load',ready,{once:true});
    visibility.observe(scene);
  }
  let queued = false;
  function update() {
    queued = false;
    if(document.documentElement.classList.contains('letter-loading') || reduced.matches) return;
    const positions=new Map();
    for(const scene of active) {
      const bounds=scene.getBoundingClientRect();
      const progress=scene===hero ? Math.min(1,Math.max(0,window.scrollY/(document.querySelector('.hero').offsetHeight*.55))) : Math.min(1,Math.max(0,(window.innerHeight*.85-bounds.top)/(window.innerHeight*.75+bounds.height*.4)));
      positions.set(scene,progress);
    }
    for(const item of animations)if(positions.has(item.scene))item.animation.currentTime=positions.get(item.scene)*1000;
  }
  function requestUpdate(){if(!queued){queued=true;requestAnimationFrame(update);}}
  window.addEventListener('scroll',requestUpdate,{passive:true});
  window.addEventListener('resize',requestUpdate,{passive:true});
  const opening=new MutationObserver(requestUpdate);
  opening.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  reduced.addEventListener('change',()=>{
    if(reduced.matches){animations.forEach(({animation})=>animation.cancel());[hero,dinner].forEach(s=>s.classList.remove('scene-ready'));}
  });
})();
