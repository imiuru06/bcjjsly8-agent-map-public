// Cloudflare Pages advanced-mode Worker for Agent Map live read models.
//
// Safety contract:
// - GET-only.
// - Read-only.
// - Public-safe summaries only.
// - Secret values, raw provider payloads, raw Kakao messages, private endpoints,
//   mutations, deploys, closes, publishes, uploads, and payments are never exposed.

const DEFAULT_REPO = 'imiuru06/bcjjsly8';
const DEFAULT_PUBLIC_MIRROR_BASE_URL = 'https://imiuru06.github.io/bcjjsly8-agent-map-public';
const PRIVATE_RUNTIME_DENY = new Set([
  '/runtime/capture-inbox.json',
  '/runtime/capture-to-note-promotions.json',
  '/runtime/knowledge-search-events.jsonl',
]);

const PUBLIC_MIRROR_RUNTIME_FIRST = new Set([
  'kakao-insight-input-snapshot',
  'kakao-information-bounded-actions',
  'kakao-public-analysis',
]);

const EXTERNAL_INFO_SOURCES = [
  { id: 'hacker_news', name: 'Hacker News', topic: 'technology', url: 'https://news.ycombinator.com/rss' },
  { id: 'github_blog', name: 'GitHub Blog', topic: 'software_platform', url: 'https://github.blog/feed/' },
  { id: 'cloudflare_blog', name: 'Cloudflare Blog', topic: 'cloud_infrastructure', url: 'https://blog.cloudflare.com/rss/' },
  { id: 'openai_news', name: 'OpenAI News', topic: 'ai', url: 'https://openai.com/news/rss.xml' },
  { id: 'federal_reserve', name: 'Federal Reserve Press Releases', topic: 'economy_policy', url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
  { id: 'ecb_press', name: 'European Central Bank Press', topic: 'monetary_policy', url: 'https://www.ecb.europa.eu/rss/press.html' },
  { id: 'sec_press', name: 'SEC Press Releases', topic: 'market_regulation', url: 'https://www.sec.gov/news/pressreleases.rss' },
];

const STATIC_RUNTIME_FILES = {
  'agent-map': 'agent-map-runtime.json',
  'life-graph': 'life-process-graph.json',
  'infrastructure-map': 'infrastructure-map.json',
  'infrastructure-inventory': 'infrastructure-inventory.json',
  'infrastructure-live': 'infrastructure-live.json',
  'decision-queue': 'decision-queue.json',
  'decision-digest': 'decision-digest.json',
  'session-agent-health': 'session-agent-health.json',
  'kakao-insight-input-snapshot': 'kakao-insight-input-snapshot.json',
  'github-info-input-snapshot': 'github-info-input-snapshot.json',
  'external-info-input-snapshot': 'external-info-input-snapshot.json',
  'kakao-information-bounded-actions': 'kakao-information-bounded-actions.json',
  'kakao-public-analysis': 'kakao-public-analysis.json',
  'knowledge-vault-summary': 'knowledge-vault-summary.json',
  'retrieval-service-health': 'retrieval-service-health.json',
  'llm-wiki-readiness': 'llm-wiki-readiness.json',
  'improvement-suggestions': 'improvement-suggestions.json',
  'improvement-knowledge-map': 'improvement-knowledge-map.json',
  'improvement-execution-plan': 'improvement-execution-plan.json',
  'ralf-loop-report': 'ralf-loop-report.json',
  'ralph-role-drive-report': 'ralph-role-drive-report.json',
  'agent-manifest-summary': 'agent-manifest-summary.json',
  'agent-system-interface-assessment': 'agent-system-interface-assessment.json',
  'service-usage-guide': 'service-usage-guide.json',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== 'GET') {
      return json({ status: 'error', message: 'method_not_allowed' }, 405, {
        Allow: 'GET',
      });
    }

    if (PRIVATE_RUNTIME_DENY.has(url.pathname)) {
      return notFound(request, env, 'private_runtime_path_not_public');
    }

    try {
      if (url.pathname === '/api/health') return handleHealth(request, env);
      if (url.pathname.startsWith('/api/runtime/')) return handleRuntime(request, env, url);
    } catch (error) {
      return json({
        status: 'error',
        message: 'live_api_failed_safe',
        reason: String(error?.message || error),
        safety: safety(),
      }, 500);
    }

    if (env?.ASSETS?.fetch) return env.ASSETS.fetch(request);
    return json({ status: 'error', message: 'assets_binding_missing' }, 404);
  },
};

async function handleHealth(request, env) {
  const registryUrl = env.AGENT_MAP_REGISTRY_URL || env.REGISTRY_URL || null;
  const githubRepo = env.GITHUB_REPO || DEFAULT_REPO;
  return json({
    status: 'ok',
    service: 'agent-map-live-api',
    generatedAt: new Date().toISOString(),
    endpoints: Object.keys(STATIC_RUNTIME_FILES).map((name) => `/api/runtime/${name}`),
    sources: {
      registry: {
        configured: Boolean(registryUrl),
        liveEligible: Boolean(registryUrl && !isLocalUrl(registryUrl)),
      },
      github: {
        repo: githubRepo,
        tokenConfigured: Boolean(env.GITHUB_TOKEN),
        publicRestFallback: true,
      },
      assets: {
        configured: Boolean(env?.ASSETS?.fetch),
        role: 'static fallback/cache for public-safe artifacts',
      },
      publicMirror: {
        configured: env.DISABLE_PUBLIC_MIRROR_RUNTIME !== '1',
        baseUrl: publicUrl(env.PUBLIC_MIRROR_BASE_URL || DEFAULT_PUBLIC_MIRROR_BASE_URL),
        role: 'fresh public-safe Kakao runtime artifact fallback while GitHub Actions is blocked',
      },
    },
    safety: safety({ privateRawDataIncluded: false }),
  }, 200, { 'Cache-Control': 'no-store' });
}

async function handleRuntime(request, env, url) {
  const name = decodeURIComponent(url.pathname.replace('/api/runtime/', '').replace(/\/$/, ''));
  if (!STATIC_RUNTIME_FILES[name]) {
    return json({ status: 'error', message: 'unknown_runtime_read_model', name }, 404);
  }

  if (name === 'agent-map') return liveAgentMap(request, env);
  if (name === 'life-graph') return liveLifeGraph(request, env);
  if (name === 'decision-queue') return liveDecisionQueue(request, env);
  if (name === 'decision-digest') return liveDecisionDigest(request, env);
  if (name === 'github-info-input-snapshot') return liveGithubInfoInput(request, env);
  if (name === 'external-info-input-snapshot') return liveExternalInfoInput(request, env);
  if (name === 'infrastructure-live') return liveInfrastructureProviders(request, env);
  if (name === 'improvement-suggestions') return liveImprovementSuggestions(request, env);
  if (name === 'improvement-execution-plan') return liveImprovementExecutionPlan(request, env);
  if (name === 'ralph-role-drive-report') return liveRalphRoleDrive(request, env);
  if (name === 'ralf-loop-report') return liveRalfLoop(request, env);
  if (name === 'agent-system-interface-assessment') return liveAgentSystemInterface(request, env);
  if (name === 'infrastructure-map') return assetRuntime(request, env, name, {
    mode: 'asset_fallback_with_live_api_boundary',
    liveCapable: false,
    reason: 'public infrastructure topology is generated/redacted at build time; provider liveness is served separately',
  });
  if (name === 'session-agent-health') return liveSessionHealth(request, env);

  return assetRuntime(request, env, name, {
    mode: 'asset_fallback',
    liveCapable: false,
    reason: 'this artifact is intentionally build/cache based for privacy, cost, or heavy processing reasons',
  });
}

async function liveAgentMap(request, env) {
  const registryUrl = env.AGENT_MAP_REGISTRY_URL || env.REGISTRY_URL || null;
  if (registryUrl && !isLocalUrl(registryUrl)) {
    try {
      const registry = await fetchJson(`${trimSlash(registryUrl)}/agents`, {
        accept: 'application/json',
      });
      const agents = normalizeRegistryAgents(registry.agents);
      return json({
        generatedAt: new Date().toISOString(),
        source: {
          mode: 'live_registry',
          registryUrl: publicUrl(registryUrl),
          updatedAt: registry.updatedAt || registry.generatedAt || null,
          rawAgentCount: rawRegistryCount(registry.agents),
          includedAgentCount: agents.length,
          excludedPatterns: ['smoke_*'],
        },
        agents,
        liveData: {
          mode: 'live',
          source: 'registry',
          fallbackUsed: false,
        },
        safety: safety(),
      });
    } catch (error) {
      return derivedAgentMapFromGithub(request, env, {
        registryUrl,
        registryFallbackReason: `registry_unavailable: ${String(error?.message || error)}`,
      });
    }
  }

  return derivedAgentMapFromGithub(request, env, {
    registryUrl,
    registryFallbackReason: registryUrl ? 'local_registry_not_reachable_from_cloudflare_worker' : 'registry_url_not_configured',
  });
}

async function derivedAgentMapFromGithub(request, env, { registryUrl, registryFallbackReason }) {
  const asset = await loadAssetJson(request, env, STATIC_RUNTIME_FILES['agent-map']);
  const github = await readGithubIssues(env, { state: 'all' });
  if (!github.ok) {
    return json(withLiveData(asset, {
      mode: 'asset_fallback',
      liveCapable: true,
      fallbackReason: `${registryFallbackReason}; ${github.reason}`,
    }));
  }

  const agents = mergeAssetAgentsWithIssueSignals(asset.agents, github.issues, github.repo);
  const openIssues = github.issues.filter((issue) => issue.state === 'open');
  return json(withLiveData({
    ...asset,
    generatedAt: new Date().toISOString(),
    source: {
      mode: 'derived_github_issues',
      registryUrl: registryUrl ? publicUrl(registryUrl) : null,
      registryFallbackReason,
      githubRepo: github.repo,
      githubIssuesUrl: `https://github.com/${github.repo}/issues`,
      updatedAt: newestIssueUpdatedAt(github.issues),
      rawAgentCount: agents.length,
      includedAgentCount: agents.length,
      excludedAgentCount: 0,
      excludedPatterns: ['smoke_*'],
      issueCounts: {
        total: github.issues.length,
        open: openIssues.length,
        closed: github.issues.filter((issue) => issue.state === 'closed').length,
        needsHuman: openIssues.filter((issue) => labels(issue).includes('needs:human')).length,
        needsAgent: openIssues.filter((issue) => labels(issue).includes('needs:agent')).length,
      },
      note: 'Registry is not reachable from Cloudflare, so this public-safe read model is derived live from GitHub Issues labels and timestamps.',
    },
    agents,
  }, {
    mode: 'live_derived',
    source: 'github_issues_rest',
    fallbackUsed: true,
    registryFallbackReason,
  }));
}

async function liveLifeGraph(request, env) {
  const asset = await loadAssetJson(request, env, STATIC_RUNTIME_FILES['life-graph']);
  const github = await readGithubIssues(env, { state: 'all' });
  if (!github.ok) {
    return json(withLiveData(asset, {
      mode: 'asset_fallback',
      liveCapable: true,
      fallbackReason: github.reason,
    }));
  }

  const openIssues = github.issues.filter((issue) => issue.state === 'open');
  const actionNodes = openIssues.map((issue) => makeIssueActionNode(issue));
  const actionLinks = actionNodes.map((node) => ({
    from: node.id,
    to: node.visualGroup === 'content-growth' ? 'content_planner' : node.visualGroup === 'core' ? 'life-core' : 'github_issue_router',
    type: node.labels.includes('needs:human') ? 'requires_decision' : 'updates',
    label: node.nextAction,
  }));

  return json(withLiveData({
    ...asset,
    generatedAt: new Date().toISOString(),
    currentness: {
      source: 'github-issues-rest-live',
      sourceRepo: github.repo,
      sourceProject: `https://github.com/${github.repo}/issues`,
      lastVerifiedAt: new Date().toISOString(),
      totalIssues: github.issues.length,
      openIssues: openIssues.length,
      closedIssues: github.issues.filter((issue) => issue.state === 'closed').length,
      reviewItems: openIssues.filter((issue) => labels(issue).includes('review')).length,
      needsHuman: openIssues.filter((issue) => labels(issue).includes('needs:human')).length,
      needsAgent: openIssues.filter((issue) => labels(issue).includes('needs:agent')).length,
      note: 'Live public-safe read model from GitHub Issues REST. Project v2 column status remains build/cache unless a tokenized backend is configured.',
    },
    actionNodes,
    actionLinks,
  }, {
    mode: 'live',
    source: 'github_issues_rest',
    fallbackUsed: false,
  }));
}

async function liveDecisionQueue(request, env) {
  const github = await readGithubIssues(env, { state: 'open' });
  if (!github.ok) {
    return assetRuntime(request, env, 'decision-queue', {
      mode: 'asset_fallback',
      liveCapable: true,
      fallbackReason: github.reason,
    });
  }

  const items = github.issues
    .filter((issue) => labels(issue).includes('needs:human'))
    .map((issue) => ({
      issue: issue.number,
      title: issue.title,
      domain: domainForIssue(issue),
      status: 'needs_human',
      owner: labels(issue).filter((label) => label.startsWith('owner:')),
      decisionNeeded: decisionNeededForIssue(issue),
      sourceUrl: issue.html_url,
      labels: labels(issue).filter((label) => /^(phase|kind|priority|needs|agent|owner|gate|decision):/.test(label)),
      updatedAt: issue.updated_at,
    }));

  return json({
    generatedAt: new Date().toISOString(),
    source: 'github-issues-rest-live',
    repo: github.repo,
    summary: {
      totalItems: items.length,
      totalNeedsHuman: items.length,
      defaultSafeAction: 'summarize and request user decision',
    },
    items,
    liveData: {
      mode: 'live',
      source: 'github_issues_rest',
      fallbackUsed: false,
    },
    safety: safety({ decisionsExecuted: false }),
  });
}

async function liveDecisionDigest(request, env) {
  const queue = await runtimePayload('decision-queue', () => liveDecisionQueue(request, env));
  if (!queue.ok) {
    return assetRuntime(request, env, 'decision-digest', {
      mode: 'asset_fallback',
      liveCapable: true,
      fallbackReason: queue.error || 'decision_queue_unavailable',
    });
  }

  const digest = buildDecisionDigest(queue.payload, {
    source: queue.payload?.source || queue.name,
  });
  return json({
    ...digest,
    generatedAt: new Date().toISOString(),
    liveData: {
      mode: queue.payload?.liveData?.mode === 'live' ? 'live_derived' : 'asset_fallback_derived',
      source: queue.payload?.liveData?.source || 'decision_queue',
      fallbackUsed: queue.payload?.liveData?.fallbackUsed === true || queue.payload?.liveData?.mode !== 'live',
    },
  }, 200, { 'Cache-Control': 'no-store' });
}

function buildDecisionDigest(queue, options = {}) {
  const items = decisionQueueItems(queue)
    .map(normalizeDecisionItem)
    .filter((item) => item.status === 'needs_human' || item.status === 'Needs Human');
  const groups = groupDecisionItems(items);
  const priorityCounts = countBy(items, decisionPriority);
  const decisionKindCounts = countBy(items, decisionKind);
  const batches = groups.map((group) => ({
    id: `decision-batch-${group.domain}`,
    domain: group.domain,
    count: group.count,
    priorityHint: group.decisions.some((item) => decisionPriority(item) === 'P1') ? 'P1' : 'P2',
    issues: group.decisions.map((item) => item.issue).filter(Number.isFinite),
    titles: group.decisions.map((item) => ({ issue: item.issue, title: item.title })),
    recommendedQuestion: `For ${group.domain}, decide each listed issue as approve, reject, snooze, or delegate.`,
  }));

  return {
    schemaVersion: 1,
    checkedAt: new Date().toISOString(),
    status: 'ok',
    command: 'npm run decision:digest',
    source: options.source || queue?.source || 'decision-queue',
    summary: {
      totalItems: items.length,
      totalNeedsHuman: items.length,
      included: items.length,
      omitted: 0,
      domains: groups.length,
      batches: batches.length,
      priorityCounts,
      decisionKindCounts,
      defaultSafeAction: queue?.summary?.defaultSafeAction || 'summarize and request user decision',
    },
    groups,
    batches,
    recommendedBatchPrompt: 'Review the grouped decisions and answer with approved / rejected / blocked / needs-more-context per issue number.',
    safety: safety({
      decisionsExecuted: false,
      comments: false,
      labels: false,
      close: false,
      merge: false,
      deploy: false,
      publish: false,
      upload: false,
      rawPrivateDataIncluded: false,
    }),
  };
}

function decisionQueueItems(queue) {
  return queue?.items || queue?.decisions || queue?.queue || [];
}

function normalizeDecisionItem(item) {
  return {
    issue: Number(item.issue),
    title: item.title || `Issue #${item.issue}`,
    domain: item.domain || 'uncategorized',
    status: item.status || 'needs_human',
    owner: item.owner || [],
    decisionNeeded: item.decisionNeeded || item.decision || item.summary || 'Decision needed.',
    sourceUrl: item.sourceUrl || item.url || null,
    labels: Array.isArray(item.labels) ? item.labels : [],
    updatedAt: item.updatedAt || null,
  };
}

function groupDecisionItems(items) {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.domain)) groups.set(item.domain, []);
    groups.get(item.domain).push(item);
  }
  return [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([domain, decisions]) => ({ domain, count: decisions.length, decisions }));
}

function countBy(items, selector) {
  return items.reduce((acc, item) => {
    const key = selector(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function decisionPriority(item) {
  if (item.labels.includes('priority:P1')) return 'P1';
  if (item.labels.includes('priority:P2')) return 'P2';
  if (item.labels.includes('priority:P3')) return 'P3';
  return 'unprioritized';
}

function decisionKind(item) {
  if (item.labels.includes('needs:secret')) return 'secret_or_access';
  if (item.labels.includes('needs:approval') || item.labels.some((label) => label.startsWith('gate:') || label.startsWith('decision:'))) return 'approval_gate';
  if (item.labels.includes('priority:P1')) return 'incident_or_blocker';
  return 'human_review';
}

async function liveGithubInfoInput(request, env) {
  const github = await readGithubIssues(env, { state: 'open' });
  if (!github.ok) {
    return assetRuntime(request, env, 'github-info-input-snapshot', {
      mode: 'asset_fallback',
      liveCapable: true,
      fallbackReason: github.reason,
    });
  }

  const issues = github.issues
    .map((issue) => {
      const issueLabels = labels(issue).sort();
      const updatedAgeHours = hoursSince(issue.updated_at);
      return {
        number: issue.number,
        title: issue.title || `Issue #${issue.number}`,
        url: issue.html_url,
        updatedAt: issue.updated_at,
        updatedAgeHours,
        domain: domainForGithubInfoIssue(issue, issueLabels),
        labels: issueLabels.filter((label) => /^(agent|phase|kind|priority|needs|owner|gate|decision):/.test(label)),
        signals: {
          needsHuman: issueLabels.includes('needs:human'),
          needsAgent: issueLabels.includes('needs:agent'),
          hasOwnerUser: issueLabels.includes('owner:user'),
          hasOwnerCodex: issueLabels.includes('owner:codex'),
          isRecent: updatedAgeHours !== null && updatedAgeHours <= 72,
          isStale: updatedAgeHours !== null && updatedAgeHours > 14 * 24,
        },
      };
    })
    .sort((a, b) => {
      const aTime = Date.parse(a.updatedAt || '') || 0;
      const bTime = Date.parse(b.updatedAt || '') || 0;
      return bTime - aTime || a.number - b.number;
    });

  const allLabels = issues.flatMap((issue) => issue.labels);
  return json({
    schemaVersion: 1,
    sourceId: 'github_issues_project_operational_signals',
    sourceType: 'public_safe_github_issue_metadata',
    sourceRepo: github.repo,
    source: {
      mode: 'github-issues-rest-live',
      issuesUrl: `https://github.com/${github.repo}/issues`,
      recentWindowHours: 72,
      staleWindowDays: 14,
    },
    collectedAt: new Date().toISOString(),
    freshness: {
      status: 'current',
      newestIssueUpdatedAt: issues[0]?.updatedAt || null,
      newestIssueAgeHours: issues[0]?.updatedAgeHours ?? null,
    },
    summary: {
      openIssues: issues.length,
      needsHuman: issues.filter((issue) => issue.signals.needsHuman).length,
      needsAgent: issues.filter((issue) => issue.signals.needsAgent).length,
      ownerUser: issues.filter((issue) => issue.signals.hasOwnerUser).length,
      ownerCodex: issues.filter((issue) => issue.signals.hasOwnerCodex).length,
      recentlyUpdated: issues.filter((issue) => issue.signals.isRecent).length,
      stale: issues.filter((issue) => issue.signals.isStale).length,
      routeableAgentWork: issues.filter((issue) => issue.signals.needsAgent && !issue.signals.needsHuman).length,
      decisionGates: issues.filter((issue) => issue.signals.needsHuman).length,
    },
    counts: {
      byDomain: countLabelsOrValues(issues.map((issue) => issue.domain)),
      byAgent: countLabelsOrValues(allLabels.filter((label) => label.startsWith('agent:'))),
      byPhase: countLabelsOrValues(allLabels.filter((label) => label.startsWith('phase:'))),
      byKind: countLabelsOrValues(allLabels.filter((label) => label.startsWith('kind:'))),
      byPriority: countLabelsOrValues(allLabels.filter((label) => label.startsWith('priority:'))),
    },
    issueSignals: issues.slice(0, 40),
    privacy: {
      issueBodiesIncluded: false,
      issueCommentsIncluded: false,
      pullRequestDiffsIncluded: false,
      secretValuesIncluded: false,
      privateRawDataIncluded: false,
    },
    liveData: {
      mode: 'live',
      source: 'github_issues_rest',
      fallbackUsed: false,
    },
    safety: safety({ privateRawDataIncluded: false }),
  }, 200, { 'Cache-Control': 'no-store' });
}

async function liveExternalInfoInput(request, env) {
  if (env.DISABLE_EXTERNAL_INFO_LIVE === '1') {
    return assetRuntime(request, env, 'external-info-input-snapshot', {
      mode: 'asset_fallback',
      liveCapable: true,
      fallbackReason: 'external_info_live_disabled',
    });
  }

  try {
    const results = await Promise.allSettled(EXTERNAL_INFO_SOURCES.map((source) => fetchExternalFeedSource(source)));
    const sourceHealth = [];
    const items = [];
    for (const [index, result] of results.entries()) {
      const source = EXTERNAL_INFO_SOURCES[index];
      if (result.status === 'fulfilled') {
        sourceHealth.push(result.value.sourceHealth);
        items.push(...result.value.items);
      } else {
        sourceHealth.push({
          sourceId: source.id,
          sourceName: source.name,
          topic: source.topic,
          status: 'error',
          itemCount: 0,
          reason: String(result.reason?.message || result.reason),
        });
      }
    }
    const publicSignals = dedupeExternalSignals(items)
      .sort((a, b) => {
        const aTime = Date.parse(a.publishedAt || '') || 0;
        const bTime = Date.parse(b.publishedAt || '') || 0;
        return bTime - aTime || a.sourceId.localeCompare(b.sourceId) || a.title.localeCompare(b.title);
      })
      .slice(0, 80)
      .map(enrichExternalSignal);
    if (!sourceHealth.some((source) => source.status === 'ok') || !publicSignals.length) {
      return assetRuntime(request, env, 'external-info-input-snapshot', {
        mode: 'asset_fallback',
        liveCapable: true,
        fallbackReason: 'external_info_live_sources_unavailable_or_empty',
      });
    }

    const snapshotBase = {
      schemaVersion: 1,
      sourceId: 'external_public_tech_economy_signals',
      sourceType: 'public_rss_atom_metadata',
      collectedAt: new Date().toISOString(),
      sourceConfig: {
        sourceCount: EXTERNAL_INFO_SOURCES.length,
        recentWindowHours: 168,
        maxItemsPerSource: 8,
        maxTotalItems: 80,
      },
      freshness: {
        status: 'current',
        newestItemPublishedAt: publicSignals[0]?.publishedAt || null,
        newestItemAgeHours: publicSignals[0]?.ageHours ?? null,
      },
      summary: {
        sourcesOk: sourceHealth.filter((source) => source.status === 'ok').length,
        sourcesError: sourceHealth.filter((source) => source.status !== 'ok').length,
        totalSignals: publicSignals.length,
        recentSignals: publicSignals.filter((item) => item.ageHours !== null && item.ageHours <= 168).length,
        technologySignals: publicSignals.filter((item) => ['technology', 'software_platform', 'cloud_infrastructure', 'ai'].includes(item.topic)).length,
        economySignals: publicSignals.filter((item) => ['economy_policy', 'monetary_policy', 'market_regulation'].includes(item.topic)).length,
        highImportanceSignals: publicSignals.filter((item) => item.importance === 'high').length,
        mediumImportanceSignals: publicSignals.filter((item) => item.importance === 'medium').length,
      },
      counts: {
        bySource: countLabelsOrValues(publicSignals.map((item) => item.sourceId)),
        byTopic: countLabelsOrValues(publicSignals.map((item) => item.topic)),
        byTag: countLabelsOrValues(publicSignals.flatMap((item) => item.tags || [])),
        byHost: countLabelsOrValues(publicSignals.map((item) => item.linkHost)),
      },
      sourceHealth,
      publicSignals,
      privacy: {
        publicFeedsOnly: true,
        fullArticleBodiesIncluded: false,
        feedDescriptionsIncluded: false,
        commentsIncluded: false,
        privateDataIncluded: false,
        secretValuesIncluded: false,
        paywalledContentFetched: false,
      },
      liveData: {
        mode: 'live',
        source: 'public_rss_atom_feeds',
        fallbackUsed: false,
      },
      safety: safety(),
    };
    snapshotBase.briefing = buildExternalBriefing(snapshotBase);
    return json(snapshotBase, 200, { 'Cache-Control': 'no-store' });
  } catch (error) {
    return assetRuntime(request, env, 'external-info-input-snapshot', {
      mode: 'asset_fallback',
      liveCapable: true,
      fallbackReason: `external_info_live_failed: ${String(error?.message || error)}`,
    });
  }
}

async function liveInfrastructureProviders(request, env) {
  const registryUrl = env.AGENT_MAP_REGISTRY_URL || env.REGISTRY_URL || null;
  const githubRepo = env.GITHUB_REPO || DEFAULT_REPO;
  const providers = [
    {
      provider: 'github',
      label: 'GitHub Issues REST',
      visibility: 'public',
      status: 'partial',
      discoveryState: 'live_rest_public_or_token',
      configuration: env.GITHUB_TOKEN ? 'token_configured' : 'public_rest_fallback',
      resourceKinds: ['issues', 'labels', 'decision_queue'],
      counts: {},
    },
    {
      provider: 'agent_map_registry',
      label: 'Agent Map Registry',
      visibility: 'public',
      status: registryUrl && !isLocalUrl(registryUrl) ? 'configured_unverified' : 'not_configured',
      discoveryState: registryUrl ? 'configured' : 'missing_url',
      configuration: registryUrl ? publicUrl(registryUrl) : 'AGENT_MAP_REGISTRY_URL missing',
      resourceKinds: ['agents', 'heartbeat'],
      counts: {},
    },
    {
      provider: 'n8n',
      label: 'n8n',
      visibility: 'public',
      status: env.N8N_BASE_URL ? 'configured_unverified' : 'not_configured',
      discoveryState: env.N8N_BASE_URL ? 'base_url_present' : 'missing_url',
      configuration: env.N8N_API_KEY ? 'api_key_configured_redacted' : 'api_key_missing_or_not_bound',
      resourceKinds: ['workflows'],
      counts: {},
    },
    {
      provider: 'cloudflare',
      label: 'Cloudflare Pages',
      visibility: 'public',
      status: 'connected',
      discoveryState: 'serving_this_worker',
      configuration: 'worker_runtime',
      resourceKinds: ['pages', 'worker', 'assets'],
      counts: {},
    },
  ];

  const github = await readGithubIssues(env, { state: 'open' });
  if (github.ok) {
    const provider = providers.find((item) => item.provider === 'github');
    provider.status = 'connected';
    provider.counts = {
      openIssues: github.issues.length,
      needsHuman: github.issues.filter((issue) => labels(issue).includes('needs:human')).length,
      needsAgent: github.issues.filter((issue) => labels(issue).includes('needs:agent')).length,
    };
  }

  return json({
    generatedAt: new Date().toISOString(),
    source: 'agent-map-live-api',
    repo: githubRepo,
    offline: false,
    providers,
    counts: summarizeProviders(providers),
    liveData: {
      mode: 'live',
      source: 'worker_env_and_public_rest',
      fallbackUsed: false,
    },
    safety: safety(),
  });
}

async function liveSessionHealth(request, env) {
  const registryUrl = env.AGENT_MAP_REGISTRY_URL || env.REGISTRY_URL || null;
  if (registryUrl && !isLocalUrl(registryUrl)) {
    try {
      const registry = await fetchJson(`${trimSlash(registryUrl)}/agents`, {
        accept: 'application/json',
      });
      const agents = normalizeRegistryAgents(registry.agents).map((agent) => ({
        id: agent.id,
        status: agent.heartbeat?.status || 'unknown',
        lastSeen: agent.heartbeat?.lastSeen || null,
        source: 'registry',
      }));
      return json({
        generatedAt: new Date().toISOString(),
        source: 'live_registry',
        summary: {
          confirmedSessions: agents.length,
          rolePoolsUnconfirmed: 0,
          activeClaims: 0,
          staleClaims: 0,
        },
        agents,
        liveData: {
          mode: 'live',
          source: 'registry',
          fallbackUsed: false,
        },
        safety: safety(),
      });
    } catch (error) {
      return derivedSessionHealthFromGithub(request, env, {
        registryUrl,
        registryFallbackReason: `registry_unavailable: ${String(error?.message || error)}`,
      });
    }
  }

  return derivedSessionHealthFromGithub(request, env, {
    registryUrl,
    registryFallbackReason: registryUrl ? 'local_registry_not_reachable_from_cloudflare_worker' : 'registry_url_not_configured',
  });
}

async function derivedSessionHealthFromGithub(request, env, { registryUrl, registryFallbackReason }) {
  const asset = await loadAssetJson(request, env, STATIC_RUNTIME_FILES['session-agent-health']);
  const github = await readGithubIssues(env, { state: 'all' });
  if (!github.ok) {
    return json(withLiveData(asset, {
      mode: 'asset_fallback',
      liveCapable: true,
      fallbackReason: `${registryFallbackReason}; ${github.reason}`,
    }));
  }

  const agents = mergeAssetAgentsWithIssueSignals(asset.agents, github.issues, github.repo).map((agent) => ({
    id: agent.id,
    status: agent.heartbeat?.status || 'unknown',
    lastSeen: agent.heartbeat?.lastSeen || null,
    source: agent.heartbeat?.source || 'github_issues_rest',
    issueSignal: agent.issueSignal || null,
  }));
  return json({
    generatedAt: new Date().toISOString(),
    source: 'github-issues-rest-derived',
    registry: {
      configured: Boolean(registryUrl),
      fallbackReason: registryFallbackReason,
    },
    summary: {
      confirmedSessions: agents.length,
      rolePoolsUnconfirmed: 0,
      activeClaims: agents.filter((agent) => agent.status === 'needs_agent').length,
      staleClaims: agents.filter((agent) => agent.status === 'needs_human').length,
    },
    agents,
    liveData: {
      mode: 'live_derived',
      source: 'github_issues_rest',
      fallbackUsed: true,
      registryFallbackReason,
    },
    safety: safety(),
  });
}

async function assetRuntime(request, env, name, liveData) {
  if (PUBLIC_MIRROR_RUNTIME_FIRST.has(name)) {
    const mirror = await loadPublicMirrorJson(env, STATIC_RUNTIME_FILES[name]);
    if (mirror.ok) {
      return json(withLiveData(mirror.payload, {
        mode: 'public_mirror',
        source: 'github_pages_public_mirror',
        fallbackUsed: false,
        mirrorUrl: mirror.url,
        originalMode: liveData?.mode || null,
        reason: 'Kakao public artifacts are refreshed by the mirror publisher when Cloudflare/GitHub deploys lag.',
      }));
    }
    liveData = {
      ...liveData,
      publicMirrorFallbackAttempted: true,
      publicMirrorFallbackReason: mirror.reason,
    };
  }
  const payload = await loadAssetJson(request, env, STATIC_RUNTIME_FILES[name]);
  return json(withLiveData(payload, liveData));
}

async function liveImprovementSuggestions(request, env) {
  const sources = await Promise.all([
    runtimePayload('decision-queue', () => liveDecisionQueue(request, env)),
    runtimePayload('decision-digest', () => liveDecisionDigest(request, env)),
    runtimePayload('life-graph', () => liveLifeGraph(request, env)),
    runtimePayload('github-info-input-snapshot', () => liveGithubInfoInput(request, env)),
    runtimePayload('external-info-input-snapshot', () => liveExternalInfoInput(request, env)),
    runtimePayload('infrastructure-live', () => liveInfrastructureProviders(request, env)),
    runtimePayload('session-agent-health', () => liveSessionHealth(request, env)),
    runtimeAssetPayload('llm-wiki-readiness', request, env, STATIC_RUNTIME_FILES['llm-wiki-readiness']),
  ]);
  const byName = Object.fromEntries(sources.map((source) => [source.name, source]));
  const suggestions = buildImprovementSuggestions({
    decision: byName['decision-queue']?.payload || {},
    decisionDigest: byName['decision-digest']?.payload || {},
    life: byName['life-graph']?.payload || {},
    githubInfo: byName['github-info-input-snapshot']?.payload || {},
    externalInfo: byName['external-info-input-snapshot']?.payload || {},
    infraLive: byName['infrastructure-live']?.payload || {},
    sessionHealth: byName['session-agent-health']?.payload || {},
    llmWiki: byName['llm-wiki-readiness']?.payload || {},
  });
  return json({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'Improvement Governor live runtime synthesis',
    status: suggestions.length ? 'suggestions_available' : 'no_suggestions',
    summary: summarizeImprovementSuggestions(suggestions),
    suggestions,
    sourceStatus: sources.map((source) => ({
      name: source.name,
      ok: source.ok,
      mode: source.payload?.liveData?.mode || source.mode || null,
      error: source.error || null,
    })),
    liveData: {
      mode: 'live_derived',
      source: 'cloudflare_worker_runtime_synthesis',
      fallbackUsed: sources.some((source) => !source.ok || source.mode === 'asset'),
    },
    safety: safety({ privateRawDataIncluded: false }),
  }, 200, { 'Cache-Control': 'no-store' });
}

async function liveImprovementExecutionPlan(request, env) {
  const asset = await loadAssetJson(request, env, STATIC_RUNTIME_FILES['improvement-execution-plan']);
  const suggestions = await runtimePayload('improvement-suggestions', () => liveImprovementSuggestions(request, env));
  if (!suggestions.ok) {
    return json(withLiveData(asset, {
      mode: 'asset_fallback',
      liveCapable: true,
      fallbackReason: suggestions.error || 'improvement_suggestions_unavailable',
    }));
  }

  const sourceSuggestions = Array.isArray(suggestions.payload?.suggestions) ? suggestions.payload.suggestions : [];
  const actions = sourceSuggestions.map((item, index) => ({
    id: `execute-${item.id}`,
    sourceSuggestionId: item.id,
    priority: item.priority || 'P2',
    title: item.title,
    category: item.category || 'workflow',
    mode: index === 0 ? 'now' : 'next',
    owner: item.suggestedOwner || 'codex',
    rationale: item.rationale,
    expectedVisibleDelta: item.expectedVisibleDelta,
    evidence: item.evidence || [],
    sourceUrls: item.sourceUrls || [],
    verification: item.verification,
    residualRisk: item.residualRisk,
  }));
  const primary = actions[0] || null;

  return json(withLiveData({
    ...asset,
    generatedAt: new Date().toISOString(),
    checkedAt: new Date().toISOString(),
    status: actions.length ? 'ok' : 'idle_no_actions',
    command: 'improvement:plan:live',
    source: 'Improvement Governor live suggestions',
    strategicDirection: {
      ...(asset.strategicDirection || {}),
      oneLine: primary
        ? 'Prefer runtime evidence, live-derived surfaces, and replacement progress over page-only growth.'
        : 'No live improvement action is currently suggested.',
    },
    summary: {
      ...(asset.summary || {}),
      actions: actions.length,
      p1Actions: actions.filter((item) => item.priority === 'P1').length,
      nowActions: primary ? 1 : 0,
      nextActions: Math.max(0, actions.length - (primary ? 1 : 0)),
      primaryAction: primary?.id || null,
      primaryDirection: primary?.title || null,
      domainPromotionCandidate: detectDomainPromotionCandidate(sourceSuggestions),
    },
    actions,
    safety: safety({
      publicSafeOnly: true,
      closeMergeDeployPublish: false,
      realWorldAutonomyClaimed: false,
    }),
  }, {
    mode: 'live_derived',
    source: 'improvement_suggestions_live',
    fallbackUsed: suggestions.payload?.liveData?.fallbackUsed === true,
  }), 200, { 'Cache-Control': 'no-store' });
}

async function liveRalphRoleDrive(request, env) {
  const asset = await loadAssetJson(request, env, STATIC_RUNTIME_FILES['ralph-role-drive-report']);
  const github = await readGithubIssues(env, { state: 'open' });
  if (!github.ok) {
    return json(withLiveData(asset, {
      mode: 'asset_fallback',
      liveCapable: true,
      fallbackReason: github.reason,
    }));
  }

  const driveItems = deriveRoleDriveFromIssues(github.issues, asset.driveItems || []);
  const mustAct = driveItems.filter((item) => item.status === 'must_act');
  const reviewOnly = driveItems.filter((item) => item.mode === 'review_gate' || item.mode === 'optional_review');
  const needsAgentOpenIssues = github.issues.filter((issue) => labels(issue).includes('needs:agent')).length;
  const needsHumanOpenIssues = github.issues.filter((issue) => labels(issue).includes('needs:human')).length;
  const staleOpenIssues = github.issues.filter((issue) => isIssueStale(issue)).length;

  return json(withLiveData({
    ...asset,
    generatedAt: new Date().toISOString(),
    status: 'ok',
    purpose: asset.purpose || 'Drive agent roles from live GitHub Issue signals into evidence-producing execution.',
    summary: {
      ...(asset.summary || {}),
      totalRoles: driveItems.length,
      mustActRoles: mustAct.length,
      reviewOnlyRoles: reviewOnly.length,
      attentionAgents: mustAct.length,
      needsAgentOpenIssues,
      needsHumanOpenIssues,
      staleOpenIssues,
      primaryAction: asset.summary?.primaryAction || 'live-issue-role-drive',
      sourceRepo: github.repo,
      newestIssueUpdatedAt: newestIssueUpdatedAt(github.issues),
    },
    topDirectives: mustAct.slice(0, 8),
    driveItems,
    warnings: [
      staleOpenIssues > 0 ? {
        code: 'stale_issue_pressure',
        count: staleOpenIssues,
        instruction: 'Prioritize stale issue reduction before page-only feature growth.',
      } : null,
      needsHumanOpenIssues > 0 ? {
        code: 'human_gate_pressure',
        count: needsHumanOpenIssues,
        instruction: 'Compress human questions into decision batches; do not bounce raw issue lists back to the user.',
      } : null,
    ].filter(Boolean),
    failures: [],
    safety: safety({ publicSafeOnly: true, closeMergeDeployPublish: false }),
  }, {
    mode: 'live_derived',
    source: 'github_issues_rest_role_drive',
    fallbackUsed: false,
  }), 200, { 'Cache-Control': 'no-store' });
}

async function liveRalfLoop(request, env) {
  const asset = await loadAssetJson(request, env, STATIC_RUNTIME_FILES['ralf-loop-report']);
  const [plan, life, decisionDigest, performance, roleDrive] = await Promise.all([
    runtimePayload('improvement-execution-plan', () => liveImprovementExecutionPlan(request, env)),
    runtimePayload('life-graph', () => liveLifeGraph(request, env)),
    runtimePayload('decision-digest', () => liveDecisionDigest(request, env)),
    runtimeAssetPayload('agent-performance-report', request, env, 'agent-performance-report.json'),
    runtimePayload('ralph-role-drive-report', () => liveRalphRoleDrive(request, env)),
  ]);
  const planPayload = plan.payload || {};
  const lifePayload = life.payload || {};
  const decisionPayload = decisionDigest.payload || {};
  const performancePayload = performance.payload || {};
  const rolePayload = roleDrive.payload || {};
  const primaryAction = planPayload.summary?.primaryAction || asset.focus?.primaryAction || null;

  return json(withLiveData({
    ...asset,
    generatedAt: new Date().toISOString(),
    status: primaryAction ? 'active' : 'idle_no_primary_action',
    focus: {
      ...(asset.focus || {}),
      primaryAction,
      primaryActionTitle: planPayload.summary?.primaryDirection || asset.focus?.primaryActionTitle || null,
      primaryPriority: (planPayload.actions || []).find((item) => item.id === primaryAction)?.priority || asset.focus?.primaryPriority || null,
      domainPromotionCandidate: planPayload.summary?.domainPromotionCandidate || lifePayload.lifeAgentization?.domainPromotionCandidates?.[0]?.id || null,
      strategicDirection: planPayload.strategicDirection?.oneLine || asset.focus?.strategicDirection || null,
    },
    metrics: {
      ...(asset.metrics || {}),
      improvementSuggestions: planPayload.summary?.actions ?? asset.metrics?.improvementSuggestions ?? 0,
      p1Actions: planPayload.summary?.p1Actions ?? 0,
      nowActions: planPayload.summary?.nowActions ?? 0,
      scopedReplacementPercent: lifePayload.lifeAgentization?.scopeReplacementPercent ?? 0,
      replacementReadyScopes: lifePayload.lifeAgentization?.replacementReadyScopes ?? 0,
      needsHuman: decisionPayload.summary?.totalNeedsHuman ?? 0,
      attentionAgents: rolePayload.summary?.attentionAgents ?? performancePayload.summary?.attentionAgents ?? 0,
      opsFindings: asset.metrics?.opsFindings ?? 0,
    },
    sourceStatus: [plan, life, decisionDigest, performance, roleDrive].map((source) => ({
      name: source.name,
      ok: source.ok,
      mode: source.payload?.liveData?.mode || source.mode || null,
      error: source.error || null,
    })),
    safety: safety({ publicSafeOnly: true, closeMergeDeployPublish: false }),
  }, {
    mode: 'live_derived',
    source: 'ralph_runtime_synthesis',
    fallbackUsed: [plan, life, decisionDigest, performance, roleDrive].some((source) => !source.ok || source.payload?.liveData?.fallbackUsed === true),
  }), 200, { 'Cache-Control': 'no-store' });
}

async function liveAgentSystemInterface(request, env) {
  const asset = await loadAssetJson(request, env, STATIC_RUNTIME_FILES['agent-system-interface-assessment']);
  const [roleDrive, sessionHealth, infraLive] = await Promise.all([
    runtimePayload('ralph-role-drive-report', () => liveRalphRoleDrive(request, env)),
    runtimePayload('session-agent-health', () => liveSessionHealth(request, env)),
    runtimePayload('infrastructure-live', () => liveInfrastructureProviders(request, env)),
  ]);
  const roleSummary = roleDrive.payload?.summary || {};
  const sessionSummary = sessionHealth.payload?.summary || {};
  const infraCounts = infraLive.payload?.counts || {};
  const liveScore = Math.max(0, Math.min(100, Math.round(
    Number(asset.score || 68)
    + (roleDrive.ok ? 4 : -4)
    + (sessionHealth.ok ? 3 : -3)
    + ((roleSummary.mustActRoles || 0) > 0 ? -2 : 2)
    + ((infraCounts.connected || 0) > 0 ? 2 : 0)
  )));

  return json(withLiveData({
    ...asset,
    generatedAt: new Date().toISOString(),
    status: liveScore >= 80 ? 'strong' : 'improving',
    score: liveScore,
    summary: {
      ...(asset.summary || {}),
      mustActRoles: roleSummary.mustActRoles ?? asset.summary?.mustActRoles ?? 0,
      needsHuman: roleSummary.needsHumanOpenIssues ?? asset.summary?.needsHuman ?? 0,
      staleOpenIssues: roleSummary.staleOpenIssues ?? asset.summary?.staleOpenIssues ?? 0,
      confirmedSessions: sessionSummary.confirmedSessions ?? asset.summary?.confirmedSessions ?? 0,
      activeClaims: sessionSummary.activeClaims ?? asset.summary?.activeClaims ?? 0,
      connectedProviders: infraCounts.connected ?? 0,
    },
    recommendations: [
      {
        priority: 'P1',
        title: 'Reduce fallback surfaces exposed in Runtime Confidence',
        action: 'Convert high-traffic fallback read models to live_derived before adding new pages.',
      },
      ...(Array.isArray(asset.recommendations) ? asset.recommendations.slice(0, 4) : []),
    ],
    sourceStatus: [roleDrive, sessionHealth, infraLive].map((source) => ({
      name: source.name,
      ok: source.ok,
      mode: source.payload?.liveData?.mode || source.mode || null,
      error: source.error || null,
    })),
    safety: safety({ publicSafeOnly: true, closeMergeDeployPublish: false }),
  }, {
    mode: 'live_derived',
    source: 'ralph_role_drive_session_health_infra_live',
    fallbackUsed: [roleDrive, sessionHealth, infraLive].some((source) => !source.ok || source.payload?.liveData?.fallbackUsed === true),
  }), 200, { 'Cache-Control': 'no-store' });
}

async function runtimePayload(name, producer) {
  try {
    const response = await producer();
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.message || `HTTP ${response.status}`);
    return { name, ok: true, payload, mode: payload?.liveData?.mode || null };
  } catch (error) {
    return { name, ok: false, payload: null, error: String(error?.message || error) };
  }
}

async function runtimeAssetPayload(name, request, env, runtimeFile) {
  try {
    const payload = await loadAssetJson(request, env, runtimeFile);
    return { name, ok: true, payload, mode: 'asset' };
  } catch (error) {
    return { name, ok: false, payload: null, mode: 'asset', error: String(error?.message || error) };
  }
}

function summarizeImprovementSuggestions(suggestions) {
  const categories = {};
  for (const item of suggestions) categories[item.category] = (categories[item.category] || 0) + 1;
  return {
    total: suggestions.length,
    p1: suggestions.filter((item) => item.priority === 'P1').length,
    p2: suggestions.filter((item) => item.priority === 'P2').length,
    p3: suggestions.filter((item) => item.priority === 'P3').length,
    categories,
  };
}

function buildImprovementSuggestions({ decision, decisionDigest, life, githubInfo, externalInfo, infraLive, sessionHealth, llmWiki }) {
  const suggestions = [];

  const decisionTotal = decision.summary?.totalItems ?? decision.summary?.totalNeedsHuman ?? githubInfo.summary?.needsHuman ?? 0;
  const decisionBatchCount = decisionDigest.summary?.batches || 0;
  if (decisionTotal > 0 || (githubInfo.summary?.needsHuman || 0) > 0) {
    const hasDigest = decisionBatchCount > 0;
    suggestions.push(improvementSuggestion({
      id: 'reduce-decision-bottleneck',
      priority: hasDigest ? 'P2' : (githubInfo.summary?.needsHuman || 0) >= 3 ? 'P1' : 'P2',
      category: 'workflow',
      title: hasDigest ? 'Needs Human 결정 묶음을 더 줄이고 자동 위임 후보를 분리' : 'Needs Human 항목을 결정 묶음으로 줄이기',
      rationale: `현재 needsHuman=${githubInfo.summary?.needsHuman ?? '-'}, decisionQueue=${decisionTotal}, decisionBatches=${decisionBatchCount}입니다.`,
      expectedVisibleDelta: hasDigest
        ? 'Agent Map v9에서 이미 batch 단위로 보이며, 다음 개선은 자동 위임/보류/승인 후보를 더 분리하는 것입니다.'
        : 'Agent Map v9/Decision Queue에서 사람 결정 항목이 더 적고 명확한 묶음으로 보입니다.',
      evidence: ['runtime/decision-digest.json', 'runtime/decision-queue.json', 'runtime/github-info-input-snapshot.json'],
      verification: 'npm run decision:digest:check && npm run decision:sync:check && npm run live:api:check',
      residualRisk: '실제 결정 자체는 사용자/Codex 책임이므로 자동 승인으로 대체하지 않습니다.',
      sourceUrls: ['./api/runtime/decision-digest', './api/runtime/decision-queue', './api/runtime/github-info-input-snapshot'],
    }));
  }

  const agentization = life.lifeAgentization || {};
  if ((agentization.domainReplacementPercent ?? 0) < 20) {
    suggestions.push(improvementSuggestion({
      id: 'raise-life-agentization-from-scoped-to-domain',
      priority: 'P1',
      category: 'agentization',
      title: '라이프 에이전트화를 scope 단위에서 domain 단위로 승격',
      rationale: `현재 domainReplacementPercent=${agentization.domainReplacementPercent ?? 0}%, scopeReplacementPercent=${agentization.scopeReplacementPercent ?? 0}%입니다.`,
      expectedVisibleDelta: 'Life Graph에서 replacement-ready domain이 0개가 아니라 최소 1개 이상으로 보입니다.',
      evidence: ['runtime/life-process-graph.json:lifeAgentization'],
      verification: 'npm run life:agentization && npm run life:check',
      residualRisk: '대체율을 올리려면 실제 입력 데이터와 반복 실행 evidence가 필요합니다.',
      sourceUrls: ['./api/runtime/life-graph', './agent-map-life.html'],
    }));
  }

  const readinessPercent = Number(llmWiki.score?.percent || 0);
  if (readinessPercent < 90 || (llmWiki.score?.globalCaps || []).length) {
    suggestions.push(improvementSuggestion({
      id: 'increase-llm-wiki-roi-evidence',
      priority: readinessPercent >= 80 ? 'P2' : 'P1',
      category: 'knowledge',
      title: 'LLM-Wiki 검색/재사용 ROI evidence 늘리기',
      rationale: `LLM-Wiki readiness=${readinessPercent}%이고 global cap이 남아 있습니다.`,
      expectedVisibleDelta: 'LLM-Wiki Readiness와 Knowledge Retrieval 페이지에서 ROI 샘플 수가 증가합니다.',
      evidence: ['runtime/llm-wiki-readiness.json', 'runtime/llm-wiki-search-roi.json'],
      verification: 'npm run llmwiki:assess && npm run knowledge:retrieval:check',
      residualRisk: '의미 있는 ROI는 실제 사용 이벤트가 쌓여야 하므로 단발성 샘플 생성만으로는 부족합니다.',
      sourceUrls: ['./llm-wiki-readiness.html', './knowledge-retrieval.html'],
    }));
  }

  if ((infraLive.counts?.notConfigured || 0) > 0) {
    suggestions.push(improvementSuggestion({
      id: 'make-infra-live-provider-status-actionable',
      priority: 'P2',
      category: 'infrastructure',
      title: '인프라 live provider not_configured 항목을 actionable하게 분리',
      rationale: `infrastructure-live notConfigured=${infraLive.counts?.notConfigured ?? 0}입니다.`,
      expectedVisibleDelta: 'Infrastructure Map에서 provider별 필요한 env/secret/권한이 더 명확히 보입니다.',
      evidence: ['runtime/infrastructure-live.json'],
      verification: 'npm run infra:check',
      residualRisk: 'secret 값은 공개하지 않고 env 이름/상태만 표시해야 합니다.',
      sourceUrls: ['./api/runtime/infrastructure-live', './infrastructure-map.html'],
    }));
  }

  if ((externalInfo.summary?.highImportanceSignals || 0) > 0 || (externalInfo.briefing?.prioritySignals || []).length) {
    suggestions.push(improvementSuggestion({
      id: 'turn-external-signals-into-daily-issue-brief',
      priority: 'P2',
      category: 'briefing',
      title: '외부 기술/경제 신호를 KST 일일 이슈 브리프로 승격',
      rationale: `external prioritySignals=${externalInfo.briefing?.prioritySignals?.length ?? 0}, high=${externalInfo.summary?.highImportanceSignals ?? 0}입니다.`,
      expectedVisibleDelta: '기본 페이지에 오늘/어제/최근 7일로 분리된 Daily Issue Brief 카드가 보입니다.',
      evidence: ['runtime/external-info-input-snapshot.json'],
      verification: 'npm run life:input:external && npm run deploy:briefing:check',
      residualRisk: '원문 본문을 수집하지 않는 안전 경계를 유지하므로 제목 기반 신호 해석임을 표시해야 합니다.',
      sourceUrls: ['./api/runtime/external-info-input-snapshot', './runtime/external-info-input-brief.md'],
    }));
  }

  if ((sessionHealth.summary?.staleClaims || 0) > 0 || (sessionHealth.summary?.rolePoolsUnconfirmed || 0) > 0) {
    suggestions.push(improvementSuggestion({
      id: 'stabilize-session-agent-identity-and-claims',
      priority: 'P2',
      category: 'collaboration',
      title: '세션 에이전트 claim/identity 상태를 자동 정리',
      rationale: `session staleClaims=${sessionHealth.summary?.staleClaims ?? '-'}, rolePoolsUnconfirmed=${sessionHealth.summary?.rolePoolsUnconfirmed ?? '-'}입니다.`,
      expectedVisibleDelta: 'Session Agent Health에서 stale/unconfirmed 값이 감소하고 active claim이 명확해집니다.',
      evidence: ['runtime/session-agent-health.json'],
      verification: 'npm run agent:connections && npm run agent:system:check',
      residualRisk: '외부 세션 에이전트는 이 repo 밖에 있으므로 직접 강제 실행은 제한됩니다.',
      sourceUrls: ['./api/runtime/session-agent-health'],
    }));
  }

  return suggestions.sort((a, b) => improvementPriorityRank(a.priority) - improvementPriorityRank(b.priority) || a.id.localeCompare(b.id));
}

function improvementSuggestion({
  id,
  priority = 'P2',
  category,
  title,
  rationale,
  expectedVisibleDelta,
  evidence,
  suggestedOwner = 'codex',
  verification,
  residualRisk,
  sourceUrls = [],
}) {
  return {
    id,
    priority,
    category,
    title,
    rationale,
    expectedVisibleDelta,
    evidence,
    suggestedOwner,
    verification,
    residualRisk,
    sourceUrls,
  };
}

function improvementPriorityRank(priority) {
  return { P1: 1, P2: 2, P3: 3 }[priority] || 9;
}

function detectDomainPromotionCandidate(suggestions) {
  const candidate = suggestions.find((item) => item.id === 'raise-life-agentization-from-scoped-to-domain');
  if (!candidate) return null;
  const text = `${candidate.rationale || ''} ${candidate.expectedVisibleDelta || ''}`.toLowerCase();
  if (text.includes('information')) return 'information';
  if (text.includes('content')) return 'content';
  return null;
}

function deriveRoleDriveFromIssues(issues, fallbackDriveItems = []) {
  const grouped = new Map();
  for (const issue of issues) {
    const issueLabels = labels(issue);
    const agents = issueLabels.filter((label) => label.startsWith('agent:')).map((label) => label.slice('agent:'.length));
    if (!agents.length && issueLabels.includes('needs:agent')) agents.push('codex');
    for (const agentId of agents) {
      if (!grouped.has(agentId)) grouped.set(agentId, []);
      grouped.get(agentId).push(issue);
    }
  }

  const liveItems = [...grouped.entries()].map(([agentId, agentIssues]) => {
    const needsAgent = agentIssues.filter((issue) => labels(issue).includes('needs:agent')).length;
    const needsHuman = agentIssues.filter((issue) => labels(issue).includes('needs:human')).length;
    const p1 = agentIssues.filter((issue) => labels(issue).includes('priority:P1')).length;
    const stale = agentIssues.filter(isIssueStale).length;
    const priority = p1 > 0 || needsAgent > 0 ? 'P1' : stale > 0 ? 'P2' : 'P3';
    const mode = roleDriveModeForAgent(agentId);
    const mustAct = needsAgent > 0 || p1 > 0 || stale > 0;
    return {
      agentId,
      displayName: displayNameForAgent(agentId),
      type: typeForAgent(agentId),
      mode,
      status: mustAct ? 'must_act' : mode === 'optional_review' ? 'optional_review' : 'monitor',
      priority,
      score: Math.max(35, 85 - needsAgent * 10 - stale * 4 - needsHuman * 2),
      pressure: {
        openIssues: agentIssues.length,
        needsAgentOpenIssues: needsAgent,
        needsHumanOpenIssues: needsHuman,
        p1OpenIssues: p1,
        staleOpenIssues: stale,
        latestUpdatedAt: newestIssueUpdatedAt(agentIssues),
      },
      ralphDirective: mustAct
        ? 'Run Analysis -> Ralph Plan -> Ralph Run on assigned/stale work, then leave issue/runtime evidence.'
        : 'Run lightweight status/health verification and stay available for review or routed work.',
      command: commandForLiveAgent(agentId, mode),
      verification: verificationForLiveAgent(agentId, mode),
      humanGate: needsHuman > 0 ? ['human decision/approval exists on one or more routed issues'] : [],
      sampleIssues: agentIssues.slice(0, 5).map((issue) => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        labels: labels(issue).filter((label) => /^(agent|needs|priority|phase|kind|owner):/.test(label)),
        updatedAt: issue.updated_at,
      })),
    };
  });

  if (liveItems.length) {
    return liveItems.sort((a, b) => roleDriveSortKey(a) - roleDriveSortKey(b) || a.agentId.localeCompare(b.agentId));
  }
  return fallbackDriveItems;
}

function roleDriveSortKey(item) {
  const priority = { P1: 1, P2: 2, P3: 3 }[item.priority] || 9;
  return priority * 1000 - (item.pressure?.needsAgentOpenIssues || 0) * 100 - (item.pressure?.staleOpenIssues || 0);
}

function roleDriveModeForAgent(agentId) {
  if (/claude|gemini|opencode|stitch|uiux|review/i.test(agentId)) return 'review_gate';
  if (/life|information|replacement|content/i.test(agentId)) return 'life_replacement_loop';
  if (/telegram|notifier|responder|intake|collector|analyzer|visualizer/i.test(agentId)) return 'runtime_execution';
  return 'queue_claim_or_status';
}

function typeForAgent(agentId) {
  if (/claude|gemini|opencode|stitch|uiux|review/i.test(agentId)) return 'reviewer-cli';
  if (/life|information|replacement|content/i.test(agentId)) return 'life-loop-agent';
  if (/telegram|notifier|responder|intake|collector|analyzer|visualizer/i.test(agentId)) return 'runtime-agent';
  return 'session-agent';
}

function displayNameForAgent(agentId) {
  return agentId
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ');
}

function commandForLiveAgent(agentId, mode) {
  if (agentId === 'life_information_loop') return 'npm run life:loop:check';
  if (agentId === 'telegram_issue_intake') return 'npm run agent:system:check';
  if (mode === 'review_gate') return `npm run agent:queue -- --agent ${agentId} --limit 3`;
  return `npm run agent:queue -- --agent ${agentId} --limit 5`;
}

function verificationForLiveAgent(agentId, mode) {
  if (agentId === 'life_information_loop') return 'npm run life:check';
  if (mode === 'review_gate') return 'npm run improvement:review';
  return 'npm run agent:performance:check -- --allow-github-error';
}

function isIssueStale(issue) {
  const hours = hoursSince(issue.updated_at);
  return hours !== null && hours > 14 * 24;
}

async function loadPublicMirrorJson(env, runtimeFile) {
  if (env.DISABLE_PUBLIC_MIRROR_RUNTIME === '1') {
    return { ok: false, reason: 'public_mirror_runtime_disabled' };
  }
  const baseUrl = env.PUBLIC_MIRROR_BASE_URL || DEFAULT_PUBLIC_MIRROR_BASE_URL;
  if (!baseUrl || isLocalUrl(baseUrl)) {
    return { ok: false, reason: 'public_mirror_base_unavailable' };
  }
  const url = `${trimSlash(baseUrl)}/runtime/${runtimeFile}`;
  try {
    const payload = await fetchJson(url, {
      accept: 'application/json',
      'user-agent': 'bcjjsly8-agent-map-live-api',
    });
    return { ok: true, url, payload };
  } catch (error) {
    return { ok: false, url, reason: `public_mirror_unavailable: ${String(error?.message || error)}` };
  }
}

async function loadAssetJson(request, env, runtimeFile) {
  if (!env?.ASSETS?.fetch) throw new Error('ASSETS binding is required for static fallback');
  const assetUrl = new URL(`/runtime/${runtimeFile}`, request.url);
  const response = await env.ASSETS.fetch(new Request(assetUrl, { method: 'GET' }));
  if (!response.ok) throw new Error(`runtime asset ${runtimeFile} failed: ${response.status}`);
  return response.json();
}

async function notFound(request, env, reason) {
  if (env?.ASSETS?.fetch) {
    const assetUrl = new URL('/404.html', request.url);
    const response = await env.ASSETS.fetch(new Request(assetUrl, { method: 'GET' }));
    if (response.ok) {
      return new Response(response.body, {
        status: 404,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Agent-Map-Block-Reason': reason,
        },
      });
    }
  }
  return json({ status: 'error', message: 'not_found', reason }, 404);
}

async function readGithubIssues(env, { state = 'open' } = {}) {
  if (env.DISABLE_GITHUB_LIVE === '1') {
    return { ok: false, reason: 'github_live_disabled' };
  }
  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  try {
    const url = `https://api.github.com/repos/${repo}/issues?state=${encodeURIComponent(state)}&per_page=100&sort=updated&direction=desc`;
    const issues = await fetchJson(url, githubHeaders(env));
    return {
      ok: true,
      repo,
      issues: issues.filter((issue) => !issue.pull_request),
    };
  } catch (error) {
    return { ok: false, repo, reason: `github_unavailable: ${String(error?.message || error)}` };
  }
}

function githubHeaders(env) {
  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'bcjjsly8-agent-map-live-api',
    'x-github-api-version': '2022-11-28',
  };
  if (env.GITHUB_TOKEN) headers.authorization = `Bearer ${env.GITHUB_TOKEN}`;
  return headers;
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

function normalizeRegistryAgents(rawAgents) {
  const entries = Array.isArray(rawAgents)
    ? rawAgents.map((agent) => [agent.id, agent]).filter(([id]) => id)
    : Object.entries(rawAgents || {});
  return entries
    .filter(([id]) => !/^smoke_/i.test(id))
    .map(([id, agent]) => {
      const heartbeat = typeof agent?.heartbeat === 'object' && agent.heartbeat ? agent.heartbeat : {};
      const lastSeen = heartbeat.lastSeen || agent?.lastSeen || agent?.updatedAt || null;
      return {
        id,
        manifestUrl: agent?.manifestUrl || null,
        protocols: Array.isArray(agent?.protocols) ? agent.protocols : [],
        endpoints: typeof agent?.endpoints === 'object' && agent.endpoints ? agent.endpoints : {},
        heartbeat: {
          status: heartbeat.status || agent?.status || 'unknown',
          lastSeen,
          sinceSec: secondsSince(lastSeen),
          source: heartbeat.source || 'registry',
        },
        lastEvent: normalizeLastEvent(agent),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function mergeAssetAgentsWithIssueSignals(assetAgents, issues, repo = DEFAULT_REPO) {
  const agentMap = new Map();
  const sourceAgents = Array.isArray(assetAgents) ? assetAgents : [];
  for (const agent of sourceAgents) {
    if (!agent?.id || /^smoke_/i.test(agent.id)) continue;
    agentMap.set(agent.id, {
      ...agent,
      heartbeat: {
        ...(agent.heartbeat || {}),
        source: agent.heartbeat?.source || 'static_registry_cache',
      },
    });
  }

  const openIssues = issues.filter((issue) => issue.state === 'open');
  const signals = new Map();
  for (const issue of openIssues) {
    const issueLabels = labels(issue);
    const agentLabels = issueLabels
      .filter((label) => label.startsWith('agent:'))
      .map((label) => label.slice('agent:'.length))
      .filter((id) => id && !/^smoke_/i.test(id));
    for (const agentId of agentLabels) {
      const current = signals.get(agentId) || {
        id: agentId,
        issues: [],
        needsHuman: 0,
        needsAgent: 0,
        latestUpdatedAt: null,
      };
      current.issues.push({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        labels: issueLabels.filter((label) => /^(phase|kind|priority|needs|agent|owner):/.test(label)),
        updatedAt: issue.updated_at,
      });
      if (issueLabels.includes('needs:human')) current.needsHuman += 1;
      if (issueLabels.includes('needs:agent')) current.needsAgent += 1;
      current.latestUpdatedAt = newestIso(current.latestUpdatedAt, issue.updated_at);
      signals.set(agentId, current);
    }
  }

  for (const signal of signals.values()) {
    const existing = agentMap.get(signal.id) || {
      id: signal.id,
      manifestUrl: null,
      protocols: [],
      endpoints: {},
      heartbeat: {},
      lastEvent: null,
    };
    const status = signal.needsHuman > 0
      ? 'needs_human'
      : signal.needsAgent > 0
        ? 'needs_agent'
        : 'active';
    agentMap.set(signal.id, {
      ...existing,
      protocols: [...new Set([...(existing.protocols || []), 'github-issues'])],
      endpoints: {
        ...(existing.endpoints || {}),
        issues: `https://github.com/${repo}/issues?q=is%3Aissue+is%3Aopen+label%3Aagent%3A${encodeURIComponent(signal.id)}`,
      },
      heartbeat: {
        ...(existing.heartbeat || {}),
        status,
        lastSeen: signal.latestUpdatedAt,
        sinceSec: secondsSince(signal.latestUpdatedAt),
        source: 'github_issues_rest',
      },
      lastEvent: {
        type: 'github.issue.signal',
        at: signal.latestUpdatedAt,
        success: true,
      },
      issueSignal: {
        openIssues: signal.issues.length,
        needsHuman: signal.needsHuman,
        needsAgent: signal.needsAgent,
        latestUpdatedAt: signal.latestUpdatedAt,
        sample: signal.issues.slice(0, 5),
      },
    });
  }

  return [...agentMap.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function newestIssueUpdatedAt(issues) {
  return issues.reduce((latest, issue) => newestIso(latest, issue.updated_at), null);
}

function newestIso(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return new Date(b).getTime() > new Date(a).getTime() ? b : a;
}

function normalizeLastEvent(agent) {
  const event = agent?.lastEvent;
  if (!event || typeof event !== 'object') return null;
  return {
    type: event.type || null,
    at: event.at || event.timestamp || null,
    success: event.success ?? null,
  };
}

function rawRegistryCount(rawAgents) {
  if (Array.isArray(rawAgents)) return rawAgents.length;
  if (rawAgents && typeof rawAgents === 'object') return Object.keys(rawAgents).length;
  return 0;
}

function secondsSince(iso) {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.round((Date.now() - time) / 100) / 10);
}

function makeIssueActionNode(issue) {
  const issueLabels = labels(issue);
  const visualGroup = visualGroupForIssue(issue);
  const agent = firstAgent(issueLabels);
  return {
    id: `issue:${issue.number}`,
    name: `#${issue.number} ${issue.title}`,
    type: 'issue',
    projectStatus: issueLabels.includes('needs:human') ? 'Needs Human' : issueLabels.includes('needs:agent') ? 'Needs Agent' : 'Open',
    status: issueLabels.includes('needs:human') ? 'blocked' : 'active',
    phase: firstPrefix(issueLabels, 'phase:') || 'ops',
    domain: visualGroup === 'content-growth' ? 'content' : visualGroup === 'core' ? 'mission_genesis' : 'cross',
    visualGroup,
    sourceIssue: issue.number,
    sourceUrl: issue.html_url,
    labels: issueLabels.filter((label) => /^(priority|needs|agent|owner|phase|kind):/.test(label)),
    owner: ['user', 'codex'],
    nextAction: issueLabels.includes('needs:human')
      ? 'User/Codex review or decision is required before close.'
      : issueLabels.includes('needs:agent')
        ? `Route or complete the next agent task for ${agent}.`
        : 'Keep linked to the live GitHub Issues read model.',
    updatedAt: issue.updated_at,
  };
}

function labels(issue) {
  return (issue.labels || []).map((label) => typeof label === 'string' ? label : label.name).filter(Boolean);
}

async function fetchExternalFeedSource(source) {
  const started = Date.now();
  const response = await fetch(source.url, {
    headers: {
      accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5',
      'user-agent': 'bcjjsly8-agent-map-live-api',
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${source.id} returned ${response.status}`);
  const items = externalItemBlocks(text).slice(0, 8).map((block) => {
    const title = externalFirstTag(block, ['title']);
    const link = externalFirstLink(block);
    if (!title || !link) return null;
    const publishedAt = externalNormalizeDate(externalFirstTag(block, ['pubDate', 'published', 'updated', 'dc:date']));
    return {
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: source.url,
      topic: source.topic,
      title,
      link,
      linkHost: hostForLink(link),
      publishedAt,
      ageHours: hoursSince(publishedAt),
      tags: externalTopicTags(title, source.topic),
    };
  }).filter(Boolean);
  return {
    sourceHealth: {
      sourceId: source.id,
      sourceName: source.name,
      topic: source.topic,
      status: 'ok',
      itemCount: items.length,
      latencyMs: Date.now() - started,
    },
    items,
  };
}

function externalItemBlocks(xml) {
  const rss = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
  if (rss.length) return rss;
  return [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]);
}

function externalDecodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

function externalStripTags(value = '') {
  return externalDecodeXml(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function externalFirstTag(block, tagNames) {
  for (const tag of tagNames) {
    const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (match) return externalStripTags(match[1]);
  }
  return null;
}

function externalFirstLink(block) {
  const atomHref = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/i);
  if (atomHref) return externalDecodeXml(atomHref[1]);
  return externalFirstTag(block, ['link']);
}

function externalNormalizeDate(value) {
  const ts = Date.parse(value || '');
  if (!Number.isFinite(ts)) return null;
  return new Date(ts).toISOString();
}

function hostForLink(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function externalTopicTags(title, topic) {
  const text = `${title || ''} ${topic || ''}`.toLowerCase();
  const tags = new Set([topic]);
  if (/\b(ai|openai|llm|model|agent|inference|gpt)\b/.test(text)) tags.add('ai');
  if (/\b(rate|inflation|monetary|central bank|federal reserve|ecb|yield|treasury)\b/.test(text)) tags.add('macro_policy');
  if (/\b(sec|securities|market|trading|investor|crypto|etf)\b/.test(text)) tags.add('market_regulation');
  if (/\b(cloud|edge|security|network|dns|compute|database)\b/.test(text)) tags.add('infrastructure');
  if (/\b(github|developer|software|repository|open source)\b/.test(text)) tags.add('software');
  return [...tags].filter(Boolean).sort();
}

function externalShortHash(value) {
  let hash = 0;
  const text = String(value || '');
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
}

function externalTruncate(value, max = 110) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function externalTopicLabel(topic) {
  return {
    technology: '기술',
    software_platform: '소프트웨어 플랫폼',
    cloud_infrastructure: '클라우드/인프라',
    ai: 'AI',
    economy_policy: '경제 정책',
    monetary_policy: '통화 정책',
    market_regulation: '시장/규제',
  }[topic] || topic || '외부';
}

function externalPriorityFromScore(score) {
  if (score >= 75) return 'high';
  if (score >= 55) return 'medium';
  return 'watch';
}

function externalScoreSignal(item) {
  let score = 38;
  const tags = new Set(item.tags || []);
  if (['ai', 'monetary_policy', 'market_regulation', 'cloud_infrastructure'].includes(item.topic)) score += 12;
  if (tags.has('ai')) score += 13;
  if (tags.has('macro_policy')) score += 12;
  if (tags.has('market_regulation')) score += 11;
  if (tags.has('infrastructure')) score += 9;
  if (tags.has('software')) score += 8;
  if (item.ageHours !== null && item.ageHours <= 6) score += 14;
  else if (item.ageHours !== null && item.ageHours <= 24) score += 8;
  else if (item.ageHours !== null && item.ageHours <= 72) score += 4;
  if (['federal_reserve', 'ecb_press', 'sec_press', 'openai_news'].includes(item.sourceId)) score += 6;
  return Math.max(0, Math.min(100, score));
}

function externalWhyItMatters(item) {
  const tags = new Set(item.tags || []);
  if (tags.has('ai')) return 'AI/에이전트 기술 변화는 자동화 대체율, 콘텐츠 제작, 지식관리 로드맵에 직접 영향을 줄 수 있습니다.';
  if (tags.has('infrastructure')) return '인프라/클라우드 변화는 Agent Map 배포, live API, 모니터링 안정성 개선 후보가 됩니다.';
  if (tags.has('software')) return '개발 플랫폼 변화는 GitHub 중심 협업, CI/CD, 에이전트 작업 루프 개선에 연결될 수 있습니다.';
  if (tags.has('macro_policy')) return '금리·물가·정책 신호는 비용, 투자, 수익화 우선순위 판단의 배경 정보가 됩니다.';
  if (tags.has('market_regulation')) return '시장/규제 신호는 서비스화·외부 공개·수익화 과정의 리스크 점검 후보입니다.';
  return '대외 환경 변화 신호이므로 내부 프로젝트 방향성과 비교해 볼 가치가 있습니다.';
}

function externalProjectRelevance(item) {
  const tags = new Set(item.tags || []);
  if (tags.has('ai')) return 'life-agentization, LLM-Wiki, 영상/지식 자동화';
  if (tags.has('infrastructure')) return 'Cloudflare Pages, live API, Registry, observability';
  if (tags.has('software')) return 'GitHub Issue/Project control-plane, CLI agent workflow';
  if (tags.has('macro_policy')) return '경제 브리프, 수익화 판단, 비용 관리';
  if (tags.has('market_regulation')) return '서비스화 리스크, 공개 데이터/정책 점검';
  return 'Agent Map 전략 점검';
}

function externalSuggestedAction(item) {
  const priority = externalPriorityFromScore(externalScoreSignal(item));
  if (priority === 'high') return '원문 출처를 검토한 뒤 관련 GitHub 이슈/로드맵에 영향 여부를 기록합니다.';
  if (priority === 'medium') return '일일/주간 브리프 후보로 보관하고 유사 신호가 반복되는지 추적합니다.';
  return '현재는 모니터링 대상으로 유지하고 반복 출현 시 중요도를 올립니다.';
}

function enrichExternalSignal(item) {
  const importanceScore = externalScoreSignal(item);
  const importance = externalPriorityFromScore(importanceScore);
  return {
    ...item,
    signalId: `ext_${externalShortHash(`${item.sourceId}:${item.link}:${item.title}`)}`,
    importanceScore,
    importance,
    oneLineSummary: `${externalTopicLabel(item.topic)} 신호 · ${externalTruncate(item.title, 104)}`,
    whyItMatters: externalWhyItMatters(item),
    projectRelevance: externalProjectRelevance(item),
    suggestedAction: externalSuggestedAction(item),
  };
}

function externalThemeLabel(theme) {
  return {
    ai: 'AI/에이전트 자동화 변화',
    macro_policy: '금리·물가·통화정책 변화',
    market_regulation: '시장/규제 리스크 변화',
    infrastructure: '클라우드/인프라 운영 변화',
    software: '개발 플랫폼/오픈소스 변화',
    technology: '기술 일반 신호',
    software_platform: '소프트웨어 플랫폼 신호',
    cloud_infrastructure: '클라우드 인프라 신호',
    economy_policy: '경제 정책 신호',
    monetary_policy: '통화 정책 신호',
  }[theme] || theme;
}

function externalTopThemes(publicSignals) {
  const counts = countLabelsOrValues(publicSignals.flatMap((item) => item.tags || []));
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([theme, count]) => ({
      theme,
      count,
      label: externalThemeLabel(theme),
    }));
}

function buildExternalBriefing(snapshotBase) {
  const publicSignals = snapshotBase.publicSignals || [];
  const prioritySignals = [...publicSignals]
    .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
    .slice(0, 8)
    .map((item) => ({
      signalId: item.signalId,
      sourceName: item.sourceName,
      topic: item.topic,
      title: item.title,
      link: item.link,
      linkHost: item.linkHost,
      publishedAt: item.publishedAt,
      importance: item.importance,
      importanceScore: item.importanceScore,
      oneLineSummary: item.oneLineSummary,
      whyItMatters: item.whyItMatters,
      projectRelevance: item.projectRelevance,
      suggestedAction: item.suggestedAction,
    }));
  const actionCandidates = prioritySignals.slice(0, 5).map((item) => ({
    id: `action_${item.signalId}`,
    priority: item.importance === 'high' ? 'P1' : item.importance === 'medium' ? 'P2' : 'P3',
    title: item.oneLineSummary,
    reason: item.whyItMatters,
    nextStep: item.suggestedAction,
    owner: 'codex',
    sourceSignalId: item.signalId,
    sourceLink: item.link,
    safety: 'metadata-derived; review source before decisions',
  }));
  return {
    status: publicSignals.length ? 'ready' : 'empty',
    generatedFrom: 'public RSS/Atom metadata: title, source, link, publishedAt, topic tags',
    oneLineSummary: `최근 ${snapshotBase.sourceConfig.recentWindowHours}시간 기준 외부 공개 신호 ${snapshotBase.summary.recentSignals}건 / 전체 ${snapshotBase.summary.totalSignals}건: 기술 ${snapshotBase.summary.technologySignals}건, 경제·정책 ${snapshotBase.summary.economySignals}건.`,
    topThemes: externalTopThemes(publicSignals),
    prioritySignals,
    actionCandidates,
    limitations: [
      '원문 본문/댓글/유료 콘텐츠를 수집하지 않으므로 제목 기반 신호 해석입니다.',
      '투자·법률·구매·외부 게시 같은 결정은 사람 검토 전 자동 실행하지 않습니다.',
    ],
  };
}

function dedupeExternalSignals(items) {
  const seen = new Set();
  const deduped = [];
  for (const item of items) {
    const key = `${item.link || ''} ${item.title || ''}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
}

function countLabelsOrValues(values) {
  const counts = {};
  for (const value of values.filter(Boolean)) counts[value] = (counts[value] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function hoursSince(iso) {
  const ts = Date.parse(iso || '');
  if (!Number.isFinite(ts)) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 3600000));
}

function firstAgent(issueLabels) {
  const label = issueLabels.find((item) => item.startsWith('agent:'));
  return label ? label.slice('agent:'.length) : 'codex';
}

function firstPrefix(issueLabels, prefix) {
  const label = issueLabels.find((item) => item.startsWith(prefix));
  return label ? label.slice(prefix.length) : null;
}

function visualGroupForIssue(issue) {
  const text = `${issue.title || ''} ${labels(issue).join(' ')}`.toLowerCase();
  if (text.includes('content') || text.includes('trend') || text.includes('video') || text.includes('youtube') || text.includes('phase:platform')) return 'content-growth';
  if (text.includes('life graph') || text.includes('agent map') || text.includes('phase:visualize')) return 'core';
  return 'agent-ops';
}

function domainForIssue(issue) {
  const issueLabels = labels(issue);
  const phase = firstPrefix(issueLabels, 'phase:');
  if (phase) return phase;
  const kind = firstPrefix(issueLabels, 'kind:');
  return kind || 'uncategorized';
}

function domainForGithubInfoIssue(issue, issueLabels = labels(issue)) {
  const text = `${issue.title || ''} ${issueLabels.join(' ')}`.toLowerCase();
  if (text.includes('kakao') || text.includes('knowledge') || text.includes('wiki') || text.includes('graphify')) return 'knowledge_information';
  if (text.includes('cloudflare') || text.includes('infra') || text.includes('registry') || text.includes('n8n')) return 'infrastructure_ops';
  if (text.includes('content') || text.includes('video') || text.includes('youtube') || text.includes('tts')) return 'content_growth';
  if (text.includes('life') || text.includes('agentization') || text.includes('replacement')) return 'life_agentization';
  return 'agent_ops';
}

function decisionNeededForIssue(issue) {
  const issueLabels = labels(issue);
  if (issueLabels.includes('gate:publish')) return 'Publish/upload gate requires explicit approval.';
  if (issueLabels.includes('decision:approve-close')) return 'Close approval is required.';
  if (issueLabels.includes('decision:provide-secret')) return 'Secret/configuration input is required.';
  return 'Human decision or Codex/user approval is required.';
}

function summarizeProviders(providers) {
  const byStatus = {};
  for (const provider of providers) {
    byStatus[provider.status] = (byStatus[provider.status] || 0) + 1;
  }
  return {
    totalProviders: providers.length,
    configured: providers.filter((provider) => !['not_configured'].includes(provider.status)).length,
    connected: providers.filter((provider) => provider.status === 'connected').length,
    partial: providers.filter((provider) => provider.status === 'partial').length,
    notConfigured: providers.filter((provider) => provider.status === 'not_configured').length,
    configuredUnverified: providers.filter((provider) => provider.status === 'configured_unverified').length,
    byStatus,
  };
}

function withLiveData(payload, liveData) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { value: payload, liveData, safety: safety() };
  }
  return {
    ...payload,
    liveData: {
      checkedAt: new Date().toISOString(),
      ...liveData,
    },
    safety: {
      ...(payload.safety || {}),
      ...safety(),
    },
  };
}

function safety(extra = {}) {
  return {
    readOnly: true,
    rawPrivateDataIncluded: false,
    rawKakaoMessages: false,
    secretValuesIncluded: false,
    externalWrites: false,
    comments: false,
    labels: false,
    close: false,
    merge: false,
    deploy: false,
    publish: false,
    upload: false,
    payments: false,
    destructiveActions: false,
    ...extra,
  };
}

function json(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'X-Agent-Map-Live-API': '1',
      ...headers,
    },
  });
}

function isLocalUrl(value) {
  try {
    const url = new URL(value);
    return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

function trimSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

function publicUrl(value) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'invalid_url';
  }
}
