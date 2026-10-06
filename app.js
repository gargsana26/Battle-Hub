/* ==========================================================================
   BATTLE HUB INTERACTIVE ENGINE
   Aesthetics: Cyberpunk Arena Canvas, Dynamic Scoreboards, Roster Radar Graphs,
   Real-Time Fan Feed & Interactive Bracket Highlighter.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  /* --------------------------------------------------------------------------
     1. Preloader Simulation & Page Entry
     -------------------------------------------------------------------------- */
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderPct = document.getElementById('preloader-pct');
  let loadProgress = 0;

  const preloaderInterval = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 8) + 2;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(preloaderInterval);
      
      setTimeout(() => {
        preloader.style.opacity = 0;
        preloader.style.visibility = 'hidden';
        document.body.classList.remove('loading-state');
        startCounters();
      }, 600);
    }
    preloaderBar.style.width = `${loadProgress}%`;
    preloaderPct.textContent = `${loadProgress}%`;
  }, 60);

  /* --------------------------------------------------------------------------
     2. Interactive Arena Canvas Particles Background
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('arena-background');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = (canvas.width = window.innerWidth);
    height = (canvas.height = window.innerHeight);
  });

  const particles = [];
  const particleCount = 60;
  const connectionDistance = 120;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.5 ? '#00F5FF' : '#FF007A';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  let laserLineY = 0;
  let laserDirection = 1;

  function animateArenaBackground() {
    ctx.clearRect(0, 0, width, height);

    const radialGlow = ctx.createRadialGradient(
      width / 2,
      height / 2,
      10,
      width / 2,
      height / 2,
      width * 0.8
    );
    radialGlow.addColorStop(0, '#0a0d24');
    radialGlow.addColorStop(1, '#050816');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(0, laserLineY);
    ctx.lineTo(width, laserLineY);
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.03)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00F5FF';
    ctx.stroke();
    ctx.shadowBlur = 0;

    laserLineY += 0.5 * laserDirection;
    if (laserLineY > height || laserLineY < 0) {
      laserDirection *= -1;
    }

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update();
      p1.draw();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          const alpha = (1 - dist / connectionDistance) * 0.12;
          ctx.strokeStyle = p1.color === '#00F5FF' 
            ? `rgba(0, 245, 255, ${alpha})`
            : `rgba(255, 0, 122, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateArenaBackground);
  }

  animateArenaBackground();

  /* --------------------------------------------------------------------------
     3. Custom Cursor Glow Follower
     -------------------------------------------------------------------------- */
  const cursorGlow = document.getElementById('cursor-glow');
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  });

  /* --------------------------------------------------------------------------
     4. Sticky Navigation & Smooth Scroll Indicator
     -------------------------------------------------------------------------- */
  const nav = document.getElementById('main-nav');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('sticky');
    } else {
      nav.classList.remove('sticky');
    }

    let currentSec = '';
    sections.forEach((sec) => {
      const sectionTop = sec.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        currentSec = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('data-target') === currentSec) {
        link.classList.add('active');
      }
    });
  });

  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. Live Countdowns (Hero Banner)
     -------------------------------------------------------------------------- */
  const countdownTarget = new Date();
  countdownTarget.setDate(countdownTarget.getDate() + 2);
  countdownTarget.setHours(countdownTarget.getHours() + 14);

  function updateHeroCountdown() {
    const now = new Date();
    const difference = countdownTarget - now;

    if (difference <= 0) {
      document.getElementById('hero-countdown').innerHTML = '<h4>LIVE STAGE UNDERWAY</h4>';
      return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
    const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById('cd-d').textContent = d.toString().padStart(2, '0');
    document.getElementById('cd-h').textContent = h.toString().padStart(2, '0');
    document.getElementById('cd-m').textContent = m.toString().padStart(2, '0');
    document.getElementById('cd-s').textContent = s.toString().padStart(2, '0');
  }

  setInterval(updateHeroCountdown, 1000);
  updateHeroCountdown();

  /* --------------------------------------------------------------------------
     6. Dashboard Counter Animations
     -------------------------------------------------------------------------- */
  function startCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach((counter) => {
      counter.textContent = '0';
      const updateCount = () => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const current = parseFloat(counter.textContent);
        const increment = target / 40;

        if (current < target) {
          if (target % 1 === 0) {
            counter.textContent = Math.ceil(current + increment);
          } else {
            counter.textContent = (current + increment).toFixed(1);
          }
          setTimeout(updateCount, 25);
        } else {
          counter.textContent = target;
        }
      };
      updateCount();
    });
  }

  /* --------------------------------------------------------------------------
     7. Live Scoreboard & Live Combat Log simulation
     -------------------------------------------------------------------------- */
  const liveRoundTimer = document.getElementById('live-round-timer');
  const liveScoreLeft = document.getElementById('live-score-left');
  const liveScoreRight = document.getElementById('live-score-right');
  const combatFeed = document.getElementById('live-combat-feed');

  const simulatedCombatEvents = [
    { type: 'kill', text: 'APX Chronos headshots FNC Derke with Vandal', time: '01:08' },
    { type: 'kill', text: 'FNC Chronicle eliminates APX Sparky with Phantom', time: '00:54' },
    { type: 'kill', text: 'FNC Boaster snaps APX ViperX on Site A entrance', time: '00:46' },
    { type: 'defuse', text: 'APX Reaper planted the Spike (Site B)', time: '00:39' },
    { type: 'kill', text: 'APX Reaper blasts FNC Alfajer (Spike Guard)', time: '00:25' },
    { type: 'kill', text: 'FNC Leo headshots APX Reaper', time: '00:18' },
    { type: 'death', text: 'APX Chronos shuts down FNC Leo - APX Wins Round!', time: '00:04' },
    { type: 'kill', text: 'FNC Derke sprays down APX ViperX', time: '01:10' },
    { type: 'kill', text: 'APX Chronos double-tap FNC Chronicle', time: '00:58' }
  ];

  function addCombatEvent(event) {
    const row = document.createElement('div');
    row.className = `combat-event-row ${event.type}`;
    
    let icon = 'shield-alert';
    if (event.type === 'kill') icon = 'crosshair';
    if (event.type === 'defuse') icon = 'shield-check';
    if (event.type === 'death') icon = 'skull';

    row.innerHTML = `
      <span class="combat-time">${event.time}</span>
      <i data-lucide="${icon}"></i>
      <span class="combat-desc">${event.text}</span>
    `;
    
    combatFeed.prepend(row);
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    if (combatFeed.children.length > 8) {
      combatFeed.removeChild(combatFeed.lastChild);
    }
  }

  simulatedCombatEvents.slice(0, 4).forEach(addCombatEvent);

  let roundTimeSeconds = 74;
  let scoreLeft = 12;
  let scoreRight = 9;

  setInterval(() => {
    if (roundTimeSeconds > 0) {
      roundTimeSeconds--;
      const min = Math.floor(roundTimeSeconds / 60);
      const sec = roundTimeSeconds % 60;
      liveRoundTimer.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

      if (roundTimeSeconds % 18 === 0) {
        const randEvent = simulatedCombatEvents[Math.floor(Math.random() * simulatedCombatEvents.length)];
        randEvent.time = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        addCombatEvent(randEvent);
      }
    } else {
      const apxWon = Math.random() > 0.55;
      if (apxWon) {
        scoreLeft++;
        liveScoreLeft.textContent = scoreLeft;
        addCombatEvent({ type: 'death', text: 'APX Chronos clutches - APX claims Haven!', time: '00:00' });
      } else {
        scoreRight++;
        liveScoreRight.textContent = scoreRight;
        addCombatEvent({ type: 'defuse', text: 'FNC Boaster defuses spike - FNC claims Haven!', time: '00:00' });
      }

      if (scoreLeft >= 13 || scoreRight >= 13) {
        scoreLeft = 0;
        scoreRight = 0;
        liveScoreLeft.textContent = scoreLeft;
        liveScoreRight.textContent = scoreRight;
      }

      roundTimeSeconds = 100;
    }
  }, 1000);

  /* --------------------------------------------------------------------------
     8. Dashboard Match Ticker simulator
     -------------------------------------------------------------------------- */
  const dashMatchTicker = document.getElementById('dashboard-match-ticker');
  const mockTickerData = [
    { team1: 'Sentinels', team2: 'G2 Esports', game: 'VALORANT', score: '1 - 1', status: 'Map 3 In Progress' },
    { team1: 'FaZe Clan', team2: 'Natus Vincere', game: 'CS2', score: '2 - 0', status: 'MATCH COMPLETED' },
    { team1: 'Apex Predators', team2: 'Fnatic', game: 'VALORANT', score: '12 - 9', status: 'LIVE / Haven' },
    { team1: 'T1', team2: 'Gen.G', game: 'LoL', score: '0 - 1', status: 'LIVE / Game 2' }
  ];

  function renderDashboardTicker() {
    dashMatchTicker.innerHTML = '';
    mockTickerData.forEach((m) => {
      const isLive = m.status.includes('LIVE');
      const item = document.createElement('div');
      item.className = 'match-ticker-item';
      item.innerHTML = `
        <div class="ticker-teams">
          <span>${m.team1}</span>
          <span class="ticker-vs">vs</span>
          <span>${m.team2}</span>
        </div>
        <span class="ticker-game">${m.game}</span>
        <div class="ticker-status">
          <strong class="color-white">${m.score}</strong>
          ${isLive 
            ? `<span class="live-tag"><span class="pulsing-red-dot" style="margin-right:2px;"></span> ${m.status}</span>` 
            : `<span class="status-badge upcoming" style="padding:2px 8px;">${m.status}</span>`}
        </div>
      `;
      dashMatchTicker.appendChild(item);
    });
  }
  renderDashboardTicker();

  setInterval(() => {
    mockTickerData[0].score = Math.random() > 0.5 ? '1 - 2' : '2 - 1';
    renderDashboardTicker();
  }, 8000);

  /* --------------------------------------------------------------------------
     9. Interactive Tournament Bracket Highlights
     -------------------------------------------------------------------------- */
  const teamSlots = document.querySelectorAll('.team-slot');
  const championName = document.getElementById('bracket-champion-name');

  teamSlots.forEach((slot) => {
    const teamId = slot.getAttribute('data-team');

    slot.addEventListener('mouseenter', () => {
      document.querySelectorAll(`[data-team="${teamId}"]`).forEach((cell) => {
        cell.classList.add('highlight-path');
      });
    });

    slot.addEventListener('mouseleave', () => {
      document.querySelectorAll(`[data-team="${teamId}"]`).forEach((cell) => {
        cell.classList.remove('highlight-path');
      });
    });

    slot.addEventListener('click', () => {
      if (teamId) {
        inspectRoster(teamId);
        document.getElementById('teams-players').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const championGlowCard = document.querySelector('.champion-glow-card');
  championGlowCard.addEventListener('click', () => {
    championName.textContent = 'APEX PREDATORS';
    championName.classList.add('color-gold');
    championName.style.textShadow = 'var(--glow-gold)';
  });

  /* --------------------------------------------------------------------------
     10. Timeline progress setup
     -------------------------------------------------------------------------- */
  const timelineProgress = document.getElementById('timeline-progress');
  const timelineNodes = document.querySelectorAll('.timeline-node');

  timelineNodes.forEach((node) => {
    node.addEventListener('click', () => {
      const progVal = node.getAttribute('data-progress');
      timelineProgress.style.width = `${progVal}%`;

      timelineNodes.forEach((n) => n.classList.remove('active'));
      node.classList.add('active');
    });
  });

  /* --------------------------------------------------------------------------
     11. Player Roster Dossiers & Custom SVG Radar performance charts
     -------------------------------------------------------------------------- */
  const rosterData = {
    apex: {
      teamName: 'Apex Predators',
      color: '#00F5FF',
      players: [
        { name: 'Chronos', role: 'Duelist (Entry)', kda: '1.45', hs: '32.1%', fav: 'Jett', stats: [95, 90, 92, 75, 60] },
        { name: 'ViperX', role: 'Flex / Initiator', kda: '1.24', hs: '28.4%', fav: 'Gekko', stats: [82, 85, 80, 88, 84] },
        { name: 'Sparky', role: 'Controller (IGL)', kda: '1.08', hs: '22.9%', fav: 'Omen', stats: [75, 80, 78, 82, 92] },
        { name: 'SentinelOne', role: 'Sentinel', kda: '1.12', hs: '26.8%', fav: 'Killjoy', stats: [72, 75, 74, 80, 95] },
        { name: 'Reaper', role: 'Duelist / Flex', kda: '1.18', hs: '29.2%', fav: 'Raze', stats: [88, 82, 85, 85, 68] }
      ]
    },
    fnatic: {
      teamName: 'Fnatic',
      color: '#FF007A',
      players: [
        { name: 'Boaster', role: 'Controller (IGL)', kda: '1.09', hs: '21.4%', fav: 'Omen', stats: [78, 92, 80, 88, 94] },
        { name: 'Derke', role: 'Duelist', kda: '1.38', hs: '34.5%', fav: 'Iso', stats: [94, 88, 92, 70, 55] },
        { name: 'Leo', role: 'Initiator', kda: '1.28', hs: '28.9%', fav: 'Sova', stats: [85, 84, 86, 90, 92] },
        { name: 'Alfajer', role: 'Sentinel', kda: '1.32', hs: '31.2%', fav: 'Cypher', stats: [92, 82, 88, 82, 85] },
        { name: 'Chronicle', role: 'Flex', kda: '1.21', hs: '27.4%', fav: 'Breach', stats: [86, 86, 85, 95, 88] }
      ]
    },
    cloud9: {
      teamName: 'Cloud9',
      color: '#3B82F6',
      players: [
        { name: 'Xeppaa', role: 'Initiator', kda: '1.14', hs: '25.6%', fav: 'Fade', stats: [82, 84, 82, 85, 80] },
        { name: 'OXY', role: 'Duelist', kda: '1.42', hs: '33.8%', fav: 'Neon', stats: [96, 86, 94, 65, 50] },
        { name: 'Vanity', role: 'Controller (IGL)', kda: '0.98', hs: '20.1%', fav: 'Astra', stats: [72, 88, 75, 82, 90] },
        { name: 'Moose', role: 'Sentinel', kda: '1.05', hs: '24.2%', fav: 'Cypher', stats: [80, 75, 78, 78, 88] },
        { name: 'Runi', role: 'Initiator / Flex', kda: '1.10', hs: '26.0%', fav: 'Sova', stats: [78, 80, 80, 84, 85] }
      ]
    }
  };

  const btnInspectTeams = document.querySelectorAll('.btn-inspect-team');
  const rosterViewContainer = document.getElementById('roster-view-container');
  const inspectTeamTitle = document.getElementById('inspect-team-title');
  const inspectPlayersGrid = document.getElementById('inspect-players-grid');
  const closeRosterBtn = document.getElementById('close-roster-btn');

  btnInspectTeams.forEach((btn) => {
    btn.addEventListener('click', () => {
      const teamKey = btn.getAttribute('data-team');
      inspectRoster(teamKey);
    });
  });

  function inspectRoster(teamKey) {
    const data = rosterData[teamKey];
    if (!data) return;

    inspectTeamTitle.textContent = data.teamName;
    inspectTeamTitle.style.color = data.color;
    inspectTeamTitle.style.textShadow = `0 0 10px ${data.color}50`;
    
    inspectPlayersGrid.innerHTML = '';

    data.players.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'player-card glass-panel';
      
      const points = [];
      const angles = [-Math.PI / 2, -Math.PI / 10, Math.PI * 0.3, Math.PI * 0.7, -Math.PI * 0.7];
      
      p.stats.forEach((val, index) => {
        const radius = (val / 100) * 40;
        const x = 65 + radius * Math.cos(angles[index]);
        const y = 65 + radius * Math.sin(angles[index]);
        points.push(`${x},${y}`);
      });

      const polygonPoints = points.join(' ');

      card.innerHTML = `
        <div class="card-glow-border"></div>
        <div class="player-card-inner">
          <div class="player-card-header">
            <div class="player-avatar">
              <i data-lucide="shield" style="color: ${data.color};"></i>
            </div>
            <div class="player-title-info">
              <h4>${p.name}</h4>
              <span class="player-role-tag" style="color: ${data.color};">${p.role}</span>
            </div>
          </div>
          
          <div class="player-stats-summary">
            <div class="p-stat-box">
              <span class="val color-green">${p.kda}</span>
              <span class="lbl">KDA Ratio</span>
            </div>
            <div class="p-stat-box">
              <span class="val color-cyan">${p.hs}</span>
              <span class="lbl">Headshot %</span>
            </div>
          </div>

          <div class="performance-radar-container">
            <svg class="radar-svg" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="40" class="radar-grid-line" />
              <circle cx="65" cy="65" r="28" class="radar-grid-line" />
              <circle cx="65" cy="65" r="16" class="radar-grid-line" />
              
              ${angles.map(ang => `
                <line x1="65" y1="65" x2="${65 + 40 * Math.cos(ang)}" y2="${65 + 40 * Math.sin(ang)}" class="radar-axis-line" />
              `).join('')}
              
              <polygon points="${polygonPoints}" class="radar-poly-area" style="fill: ${data.color}20; stroke: ${data.color};" />
              
              <text x="65" y="15" class="radar-label-text">AIM</text>
              <text x="115" y="55" class="radar-label-text">PLAY</text>
              <text x="95" y="115" class="radar-label-text">MECH</text>
              <text x="35" y="115" class="radar-label-text">VERS</text>
              <text x="15" y="55" class="radar-label-text">SUPP</text>
            </svg>
          </div>

          <div class="player-fav-agent">
            <span>Signature:</span>
            <strong>${p.fav}</strong>
          </div>
        </div>
      `;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const angleX = (yc - y) / 15;
        const angleY = (x - xc) / 15;
        card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0) rotateY(0)';
      });

      inspectPlayersGrid.appendChild(card);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    rosterViewContainer.style.display = 'block';
  }

  closeRosterBtn.addEventListener('click', () => {
    rosterViewContainer.style.display = 'none';
  });

  /* --------------------------------------------------------------------------
     12. Leaderboard Tabs Sort / Filtering
     -------------------------------------------------------------------------- */
  const tabBtnTeams = document.getElementById('leaderboard-tab-teams');
  const tabBtnPlayers = document.getElementById('leaderboard-tab-players');
  const tableHeaders = document.getElementById('leaderboard-headers');
  const tableBody = document.getElementById('leaderboard-body');

  const mockLeaderboardTeams = [
    { rank: 1, name: 'Apex Predators', tag: 'APX', points: 380, won: 18, lost: 2, kd: '1.42', status: 'QUALIFIED', colorClass: 'green' },
    { rank: 2, name: 'Fnatic', tag: 'FNC', points: 340, won: 16, lost: 4, kd: '1.30', status: 'QUALIFIED', colorClass: 'green' },
    { rank: 3, name: 'Team Liquid', tag: 'TL', points: 290, won: 14, lost: 6, kd: '1.18', status: 'ACTIVE', colorClass: 'cyan' },
    { rank: 4, name: 'Cloud9', tag: 'C9', points: 270, won: 13, lost: 7, kd: '1.24', status: 'ACTIVE', colorClass: 'cyan' },
    { rank: 5, name: 'G2 Esports', tag: 'G2', points: 210, won: 10, lost: 10, kd: '1.02', status: 'ACTIVE', colorClass: 'cyan' },
    { rank: 6, name: 'FaZe Clan', tag: 'FAZE', points: 180, won: 8, lost: 12, kd: '0.94', status: 'ELIMINATED', colorClass: 'pink' }
  ];

  const mockLeaderboardPlayers = [
    { rank: 1, name: 'OXY', team: 'Cloud9', tag: 'C9', points: 282, won: 242, lost: 140, kd: '1.72', status: 'GODLIKE', colorClass: 'green' },
    { rank: 2, name: 'Chronos', team: 'Apex Predators', tag: 'APX', points: 274, won: 220, lost: 132, kd: '1.66', status: 'GODLIKE', colorClass: 'green' },
    { rank: 3, name: 'Derke', team: 'Fnatic', tag: 'FNC', points: 260, won: 212, lost: 142, kd: '1.49', status: 'DOMINATING', colorClass: 'cyan' },
    { rank: 4, name: 'Leo', team: 'Fnatic', tag: 'FNC', points: 245, won: 180, lost: 125, kd: '1.44', status: 'DOMINATING', colorClass: 'cyan' },
    { rank: 5, name: 'ViperX', team: 'Apex Predators', tag: 'APX', points: 210, won: 165, lost: 130, kd: '1.26', status: 'ACTIVE', colorClass: 'cyan' }
  ];

  function renderLeaderboard(isTeams) {
    tableBody.innerHTML = '';
    
    if (isTeams) {
      tableHeaders.innerHTML = `
        <th>Rank</th>
        <th>Squad</th>
        <th>Points</th>
        <th>Matches Won</th>
        <th>Matches Lost</th>
        <th>K/D Ratio</th>
        <th>Performance Status</th>
      `;
      
      mockLeaderboardTeams.forEach((t) => {
        const tr = document.createElement('tr');
        if (t.rank === 1) tr.className = 'leaderboard-row-top1';
        else if (t.rank === 2) tr.className = 'leaderboard-row-top2';
        else if (t.rank === 3) tr.className = 'leaderboard-row-top3';

        const rankGlow = t.rank === 1 ? 'rank-gold-glow' : t.rank === 2 ? 'rank-silver-glow' : t.rank === 3 ? 'rank-bronze-glow' : '';

        tr.innerHTML = `
          <td class="rank-display-cell ${rankGlow}">#${t.rank}</td>
          <td>
            <div class="team-cell">
              <div class="team-mini-badge">${t.tag}</div>
              <span>${t.name}</span>
            </div>
          </td>
          <td class="font-bold">${t.points}</td>
          <td>${t.won}</td>
          <td>${t.lost}</td>
          <td class="color-cyan">${t.kd}</td>
          <td>
            <span class="status-indicator">
              <span class="status-dot ${t.colorClass}"></span> ${t.status}
            </span>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    } else {
      tableHeaders.innerHTML = `
        <th>Rank</th>
        <th>Player</th>
        <th>Combat Rating</th>
        <th>Total Kills</th>
        <th>Total Deaths</th>
        <th>K/D Ratio</th>
        <th>Tier Class</th>
      `;

      mockLeaderboardPlayers.forEach((p) => {
        const tr = document.createElement('tr');
        if (p.rank === 1) tr.className = 'leaderboard-row-top1';
        else if (p.rank === 2) tr.className = 'leaderboard-row-top2';
        else if (p.rank === 3) tr.className = 'leaderboard-row-top3';

        const rankGlow = p.rank === 1 ? 'rank-gold-glow' : p.rank === 2 ? 'rank-silver-glow' : p.rank === 3 ? 'rank-bronze-glow' : '';

        tr.innerHTML = `
          <td class="rank-display-cell ${rankGlow}">#${p.rank}</td>
          <td>
            <div class="team-cell">
              <div class="team-mini-badge" style="border-color: var(--neon-purple);">${p.tag}</div>
              <div>
                <strong>${p.name}</strong>
                <div style="font-size: 0.75rem; color: var(--muted-gray);">${p.team}</div>
              </div>
            </div>
          </td>
          <td class="font-bold color-cyan">${p.points}</td>
          <td>${p.won}</td>
          <td>${p.lost}</td>
          <td class="color-pink">${p.kd}</td>
          <td>
            <span class="status-indicator">
              <span class="status-dot ${p.colorClass}"></span> ${p.status}
            </span>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }
  }

  renderLeaderboard(true);

  tabBtnTeams.addEventListener('click', () => {
    tabBtnTeams.classList.add('active');
    tabBtnPlayers.classList.remove('active');
    renderLeaderboard(true);
  });

  tabBtnPlayers.addEventListener('click', () => {
    tabBtnPlayers.classList.add('active');
    tabBtnTeams.classList.remove('active');
    renderLeaderboard(false);
  });

  /* --------------------------------------------------------------------------
     13. Fan Zone - Simulated Chat feed & Reactions
     -------------------------------------------------------------------------- */
  const chatMessagesBox = document.getElementById('chat-messages-box');
  const chatInputField = document.getElementById('chat-input-field');
  const chatSendBtnEl = document.getElementById('chat-send-btn-el');

  const randomChatHandles = ['CyberSlayer', 'FNC_Fanboy', 'VandalKing', 'TacticalMage', 'NeonBreeze', 'BoomerGamer', 'ClutchGamer', 'SpikeDiff'];
  const randomChatTexts = [
    'OMGGGG Apex Predators are literally cooking Haven right now!',
    'Boaster clutched that 1v3, what a literal genius.',
    'Is anyone streaming this on Discord too? Lag is high.',
    'CHRONOS IS AN ABSOLUTE BEAST!',
    'Can Fnatic still make a comeback? Maps choice is Sunset next.',
    'That utility setup on A site defense was perfect.',
    'ViperX initiator lineup is crazy lol.',
    'BH platform is so slick, clean UI FrontFusion!'
  ];

  function addChatMessage(sender, text, isSelf = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-message-bubble ${isSelf ? 'chat-msg-self' : ''}`;
    
    const isFnc = sender.includes('FNC');
    const senderColorClass = isFnc ? 'fnc-sender' : '';

    bubble.innerHTML = `
      <div class="chat-msg-sender ${senderColorClass}">
        ${sender} 
        ${isSelf ? '<span class="sender-tag">CAPTAIN</span>' : ''}
      </div>
      <div class="chat-msg-text">${text}</div>
    `;

    chatMessagesBox.appendChild(bubble);
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;

    if (chatMessagesBox.children.length > 25) {
      chatMessagesBox.removeChild(chatMessagesBox.firstChild);
    }
  }

  addChatMessage('VandalKing', 'Lets go APX!!!');
  addChatMessage('FNC_Fanboy', 'EMEA REPRESENT Boaster take my energy!');
  addChatMessage('CyberSlayer', 'Insane production value here.');

  setInterval(() => {
    const randSender = randomChatHandles[Math.floor(Math.random() * randomChatHandles.length)];
    const randText = randomChatTexts[Math.floor(Math.random() * randomChatTexts.length)];
    addChatMessage(randSender, randText);
  }, 4500);

  function triggerSendMessage() {
    const text = chatInputField.value.trim();
    if (!text) return;

    addChatMessage('Spectator_Self', text, true);
    chatInputField.value = '';

    setTimeout(() => {
      addChatMessage('TacticalMage', 'Agreed, Spectator_Self! Absolute clutch plays.', false);
    }, 1200);
  }

  chatSendBtnEl.addEventListener('click', triggerSendMessage);
  chatInputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      triggerSendMessage();
    }
  });

  const emojiBtns = document.querySelectorAll('.emoji-btn');
  emojiBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const badge = btn.querySelector('.badge');
      let count = parseInt(badge.textContent);
      badge.textContent = count + 1;
      
      btn.style.borderColor = '#00F5FF';
      btn.style.boxShadow = 'var(--glow-cyan)';
      setTimeout(() => {
        btn.style.borderColor = 'var(--border-card)';
        btn.style.boxShadow = 'none';
      }, 500);
    });
  });

  const pollOptionRows = document.querySelectorAll('.poll-option-row');
  const pollApxPct = document.getElementById('poll-apx-pct');
  const pollFncPct = document.getElementById('poll-fnc-pct');
  const pollApxBar = document.getElementById('poll-apx-bar');
  const pollFncBar = document.getElementById('poll-fnc-bar');
  const totalPollVotes = document.getElementById('total-poll-votes');

  let apxVotes = 9904;
  let fncVotes = 8438;

  pollOptionRows.forEach((row) => {
    row.addEventListener('click', () => {
      const opt = row.getAttribute('data-option');
      if (opt === 'apx') {
        apxVotes++;
      } else {
        fncVotes++;
      }

      const total = apxVotes + fncVotes;
      totalPollVotes.textContent = total.toLocaleString();

      const apxPct = Math.round((apxVotes / total) * 100);
      const fncPct = 100 - apxPct;

      pollApxPct.textContent = `${apxPct}%`;
      pollFncPct.textContent = `${fncPct}%`;

      pollApxBar.style.width = `${apxPct}%`;
      pollFncBar.style.width = `${fncPct}%`;

      row.style.borderColor = '#00F5FF';
      setTimeout(() => {
        row.style.borderColor = 'var(--border-card)';
      }, 600);
    });
  });

  /* --------------------------------------------------------------------------
     14. Team Registration Form Wizards with file preview
     -------------------------------------------------------------------------- */
  const dropzone = document.getElementById('logo-dropzone');
  const fileInput = document.getElementById('reg-logo');
  const previewBox = document.getElementById('logo-preview-box');
  const previewImg = document.getElementById('logo-preview-img');
  const previewName = document.getElementById('logo-preview-name');
  const removeLogoBtn = document.getElementById('remove-logo-btn');

  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#remove-logo-btn') || e.target.closest('#logo-preview-box')) return;
    fileInput.click();
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      handleUploadedLogo(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length) {
      handleUploadedLogo(fileInput.files[0]);
    }
  });

  function handleUploadedLogo(file) {
    if (!file.type.startsWith('image/')) {
      alert('Emblem file must be an image format!');
      return;
    }
    
    previewName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewBox.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  removeLogoBtn.addEventListener('click', () => {
    fileInput.value = '';
    previewImg.src = '';
    previewBox.classList.add('hidden');
  });

  const submitRegistrationBtn = document.getElementById('submit-registration-btn');
  const regForm = document.getElementById('registration-wizard');
  const successModal = document.getElementById('success-modal');
  const successTeamDisplay = document.getElementById('success-team-display');
  const closeSuccessBtn = document.getElementById('close-success-btn');

  submitRegistrationBtn.addEventListener('click', () => {
    const teamNameInput = document.getElementById('reg-team-name');
    const captainInput = document.getElementById('reg-captain');
    const emailInput = document.getElementById('reg-email');
    const gameSelect = document.getElementById('reg-game');
    const regionSelect = document.getElementById('reg-region');

    if (!teamNameInput.value || !captainInput.value || !emailInput.value || !gameSelect.value || !regionSelect.value) {
      regForm.reportValidity();
      return;
    }

    submitRegistrationBtn.disabled = true;
    submitRegistrationBtn.querySelector('.btn-text').textContent = 'Connecting neural link...';

    setTimeout(() => {
      successTeamDisplay.textContent = teamNameInput.value.toUpperCase();
      successModal.classList.add('active');

      regForm.reset();
      previewBox.classList.add('hidden');
      submitRegistrationBtn.disabled = false;
      submitRegistrationBtn.querySelector('.btn-text').textContent = 'Submit Squad Dossier';
    }, 1800);
  });

  closeSuccessBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
  });

});