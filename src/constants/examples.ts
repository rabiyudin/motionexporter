import { AnimationExample } from '../types';

export const ANIMATION_EXAMPLES: AnimationExample[] = [
  {
    id: 'sample-wand-papers',
    title: 'Magic Wand & Floating Papers',
    category: 'Commercial Stock',
    description: 'Sample test animation with floating documents, sparkling 4-point stars, and a swinging wand.',
    suggestedDuration: 3,
    suggestedFps: 30,
    suggestedBackground: 'transparent',
    code: `function draw(ctx, time, width, height) {
    const scale = Math.min(width, height) / 500;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const loopTime = (time % 3) / 3;
    const float = Math.sin(time * 2) * 15 * scale;
    const wandSwing = Math.sin(loopTime * Math.PI * 2) * 0.8;
    const paperLift = Math.pow(
        Math.sin(loopTime * Math.PI),
        4
    ) * 60 * scale;

    function drawStar(x, y, r, color) {
        ctx.save();
        ctx.translate(x, y);

        const pulse =
            Math.sin(time * 4 + x) * 0.2 + 0.8;

        ctx.scale(pulse, pulse);

        ctx.beginPath();

        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.lineTo(r * scale, 0);
            ctx.lineTo(0, r * 0.2 * scale);
        }

        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();
    }

    drawStar(
        cx - 140 * scale,
        cy - 80 * scale + float * 0.5,
        18,
        '#00F5E1'
    );

    drawStar(
        cx + 150 * scale,
        cy + 20 * scale + float * 0.7,
        12,
        '#00F5E1'
    );

    drawStar(
        cx + 60 * scale,
        cy - 180 * scale + float * 0.3,
        22,
        '#00F5E1'
    );

    drawStar(
        cx - 30 * scale,
        cy - 160 * scale,
        6,
        '#00F5E1'
    );

    function drawPaper(
        x,
        y,
        w,
        h,
        lift,
        opacity,
        isMain = false
    ) {
        ctx.save();

        ctx.translate(
            x,
            y - lift + float
        );

        ctx.fillStyle =
            \`rgba(235, 232, 255, \${opacity})\`;

        ctx.beginPath();

        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(
                -w / 2,
                -h / 2,
                w,
                h,
                8 * scale
            );
        } else {
            ctx.rect(
                -w / 2,
                -h / 2,
                w,
                h
            );
        }

        ctx.fill();

        if (isMain) {
            ctx.fillStyle = '#D1C9FF';

            ctx.beginPath();

            ctx.arc(
                20 * scale,
                -30 * scale,
                15 * scale,
                0,
                Math.PI * 2
            );

            ctx.fill();
        } else {
            ctx.strokeStyle = '#D1C9FF';
            ctx.lineWidth = 4 * scale;

            for (let i = 0; i < 3; i++) {
                ctx.beginPath();

                ctx.moveTo(
                    -w / 4,
                    -10 * scale +
                    i * 15 * scale
                );

                ctx.lineTo(
                    w / 4,
                    -10 * scale +
                    i * 15 * scale
                );

                ctx.stroke();
            }
        }

        ctx.restore();
    }

    drawPaper(
        cx + 60 * scale,
        cy - 40 * scale,
        80 * scale,
        120 * scale,
        paperLift * 0.3,
        0.8
    );

    drawPaper(
        cx + 40 * scale,
        cy - 50 * scale,
        90 * scale,
        130 * scale,
        paperLift * 0.6,
        0.9
    );

    drawPaper(
        cx - 10 * scale,
        cy - 70 * scale,
        130 * scale,
        150 * scale,
        paperLift,
        1,
        true
    );

    ctx.save();

    ctx.translate(
        cx,
        cy + float
    );

    ctx.fillStyle = '#7457FF';

    ctx.beginPath();

    ctx.roundRect(
        -115 * scale,
        -70 * scale,
        80 * scale,
        50 * scale,
        12 * scale
    );

    ctx.fill();

    ctx.fillStyle = '#8B73FF';

    ctx.beginPath();

    ctx.roundRect(
        -115 * scale,
        -45 * scale,
        230 * scale,
        130 * scale,
        18 * scale
    );

    ctx.fill();

    const grad =
        ctx.createRadialGradient(
            20 * scale,
            20 * scale,
            0,
            0,
            0,
            150 * scale
        );

    grad.addColorStop(
        0,
        'rgba(255,255,255,0.1)'
    );

    grad.addColorStop(
        1,
        'rgba(0,0,0,0.1)'
    );

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();

    ctx.save();

    ctx.translate(
        cx + 200 * scale,
        cy + 80 * scale + float
    );

    ctx.rotate(
        Math.PI / 6 - wandSwing
    );

    ctx.fillStyle = '#4A3AFF';

    ctx.beginPath();

    ctx.roundRect(
        -10 * scale,
        -80 * scale,
        20 * scale,
        120 * scale,
        10 * scale
    );

    ctx.fill();

    ctx.fillStyle = '#FFFFFF';

    ctx.beginPath();

    ctx.roundRect(
        -10 * scale,
        -80 * scale,
        20 * scale,
        25 * scale,
        8 * scale
    );

    ctx.fill();

    ctx.restore();
}`
  },
  {
    id: 'floating-stars',
    title: 'Floating Stars & Nebula Glow',
    category: 'Abstract / Sci-Fi',
    description: 'Deep cosmic starfield with pulsing twinkling stars, glowing radial halos, and layered parallax motion.',
    suggestedDuration: 4,
    suggestedFps: 30,
    suggestedBackground: 'black',
    code: `function draw(ctx, time, width, height) {
    const scale = Math.min(width, height) / 800;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Deep ambient nebula glow
    const grad = ctx.createRadialGradient(cx, cy, 20 * scale, cx, cy, 380 * scale);
    grad.addColorStop(0, 'rgba(116, 87, 255, 0.25)');
    grad.addColorStop(0.5, 'rgba(0, 245, 225, 0.12)');
    grad.addColorStop(1, 'rgba(10, 12, 20, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const starCount = 36;
    for (let i = 0; i < starCount; i++) {
        const seed = i * 137.5;
        const rad = ((seed * 3.7) % 320 + 20) * scale;
        const speed = 0.5 + (i % 5) * 0.2;
        const angle = (seed * Math.PI) / 180 + (time * speed * 0.4);
        
        const x = cx + Math.cos(angle) * rad;
        const y = cy + Math.sin(angle) * (rad * 0.75);

        const pulse = Math.sin(time * 3 + i * 1.5) * 0.4 + 0.6;
        const size = (3 + (i % 4) * 3) * scale * pulse;

        // Soft halo
        const halo = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        halo.addColorStop(0, i % 2 === 0 ? 'rgba(0, 245, 225, 0.8)' : 'rgba(255, 120, 220, 0.8)');
        halo.addColorStop(0.4, i % 2 === 0 ? 'rgba(0, 245, 225, 0.2)' : 'rgba(255, 120, 220, 0.2)');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }
}`
  },
  {
    id: 'magic-wand-burst',
    title: 'Magic Wand & Sparkle Trails',
    category: 'VFX / Overlay',
    description: 'Stylized glowing magic wand casting glowing particle trails and spinning orbital energy rings.',
    suggestedDuration: 3,
    suggestedFps: 30,
    suggestedBackground: 'transparent',
    code: `function draw(ctx, time, width, height) {
    const scale = Math.min(width, height) / 600;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const loopTime = (time % 3) / 3;
    const hover = Math.sin(loopTime * Math.PI * 2) * 12 * scale;

    ctx.save();
    ctx.translate(cx, cy + hover);

    // Orbital Energy Rings
    for (let r = 0; r < 3; r++) {
        const ringTime = (time * 1.8 + r * 0.8);
        ctx.save();
        ctx.rotate(ringTime * 0.6);
        ctx.strokeStyle = r % 2 === 0 ? '#00F5E1' : '#B886EE';
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.ellipse(0, -60 * scale, 50 * scale, 18 * scale, ringTime, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // Wand Body
    ctx.save();
    ctx.rotate(-Math.PI / 4 + Math.sin(time * 2.5) * 0.1);
    
    // Shaft
    const wandGrad = ctx.createLinearGradient(0, -80 * scale, 0, 90 * scale);
    wandGrad.addColorStop(0, '#FFFFFF');
    wandGrad.addColorStop(0.3, '#7457FF');
    wandGrad.addColorStop(1, '#3B24B3');
    ctx.fillStyle = wandGrad;
    ctx.beginPath();
    ctx.roundRect(-6 * scale, -80 * scale, 12 * scale, 160 * scale, 6 * scale);
    ctx.fill();

    // Wand Tip Star Gem
    const gemPulse = Math.sin(time * 5) * 0.2 + 1;
    ctx.save();
    ctx.translate(0, -85 * scale);
    ctx.scale(gemPulse, gemPulse);
    ctx.fillStyle = '#FFE57F';
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.lineTo(18 * scale, 0);
        ctx.lineTo(0, 4 * scale);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
    ctx.restore();
}`
  },
  {
    id: 'loading-circle',
    title: 'Loading Circle (HUD Preloader)',
    category: 'UI / Technology',
    description: 'High-tech futuristic segmented spinner ring with glowing neon accents, perfect for tech overlays.',
    suggestedDuration: 2,
    suggestedFps: 30,
    suggestedBackground: 'transparent',
    code: `function draw(ctx, time, width, height) {
    const scale = Math.min(width, height) / 500;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const baseRadius = 110 * scale;
    const segments = 16;
    const spin = time * Math.PI * 1.5;

    // Outer subtle track
    ctx.strokeStyle = 'rgba(116, 87, 255, 0.15)';
    ctx.lineWidth = 14 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Active Segmented Arcs
    for (let i = 0; i < segments; i++) {
        const segAngle = (i / segments) * Math.PI * 2 + spin;
        const arcLength = (Math.PI * 2 / segments) * 0.7;
        const alpha = Math.pow((i + 1) / segments, 2.5);

        ctx.strokeStyle = \`rgba(0, 245, 225, \${alpha})\`;
        ctx.lineWidth = 12 * scale;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, segAngle, segAngle + arcLength);
        ctx.stroke();
    }

    // Inner Pulsing Core
    const pulse = Math.sin(time * 6) * 0.15 + 0.85;
    ctx.fillStyle = '#7457FF';
    ctx.beginPath();
    ctx.arc(cx, cy, 32 * scale * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, 14 * scale * pulse, 0, Math.PI * 2);
    ctx.fill();
}`
  },
  {
    id: 'abstract-blob',
    title: 'Abstract Organic Blob',
    category: 'Abstract / Design',
    description: 'Morphing harmonic fluid liquid shape with rich vibrant gradient fill and soft floating wave physics.',
    suggestedDuration: 4,
    suggestedFps: 30,
    suggestedBackground: 'transparent',
    code: `function draw(ctx, time, width, height) {
    const scale = Math.min(width, height) / 500;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const points = 12;
    const baseRadius = 120 * scale;

    ctx.save();
    ctx.translate(cx, cy);

    const grad = ctx.createLinearGradient(-150 * scale, -150 * scale, 150 * scale, 150 * scale);
    grad.addColorStop(0, '#7457FF');
    grad.addColorStop(0.5, '#FF3399');
    grad.addColorStop(1, '#00F5E1');

    ctx.fillStyle = grad;
    ctx.beginPath();

    const coords = [];
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave1 = Math.sin(time * 2 + i * 2) * 25 * scale;
        const wave2 = Math.cos(time * 3 + i * 1.5) * 15 * scale;
        const r = baseRadius + wave1 + wave2;
        coords.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
        });
    }

    // Smooth Bezier Curve Loop
    ctx.moveTo(
        (coords[0].x + coords[points - 1].x) / 2,
        (coords[0].y + coords[points - 1].y) / 2
    );

    for (let i = 0; i < points; i++) {
        const current = coords[i];
        const next = coords[(i + 1) % points];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, midX, midY);
    }

    ctx.closePath();
    ctx.fill();

    // Inner highlight reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(-35 * scale, -45 * scale, 30 * scale, 16 * scale, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}`
  },
  {
    id: 'minimal-geometric-loop',
    title: 'Minimal Geometric Loop',
    category: 'Minimalist / 3D',
    description: 'Clean isometric nested rotating geometric polygons with precision rhythmic easing and depth.',
    suggestedDuration: 3,
    suggestedFps: 30,
    suggestedBackground: 'transparent',
    code: `function draw(ctx, time, width, height) {
    const scale = Math.min(width, height) / 500;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx, cy);

    const layers = 5;
    for (let i = layers; i >= 1; i--) {
        const r = i * 36 * scale;
        const spin = (time * (1.2 / i)) * (i % 2 === 0 ? 1 : -1);

        ctx.save();
        ctx.rotate(spin);

        ctx.lineWidth = 4 * scale;
        ctx.strokeStyle = i % 2 === 0 ? '#7457FF' : '#00F5E1';
        ctx.fillStyle = i === 1 ? '#FFFFFF' : 'transparent';

        // Draw regular hexagon
        ctx.beginPath();
        for (let s = 0; s < 6; s++) {
            const angle = (s / 6) * Math.PI * 2;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        if (i === 1) ctx.fill();

        ctx.restore();
    }

    ctx.restore();
}`
  },
  {
    id: 'particles-network',
    title: 'Constellation Particle Network',
    category: 'Technology / Network',
    description: 'Plexus style floating connected particle nodes with dynamic proximity line linking.',
    suggestedDuration: 4,
    suggestedFps: 30,
    suggestedBackground: 'black',
    code: `function draw(ctx, time, width, height) {
    const scale = Math.min(width, height) / 600;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const count = 30;
    const nodes = [];

    for (let i = 0; i < count; i++) {
        const seed = i * 43.17;
        const rBase = (seed % 180 + 30) * scale;
        const speed = 0.4 + (i % 3) * 0.2;
        const angle = (seed * Math.PI / 180) + (time * speed);
        
        const x = cx + Math.cos(angle) * rBase;
        const y = cy + Math.sin(angle * 1.2) * (rBase * 0.85);

        nodes.push({ x, y, size: (2 + (i % 3) * 2) * scale });
    }

    // Draw connecting lines between close nodes
    const maxDist = 95 * scale;
    for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
                const alpha = (1 - dist / maxDist) * 0.6;
                ctx.strokeStyle = \`rgba(116, 87, 255, \${alpha})\`;
                ctx.lineWidth = 1.5 * scale;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }

    // Draw nodes
    for (let i = 0; i < count; i++) {
        const n = nodes[i];
        ctx.fillStyle = i % 2 === 0 ? '#00F5E1' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
    }
}`
  },
  {
    id: 'confetti-burst',
    title: 'Festive Confetti Celebration',
    category: 'Celebration / Event',
    description: 'Dynamic fluttering celebration confetti ribbons and papers in seamless vertical cascade.',
    suggestedDuration: 3,
    suggestedFps: 30,
    suggestedBackground: 'transparent',
    code: `function draw(ctx, time, width, height) {
    const scale = Math.min(width, height) / 500;
    ctx.clearRect(0, 0, width, height);

    const count = 48;
    const colors = ['#7457FF', '#00F5E1', '#FF499E', '#FFB703', '#4CC9F0'];
    const duration = 3;
    const loopT = (time % duration) / duration;

    for (let i = 0; i < count; i++) {
        const xOffset = ((i * 37.89) % width);
        const yProgress = (loopT + (i / count)) % 1;
        const y = yProgress * (height + 60 * scale) - 30 * scale;
        const wobble = Math.sin(time * 5 + i) * 20 * scale;

        const w = (10 + (i % 6) * 3) * scale;
        const h = (6 + (i % 4) * 2) * scale;
        const color = colors[i % colors.length];

        ctx.save();
        ctx.translate(xOffset + wobble, y);
        ctx.rotate(time * 3 + i * 2);
        ctx.scale(Math.cos(time * 4 + i), 1);

        ctx.fillStyle = color;
        ctx.fillRect(-w / 2, -h / 2, w, h);

        ctx.restore();
    }
}`
  },
  {
    id: 'floating-ui-cards',
    title: 'Floating Glass UI Cards',
    category: 'Fintech / Dashboard',
    description: 'Glassmorphism finance cards with subtle tilt, soft drop shadow, and glowing chip details.',
    suggestedDuration: 4,
    suggestedFps: 30,
    suggestedBackground: 'transparent',
    code: `function draw(ctx, time, width, height) {
    const scale = Math.min(width, height) / 600;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const float1 = Math.sin(time * 1.5) * 14 * scale;
    const float2 = Math.cos(time * 1.8) * 10 * scale;

    // Background Card
    ctx.save();
    ctx.translate(cx + 40 * scale, cy - 30 * scale + float2);
    ctx.rotate(0.08);

    ctx.fillStyle = 'rgba(74, 58, 255, 0.4)';
    ctx.beginPath();
    ctx.roundRect(-130 * scale, -80 * scale, 260 * scale, 160 * scale, 18 * scale);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
    ctx.restore();

    // Foreground Primary Card
    ctx.save();
    ctx.translate(cx - 30 * scale, cy + 20 * scale + float1);
    ctx.rotate(-0.04);

    // Drop shadow
    ctx.shadowColor = 'rgba(116, 87, 255, 0.35)';
    ctx.shadowBlur = 30 * scale;
    ctx.shadowOffsetY = 15 * scale;

    const cardGrad = ctx.createLinearGradient(-140 * scale, -85 * scale, 140 * scale, 85 * scale);
    cardGrad.addColorStop(0, '#1E2235');
    cardGrad.addColorStop(1, '#111422');
    ctx.fillStyle = cardGrad;

    ctx.beginPath();
    ctx.roundRect(-140 * scale, -85 * scale, 280 * scale, 170 * scale, 20 * scale);
    ctx.fill();

    // Reset shadow for details
    ctx.shadowColor = 'transparent';

    // Card border
    ctx.strokeStyle = 'rgba(0, 245, 225, 0.4)';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // Chip
    ctx.fillStyle = '#00F5E1';
    ctx.beginPath();
    ctx.roundRect(-110 * scale, -55 * scale, 38 * scale, 28 * scale, 6 * scale);
    ctx.fill();

    // Numbers placeholder
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let c = 0; c < 4; c++) {
        ctx.beginPath();
        ctx.roundRect((-110 + c * 55) * scale, 15 * scale, 35 * scale, 8 * scale, 3 * scale);
        ctx.fill();
    }

    ctx.restore();
}`
  }
];
