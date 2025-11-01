import * as THREE from "three";
import "./App.css";
import { useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

function App() {
  useEffect(() => {
    const canvas = document.querySelector("canvas.webgl");
    const scene = new THREE.Scene();
    const gui = new GUI();

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const parameters = {
      count: 200000,
      size: 0.005,
      radius: 4,
      branches: 5,
      spin: 2,
      radnomness: 0.4,
      verticalPower: 4,
      horizontalPower: 2,
      innerColor: 0xff0000,
      outerColor: 0xbbbbf7,
      rotationSpeed : 0.1
    };

    let particleGeometry = null;
    let particleMaterial = null;
    let particles = null;

    const generateGalaxy = () => {
      //? destroy old galaxy

      if (particles !== null) {
        particleGeometry.dispose();
        particleMaterial.dispose();
        scene.remove(particles);
      }

      // geometry
      particleGeometry = new THREE.BufferGeometry();

      const positions = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);

      const colorInside = new THREE.Color(parameters.innerColor);
      const colorOutside = new THREE.Color(parameters.outerColor);

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const radius = parameters.radius * Math.random();

        const branch = i % parameters.branches;
        const segmentAngle = (Math.PI * 2) / parameters.branches;
        const branchAngle = branch * segmentAngle;
        const spinAngle = radius * parameters.spin;

        const randomX =
          Math.pow(Math.random(), parameters.verticalPower) *
          (Math.random() > 0.5 ? 1 : -1) *
          parameters.radnomness *
          Math.pow(radius, parameters.horizontalPower);
        const randomY =
          Math.pow(Math.random(), parameters.verticalPower) *
          (Math.random() > 0.5 ? 1 : -1) *
          parameters.radnomness *
          Math.pow(radius, parameters.horizontalPower);
        const randomZ =
          Math.pow(Math.random(), parameters.verticalPower) *
          (Math.random() > 0.5 ? 1 : -1) *
          parameters.radnomness *
          Math.pow(radius, parameters.horizontalPower);

        positions[i3 + 0] =
          Math.sin(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = 0 + randomY;
        positions[i3 + 2] =
          Math.cos(branchAngle + spinAngle) * radius + randomZ;

        //? colors
        const mixedColor = colorInside.clone();
        const lerpColor = mixedColor.lerp(
          colorOutside,
          radius / parameters.radius
        );

        colors[i3 + 0] = lerpColor.r;
        colors[i3 + 1] = lerpColor.g;
        colors[i3 + 2] = lerpColor.b;
      }

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      particleGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );

      // material
      particleMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);
    };
    generateGalaxy();

    gui.add(parameters, "rotationSpeed", 0.01, 5, 0.0001)
    gui.add(parameters, "count", 10, 1000000, 1).onFinishChange(() => {
      generateGalaxy();
    });
    gui.add(parameters, "size", 0.0001, 0.05, 0.0001).onFinishChange(() => {
      generateGalaxy();
    });
    gui.add(parameters, "radius", 1, 50, 0.01).onFinishChange(() => {
      generateGalaxy();
    });
    gui.add(parameters, "branches", 2, 20, 1).onFinishChange(() => {
      generateGalaxy();
    });
    gui.add(parameters, "spin", -5, 5, 0.001).onFinishChange(() => {
      generateGalaxy();
    });
    gui.add(parameters, "radnomness", 0, 1, 0.001).onFinishChange(() => {
      generateGalaxy();
    });
    gui.add(parameters, "verticalPower", 1, 10, 0.001).onFinishChange(() => {
      generateGalaxy();
    });
    gui.add(parameters, "horizontalPower", 1, 5, 0.001).onFinishChange(() => {
      generateGalaxy();
    });
    gui.addColor(parameters, "innerColor").onFinishChange(() => {
      generateGalaxy();
    });
    gui.addColor(parameters, "outerColor").onFinishChange(() => {
      generateGalaxy();
    });

    //? camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.01,
      100
    );
    camera.position.z = 3;
    camera.position.y = 1;
    scene.add(camera);

    //? renderer
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Resize handler
    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", onResize);

    //? scroll
    let scrollY = window.scrollY

    window.addEventListener(('scroll'), ()=>{
      camera.position.z = scrollY / sizes.height * 3
    })

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooth camera motion

    let animationId;
    const clock = new THREE.Clock();
    function tick() {
      const elapsedTime = clock.getElapsedTime();

      // for (let i = 0; i < parameters.count; i++) {
      //   const i3 = i * 3;

      //   // Get the particle's distance from center
      //   const x = particleGeometry.attributes.position.array[i3];
      //   const z = particleGeometry.attributes.position.array[i3 + 2];
      //   const radius = Math.sqrt(x * x + z * z);

      //   // Calculate current angle and add a small rotation increment
      //   const angle = Math.atan2(z, x);
      //   const rotationIncrement = rotationSpeed * 0.016; // approximate frame time

      //   // Update position
      //   particleGeometry.attributes.position.array[i3] =
      //     Math.cos(angle + rotationIncrement) * radius;
      //   particleGeometry.attributes.position.array[i3 + 2] =
      //     Math.sin(angle + rotationIncrement) * radius;
      // }

      particles.rotation.y = elapsedTime * parameters.rotationSpeed

      particleGeometry.attributes.position.needsUpdate = true;
      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(tick);
    }
    tick();

    // cleanup on unmount
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas className="webgl"></canvas>;
}

export default App;
