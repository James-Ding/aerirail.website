/* ==========================================================================
   AeriRail PRT System - Core Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // -------------------------------------------------------------
    // 1. Mobile Navigation & Scroll Styling
    // -------------------------------------------------------------
    const header = document.getElementById('main-header');
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.querySelector('.mobile-nav-toggle');

    // Header scroll background change
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile nav toggle click handler
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });
    }

    // Close menu when links are clicked
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            const icon = navToggle.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        });
    });


    // -------------------------------------------------------------
    // 2. Interactive SVG Visualizer Hovers
    // -------------------------------------------------------------
    const aerirodSpecs = {
        rail: {
            title: "Rigid Guide-Conductor Rail",
            desc: "Continuous overhead composite providing rigid mechanical constraint and power transfer. Deployed longitudinally above the traffic lanes."
        },
        cantilever: {
            title: "T-Shaped Cantilever Connection",
            desc: "Robust structural bracket offsetting guide tracks by exactly 1.0 m from support poles, preserving rotor clearance envelopes."
        },
        rotor: {
            title: "Aerodynamic Rotor Assembly",
            desc: "Distributed propulsion footprint with 3.1 m width. Generates lift to offload dead weight and provides active auxiliary vectoring."
        },
        shaft: {
            title: "Vertical Main Rotor Shaft",
            desc: "1.0 m steel connecting shaft. Provides an aerodynamic buffer zone and standardized mounting for collector shoes."
        },
        shoe: {
            title: "Metallized Graphite Collection Shoe",
            desc: "25-30 cm assembly indexed 30 cm above the cabin roof. Transfers power via sliding friction on the energized conductor rail."
        },
        cabin: {
            title: "Carbon-Fiber Composite Cabin",
            desc: "1.5 m streamlined cabin body for individual passenger travel. Minimizes aerodynamic drag and tare weight."
        },
        landinggear: {
            title: "Skid-Type Landing Gear System",
            desc: "Symmetric 15 cm landing gear skids. Supports static docking, passenger boarding, and emergency maintenance tracking."
        }
    };

    const waysideSpecs = {
        pole: {
            title: "Wayside Column / Davit Pole",
            desc: "Steel bracketed support columns anchored on concrete pads. Bases are reinforced to withstand complex structural wind loads."
        },
        "t-cantilever": {
            title: "T-Shaped Cantilever Bracket",
            desc: "Horizontal arm projecting into roadway airspace, maintaining a 1.0 m track offset and providing rigid mechanical connection."
        },
        "track-system": {
            title: "Rigid Guide Rail Alignment",
            desc: "Longitudinally aligned track interface that constrains the main shaft of the AeriRod to guarantee steady tracking."
        },
        "rotor-clearance": {
            title: "Anti-Interference Safety Clearance",
            desc: "The support column apex must not project above the conductor rail. This creates a plane where 3.1m rotors sweep freely."
        },
        "ground-marking": {
            title: "High-Visibility Safety Buffer",
            desc: "Explicit safety boundary painted directly on the roadway beneath the AeriRail tracks, marking the right-of-way."
        }
    };

    // Attach listeners to AeriRod SVG
    const aerirodSvg = document.getElementById('aerirod-spec-svg');
    const aerirodTitle = document.getElementById('diagram-active-title');
    const aerirodDesc = document.getElementById('diagram-active-desc');

    if (aerirodSvg) {
        const interactives = aerirodSvg.querySelectorAll('.diagram-interactive');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                const target = el.getAttribute('data-target');
                if (aerirodSpecs[target]) {
                    aerirodTitle.textContent = aerirodSpecs[target].title;
                    aerirodDesc.textContent = aerirodSpecs[target].desc;
                    aerirodTitle.style.color = target === 'shoe' ? 'var(--accent-amber)' : 'var(--accent-cyan)';
                }
            });
        });
    }

    // Attach listeners to Wayside SVG
    const waysideSvg = document.getElementById('wayside-infra-svg');
    const waysideTitle = document.getElementById('wayside-active-title');
    const waysideDesc = document.getElementById('wayside-active-desc');

    if (waysideSvg) {
        const interactives = waysideSvg.querySelectorAll('.diagram-interactive');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                const target = el.getAttribute('data-target');
                if (waysideSpecs[target]) {
                    waysideTitle.textContent = waysideSpecs[target].title;
                    waysideDesc.textContent = waysideSpecs[target].desc;
                    waysideTitle.style.color = 'var(--accent-cyan)';
                }
            });
        });
    }


    // -------------------------------------------------------------
    // 3. Clearance and Support Calculator
    // -------------------------------------------------------------
    const carHeightInput = document.getElementById('car-height');
    const safetyClearanceInput = document.getElementById('safety-clearance');
    const carHeightVal = document.getElementById('car-height-val');
    const safetyClearanceVal = document.getElementById('safety-clearance-val');

    // Outputs
    const resRailHeight = document.getElementById('res-rail-height');
    const resPoleHeight = document.getElementById('res-pole-height');
    const resRotorHeight = document.getElementById('res-rotor-height');
    const resRotorClearance = document.getElementById('res-rotor-clearance');

    // SVG elements to manipulate
    const svgCar = document.getElementById('calc-ground-car');
    const svgCarBody = document.getElementById('calc-car-body');
    const svgCarLabel = document.getElementById('calc-car-label');
    const svgSafetyZone = document.getElementById('calc-safety-zone');
    const svgSafetyText = document.getElementById('calc-safety-text');
    const svgPod = document.getElementById('calc-pod');
    const svgRailGroup = document.getElementById('calc-rail-group');
    const svgRail = document.getElementById('calc-rail');
    const svgRailNode = document.getElementById('calc-rail-node');
    const svgPoleGroup = document.getElementById('calc-pole-group');
    const svgPole = document.getElementById('calc-pole');
    const svgCantilever = document.getElementById('calc-cantilever');
    const svgPoleTop = document.getElementById('calc-pole-top');
    const svgMarkers = document.getElementById('calc-markers');
    const svgPoleHeightTxt = document.getElementById('calc-pole-height-txt');

    function updateCalculator() {
        const carHeight = parseFloat(carHeightInput.value);
        const safetyClearance = parseFloat(safetyClearanceInput.value);

        // Update Slider Labels
        carHeightVal.textContent = `${carHeight.toFixed(2)} m`;
        safetyClearanceVal.textContent = `${safetyClearance.toFixed(2)} m`;

        // Constant AeriRod dimensions (meters)
        const landingGearHeight = 0.15;
        const cabinHeight = 1.50;
        const shaftHeight = 1.00;
        const shoeOffsetFromCabinRoof = 0.30;

        // Perform spatial math
        // Lowest point of landing gear is carHeight + safetyClearance
        const landingGearBottomHeight = carHeight + safetyClearance;
        const cabinBottomHeight = landingGearBottomHeight + landingGearHeight;
        const cabinRoofHeight = cabinBottomHeight + cabinHeight;
        
        // Conductor rail sits exactly at collection shoe height (30cm offset from cabin roof)
        const railHeight = cabinRoofHeight + shoeOffsetFromCabinRoof;
        const poleHeightLimit = railHeight; // Apex must not project above rail
        const rotorHeight = cabinRoofHeight + shaftHeight;
        
        // Rotor sweep clearance relative to pole apex limit
        const rotorToPoleClearance = rotorHeight - poleHeightLimit; // always 0.70m due to fixed AeriRod parameters

        // Update UI Text values
        resRailHeight.textContent = `${railHeight.toFixed(2)} m`;
        resPoleHeight.textContent = `${poleHeightLimit.toFixed(2)} m`;
        resRotorHeight.textContent = `${rotorHeight.toFixed(2)} m`;
        resRotorClearance.textContent = `${Math.round(rotorToPoleClearance * 100)} cm`;

        // ---------------------------------------------------------
        // SVG Dynamic Layout Adjustment (Scale: 40 pixels per meter)
        // ---------------------------------------------------------
        const pixelsPerMeter = 40;
        const groundY = 550;

        // 1. Ground Traffic Car
        const carHeightPx = carHeight * pixelsPerMeter;
        const carRoofY = groundY - carHeightPx;
        svgCarBody.setAttribute('y', carRoofY);
        svgCarBody.setAttribute('height', carHeightPx);
        svgCarLabel.setAttribute('y', carRoofY + carHeightPx / 2 + 4);
        
        // 2. Safety Zone
        const safetyClearancePx = safetyClearance * pixelsPerMeter;
        const podBottomY = carRoofY - safetyClearancePx;
        svgSafetyZone.setAttribute('y', podBottomY);
        svgSafetyZone.setAttribute('height', safetyClearancePx);
        svgSafetyText.setAttribute('y', podBottomY + safetyClearancePx / 2 + 4);
        svgSafetyText.textContent = `SAFETY ENVELOPE (${safetyClearance.toFixed(1)}m)`;

        // 3. AeriRod Pod Group translation
        // Template base position: lowest point of landing gear skid is at Y = 238
        const dy = podBottomY - 238;
        svgPod.setAttribute('transform', `translate(0, ${dy})`);

        // 4. Conductor Rail Group (sits relative to the translated shoe)
        // Nominal rail height at template is 76 (238 - landinggear(18) - cabin(120) - shoeOffset(24) = 76)
        const railY = 76 + dy;
        svgRail.setAttribute('y1', railY);
        svgRail.setAttribute('y2', railY);
        svgRailNode.setAttribute('cy', railY + 9); // aligns node with shoe contact point

        // 5. Wayside Pole Group
        // Pole apex is at railY. Pole starts at groundY=550.
        const poleHeightPx = groundY - railY;
        svgPole.setAttribute('y', railY);
        svgPole.setAttribute('height', poleHeightPx);
        svgCantilever.setAttribute('y', railY);
        svgPoleTop.setAttribute('cy', railY);

        // 6. Height marker details
        // Left height indicator bar
        const markerBar = svgMarkers.querySelector('line');
        const markerTopTick = svgMarkers.querySelectorAll('path')[0];
        const markerBottomTick = svgMarkers.querySelectorAll('path')[1];
        
        markerBar.setAttribute('y1', railY);
        markerBar.setAttribute('y2', groundY);
        markerTopTick.setAttribute('d', `M 25 ${railY} L 35 ${railY}`);
        markerBottomTick.setAttribute('d', `M 25 ${groundY} L 35 ${groundY}`);
        svgPoleHeightTxt.setAttribute('y', railY + poleHeightPx / 2);
        svgPoleHeightTxt.textContent = `Pole Apex: ${poleHeightLimit.toFixed(2)}m`;
    }

    if (carHeightInput && safetyClearanceInput) {
        carHeightInput.addEventListener('input', updateCalculator);
        safetyClearanceInput.addEventListener('input', updateCalculator);
        // Initialize math calculations
        updateCalculator();
    }


    // -------------------------------------------------------------
    // 4. Specifications Matrix Table Search & Unit Conversion
    // -------------------------------------------------------------
    const rawSpecs = [
        {
            category: 'vehicle',
            name: 'Total Aerodynamic Rotor Width',
            metricVal: 3.1,
            metricUnit: 'm',
            desc: 'Distributed electric propulsion footprint dynamically offloading track load.'
        },
        {
            category: 'vehicle',
            name: 'Rotor-to-Cabin Vertical Main Shaft Height',
            metricVal: 1.0,
            metricUnit: 'm',
            desc: 'Guarantees aerodynamic buffer zones isolating cabin from rotor downwash velocity fields.'
        },
        {
            category: 'vehicle',
            name: 'Structural Cabin Vertical Height',
            metricVal: 1.5,
            metricUnit: 'm',
            desc: 'Lightweight capsule sized for individual passenger point-to-point travel.'
        },
        {
            category: 'vehicle',
            name: 'Vertical Landing Gear Height',
            metricVal: 15,
            metricUnit: 'cm',
            desc: 'Symmetrically installed skids for stable docking and emergency maintenance.'
        },
        {
            category: 'vehicle',
            name: 'Base Indexing Distance (Lower Edge to Cabin Roof)',
            metricVal: 30,
            metricUnit: 'cm',
            desc: 'Physical offset mounting parameter for the current collector shoes.'
        },
        {
            category: 'vehicle',
            name: 'Physical Height of the Assembly Component',
            metricVal: 27.5, // 25 - 30 nominal, mean = 27.5
            metricUnit: 'cm',
            desc: 'Size range (25-30 cm) of metallized graphite collection shoe contact head.'
        },
        {
            category: 'wayside',
            name: 'Alignment Routing Definition',
            metricVal: null,
            metricUnit: 'text',
            desc: 'Conductor guide tracks deployed longitudinally directly above traffic lanes.'
        },
        {
            category: 'wayside',
            name: 'Lateral Distance from Support Pole to Conductor Rail',
            metricVal: 1.0,
            metricUnit: 'm',
            desc: 'Horizontal offset maintained via T-Shaped cantilever arms projecting into roadway airspace.'
        },
        {
            category: 'clearance',
            name: 'Minimum Operational Clearance to Ground Vehicle Roofs',
            metricVal: 6.0,
            metricUnit: 'm',
            desc: 'Zero-collision safety envelope above mixed road vehicles.'
        }
    ];

    const matrixBody = document.getElementById('matrix-body');
    const searchInput = document.getElementById('matrix-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const unitToggle = document.getElementById('unit-toggle');
    
    let currentFilter = 'all';
    let currentUnitSystem = 'metric'; // 'metric' or 'imperial'

    // Helper functions for unit conversions
    function convertValue(val, unit, targetSystem) {
        if (val === null) return 'Aligned above lanes';
        if (targetSystem === 'metric') {
            return `${val} ${unit}`;
        } else {
            // Convert to Imperial
            if (unit === 'm') {
                const ft = val * 3.28084;
                return `${ft.toFixed(2)} ft`;
            } else if (unit === 'cm') {
                const inches = val * 0.393701;
                return `${inches.toFixed(1)} in`;
            }
            return `${val} ${unit}`;
        }
    }

    function renderMatrix() {
        if (!matrixBody) return;
        matrixBody.innerHTML = '';
        
        const query = searchInput ? searchInput.value.toLowerCase() : '';

        const filtered = rawSpecs.filter(item => {
            const matchesCat = currentFilter === 'all' || item.category === currentFilter;
            const matchesQuery = item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
            return matchesCat && matchesQuery;
        });

        if (filtered.length === 0) {
            matrixBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-dim);">No parameters matching your criteria were found.</td></tr>`;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            
            const displayVal = convertValue(item.metricVal, item.metricUnit, currentUnitSystem);
            
            tr.innerHTML = `
                <td class="matrix-category">${item.category}</td>
                <td><strong>${item.name}</strong></td>
                <td class="matrix-value">${displayVal}</td>
                <td style="color: var(--text-muted); font-size: 0.85rem;">${item.desc}</td>
            `;
            matrixBody.appendChild(tr);
        });
    }

    // Event listeners for filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderMatrix();
        });
    });

    // Event listeners for search
    if (searchInput) {
        searchInput.addEventListener('input', renderMatrix);
    }

    // Event listener for unit toggle
    if (unitToggle) {
        unitToggle.addEventListener('click', () => {
            const opts = unitToggle.querySelectorAll('.unit-opt');
            opts.forEach(opt => opt.classList.toggle('active'));
            
            const activeOpt = unitToggle.querySelector('.unit-opt.active');
            currentUnitSystem = activeOpt.getAttribute('data-unit');
            renderMatrix();
        });
    }

    // Initial table render
    renderMatrix();


    // -------------------------------------------------------------
    // 5. Scroll Animations Trigger (Intersection Observer)
    // -------------------------------------------------------------
    const animatedElements = document.querySelectorAll('.scroll-animate');
    
    if ('IntersectionObserver' in window && animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        animatedElements.forEach(el => el.classList.add('animated'));
    }
});
