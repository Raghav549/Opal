import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import './styles.css';

type Gem = {
  id: string;
  name: string;
  family: string;
  color: string;
  accent: string;
  shape: 'diamond' | 'emerald' | 'oval' | 'cushion';
  intro: string;
};

const gems: Gem[] = [
  { id: 'diamond', name: 'Diamond', family: 'Pure white', color: '#e7eef3', accent: '#afc9d9', shape: 'diamond', intro: 'Bright, clear and almost weightless beneath the light.' },
  { id: 'sapphire', name: 'Blue Sapphire', family: 'Ceylon blue', color: '#506cae', accent: '#a6bbec', shape: 'oval', intro: 'A deep blue surface with a cool, glass-like depth.' },
  { id: 'emerald', name: 'Emerald', family: 'Colombian green', color: '#63a37c', accent: '#b5dcc2', shape: 'emerald', intro: 'Quiet mineral green, built around clean geometry.' },
  { id: 'ruby', name: 'Ruby', family: 'Crimson red', color: '#b85d68', accent: '#efadb5', shape: 'cushion', intro: 'A concentrated red that catches the light slowly.' },
  { id: 'tanzanite', name: 'Tanzanite', family: 'Violet blue', color: '#7477bf', accent: '#c2c6fa', shape: 'diamond', intro: 'A shifting violet-blue study with a nocturnal character.' },
];

function StoneScene({ gem }: { gem: Gem }) {
  const mount = useRef<HTMLDivElement | null>(null);
  const pointer = useRef({ x: 0.18, y: 0.08 });
  const rotation = useRef({ x: 0.18, y: 0.08 });

  useEffect(() => {
    const node = mount.current;
    if (!node) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 100);
    camera.position.set(0, 0.1, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    node.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 1.75));

    const key = new THREE.DirectionalLight(new THREE.Color(gem.accent), 5.4);
    key.position.set(2.5, 3.8, 4.7);
    scene.add(key);

    const edge = new THREE.PointLight(0xffffff, 12, 12);
    edge.position.set(-3, 1.2, 3.4);
    scene.add(edge);

    const material = new THREE.MeshPhysicalMaterial({
      color: gem.color,
      roughness: 0.035,
      clearcoat: 1,
      clearcoatRoughness: 0.025,
      transmission: gem.id === 'diamond' ? 0.94 : 0.5,
      thickness: 0.75,
      ior: gem.id === 'diamond' ? 2.1 : 1.6,
      transparent: true,
      opacity: 0.98,
    });

    let geometry: THREE.BufferGeometry;
    if (gem.shape === 'diamond') geometry = new THREE.OctahedronGeometry(1.08, 2);
    else if (gem.shape === 'emerald') geometry = new THREE.BoxGeometry(1.55, 1.12, 1.0, 2, 2, 2);
    else if (gem.shape === 'cushion') geometry = new THREE.IcosahedronGeometry(1.13, 2);
    else geometry = new THREE.SphereGeometry(1.12, 32, 20);

    const stone = new THREE.Mesh(geometry, material);
    if (gem.shape === 'emerald') stone.rotation.z = 0.08;
    stone.scale.set(1, 1.12, 0.9);
    group.add(stone);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(1.52, 1.54, 128),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(gem.accent), transparent: true, opacity: 0.16, side: THREE.DoubleSide }),
    );
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i += 1) {
      const r = 1.9 + Math.random() * 1.4;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
      positions[i * 3 + 2] = Math.sin(a) * r;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particles = new THREE.Points(
      particlesGeo,
      new THREE.PointsMaterial({ color: new THREE.Color(gem.accent), size: 0.018, transparent: true, opacity: 0.44, depthWrite: false }),
    );
    group.add(particles);

    const resize = () => {
      const width = node.clientWidth || 1;
      const height = node.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      pointer.current.y = ((event.clientX - rect.left) / rect.width - 0.5) * 0.64;
      pointer.current.x = 0.14 + ((event.clientY - rect.top) / rect.height - 0.5) * 0.22;
    };

    const onLeave = () => {
      pointer.current.x = 0.14;
      pointer.current.y = 0.18;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(node);
    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    resize();

    let frame = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const t = (now - start) * 0.001;
      rotation.current.x += (pointer.current.x - rotation.current.x) * 0.05;
      rotation.current.y += (pointer.current.y - rotation.current.y) * 0.05;
      group.rotation.x = rotation.current.x + Math.sin(t * 0.7) * 0.028;
      group.rotation.y = rotation.current.y + t * 0.11;
      group.position.y = Math.sin(t * 0.82) * 0.065;
      halo.rotation.z = t * 0.14;
      particles.rotation.y = t * 0.025;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
      geometry.dispose();
      material.dispose();
      halo.geometry.dispose();
      halo.material.dispose();
      particlesGeo.dispose();
      particles.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [gem]);

  return <div className="stoneScene" ref={mount} aria-label={gem.name + ' animated 3D stone'} />;
}

function App() {
  const [active, setActive] = useState(gems[0]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(
    () => gems.filter((gem) => gem.name.toLowerCase().includes(search.toLowerCase()) || gem.family.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <main className="app">
      <header className="header">
        <a className="brand" href="#top">OPAL<span> / STONES</span></a>
        <nav className="nav">
          <a href="#collection">COLLECTION</a>
          <a href="#atelier">ATELIER</a>
          <a href="#sourcing">SOURCING</a>
        </nav>
        <div className="headerTools">
          <label className="search">
            <span>⌕</span>
            <input aria-label="Search stones" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <button className="outlineSmall" onClick={() => setDrawerOpen(true)}>PRIVATE INQUIRY ↗</button>
        </div>
      </header>

      <section id="top" className="hero">
        <div className="heroCopy">
          <p className="eyebrow">LOOSE STONES · DIAMONDS · GEMSTONES</p>
          <h1>Measured<br /><i>purity.</i></h1>
          <p className="heroSub">A digital atelier where exceptional stones are shown as material first — their cut, color, surface and light left completely unobstructed.</p>
          <div className="heroBottom">
            <a className="blackButton" href="#collection">DISCOVER THE COLLECTION <span>↘</span></a>
            <span className="pageNo">01 / 05</span>
          </div>
          <div className="microMeta">
            <span>NO SETTINGS</span><span>NO JEWELRY</span><span>ONLY STONE</span>
          </div>
        </div>
        <div className="heroVisual">
          <div className="visualNote">SPECIMEN / 03D</div>
          <StoneScene gem={active} />
          <div className="visualInfo">
            <span>{active.family}</span>
            <strong>{active.name}</strong>
            <small>{active.intro}</small>
          </div>
          <div className="orbit orbit1" />
          <div className="orbit orbit2" />
        </div>
      </section>

      <section className="statement"><div>LIGHT / FORM / DEPTH / FIRE /</div><div>LIGHT / FORM / DEPTH / FIRE /</div></section>

      <section id="collection" className="collection">
        <div className="sectionTop">
          <div><p className="eyebrow">THE COLLECTION</p><h2>Pure material,<br /><i>carefully framed.</i></h2></div>
          <p>Tap a stone to bring it into the hero. The collection is intentionally spare so color, geometry and light remain the story.</p>
        </div>
        <div className="cards">
          {filtered.map((gem, index) => (
            <button key={gem.id} className={'card ' + (active.id === gem.id ? 'active' : '')} onClick={() => setActive(gem)}>
              <span className="cardIndex">0{index + 1}</span>
              <div className="cardStone" style={{ '--tone': gem.color, '--accent': gem.accent } as React.CSSProperties}><i /></div>
              <div className="cardText"><small>{gem.family}</small><strong>{gem.name}</strong></div>
              <span className="cardArrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section id="atelier" className="atelier">
        <div className="atelierVisual">
          <p>THE STONE, BEFORE THE OBJECT</p>
          <div className="atelierStone" style={{ '--tone': active.color, '--accent': active.accent } as React.CSSProperties}><i /></div>
          <div className="atelierCross x" /><div className="atelierCross y" />
        </div>
        <div className="atelierCopy">
          <p className="eyebrow">THE ATELIER</p>
          <h2>Nothing between<br /><i>you and the material.</i></h2>
          <p className="copy">The interface stays quiet on purpose. White space, fine lines, restrained color and gentle motion let the stone carry the visual weight.</p>
          <div className="detailRows">
            <div><span>01</span><strong>Loose-stone first</strong><em>no settings / no jewelry</em></div>
            <div><span>02</span><strong>Interactive form</strong><em>Three.js specimen view</em></div>
            <div><span>03</span><strong>Private sourcing</strong><em>availability confirmed separately</em></div>
          </div>
        </div>
      </section>

      <section id="sourcing" className="sourcing">
        <div>
          <p className="eyebrow">PRIVATE SOURCING</p>
          <h2>Searching for<br /><i>a particular stone?</i></h2>
          <p>Tell us the stone family, color, shape, size or other criteria. This is a request interface — no stock, pricing or certification is fabricated.</p>
          <button className="blackButton" onClick={() => setDrawerOpen(true)}>START A PRIVATE INQUIRY <span>↗</span></button>
        </div>
        <div className="sourcingGraphic"><div className="circle c1" /><div className="circle c2" /><div className="circle c3" /><span>{active.name}</span></div>
      </section>

      <footer className="footer">
        <a className="brand" href="#top">OPAL<span> / STONES</span></a>
        <span>LOOSE STONES ONLY · MATERIAL / LIGHT / FORM</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>

      {drawerOpen && (
        <div className="modalBackdrop" role="presentation">
          <form className="modal" onSubmit={(e) => { e.preventDefault(); setDrawerOpen(false); }}>
            <button type="button" className="close" aria-label="Close" onClick={() => setDrawerOpen(false)}>×</button>
            <p className="eyebrow">PRIVATE INQUIRY</p>
            <h3>Find the right<br /><i>material.</i></h3>
            <label>STONE<input value={active.name} readOnly /></label>
            <label>YOUR NOTE<textarea placeholder="Color, shape, size, source, or anything else that matters." /></label>
            <button className="blackButton" type="submit">SAVE REQUEST DRAFT <span>↗</span></button>
          </form>
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
