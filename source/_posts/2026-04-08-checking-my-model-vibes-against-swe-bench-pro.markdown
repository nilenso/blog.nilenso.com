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
</style>

If you choose coding models for production work, resolve rate is only part of the decision. Cost, tokens, and runtime decide whether a model is workable day to day. My intuition was: GPT models felt slow and token hungry, Claude models felt faster on similar tasks, so Claude should be cheaper. Similar claims appear in public writeups, for example in the [OpenHands Index](https://openhands.dev/blog/openhands-index), where Opus 4.5 is noted as finishing tasks quickly despite its size.

Some benchmark operators already publish this view. [SWE-rebench](https://swe-rebench.com/) and OpenHands Index include cost and runtime alongside accuracy metrics. I focused on SWE-Bench Pro because it is the one I understand best. Our [earlier write-up](https://blog.nilenso.com/blog/2025/09/25/swe-benchmarks/) covers why Pro is the best available alternative, and [OpenAI has made the same shift](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/). SWE-Bench Pro publishes trajectories, but it does not publish a consolidated cost-token-time report.

So I built one from the public data. One important choice is in **pairing**: I compare each task only when both models submitted on that same instance, then compute Sonnet 4.5 / GPT-5 ratios per task and summarize those ratios. This keeps the comparison grounded because every ratio comes from the same task under the same harness setup. I analyzed October 2025 paired runs in SWE-Bench Pro, and I would like to run the same analysis on current leaderboard pairs like GPT-4 vs Opus-4.6 once comparable paired data is available.

My vibes were off.

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

Total token usage is mixed and much less extreme than cost. Sonnet 4.5 uses more total tokens in 58.0% of tasks, with a broad spread around 1x.

Takeaway notes:
- The largest token difference is in output, not input. In the deeper breakdown, Sonnet 4.5 emits much more output per task.
- A lot of that output is tool-call content and temporary file creation that gets discarded and never appears in the final submitted patch.

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

This post is a field report from publicly available trajectories. My vibes were off, I had been avoiding GPT models because they felt slow and token hungry. This SWE-Bench Pro slice shows a different operating profile, so I am now going to use GPT and Codex models more often.

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

      const metricDefs = {
        cost: {
          title: 'Per-task cost ratio',
          xLabel: 'Cost ratio',
          leftLabel: 'Sonnet cheaper',
          rightLabel: 'Sonnet more expensive',
          takeawayPhrase: 'Sonnet was more expensive on',
          g: (s) => s.model_stats.instance_cost,
          c: (s) => s.model_stats.instance_cost,
        },
        tokensTotal: {
          title: 'Per-task total token ratio',
          xLabel: 'Total token ratio',
          leftLabel: 'Sonnet fewer total tokens',
          rightLabel: 'Sonnet more total tokens',
          takeawayPhrase: 'Sonnet used more total tokens on',
          g: (s) => s.model_stats.tokens_sent + s.model_stats.tokens_received,
          c: (s) => s.model_stats.tokens_sent + s.model_stats.tokens_received,
        },
        time: {
          title: 'Per-task time ratio',
          xLabel: 'Time ratio',
          leftLabel: 'Sonnet faster',
          rightLabel: 'Sonnet slower',
          takeawayPhrase: 'Sonnet was slower on',
          g: (s) => s.tool_time.total_seconds,
          c: (s) => s.tool_time.total_seconds,
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
        const n = ratios.length;
        const higherCount = ratios.filter(v => v > 1).length;
        return {
          ...def,
          ratios,
          n,
          median: quantile(ratios, 0.5),
          q1: quantile(ratios, 0.25),
          q3: quantile(ratios, 0.75),
          higherCount,
          higherPct: n ? (higherCount * 100 / n) : 0,
        };
      }

      const mCost = makeMetric(metricDefs.cost);
      const mTokTotal = makeMetric(metricDefs.tokensTotal);
      const mTime = makeMetric(metricDefs.time);

      renderSummary(document.getElementById('ratio-summary'), [
        { name: 'Cost', median: mCost.median, q1: mCost.q1, q3: mCost.q3 },
        { name: 'Total tokens', median: mTokTotal.median, q1: mTokTotal.q1, q3: mTokTotal.q3 },
        { name: 'Time', median: mTime.median, q1: mTime.q1, q3: mTime.q3 },
      ]);

      renderHistogram(document.getElementById('ratio-cost'), mCost);
      renderHistogram(document.getElementById('ratio-tokens-total'), mTokTotal);
      renderHistogram(document.getElementById('ratio-time'), mTime);
    })
    .catch(() => {
      ['ratio-summary', 'ratio-cost', 'ratio-tokens-total', 'ratio-time'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<p class="ratio-muted">Failed to load chart data.</p>';
      });
    });
})();
</script>
