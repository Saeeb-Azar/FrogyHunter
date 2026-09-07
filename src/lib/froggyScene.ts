import * as THREE from 'three';

export interface FroggySceneOptions { reduceMotion?: boolean; onReady?: () => void; onError?: () => void }

/** Original, fully procedural frog diorama. No downloaded models or textures. */
export function mountFroggyScene(container: HTMLElement, options: FroggySceneOptions = {}) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch { options.onError?.(); return { dispose() {}, celebrate() {} }; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 3.5, 7.8); camera.lookAt(0, 0.9, 0);
  scene.add(new THREE.HemisphereLight(0xfffce3, 0x4b8568, 2.5));
  const key = new THREE.DirectionalLight(0xfff5d8, 3.2); key.position.set(-3, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xa6eaff, 2); rim.position.set(4, 3, -3); scene.add(rim);
  const mats: THREE.Material[] = [];
  const material = (color: number, roughness = 0.48, extra: THREE.MeshStandardMaterialParameters = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, ...extra }); mats.push(m); return m;
  };
  const green = material(0x91cf37), lightGreen = material(0xb6e14f), darkGreen = material(0x477e29);
  const cream = material(0xffedac), black = material(0x12271d, 0.12), white = material(0xffffff, 0.2);
  const pink = material(0xf38d83), water = material(0x55c7b6, 0.18, { metalness: 0.12 });
  const leafMat = material(0x73b748), edgeMat = material(0x378f7c);
  const sphere = new THREE.SphereGeometry(1, 28, 20);
  const mesh = (parent: THREE.Object3D, mat: THREE.Material, position: number[], scale: number[], geo: THREE.BufferGeometry = sphere) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(position[0], position[1], position[2]); m.scale.set(scale[0], scale[1], scale[2]); parent.add(m); return m;
  };
  const world = new THREE.Group(); scene.add(world);
  mesh(world, edgeMat, [0, -0.10, 0], [2.1, 0.15, 1.55]);
  mesh(world, water, [0, 0, 0], [2.02, 0.10, 1.49]);
  const lilyGeo = new THREE.CylinderGeometry(1, 1, 0.045, 48, 1, false, 0.22, Math.PI * 2 - 0.44);
  const lilies: THREE.Mesh[] = [];
  for (const [x, z, size, rotation] of [[0, 0, 1.06, 2.6], [-1.35, 0.6, 0.43, 1.7], [1.3, -0.3, 0.56, -0.8]]) {
    const lily = mesh(world, leafMat, [x, 0.13, z], [size, 1, size * 0.85], lilyGeo); lily.rotation.y = rotation; lilies.push(lily);
  }
  // A tiny water lily adds a warm point of contrast without stealing focus.
  const flower = new THREE.Group(); flower.position.set(1.35, 0.2, -0.28); world.add(flower);
  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7;
    const petal = mesh(flower, cream, [Math.sin(angle) * 0.11, 0.06, Math.cos(angle) * 0.11], [0.075, 0.04, 0.19]); petal.rotation.y = angle; petal.rotation.x = -0.2;
  }
  mesh(flower, material(0xffc745), [0, 0.10, 0], [0.08, 0.05, 0.08]);
  const frog = new THREE.Group(); frog.position.y = 0.20; world.add(frog);
  const body = new THREE.Group(); frog.add(body);
  mesh(body, green, [0, 0.65, 0], [0.77, 0.75, 0.61]);
  mesh(body, cream, [0, 0.60, 0.48], [0.55, 0.56, 0.18]);
  const head = new THREE.Group(); head.position.set(0, 1.23, 0.12); body.add(head);
  mesh(head, green, [0, 0, 0], [0.91, 0.57, 0.66]);
  mesh(head, lightGreen, [0, -0.11, 0.43], [0.72, 0.29, 0.24]);
  const pupils: THREE.Mesh[] = []; const lids: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    mesh(head, green, [side * 0.47, 0.40, 0.08], [0.37, 0.44, 0.34]);
    const eye = mesh(head, black, [side * 0.47, 0.46, 0.34], [0.245, 0.30, 0.155]); pupils.push(eye);
    mesh(eye, white, [-0.29, 0.40, 0.80], [0.24, 0.20, 0.15]);
    mesh(eye, white, [0.27, -0.22, 0.94], [0.10, 0.08, 0.10]);
    const lid = mesh(head, green, [side * 0.47, 0.46, 0.36], [0.26, 0.001, 0.17]); lids.push(lid);
    mesh(head, pink, [side * 0.62, -0.12, 0.57], [0.14, 0.075, 0.025]);
    mesh(head, darkGreen, [side * 0.15, 0.02, 0.656], [0.028, 0.018, 0.012]);
    // Rounded haunches, forelegs and three plump toes on each foot.
    mesh(frog, green, [side * 0.70, 0.29, 0.08], [0.42, 0.34, 0.45]);
    const arm = mesh(body, lightGreen, [side * 0.56, 0.37, 0.51], [0.15, 0.38, 0.16]); arm.rotation.z = side * 0.22;
    mesh(frog, lightGreen, [side * 0.57, 0.09, 0.68], [0.26, 0.10, 0.27]);
    for (let toe = 0; toe < 3; toe++) mesh(frog, lightGreen, [side * 0.57 + (toe - 1) * 0.16, 0.075, 0.86], [0.092, 0.062, 0.16]);
  }
  const smileCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.35,-0.13,0.656),new THREE.Vector3(-0.18,-0.23,0.679),new THREE.Vector3(0,-0.25,0.683),new THREE.Vector3(0.18,-0.23,0.679),new THREE.Vector3(0.35,-0.13,0.656)]);
  mesh(head, darkGreen, [0,0,0], [1,1,1], new THREE.TubeGeometry(smileCurve, 24, 0.018, 6, false));
  const rippleMat = new THREE.MeshBasicMaterial({ color: 0xcefff1, transparent: true, opacity: 0.25, side: THREE.DoubleSide }); mats.push(rippleMat);
  const ripples = [0,1].map(i => { const m = mesh(world, rippleMat, [0,0.115,0], [1,1,1], new THREE.RingGeometry(1.12,1.135,64)); m.rotation.x = -Math.PI / 2; m.userData.offset = i * 0.5; return m; });
  let disposed = false, raf = 0, time = 0, last = 0, celebration = -10, visible = !document.hidden;
  const pointer = new THREE.Vector2();
  const pointerMove = (e: PointerEvent) => { const r = container.getBoundingClientRect(); pointer.set(((e.clientX-r.left)/Math.max(r.width,1)-0.5)*2, ((e.clientY-r.top)/Math.max(r.height,1)-0.5)*2); };
  const pointerLeave = () => pointer.set(0,0);
  const resize = () => { if (disposed) return; const w = Math.max(container.clientWidth, 1), h = Math.max(container.clientHeight, 1); renderer.setSize(w,h,false); camera.aspect = w/h; camera.position.z = camera.aspect < 0.85 ? 9.2 : 7.8; camera.updateProjectionMatrix(); };
  const draw = (stamp: number) => {
    if (disposed || !visible) return;
    const dt = last ? Math.min((stamp-last)/1000,0.05) : 0; last=stamp; time+=dt;
    if (!options.reduceMotion) {
      body.scale.y = 1 + Math.sin(time*2.3)*0.018;
      head.rotation.y += (pointer.x*0.16-head.rotation.y)*Math.min(dt*5,1);
      head.rotation.x += (pointer.y*0.09-head.rotation.x)*Math.min(dt*5,1);
      const blinkPhase = time % 4.7;
      const blink = blinkPhase > 4.48 ? Math.sin((blinkPhase-4.48)/0.22*Math.PI) : 0;
      pupils.forEach(p=>p.scale.y=0.30*Math.max(0.025,1-blink)); lids.forEach(l=>l.scale.y=0.30*blink+0.001);
      const elapsed = time-celebration, periodic = time % 11;
      const hop = elapsed < 1.1 ? Math.abs(Math.sin(elapsed/1.1*Math.PI*2))*0.43*(1-elapsed/1.4) : periodic > 9.8 && periodic < 10.6 ? Math.sin((periodic-9.8)/0.8*Math.PI)*0.25 : 0;
      frog.position.y=0.20+hop; frog.rotation.z=elapsed<1.1?Math.sin(elapsed*15)*0.08:0;
      lilies.forEach((l,i)=>l.rotation.z=Math.sin(time*1.3+i)*0.012);
      ripples.forEach(r=>{const phase=(time*0.24+r.userData.offset)%1;r.scale.setScalar(1+phase*0.60);});
    }
    renderer.render(scene,camera); raf=requestAnimationFrame(draw);
  };
  const visibility = () => { visible=!document.hidden; cancelAnimationFrame(raf); last=0; if(visible&&!disposed) raf=requestAnimationFrame(draw); };
  const lost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf); options.onError?.(); };
  const observer = new ResizeObserver(resize); observer.observe(container);
  container.addEventListener('pointermove',pointerMove); container.addEventListener('pointerleave',pointerLeave);
  document.addEventListener('visibilitychange',visibility); renderer.domElement.addEventListener('webglcontextlost',lost);
  resize(); raf=requestAnimationFrame(draw); options.onReady?.();
  return {
    celebrate() { celebration=time; },
    dispose() { if(disposed)return; disposed=true; cancelAnimationFrame(raf); observer.disconnect(); container.removeEventListener('pointermove',pointerMove); container.removeEventListener('pointerleave',pointerLeave); document.removeEventListener('visibilitychange',visibility); renderer.domElement.removeEventListener('webglcontextlost',lost); const geometries=new Set<THREE.BufferGeometry>(); scene.traverse(o=>{if(o instanceof THREE.Mesh)geometries.add(o.geometry);}); geometries.forEach(g=>g.dispose()); mats.forEach(m=>m.dispose()); renderer.dispose(); renderer.domElement.remove(); }
  };
}
