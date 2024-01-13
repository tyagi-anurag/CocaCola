const canvas = document.querySelector('canvas.webgl');
/**
 * Loaders
 */

const bodyElement = document.querySelector('body')
const gltfLoader = new THREE.GLTFLoader();
/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const alphaShadow = textureLoader.load('/assets/texture/simpleShadow.jpg');
// Scene
const scene = new THREE.Scene();

const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        transparent: true,
        color: 0x000000,
        opacity: 0.5,
        alphaMap: alphaShadow
    })
);

sphereShadow.rotation.x = -Math.PI * 0.5;

sphereShadow.position.y = -1;
sphereShadow.position.x = 0;

scene.add(sphereShadow);

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,
    uniforms: {
        uAlpha: {
            value: 1.0
        }
    },
    transparent: true
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);
/**
 * GLTF Model
 */
let cocacola = null;

gltfLoader.load(
    './assets/cocacola/scene.gltf',
    (gltf) => {
        console.log(gltf);

        cocacola = gltf.scene;

        cocacola.position.x = 0;

        cocacola.rotation.x = Math.PI * 0.2;
        cocacola.rotation.z = 0;

        cocacola.scale.set(0.7, 0.7, 0.7);

        scene.add(cocacola);
    },
    (progress) => {
        console.log(progress);
    },
    (error) => {
        console.error(error);
    }
);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // You can adjust the intensity as needed
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x000000, 0xffffff, 50); // Set skyColor to black (0x000000)
scene.add(hemisphereLight);

const directionalLightY = new THREE.DirectionalLight(0xffffff, 10); // Adjust the intensity as needed
directionalLightY.position.set(-2, 8, 0); // Point it downward
scene.add(directionalLightY);

const directionalLightY2 = new THREE.DirectionalLight(0xffffff, 10); // Adjust the intensity as needed
directionalLightY2.position.set(2, 8, 0); // Point it downward
scene.add(directionalLightY2);
/** 
 * Sizes
 */
const sizes = {
    width: window.innerWidth, // 40vw
    height: window.innerHeight, // 100vh
};

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;
const transformDonut = [
    {
        rotationZ: 0,
        positionX: 0
    },
    {
        rotationZ: 0,
        positionX: -1.5
    },
    {
        rotationZ: 0,
        positionX: 1.5
    },
    {
        rotationZ: 0,
        positionX: 0
    },
    {
        rotationZ: 0.0314,
        positionX: 0
    }
];
let isSectionFour = false;
// Inside the scroll event listener
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY / sizes.height);

    if (newSection != currentSection) {
        currentSection = newSection;
        isSectionFour = currentSection === 3; // Check if it's section four (zero-based index 3)

        if (!!cocacola) {
            gsap.to(
                cocacola.rotation,
                {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    z: transformDonut[currentSection].rotationZ
                }
            );
            gsap.to(
                cocacola.position,
                {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: transformDonut[currentSection].positionX
                }
            );
            gsap.to(
                sphereShadow.position,
                {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: transformDonut[currentSection].positionX
                }
            );
        }
    }
});
/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 10);
camera.position.set(0, 0, 5);
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Update renderer size when window size changes
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    // Update camera aspect ratio
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    // Update renderer size
    renderer.setSize(sizes.width, sizes.height);
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - lastElapsedTime;
    lastElapsedTime = elapsedTime;

    if (!!cocacola) {
        // Rotate the cocacola continuously
        cocacola.rotation.y += deltaTime;
    }
    renderer.render(scene, camera);
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

/**
 * On Reload
 */
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

// Function to handle responsive layout
function handleResponsiveLayout() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (screenWidth < 760) {
        // Center the model
        if (!!cocacola) {
            cocacola.position.x = 0;
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 15);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 0, 0);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-2.5, 5, -4);
        scene.add(directionalLight2);

        const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight3.position.set(2.5, 5, -4);
        scene.add(directionalLight3);

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        /**
         * Scroll
         */
        let scrollY = window.scrollY;
        let currentSection = 0;

        const transformDonut = [
            {
                rotationZ: 0,
                positionX: 0
            },
            {
                rotationZ: 0.314,
                positionX: 0
            },
            {
                rotationZ: 0.45,
                positionX: 0
            },
            {
                rotationZ: 0.0314,
                positionX: 0
            },
            {
                rotationZ: 0.0314,
                positionX: 0
            }
        ];

        window.addEventListener('scroll', () => {
            scrollY = window.scrollY;
            const newSection = Math.round(scrollY / sizes.height);

            if (newSection != currentSection) {
                currentSection = newSection;

                if (!!cocacola) {
                    gsap.to(
                        cocacola.rotation,
                        {
                            duration: 1.5,
                            ease: 'power2.inOut',
                            z: transformDonut[currentSection].rotationZ
                        }
                    );

                    gsap.to(
                        cocacola.position,
                        {
                            duration: 1.5,
                            ease: 'power2.inOut',
                            x: transformDonut[currentSection].positionX
                        }
                    );
                    gsap.to(
                        sphereShadow.position,
                        {
                            duration: 1.5,
                            ease: 'power2.inOut',
                            x: transformDonut[currentSection].positionX
                        }
                    );
                }
            }
        });

        

    } else if (screenWidth >= 601 && screenWidth <= 992 && screenHeight > 900) {
        /**
         * Scroll
         */
        let scrollY = window.scrollY;
        let currentSection = 0;

        const transformDonut = [
            {
                rotationZ: 0,
                positionX: 0
            },
            {
                rotationZ: 0.45,
                positionX: 0
            },
            {
                rotationZ: -0.45,
                positionX: 0
            },
            {
                rotationZ: 0.0314,
                positionX: 0
            },
            {
                rotationZ: 0.0314,
                positionX: 0
            }
        ];

        window.addEventListener('scroll', () => {
            scrollY = window.scrollY;
            const newSection = Math.round(scrollY / sizes.height);

            if (newSection != currentSection) {
                currentSection = newSection;

                if (!!cocacola) {
                    gsap.to(
                        cocacola.rotation,
                        {
                            duration: 1.5,
                            ease: 'power2.inOut',
                            z: transformDonut[currentSection].rotationZ
                        }
                    );

                    gsap.to(
                        cocacola.position,
                        {
                            duration: 1.5,
                            ease: 'power2.inOut',
                            x: transformDonut[currentSection].positionX
                        }
                    );
                    gsap.to(
                        sphereShadow.position,
                        {
                            duration: 1.5,
                            ease: 'power2.inOut',
                            x: transformDonut[currentSection].positionX
                        }
                    );
                }
            }
        });
    
    }else if (screenWidth >= 761 && screenWidth <= 1024) {
        // Adjust the position for the specific range
        if (!!cocacola) {
            cocacola.position.x = 0;
        }

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        const ambientLight = new THREE.AmbientLight(0xffffff, 15);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 0, 0);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-2.5, 5, -4);
        scene.add(directionalLight2);

        const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight3.position.set(2.5, 5, -4);
        scene.add(directionalLight3);
        /**
         * Scroll
         */
        let scrollY = window.scrollY;
        let currentSection = 0;

        const transformDonut = [
            {
                rotationZ: 0,
                positionX: 0
            },
            {
                rotationZ: 0,
                positionX: -1.2
            },
            {
                rotationZ: 0,
                positionX: 1.2
            },
            {
                rotationZ: 0.0314,
                positionX: 0
            },
            {
                rotationZ: 0,
                positionX: 0
            }
        ];

        window.addEventListener('scroll', () => {
            scrollY = window.scrollY;
            const newSection = Math.round(scrollY / sizes.height);

            if (newSection != currentSection) {
                currentSection = newSection;

                if (!!cocacola) {
                    gsap.to(
                        cocacola.rotation,
                        {
                            duration: 1.5,
                            ease: 'power2.inOut',
                            z: transformDonut[currentSection].rotationZ
                        }
                    );

                    gsap.to(
                        cocacola.position,
                        {
                            duration: 1.5,
                            ease: 'power2.inOut',
                            x: transformDonut[currentSection].positionX
                        }
                    );
                    gsap.to(
                        sphereShadow.position,
                        {
                            duration: 1.5,
                            ease: 'power2.inOut',
                            x: transformDonut[currentSection].positionX
                        }
                    );
                }
            }
        });
    
    }
}

window.addEventListener('resize', handleResponsiveLayout);
handleResponsiveLayout();

function toggleNavbar() {
    const navbar = document.getElementById("myNavbar");
    if (navbar.className === "navbar") {
        navbar.className += " responsive";
    } else {
        navbar.className = "navbar";
    }
}

const brandHead2 = document.querySelector('.brand-head2');
gsap.set(brandHead2, { x: '-100%', opacity: 0 });
gsap.to(brandHead2, {
    x: '0%',
    opacity: 1,
    duration: 1.5, 
    ease: 'power4.out', 
    delay: 1, 
});
const brandHead = document.querySelector('.brand-head');
gsap.set(brandHead, { x: '-100%', opacity: 0 });
gsap.to(brandHead, {
  x: '0%',
  opacity: 1,
  duration: 1.5,
  ease: 'power4.out', 
  delay: 1,
});

const heroLeft = document.querySelector('.hero-left');
gsap.set(heroLeft, { x: '100%', opacity: 0 });
gsap.to(heroLeft, {
  x: '0%',
  opacity: 1,
  duration: 1.5,
  ease: 'power4.out', 
  delay: 1,
});

const heroSection = document.getElementsByClassName('hero-section1');
gsap.set(heroSection, { scale: 0.2  });
const heroAnimation = gsap.timeline({
    scrollTrigger: {
        trigger: heroSection, 
        start: 'top 65%', 
        end: 'top 65%', 
        scrub: 0.5, 
    },
});
heroAnimation.to(heroSection, {
    scale: 1,
    duration: 0.5,
    ease: 'power1.out',
});

const heroSection2 = document.getElementsByClassName('hero-section2');
gsap.set(heroSection2, { scale: 0.2  });
const heroAnimation2 = gsap.timeline({
    scrollTrigger: {
        trigger: heroSection2, 
        start: 'top 65%', 
        end: 'top 65%', 
        scrub: 0.5, 
    },
});
heroAnimation2.to(heroSection2, {
    scale: 1,
    duration: 0.5,
    ease: 'power1.out', 
});

const animatedheading = document.getElementById('animated-heading');
gsap.set(animatedheading, {opacity:0  });
const animatedhead = gsap.timeline({
    scrollTrigger: {
        trigger: animatedheading, 
        start: 'top 50%',
        end: 'top 20%', 
        scrub: 0.5, 
    },
});
animatedhead.to(animatedheading, {
    opacity:1,
    
    duration: 0.5,
    ease: 'power1.out',
});