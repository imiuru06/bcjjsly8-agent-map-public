(() => {
  const loops = [
    ['Sense', '입력·상태를 수집'],
    ['Prioritize', '결정·주의를 정리'],
    ['Act', '대체 실행으로 연결'],
    ['Verify', '증거·헬스를 확인'],
    ['Learn', '지식·개선으로 누적'],
  ];

  const pageConfig = {
    'daily-brief.html': {
      title: 'Message Daily Brief',
      step: 'Prioritize',
      purpose: '카카오/메시지 입력을 원문 없이 오늘의 결정 후보, 할 일, 검증 가능한 다음 action으로 압축합니다.',
      evidence: './runtime/kakao-insight-input-brief.md',
      chip: 'public-safe message summary',
    },
    'kakao-analysis.html': {
      title: 'Kakao Public Analysis',
      step: 'Sense',
      purpose: '비공개 원문은 숨기고 공개 가능한 카카오 분석 집계와 안전 경계를 Agent Map 입력층으로 노출합니다.',
      evidence: './runtime/kakao-public-analysis.json',
      chip: 'raw message hidden',
    },
    'external-trends.html': {
      title: 'External Trends',
      step: 'Sense',
      purpose: '기술·경제 등 외부 동향을 수집해 개인 에이전트가 판단·기술정의·아이디어로 연결할 수 있게 합니다.',
      evidence: './runtime/external-info-input-snapshot.json',
      chip: 'trend input route',
    },
    'knowledge-map.html': {
      title: 'Knowledge Map',
      step: 'Learn',
      purpose: 'Obsidian-compatible atomic notes, Graphify 산출물, retrieval pilot을 연결해 지식이 버려지지 않게 합니다.',
      evidence: './runtime/knowledge-vault-summary.json',
      chip: 'atomic vault index',
    },
    'knowledge-retrieval.html': {
      title: 'Knowledge Retrieval Pilot',
      step: 'Learn',
      purpose: '무거운 RAG/MCP 전 단계로 공개 안전 증거 검색 가능성과 검색 ROI를 확인합니다.',
      evidence: './runtime/knowledge-retrieval-index.json',
      chip: 'retrieval baseline',
    },
    'llm-wiki-readiness.html': {
      title: 'LLM-Wiki Readiness',
      step: 'Verify',
      purpose: '캡처 마찰, 검색 ROI, 지식 복리 루프 관점에서 RAG/MCP 확장 준비도를 평가합니다.',
      evidence: './runtime/llm-wiki-readiness.json',
      chip: 'readiness gate',
    },
    'ops-environment-audit.html': {
      title: 'Ops Environment Audit',
      step: 'Verify',
      purpose: '결과물 데이터가 아니라 런타임·CLI 에이전트, 세션, 스케줄, 큐, 인프라 연결 상태를 점검합니다.',
      evidence: './runtime/ops-environment-audit.json',
      chip: 'execution-plane audit',
    },
    'infrastructure-map.html': {
      title: 'Infrastructure Map',
      step: 'Verify',
      purpose: 'DB, 메모리, 라우터, 허브, API key, 클라우드 리소스 연결 상태를 구조적으로 가시화합니다.',
      evidence: './runtime/infrastructure-live.json',
      chip: 'live infra topology',
    },
  };

  const currentScript = document.currentScript;
  const scriptSrc = currentScript?.getAttribute('src') || './assets/stitch-service-shell.js';
  const assetBase = scriptSrc.includes('/') ? scriptSrc.replace(/[^/]*$/, '') : './assets/';
  const pageName = location.pathname.split('/').pop() || 'index.html';
  const config = pageConfig[pageName] || {
    title: document.title || 'Agent Map Service',
    step: 'Verify',
    purpose: 'Agent Map 서비스 표면을 Life Agent OS의 입력·실행·검증·학습 루프 안에서 해석합니다.',
    evidence: './agent-map-v10.html',
    chip: 'agent-map surface',
  };

  if (document.querySelector('[data-stitch-service-shell-banner]')) return;

  if (!document.querySelector('link[data-stitch-service-shell]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${assetBase}stitch-service-shell.css`;
    link.dataset.stitchServiceShell = 'true';
    document.head.appendChild(link);
  }

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const loopMarkup = loops.map(([name, help]) => `
    <div class="stitch-shell-banner__step" ${name === config.step ? 'aria-current="step"' : ''}>
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(help)}</span>
    </div>
  `).join('');

  const banner = document.createElement('aside');
  banner.className = 'stitch-shell-banner';
  banner.dataset.stitchServiceShellBanner = 'true';
  banner.setAttribute('aria-label', 'Life Agent OS service context');
  banner.innerHTML = `
    <div class="stitch-shell-banner__top">
      <div>
        <p class="stitch-shell-banner__eyebrow">Life Agent OS · Stitch-aligned service surface</p>
        <h1 class="stitch-shell-banner__title">${escapeHtml(config.title)}</h1>
        <p class="stitch-shell-banner__purpose">${escapeHtml(config.purpose)}</p>
      </div>
      <nav class="stitch-shell-banner__nav" aria-label="service navigation">
        <a href="./agent-map-v10.html">Agent Map v10</a>
        <a href="./agent-map-life.html">Life Graph</a>
        <a href="./service-usage-guide.html">Usage Guide</a>
        <a href="${escapeHtml(config.evidence)}">Runtime Evidence</a>
      </nav>
    </div>
    <div class="stitch-shell-banner__chips" aria-label="surface attributes">
      <span class="stitch-shell-banner__chip" data-tone="safe">${escapeHtml(config.chip)}</span>
      <span class="stitch-shell-banner__chip">active loop: ${escapeHtml(config.step)}</span>
      <span class="stitch-shell-banner__chip" data-tone="safe">bright/mobile/overflow-safe</span>
      <span class="stitch-shell-banner__chip" data-tone="warn">raw private data excluded</span>
    </div>
    <div class="stitch-shell-banner__loop" aria-label="Agent Map operating loop">${loopMarkup}</div>
  `;

  document.documentElement.dataset.stitchServiceShell = 'active';
  document.body.classList.add('stitch-service-shell');
  document.body.dataset.stitchServicePage = pageName.replace(/\.html$/u, '');
  document.body.prepend(banner);
})();
