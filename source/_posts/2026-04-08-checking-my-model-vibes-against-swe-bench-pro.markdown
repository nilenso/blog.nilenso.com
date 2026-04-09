---
title: "Checking my model vibes against SWE-Bench Pro"
kind: article
author: Srihari Sriraman
created_at: 2026-04-08 00:00:00 UTC
description: "I thought GPT models felt slow and token hungry, and Claude models were faster. I was wrong."
layout: post
---

<style>
.ratio-wrap { margin: 1.2rem 0 1.6rem; }
.ratio-wrap, .ratio-wrap * { font-family: var(--font-sans); }
.ratio-card { margin: 0.8rem 0 1.4rem; }
.ratio-title { font-size: 1.25rem; line-height: 1.35; font-weight: 600; margin: 0 0 0.35rem; }
.ratio-sub { color: #111; font-size: 1rem; margin: 0 0 0.7rem; }
.ratio-ratio-note {
  color: var(--nilenso-pink, #FF3D84);
  font-size: 0.95rem;
  margin: 0.35rem 0 0;
  white-space: nowrap;
  text-align: center;
}
.ratio-stat { color: var(--nilenso-pink, #FF3D84); font-size: 0.95rem; margin: 0.3rem 0 0; }
.ratio-caption {
  margin: 0 0 2em;
  padding-bottom: 0.75rem;
  text-align: center;
  border-bottom: 1px dashed gray;
}
.ratio-svg { display: block; width: 100%; height: auto; }
.ratio-muted { color: #777; font-size: 0.95rem; }

.annex-wrap { margin: 1rem 0 2rem; }
.annex-table {
  border-collapse: collapse;
  width: 100%;
  margin: 0;
  font-family: var(--font-monospace);
  font-size: 0.9rem;
}
.annex-table th, .annex-table td {
  text-align: right;
  padding: 6px 10px;
  border-bottom: 1px solid #ececec;
  white-space: nowrap;
}
.annex-table th {
  color: #888;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-family: var(--font-sans);
  font-weight: 500;
}
.annex-table td:first-child,
.annex-table th:first-child {
  text-align: left;
}
.annex-table td:first-child {
  white-space: normal;
  max-width: 380px;
  font-family: var(--font-serif);
  font-size: 0.98rem;
}
.annex-desc {
  display: block;
  color: #888;
  font-size: 0.8rem;
  font-family: var(--font-serif);
}
.annex-note {
  color: #666;
  font-size: 0.92rem;
  margin: 0.45rem 0 0;
}
.annex-scroll {
  max-height: 560px;
  overflow: auto;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
}
.annex-scroll .annex-table th {
  position: sticky;
  top: 0;
  background: #fafafa;
  z-index: 1;
}
</style>

If you choose coding models for production work, resolve rate is only part of the decision. Cost, tokens, and runtime decide whether a model is workable day to day. My intuition was: GPT models felt slow and token hungry, Claude models felt faster on similar tasks, so Claude should be cheaper. Similar claims appear in public writeups, for example in the [OpenHands Index](https://openhands.dev/blog/openhands-index), where Opus 4.5 is noted as finishing tasks quickly despite its size.

Some benchmark operators already publish this view. [SWE-rebench](https://swe-rebench.com/) and OpenHands Index include cost and runtime alongside accuracy metrics. I focused on SWE-Bench Pro because it is the one I understand best. Our [earlier write-up](https://blog.nilenso.com/blog/2025/09/25/swe-benchmarks/) covers why Pro is the best available alternative, and [OpenAI has made the same shift](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/). SWE-Bench Pro publishes trajectories, but it does not publish a consolidated cost-token-time report.

So I built one from the public data. One important choice is in **pairing**: I compare each task only when both models submitted on that same instance, then compute Sonnet 4.5 / GPT-5 ratios per task and summarize those ratios. This keeps the comparison grounded because every ratio comes from the same task under the same harness setup. I analyzed October 2025 paired runs in SWE-Bench Pro, and I would like to run the same analysis on current leaderboard pairs like GPT-4 vs Opus-4.6 once comparable paired data is available.

My intuitions were wrong.

## High-level results

<div id="ratio-summary" class="ratio-wrap"><p class="ratio-muted">Loading chart...</p></div>

Across 616 paired tasks, resolve rates are close while operating profile is not. The results below come from the October 2025 GPT-5 vs Sonnet 4.5 paired trajectories.

- **Cost:** median ratio **6.33x** (Sonnet 4.5 / GPT-5)
- **Total tokens:** median ratio **1.15x**
- **Tool time:** median ratio **1.35x**
- **Resolve rate:** GPT-5 **42.5%**, Sonnet 4.5 **44.5%**

Accuracy is similar here. The larger differences show up in cost, tokens, and runtime.

## Cost

<div id="ratio-cost" class="ratio-wrap"><p class="ratio-muted">Loading chart...</p></div>

Cost shows the largest gap in this dataset. Sonnet 4.5 is more expensive on most tasks, with many tasks clustered between 4x and 10x.

Caveats:
- Costs come from benchmark run logs, not a rerun done today.
- These are litellm proxy costs from the benchmark environment, not public list pricing.
- Discounts, caching, and contract terms can change absolute dollars.
- This is one benchmark setup, not every real-world coding workflow.

## Tokens

<div id="ratio-tokens-total" class="ratio-wrap"><p class="ratio-muted">Loading chart...</p></div>

Total token usage is mixed and much less extreme than cost. Sonnet 4.5 uses more total tokens in 58.0% of tasks, with a broad spread around 1x. The largest token difference is in output, not input, and in the deeper breakdown Sonnet 4.5 emits much more output per task; a lot of that output is tool-call content and temporary file creation that gets discarded and never appears in the final submitted patch.

Caveats:
- This chart uses total tokens from run stats: `tokens_sent + tokens_received`.
- SWE-Agent's built-in `tokens_received` only counts `message.content` and misses tool-call arguments, so in the deeper token breakdown I re-count output tokens with tiktoken (`cl100k_base`) across `message.content`, `message.thought`, and `tool_calls[].function.arguments`.
- Hidden reasoning tokens are not visible in trajectories.
- Token behavior depends on harness strategy, turn limits, and repo shape.

## Time

<div id="ratio-time" class="ratio-wrap"><p class="ratio-muted">Loading chart...</p></div>

Time is more comparable than cost and noisier across tasks. Sonnet 4.5 is slower in 58.9% of tasks, with a median ratio of 1.35x.

Caveats:
- This is **tool execution time** from trajectories.
- It is not full wall-clock latency.
- Model inference latency is not fully captured in this metric.
- Test-suite length and repo workflows add variance.

## Conclusion

This SWE-Bench Pro slice is a signal, not a universal ranking. I do not expect October 2025 GPT-5 and Sonnet 4.5 behavior to generalize cleanly to newer model releases, but it is enough to challenge my default, so I will be trying GPT models more often now. The broader takeaway is to measure on your own use case with cost, token, and time data, and avoid decisions driven by timeline takes or out-of-context benchmark reporting.

## Annex: methodology and additional data

This annex lists implementation details, additional ratio charts, and full comparative tables for the same paired set used above.

Analysis code and data: [github.com/nilenso/swe-bench-pro-cost-token-time-analysis](https://github.com/nilenso/swe-bench-pro-cost-token-time-analysis).

### A.1 Data and pairing protocol

- Source: public SWE-Bench Pro trajectories from Scale AI.
- Pairing unit: same `instance_id`, requiring both GPT-5 and Sonnet 4.5 to have `submitted=true`.
- Paired sample size: **616** instances.
- Unit of comparison: per-instance ratio, Sonnet 4.5 / GPT-5.
- Aggregation: medians and IQR over per-instance ratios, not pooled cross-task means.
- Scope: October 2025 model runs in one harness configuration.
- Environment note: costs are benchmark-environment proxy costs, not current list pricing.

### A.1.1 Inclusion and denominator audit

All annex charts and tables use the same paired set unless stated otherwise.

<div class="annex-wrap">
  <table class="annex-table">
    <tr><th>Metric</th><th>Included (n)</th><th>Excluded</th><th>Inclusion rule</th></tr>
    <tr><td>Cost ratio</td><td>616</td><td>0</td><td>both costs &gt; 0</td></tr>
    <tr><td>Total token ratio (`tokens_sent + tokens_received`)</td><td>616</td><td>0</td><td>both totals &gt; 0</td></tr>
    <tr><td>Tool-time ratio</td><td>616</td><td>0</td><td>both tool times &gt; 0</td></tr>
    <tr><td>Input token ratio</td><td>616</td><td>0</td><td>both `tokens_sent` &gt; 0</td></tr>
    <tr><td>Output token ratio (`output_tokens.total`)</td><td>616</td><td>0</td><td>both totals &gt; 0</td></tr>
    <tr><td>Step-count ratio</td><td>616</td><td>0</td><td>both step counts &gt; 0</td></tr>
  </table>
</div>

Note: denominator stays constant across ratio charts, so cross-metric comparisons are on the same paired sample.

### A.1.2 Paired outcome decomposition

- Both solved: **206**
- GPT-5 only solved: **56**
- Sonnet 4.5 only solved: **68**
- Neither solved: **286**

Note: this decomposition separates overlap from directional wins on the same instances.

### A.1.3 Uncertainty checks

- Resolve rate, Wilson 95% CI:
  - GPT-5: **42.5%** (262/616), CI **38.7%-46.5%**
  - Sonnet 4.5: **44.5%** (274/616), CI **40.6%-48.4%**
- Paired discordant outcomes: GPT-only **56**, Sonnet-only **68**; McNemar exact p-value **0.323**.
- Median ratio 95% bootstrap CI (4,000 resamples):
  - Cost: **6.33x**, CI **5.91x-6.68x**
  - Total tokens: **1.15x**, CI **1.06x-1.26x**
  - Tool time: **1.35x**, CI **1.18x-1.55x**

Note: in this paired slice, cost, total-token, and tool-time ratio signals are stable; resolve-rate differences are less decisive.

### A.2 Additional ratio charts (not shown above)

Input token ratio per paired task.
<div id="annex-ratio-input" class="ratio-wrap"><p class="ratio-muted">Loading chart...</p></div>

Output token ratio per paired task.
<div id="annex-ratio-output" class="ratio-wrap"><p class="ratio-muted">Loading chart...</p></div>

Step-count ratio per paired task.
<div id="annex-ratio-steps" class="ratio-wrap"><p class="ratio-muted">Loading chart...</p></div>

### A.3 Comparative tables

Cost summary across all paired tasks.
<div id="annex-table-cost" class="annex-wrap"><p class="ratio-muted">Loading table...</p></div>

Token and patch summary.
<div id="annex-table-tokens" class="annex-wrap"><p class="ratio-muted">Loading table...</p></div>

Action breakdown summary.
<div id="annex-table-actions" class="annex-wrap"><p class="ratio-muted">Loading table...</p></div>

Execution summary.
<div id="annex-table-exec" class="annex-wrap"><p class="ratio-muted">Loading table...</p></div>

Repo-level resolve counts.
<div id="annex-table-repos" class="annex-wrap"><p class="ratio-muted">Loading table...</p></div>

Per-instance comparison table.
<div id="annex-table-instances" class="annex-wrap"><p class="ratio-muted">Loading table...</p></div>

<script>
(function () {
  function quantile(values, q) {
    if (!values.length) return NaN;
    const s = [...values].sort((a, b) => a - b);
    if (s.length === 1) return s[0];
    const pos = (s.length - 1) * q;
    const lo = Math.floor(pos), hi = Math.ceil(pos);
    if (lo === hi) return s[lo];
    const w = pos - lo;
    return s[lo] * (1 - w) + s[hi] * w;
  }

  function fmtx(v, d) {
    return v.toFixed(d === undefined ? 2 : d) + 'x';
  }

  function niceMax(n) {
    if (n <= 5) return 5;
    const p = Math.pow(10, Math.floor(Math.log10(n)));
    const m = n / p;
    if (m <= 1) return 1 * p;
    if (m <= 2) return 2 * p;
    if (m <= 5) return 5 * p;
    return 10 * p;
  }

  function mean(arr) {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
  }

  function median(arr) {
    return quantile(arr, 0.5);
  }

  function fmt(n, dec = 0) {
    if (!isFinite(n)) return '—';
    return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function fmtD(n) {
    return '$' + fmt(n, 2);
  }

  function ratioSG(g, s) {
    if (!g || !isFinite(g) || !isFinite(s)) return '—';
    return (s / g).toFixed(1) + 'x';
  }

  function outcomeOf(p) {
    const gr = p.gpt5.resolved === true;
    const sr = p.claude.resolved === true;
    if (gr && sr) return 'both';
    if (gr) return 'gpt5-only';
    if (sr) return 'sonnet-only';
    return 'neither';
  }

  function aggRow(label, gVals, sVals, opts) {
    const fn = (opts && opts.fn) || mean;
    const dollar = opts && opts.dollar;
    const dec = opts && opts.dec !== undefined ? opts.dec : (dollar ? 2 : 0);
    const desc = opts && opts.desc ? `<span class="annex-desc">${opts.desc}</span>` : '';
    const g = fn(gVals), s = fn(sVals);
    const gStr = dollar ? fmtD(g) : fmt(g, dec);
    const sStr = dollar ? fmtD(s) : fmt(s, dec);
    return `<tr><td>${label}${desc}</td><td>${gStr}</td><td>${sStr}</td><td>${ratioSG(g, s)}</td></tr>`;
  }

  function renderAnnexTable(el, caption, htmlTable, note) {
    el.innerHTML = `${htmlTable}<p class="annex-note">${note}</p>`;
  }

  function renderHistogram(el, metric) {
    const ratios = metric.ratios;
    const logs = ratios.map(r => Math.log2(r));
    const lo = -4, hi = 5;
    const binsN = 34;
    const binW = (hi - lo) / binsN;
    const bins = new Array(binsN).fill(0);

    logs.forEach(v => {
      let i = Math.floor((v - lo) / binW);
      if (i < 0) i = 0;
      if (i >= binsN) i = binsN - 1;
      bins[i] += 1;
    });

    const W = 920, H = 360;
    const m = { l: 68, r: 18, t: 26, b: 66 };
    const pw = W - m.l - m.r;
    const ph = H - m.t - m.b;
    const yMax = niceMax(Math.max(...bins, 1));

    const x = (v) => m.l + ((v - lo) / (hi - lo)) * pw;
    const y = (v) => m.t + ph - (v / yMax) * ph;

    const yTicks = [0, yMax / 2, yMax];
    const xTicks = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

    let svg = '';

    yTicks.forEach(t => {
      svg += `<line x1="${m.l}" y1="${y(t)}" x2="${m.l + pw}" y2="${y(t)}" stroke="#f2f2f2" stroke-width="1"/>`;
      svg += `<text x="${m.l - 8}" y="${y(t) + 4}" fill="#555" font-size="11" text-anchor="end">${Math.round(t)}</text>`;
    });

    for (let i = 0; i < binsN; i++) {
      const bx0 = m.l + (i / binsN) * pw;
      const bx1 = m.l + ((i + 1) / binsN) * pw;
      const bh = (bins[i] / yMax) * ph;
      svg += `<rect x="${bx0 + 0.2}" y="${m.t + ph - bh}" width="${Math.max(0, bx1 - bx0 - 0.6)}" height="${bh}" fill="#202020"/>`;
    }

    svg += `<line x1="${x(0)}" y1="${m.t}" x2="${x(0)}" y2="${m.t + ph}" stroke="#bdbdbd" stroke-width="1" stroke-dasharray="4,4"/>`;

    const medX = x(Math.log2(metric.median));
    svg += `<line x1="${medX}" y1="${m.t}" x2="${medX}" y2="${m.t + ph}" stroke="#111" stroke-width="1.4"/>`;
    svg += `<text x="${Math.max(m.l + 34, Math.min(m.l + pw - 34, medX))}" y="${m.t - 8}" fill="#111" font-size="12" text-anchor="middle">Median ${fmtx(metric.median, 2)}</text>`;

    svg += `<text x="${m.l}" y="14" fill="#555" font-size="12" text-anchor="start">${metric.leftLabel}</text>`;
    svg += `<text x="${m.l + pw}" y="14" fill="#555" font-size="12" text-anchor="end">${metric.rightLabel}</text>`;

    svg += `<line x1="${m.l}" y1="${m.t + ph}" x2="${m.l + pw}" y2="${m.t + ph}" stroke="#e6e6e6" stroke-width="1"/>`;
    svg += `<line x1="${m.l}" y1="${m.t}" x2="${m.l}" y2="${m.t + ph}" stroke="#e6e6e6" stroke-width="1"/>`;

    xTicks.forEach(k => {
      const xv = x(k);
      const rv = Math.pow(2, k);
      const label = (rv >= 1 ? (Number.isInteger(rv) ? rv.toFixed(0) : rv.toFixed(2)) : rv.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')) + 'x';
      svg += `<line x1="${xv}" y1="${m.t + ph}" x2="${xv}" y2="${m.t + ph + 5}" stroke="#e6e6e6" stroke-width="1"/>`;
      svg += `<text x="${xv}" y="${H - 28}" fill="#555" font-size="11" text-anchor="middle">${label}</text>`;
    });

    svg += `<text x="${m.l + pw / 2}" y="${H - 6}" fill="#111" font-size="12" text-anchor="middle">${metric.xLabel}</text>`;
    svg += `<text x="18" y="${m.t + ph / 2}" fill="#111" font-size="12" text-anchor="middle" transform="rotate(-90 18 ${m.t + ph / 2})">Tasks</text>`;

    el.innerHTML = `
      <section class="ratio-card">
        <p class="ratio-sub">${metric.title}. Ratio = Sonnet 4.5 / GPT-5, 1x = equal.</p>
        <svg class="ratio-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${metric.title}">${svg}</svg>
        <div class="ratio-caption">
          <p class="ratio-stat">IQR ${fmtx(metric.q1, 2)}-${fmtx(metric.q3, 2)}; ${metric.takeawayPhrase} ${metric.higherCount} of ${metric.n} tasks (${metric.higherPct.toFixed(1)}%).</p>
        </div>
      </section>
    `;
  }

  function renderSummary(el, rows) {
    const whiskerLogs = rows.flatMap(r => [Math.log2(r.q1), Math.log2(r.q3)]).filter(v => isFinite(v));
    let lo = Math.min(...whiskerLogs) - 0.6;
    let hi = Math.max(...whiskerLogs) + 0.6;
    lo = Math.min(lo, -0.5);
    hi = Math.max(hi, 0.5);
    lo = Math.floor(lo * 2) / 2;
    hi = Math.ceil(hi * 2) / 2;

    const W = 920, H = 280;
    const m = { l: 150, r: 18, t: 18, b: 68 };
    const pw = W - m.l - m.r;
    const ph = H - m.t - m.b;

    const x = (lv) => m.l + ((lv - lo) / (hi - lo)) * pw;
    const rowY = (i) => m.t + ((i + 0.5) / rows.length) * ph;

    const allTicks = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
    const ticks = allTicks.filter(k => k >= lo && k <= hi);

    let svg = '';

    ticks.forEach(k => {
      const xv = x(k);
      const rv = Math.pow(2, k);
      const label = (rv >= 1 ? (Number.isInteger(rv) ? rv.toFixed(0) : rv.toFixed(2)) : rv.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')) + 'x';
      svg += `<line x1="${xv}" y1="${m.t}" x2="${xv}" y2="${m.t + ph}" stroke="#f2f2f2" stroke-width="1"/>`;
      svg += `<text x="${xv}" y="${H - 26}" fill="#555" font-size="11" text-anchor="middle">${label}</text>`;
    });

    svg += `<line x1="${x(0)}" y1="${m.t}" x2="${x(0)}" y2="${m.t + ph}" stroke="#bdbdbd" stroke-width="1" stroke-dasharray="4,4"/>`;

    rows.forEach((r, i) => {
      const y = rowY(i);
      const x1 = x(Math.log2(r.q1));
      const x3 = x(Math.log2(r.q3));
      const xm = x(Math.log2(r.median));
      svg += `<line x1="${x1}" y1="${y}" x2="${x3}" y2="${y}" stroke="#111" stroke-width="1.6"/>`;
      svg += `<circle cx="${xm}" cy="${y}" r="3.2" fill="#111"/>`;
      svg += `<text x="${m.l - 12}" y="${y + 4}" fill="#111" font-size="12" text-anchor="end">${r.name}</text>`;
      svg += `<text x="${xm + 8}" y="${y - 6}" fill="#111" font-size="11" text-anchor="start">${fmtx(r.median, 2)}</text>`;
    });

    svg += `<line x1="${m.l}" y1="${m.t + ph}" x2="${m.l + pw}" y2="${m.t + ph}" stroke="#e6e6e6" stroke-width="1"/>`;
    svg += `<text x="${m.l + pw / 2}" y="${H - 6}" fill="#111" font-size="12" text-anchor="middle">Ratio</text>`;

    el.innerHTML = `
      <section class="ratio-card">
        <p class="ratio-sub">Sonnet 4.5 / GPT-5, 1x = equal, left of 1x means Sonnet is lower, right means Sonnet is higher.</p>
        <svg class="ratio-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Typical per-task difference across metrics">${svg}</svg>
        <div class="ratio-caption">
          <p class="ratio-ratio-note">For cost and tokens, lower is better. For time, lower means faster.</p>
        </div>
      </section>
    `;
  }

  fetch('/assets/swe-bench-pro-data.json')
    .then(r => r.json())
    .then(data => {
      const pairs = data.filter(p => p.gpt5 && p.claude && p.gpt5.submitted && p.claude.submitted);
      const g = pairs.map(p => p.gpt5);
      const s = pairs.map(p => p.claude);
      const n = pairs.length;

      const metricDefs = {
        cost: {
          title: 'Per-task cost ratio',
          xLabel: 'Cost ratio',
          leftLabel: 'Sonnet cheaper',
          rightLabel: 'Sonnet more expensive',
          takeawayPhrase: 'Sonnet was more expensive on',
          g: (m) => m.model_stats.instance_cost,
          c: (m) => m.model_stats.instance_cost,
        },
        tokensTotal: {
          title: 'Per-task total token ratio',
          xLabel: 'Total token ratio',
          leftLabel: 'Sonnet fewer total tokens',
          rightLabel: 'Sonnet more total tokens',
          takeawayPhrase: 'Sonnet used more total tokens on',
          g: (m) => m.model_stats.tokens_sent + m.model_stats.tokens_received,
          c: (m) => m.model_stats.tokens_sent + m.model_stats.tokens_received,
        },
        time: {
          title: 'Per-task time ratio',
          xLabel: 'Time ratio',
          leftLabel: 'Sonnet faster',
          rightLabel: 'Sonnet slower',
          takeawayPhrase: 'Sonnet was slower on',
          g: (m) => m.tool_time.total_seconds,
          c: (m) => m.tool_time.total_seconds,
        },
        tokensInput: {
          title: 'Per-task input token ratio',
          xLabel: 'Input token ratio',
          leftLabel: 'Sonnet fewer input tokens',
          rightLabel: 'Sonnet more input tokens',
          takeawayPhrase: 'Sonnet used more input tokens on',
          g: (m) => m.model_stats.tokens_sent,
          c: (m) => m.model_stats.tokens_sent,
        },
        tokensOutput: {
          title: 'Per-task output token ratio',
          xLabel: 'Output token ratio',
          leftLabel: 'Sonnet fewer output tokens',
          rightLabel: 'Sonnet more output tokens',
          takeawayPhrase: 'Sonnet used more output tokens on',
          g: (m) => m.output_tokens.total,
          c: (m) => m.output_tokens.total,
        },
        steps: {
          title: 'Per-task steps ratio',
          xLabel: 'Steps ratio',
          leftLabel: 'Sonnet fewer steps',
          rightLabel: 'Sonnet more steps',
          takeawayPhrase: 'Sonnet took more steps on',
          g: (m) => m.steps,
          c: (m) => m.steps,
        },
      };

      function makeMetric(def) {
        const ratios = [];
        for (const p of pairs) {
          const gv = def.g(p.gpt5);
          const cv = def.c(p.claude);
          if (!gv || !cv || gv <= 0 || cv <= 0) continue;
          ratios.push(cv / gv);
        }
        const included = ratios.length;
        const higherCount = ratios.filter(v => v > 1).length;
        return {
          ...def,
          ratios,
          n: included,
          median: quantile(ratios, 0.5),
          q1: quantile(ratios, 0.25),
          q3: quantile(ratios, 0.75),
          higherCount,
          higherPct: included ? (higherCount * 100 / included) : 0,
        };
      }

      const mCost = makeMetric(metricDefs.cost);
      const mTokTotal = makeMetric(metricDefs.tokensTotal);
      const mTime = makeMetric(metricDefs.time);
      const mTokInput = makeMetric(metricDefs.tokensInput);
      const mTokOutput = makeMetric(metricDefs.tokensOutput);
      const mSteps = makeMetric(metricDefs.steps);

      renderSummary(document.getElementById('ratio-summary'), [
        { name: 'Cost', median: mCost.median, q1: mCost.q1, q3: mCost.q3 },
        { name: 'Tokens', median: mTokTotal.median, q1: mTokTotal.q1, q3: mTokTotal.q3 },
        { name: 'Time', median: mTime.median, q1: mTime.q1, q3: mTime.q3 },
      ]);

      renderHistogram(document.getElementById('ratio-cost'), mCost);
      renderHistogram(document.getElementById('ratio-tokens-total'), mTokTotal);
      renderHistogram(document.getElementById('ratio-time'), mTime);

      // Annex ratio charts
      renderHistogram(document.getElementById('annex-ratio-input'), mTokInput);
      renderHistogram(document.getElementById('annex-ratio-output'), mTokOutput);
      renderHistogram(document.getElementById('annex-ratio-steps'), mSteps);

      // Shared arrays for tables
      const gCost = g.map(x => x.model_stats.instance_cost);
      const sCost = s.map(x => x.model_stats.instance_cost);
      const gIn = g.map(x => x.model_stats.tokens_sent);
      const sIn = s.map(x => x.model_stats.tokens_sent);
      const gOut = g.map(x => x.output_tokens.total);
      const sOut = s.map(x => x.output_tokens.total);
      const gOutC = g.map(x => x.output_tokens.content);
      const sOutC = s.map(x => x.output_tokens.content);
      const gOutT = g.map(x => x.output_tokens.tool_call_args);
      const sOutT = s.map(x => x.output_tokens.tool_call_args);
      const gPatTok = g.map(x => x.patch_tokens);
      const sPatTok = s.map(x => x.patch_tokens);
      const gCalls = g.map(x => x.model_stats.api_calls);
      const sCalls = s.map(x => x.model_stats.api_calls);
      const gTpc = g.map(x => x.tokens_per_call);
      const sTpc = s.map(x => x.tokens_per_call);
      const gTT = g.map(x => x.tool_time.total_seconds);
      const sTT = s.map(x => x.tool_time.total_seconds);
      const gSt = g.map(x => x.steps);
      const sSt = s.map(x => x.steps);

      const nBoth = pairs.filter(p => outcomeOf(p) === 'both').length;
      const nGOnly = pairs.filter(p => outcomeOf(p) === 'gpt5-only').length;
      const nSOnly = pairs.filter(p => outcomeOf(p) === 'sonnet-only').length;
      const gResolved = nBoth + nGOnly;
      const sResolved = nBoth + nSOnly;
      const gCostPerResolve = gResolved ? sum(gCost) / gResolved : Infinity;
      const sCostPerResolve = sResolved ? sum(sCost) / sResolved : Infinity;
      const gMoreExp = pairs.filter((p, i) => gCost[i] > sCost[i]).length;

      const hdr = '<tr><th></th><th>GPT-5</th><th>Sonnet 4.5</th><th>S/G</th></tr>';

      const costTable =
        '<table class="annex-table">' + hdr +
        aggRow('Mean', gCost, sCost, { dollar: true, desc: 'Average API cost per task.' }) +
        aggRow('Median', gCost, sCost, { fn: median, dollar: true, desc: 'Middle value, less sensitive to outliers.' }) +
        aggRow('Total', gCost, sCost, { fn: sum, dollar: true }) +
        `<tr><td>Cost per resolve<span class="annex-desc">Total spend divided by tasks fixed.</span></td><td>${fmtD(gCostPerResolve)}</td><td>${fmtD(sCostPerResolve)}</td><td>${ratioSG(gCostPerResolve, sCostPerResolve)}</td></tr>` +
        `<tr><td>GPT-5 more expensive</td><td colspan="3">${gMoreExp}/${n} instances</td></tr>` +
        '</table>';
      renderAnnexTable(
        document.getElementById('annex-table-cost'),
        '',
        costTable,
        'Note: costs are from benchmark logs and reflect the benchmark pricing context.'
      );

      const tokenTable =
        '<table class="annex-table">' + hdr +
        aggRow('Input tokens (mean)', gIn, sIn, { desc: 'Total tokens sent across API calls.' }) +
        aggRow('Output tokens (mean)', gOut, sOut, { desc: 'Visible output tokens via tiktoken recount.' }) +
        aggRow('  content', gOutC, sOutC, { desc: 'Text portion of model response.' }) +
        aggRow('  tool_call args', gOutT, sOutT, { desc: 'Tool arguments: edits, shell commands, queries.' }) +
        aggRow('Patch size (tokens)', gPatTok, sPatTok, { desc: 'Tiktoken count of submitted diff.' }) +
        '</table>';
      renderAnnexTable(
        document.getElementById('annex-table-tokens'),
        '',
        tokenTable,
        'Takeaway: output-token differences are much larger than input-token differences.'
      );

      const actionKeys = ['bash', 'view', 'edit', 'create', 'search_find', 'submit', 'other'];
      const actionDesc = {
        bash: 'Shell commands: tests, install, command checks.',
        view: 'File reads.',
        edit: 'Edits to existing files.',
        create: 'New files created.',
        search_find: 'Search via find/grep style actions.',
        submit: 'Final patch submission.',
        other: 'Unclassified actions.',
      };
      let actionRows = '';
      actionKeys.forEach(k => {
        actionRows += aggRow(k, g.map(x => x.actions[k]), s.map(x => x.actions[k]), { dec: 1, desc: actionDesc[k] });
      });
      const actionTable = '<table class="annex-table">' + hdr + actionRows + '</table>';
      renderAnnexTable(
        document.getElementById('annex-table-actions'),
        '',
        actionTable,
        'Note: action frequencies summarize strategy differences, not correctness.'
      );

      const execTable =
        '<table class="annex-table">' + hdr +
        aggRow('Steps (mean)', gSt, sSt, { desc: 'Model turns per task.' }) +
        aggRow('API calls (mean)', gCalls, sCalls, { desc: 'Model round-trips per task.' }) +
        aggRow('Tokens/call (mean)', gTpc, sTpc, { desc: 'Average context per model call.' }) +
        aggRow('Tool time, mean (s)', gTT, sTT, { dec: 1, desc: 'Seconds spent waiting for tools.' }) +
        aggRow('Tool time, median (s)', gTT, sTT, { fn: median, dec: 1, desc: 'Median tool wait time.' }) +
        '</table>';
      renderAnnexTable(
        document.getElementById('annex-table-exec'),
        '',
        execTable,
        'Caveat: tool time excludes full wall-clock and does not fully include inference latency.'
      );

      const repoCounts = {};
      pairs.forEach(p => { repoCounts[p.repo] = (repoCounts[p.repo] || 0) + 1; });
      let repoRows = '<tr><th style="text-align:left">Repo</th><th>Instances</th><th>GPT-5 resolved</th><th>Sonnet 4.5 resolved</th></tr>';
      Object.keys(repoCounts).sort().forEach(repo => {
        const rp = pairs.filter(p => p.repo === repo);
        const rg = rp.filter(p => p.gpt5.resolved === true).length;
        const rsr = rp.filter(p => p.claude.resolved === true).length;
        repoRows += `<tr><td>${repo}</td><td>${repoCounts[repo]}</td><td>${rg}</td><td>${rsr}</td></tr>`;
      });
      const repoTable = '<table class="annex-table">' + repoRows + '</table>';
      renderAnnexTable(
        document.getElementById('annex-table-repos'),
        '',
        repoTable,
        'Note: repository mix is fixed by SWE-Bench Pro public split composition.'
      );

      const perRowsHeader =
        '<tr>' +
        '<th>Instance</th><th>Repo</th><th>Outcome</th>' +
        '<th>$ GPT-5</th><th>$ S4.5</th>' +
        '<th>Steps GPT-5</th><th>Steps S4.5</th>' +
        '<th>Input GPT-5</th><th>Input S4.5</th>' +
        '<th>Out GPT-5</th><th>Out S4.5</th>' +
        '<th>Patch GPT-5</th><th>Patch S4.5</th>' +
        '</tr>';

      const sorted = [...pairs].sort((a, b) => a.instance_id.localeCompare(b.instance_id));
      let perRows = perRowsHeader;
      sorted.forEach(p => {
        const oc = outcomeOf(p);
        const ocLabel = oc === 'both' ? '✓✓' : oc === 'gpt5-only' ? '✓✗' : oc === 'sonnet-only' ? '✗✓' : '✗✗';
        const shortId = p.instance_id.replace('instance_', '');
        perRows += '<tr>' +
          `<td title="${shortId}">${shortId}</td>` +
          `<td>${p.repo}</td>` +
          `<td>${ocLabel}</td>` +
          `<td>${fmtD(p.gpt5.model_stats.instance_cost)}</td>` +
          `<td>${fmtD(p.claude.model_stats.instance_cost)}</td>` +
          `<td>${p.gpt5.steps}</td>` +
          `<td>${p.claude.steps}</td>` +
          `<td>${fmt(p.gpt5.model_stats.tokens_sent)}</td>` +
          `<td>${fmt(p.claude.model_stats.tokens_sent)}</td>` +
          `<td>${fmt(p.gpt5.output_tokens.total)}</td>` +
          `<td>${fmt(p.claude.output_tokens.total)}</td>` +
          `<td>${fmt(p.gpt5.patch_chars)}</td>` +
          `<td>${fmt(p.claude.patch_chars)}</td>` +
        '</tr>';
      });
      const perTable = `<div class="annex-scroll"><table class="annex-table">${perRows}</table></div>`;
      renderAnnexTable(
        document.getElementById('annex-table-instances'),
        '',
        perTable,
        'Note: this includes all paired submitted instances with raw per-instance comparison values.'
      );
    })
    .catch(() => {
      [
        'ratio-summary', 'ratio-cost', 'ratio-tokens-total', 'ratio-time',
        'annex-ratio-input', 'annex-ratio-output', 'annex-ratio-steps',
        'annex-table-cost', 'annex-table-tokens', 'annex-table-actions',
        'annex-table-exec', 'annex-table-repos', 'annex-table-instances'
      ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<p class="ratio-muted">Failed to load chart data.</p>';
      });
    });
})();
</script>
