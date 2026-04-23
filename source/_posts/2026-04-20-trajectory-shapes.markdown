---
title: "Trajectory shapes"
kind: article
author: Srihari Sriraman
created_at: 2026-04-20 00:00:00 UTC
description: "Benchmark scores tell you whether a coding agent solved the task. Trajectory shapes tell you how it worked, and those workflow signatures persist beyond the benchmark."
layout: post
---

Why are we managing our coding agents based on vibes, instead of their actual work habits?

Leaderboards tell us _how many_ tasks a model solved but not _how_. The trajectories that they leave behind tell the story of _how_, but these aren't studied as much. The tools a model prefers, and the overall "shape" of its workflow is visible through an empirical lens.

I analyzed the latest SWE-bench Pro trajectories I could get my hands on: runs from October 2025 for Sonnet 4.5 and GPT-5, 730 task trajectories per model. I [deterministically classified](#intent-classification-taxonomy) each of the steps using only tool calls, and then computed their share over time. This "trajectory shape" chart I got as a result is very interesting!

<div class="ts-shape-chart">
  <div id="ts-stackedPanels"></div>
</div>

<style>
.ts-shape-chart { margin: 1.2rem 0 1.6rem; font-family: var(--font-serif); color: #333; }
.ts-shape-chart .ts-note { color: #666; font-size: 0.92rem; margin: 0.45rem 0 0; font-family: var(--font-serif); }
.ts-shape-chart .ts-panel { padding: 4px 0; margin-bottom: 4px; }
.ts-shape-chart .ts-panel-header { display: flex; align-items: baseline; gap: 14px; margin-bottom: 2px; }
.ts-shape-chart .ts-model-tag { font-size: 13px; }
.ts-shape-chart .ts-model-tag.ts-claude { color: #b8785e; }
.ts-shape-chart .ts-model-tag.ts-gpt { color: #6a8da8; }
.ts-shape-chart .ts-panel-subhead { font-size: 11.5px; color: #111; }
.ts-shape-chart canvas { display: block; }
</style>

<script>
(function() {
  var D = {
    "models": ["claude45","gpt5"],
    "model_display_names": {"claude45":"Sonnet 4.5","gpt5":"GPT-5"},
    "tag_class": {"claude45":"ts-claude","gpt5":"ts-gpt"},
    "resolve_rate": {"claude45":43.7,"gpt5":36.3},
    "markers": {
      "claude45": [
        { "name": "first edit", "at": 34.6 },
        { "name": "last edit",  "at": 61.9 }
      ],
      "gpt5": [
        { "name": "first edit", "at": 49.5 },
        { "name": "last edit",  "at": 89.4 }
      ]
    },
    "avg_phase": {
      "claude45": {
        "R":[0.13965804428767392,0.5430711682769297,0.39351317406872927,0.31465269983788496,0.2553399960807369,0.21945617254259225,0.21181093711957916,0.21168895500171228,0.2110572212424064,0.19806842677213043,0.20051559094768975,0.1793642381090942,0.17712783330067283,0.16911868043555298,0.16396103896103903,0.1530420806140971,0.15820105820105812,0.16958617133514256,0.22328205630674755,0.12071879880521874],
        "S":[0.8545120517342736,0.4448444369226261,0.5332993366943987,0.5029946238793981,0.4190492520739432,0.34011692468482574,0.2824930670609682,0.20299175371191833,0.1791625841008558,0.18367300280880539,0.18194051033557215,0.18411337557428095,0.18262459990855057,0.149003952913418,0.11701286824743626,0.12530874094660113,0.10201842053693913,0.09098896074204721,0.08937939061395857,0.043740610098634766],
        "P":[0.0,0.0008818342151675485,0.006287151348879743,0.023071989738656404,0.029877849630936048,0.03250375596054608,0.02614638447971781,0.0219952315631328,0.015262264027696128,0.01702593245803122,0.013694558756287153,0.014449016918152717,0.015928538768044943,0.01790286759422562,0.01697040956300216,0.018521784571167283,0.020257691553987846,0.023059964726631396,0.026399503559997383,0.024880789078319934],
        "E":[0.0,0.0003919263178522438,0.002573649487229734,0.013931347573322882,0.05153014566594815,0.13101888966086503,0.18962048468221301,0.25110125357038937,0.2435201515448428,0.21639231824417018,0.17680286106212031,0.1390086441526772,0.12761120909269055,0.09861247196638155,0.08757103664511078,0.07418947460099726,0.06837154614932399,0.05585820976767481,0.05525997779084202,0.013838265072832968],
        "V":[0.0,0.009037167679142987,0.05554753888087221,0.12699897267798513,0.20733718727545888,0.23276177411979873,0.2410787771898883,0.25338471922834066,0.28828630217519113,0.3290646025213925,0.3696681690508851,0.41042088531800486,0.4261561826376643,0.476058201058201,0.5076572604350388,0.489603065734753,0.47171108498268954,0.4319126994024112,0.3889408488173922,0.20793823993412486],
        "G":[0.0,0.00102880658436214,0.004686785550983082,0.007992030831537005,0.012499183486837807,0.016856097720295254,0.018525050623816056,0.028146841727088635,0.028907831994251752,0.025919393820628384,0.0208472140570906,0.02734398660324586,0.02034424194918022,0.020762296688222614,0.019935985368084132,0.019067215363511657,0.030472271213011954,0.03833365993859819,0.04405162738496069,0.017463138142150482],
        "H":[0.0,0.0,0.00027434842249657066,0.000533455265965554,0.0059246195048664185,0.006280619243582206,0.008093278463648835,0.009775295577764714,0.010379515317786922,0.01161734927167026,0.013296100333137368,0.01581422692533804,0.025961852505062378,0.04702789208962047,0.05469984976157815,0.0886047423084461,0.11258736690835462,0.16058527663465952,0.13651179638833966,0.08702471511113505]
      },
      "gpt5": {
        "R":[0.19023445775523332,0.5089693547449784,0.5474244822582772,0.5199558674627927,0.47560403200984935,0.424895714473277,0.4294093986961019,0.42423027880091596,0.3791168511390115,0.3559299733814969,0.3243217347441726,0.31330414353267527,0.30391658971991375,0.298754262050661,0.27372598162071854,0.2739288912072846,0.265446610945226,0.24181341511673926,0.24684193538071655,0.11937134502923975],
        "S":[0.6907071806310039,0.33964419314142313,0.2844133359715078,0.28030602822846595,0.28524930747922456,0.2956316882563421,0.26218296938518537,0.2560958316844745,0.25994866552345786,0.24186355734139658,0.22461188396091458,0.20993272655322512,0.17409972299168977,0.16964570517202088,0.19225585894560965,0.1646941816263147,0.14372785570846508,0.15838115024403113,0.15650301529802918,0.07873356637207055],
        "P":[0.0,0.0017313019390581717,0.006902123730378578,0.008953304313415116,0.01055269753330695,0.016258948807425264,0.029125445191927186,0.023199445983379502,0.025359451259728265,0.03386426592797783,0.03748845798707294,0.051873103812162,0.06019324627357869,0.07460262498351139,0.05767378973750166,0.09336664028492282,0.0937332366002726,0.10935617552653566,0.11361517829661873,0.0526167392164622],
        "E":[0.0,0.0012891540592371617,0.007763927362265311,0.018082878955455135,0.03804027612891878,0.06509889771662623,0.08648650134107198,0.11768836734210697,0.13826626974133893,0.15876140249408943,0.17682943403165005,0.2009044741039201,0.21356516290726815,0.20188029883320752,0.22395792111858578,0.20718043114164997,0.1964599497147973,0.18390768588137005,0.16304647184148563,0.08392087675328679],
        "V":[0.001654355186211142,0.003516466605109264,0.006499802136921249,0.00873730378578024,0.012628061381523985,0.015406388778964959,0.016533658708173946,0.028347183748845796,0.02584641428131733,0.028268038517345995,0.038256826276216856,0.04215692740623487,0.04836707998065338,0.0642945581657493,0.07607615530053208,0.08698510630643595,0.09825500753478589,0.13621388998812825,0.14525873095817698,0.0744168535373522],
        "G":[0.0,0.0,0.0,0.0004616805170821791,0.0,0.0,0.00017313019390581717,0.0001538935056940597,0.0,0.0,0.0,0.0,0.00047487138899881284,0.0008903838543727739,0.00042870333729059493,0.0025392428439519853,0.002123730378578024,0.0011014378050389132,0.001436705799586686,0.0013174383326737898],
        "H":[0.0,0.0,0.0,0.0,0.0,0.0012465373961218836,0.00034626038781163435,0.0,0.00019786307874950534,0.0,0.0004616805170821791,0.00034626038781163435,0.0016620498614958448,0.0,0.0,0.0011426592797783932,0.0010156971375807943,0.0008079409048938134,0.0015004616805170822,0.0006232686980609418]
      }
    }
  };

  var TEXT = '#111';
  var MUTED = '#9aa1a8';
  var MODEL_COLOR = { "claude45": "#b8785e", "gpt5": "#6a8da8" };
  var ALL_MODELS = D.models.slice().sort(function(a,b){
    return (D.resolve_rate[b] || -Infinity) - (D.resolve_rate[a] || -Infinity);
  });

  function getCtx(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.parentElement.clientWidth;
    var cssH = canvas.height;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: cssW, h: cssH };
  }

  function drawStackedArea(canvas, model, markers) {
    var got = getCtx(canvas);
    var ctx = got.ctx, w = got.w, h = got.h;
    var left = 40, right = 20, top = 40, bot = 10;
    var plotW = w - left - right;
    var plotH = h - top - bot;
    var bins = 20;

    var groups = [
      { name: 'understand', letters: ['R','S'], color: '#5a7d9a' },
      { name: 'reproduce',  letters: ['P'],     color: '#b0956a' },
      { name: 'edit',       letters: ['E'],     color: '#4a8a5a' },
      { name: 'verify',     letters: ['V'],     color: '#b56a50' },
      { name: 'cleanup',    letters: ['G','H'], color: '#3a8a8a' },
    ];

    var groupVals = groups.map(function(g) {
      var summed = new Array(bins).fill(0);
      g.letters.forEach(function(l) {
        var vals = D.avg_phase[model][l];
        if (vals) for (var b = 0; b < bins; b++) summed[b] += vals[b];
      });
      return summed;
    });

    var stacked = [];
    var cumulative = new Array(bins).fill(0);
    for (var gi = 0; gi < groups.length; gi++) {
      var layer = groupVals[gi].map(function(v,i){ return cumulative[i] + v; });
      stacked.push({ group: groups[gi], bottom: cumulative.slice(), top: layer });
      cumulative = layer;
    }
    var maxes = cumulative;

    function xAt(i) { return left + (i / (bins - 1)) * plotW; }
    function yAt(v, binIdx) {
      var norm = maxes[binIdx] > 0 ? v / maxes[binIdx] : 0;
      return top + plotH - norm * plotH;
    }

    for (var s = stacked.length - 1; s >= 0; s--) {
      var L = stacked[s];
      ctx.fillStyle = L.group.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (var i = 0; i < bins; i++) {
        var x = xAt(i), y = yAt(L.top[i], i);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (var j = bins - 1; j >= 0; j--) ctx.lineTo(xAt(j), yAt(L.bottom[j], j));
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = TEXT; ctx.font = '9px Charter, serif'; ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 0.5;
    [0, 25, 50, 75].forEach(function(p) {
      var tx = left + (p / 100) * plotW;
      ctx.fillText(p + '%', tx, top - 8);
      ctx.beginPath();
      ctx.moveTo(tx, top - 3);
      ctx.lineTo(tx, top + 4);
      ctx.stroke();
    });

    var halfX = left + 0.5 * plotW;
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3,3]);
    ctx.beginPath();
    ctx.moveTo(halfX, top);
    ctx.lineTo(halfX, top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    if (markers) {
      markers.forEach(function(mk) {
        var mx = left + (mk.at / 100) * plotW;
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(mx, top - 12);
        ctx.lineTo(mx, top + plotH + 5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = TEXT;
        ctx.font = '10px Charter, serif';
        var halfLabel = ctx.measureText(mk.name).width / 2;
        if (mx + halfLabel > left + plotW) {
          ctx.textAlign = 'right';
        } else if (mx - halfLabel < left) {
          ctx.textAlign = 'left';
        } else {
          ctx.textAlign = 'center';
        }
        ctx.fillText(mk.name, mx, top - 16);
      });
    }

    for (var ls = 0; ls < stacked.length; ls++) {
      var L2 = stacked[ls];
      var searchFrom = 2, searchTo = bins - 3;
      var bestBin = Math.floor(bins / 2), bestH = 0;
      for (var bb = searchFrom; bb <= searchTo; bb++) {
        var hh = Math.abs(yAt(L2.bottom[bb], bb) - yAt(L2.top[bb], bb));
        if (hh > bestH) { bestH = hh; bestBin = bb; }
      }
      if (bestH < 10) continue;
      var labelX = xAt(bestBin);
      var midY = (yAt(L2.top[bestBin], bestBin) + yAt(L2.bottom[bestBin], bestBin)) / 2;
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.9;
      ctx.font = bestH >= 16 ? '10px Charter, serif' : '8.5px Charter, serif';
      ctx.textAlign = 'center';
      ctx.fillText(L2.group.name, labelX, midY + (bestH >= 16 ? 4 : 3));
      ctx.globalAlpha = 1;
    }
  }

  function render() {
    var container = document.getElementById('ts-stackedPanels');
    if (!container) return;
    container.innerHTML = '';
    ALL_MODELS.forEach(function(m) {
      var wrap = document.createElement('div');
      wrap.className = 'ts-panel';
      var cls = D.tag_class[m] || '';
      var rr = D.resolve_rate[m];
      var sub = rr != null ? '<span class="ts-panel-subhead">' + rr.toFixed(1) + '% resolved</span>' : '';
      wrap.innerHTML =
        '<div class="ts-panel-header">' +
          '<span class="ts-model-tag ' + cls + '">' + D.model_display_names[m] + '</span>' +
          sub +
        '</div>' +
        '<canvas height="173"></canvas>';
      container.appendChild(wrap);
      var canvas = wrap.querySelector('canvas');
      drawStackedArea(canvas, m, D.markers[m] || null);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });
})();
</script>

Here are the main work habits I see in this chart:
1. Sonnet starts editing early (at 35%), GPT starts editing much later (at 50%)
2. Sonnet is done with the implementation early (at 62%)
3. Sonnet spends a LOT of time verifying after the last source edit
4. Sonnet has some cleanup to do, which GPT doesn't have to do
5. GPT-5 reads a LOT to front load context, before it starts to do any work (at 50%)
6. GPT-5 barely does any verification

If I were to condense the above to "vibes", I might say _"Claude starts editing early and figures it out in the loop. GPT reads first, then goes for the one-shot."_ That is also close to what people on my timeline were saying when these runs were current. For example, Eric Provencher wrote:

<blockquote class="twitter-tweet" data-align="center"><p lang="en" dir="ltr">My take with codex vs claude code<br><br>- Use codex if you have a detailed plan and want to walk away for 30 min. If you try and interrupt and iterate codex, you might as well restart from scratch <br>- Use claude code if youre not 100% sure where you&#39;re going and want to iterate</p>&mdash; eric provencher (@pvncher) <a href="https://twitter.com/pvncher/status/1977806477701333470?ref_src=twsrc%5Etfw">October 13, 2025</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Now I can say the same thing with data, and with a better sense of the nuances.

{% comment %}
### Models have tool preferences

<div class="ts-ic-chart">
  <p class="ts-ic-desc">The tools provided in RLVR environments likely shape the tool preferences of models. Here are the various tools used per category, compared across <span class="ts-ic-model-sonnet">Sonnet 4.5</span> / <span class="ts-ic-model-gpt">GPT-5</span>.</p>
  <div id="ts-intent-comparison-chart"></div>
</div>

<style>
.ts-ic-chart { margin: 0.4rem 0 1.5rem; }
.ts-ic-desc {
  color: inherit;
  font-size: 1em;
  margin: 0 0 1.1rem;
}
.ts-ic-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  max-width: 920px;
  border: none !important;
}
.ts-ic-table thead,
.ts-ic-table tbody,
.ts-ic-table tr,
.ts-ic-table th {
  border: none !important;
  box-shadow: none !important;
}
.ts-ic-table td {
  box-shadow: none !important;
}
.ts-ic-table th {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 400;
  font-style: italic;
  color: #777;
}
.ts-ic-table td {
  padding: 0;
}
.ts-ic-row { border-bottom: 4px solid transparent; }
.ts-ic-cat td {
  padding: 20px 0 6px 0 !important;
  font-size: 0.88rem;
  font-style: italic;
  color: #333;
  text-align: left !important;
}
.ts-ic-name {
  text-align: right !important;
  padding-right: 12px !important;
  color: #333;
  white-space: nowrap;
  width: 1%;
  vertical-align: middle;
  font-size: 0.88rem;
}
.ts-ic-link {
  color: inherit;
  text-decoration: none;
}
.ts-ic-link:hover,
.ts-ic-link:focus-visible {
  color: #5a7d9a;
  text-decoration: underline;
}
.ts-ic-bars { padding: 2px 4px !important; max-width: 500px; }
.ts-ic-bar-row {
  display: flex;
  align-items: center;
  height: 12px;
  gap: 3px;
}
.ts-ic-bar {
  height: 12px;
  border-radius: 0;
  opacity: 0.88;
  min-width: 2px;
}
.ts-ic-bar-val {
  font-size: 0.72rem;
  min-width: 26px;
  line-height: 1;
}
.ts-ic-annotation {
  width: 240px;
  padding: 0 0 0 18px !important;
  font-size: 0.82rem;
  color: #666;
  line-height: 1.45;
  vertical-align: middle;
  font-style: italic;
  text-align: left !important;
}
.ts-ic-annotation-mobile {
  font-size: 0.76rem;
  color: #666;
  line-height: 1.45;
  font-style: italic;
  text-align: left !important;
  padding: 0 0 8px 0 !important;
}
.ts-ic-annotation code,
.ts-ic-annotation-mobile code {
  font-size: inherit;
  background: transparent;
  padding: 0;
}
.ts-ic-model-sonnet { color: #b8785e; }
.ts-ic-model-gpt { color: #6a8da8; }
@media (max-width: 640px) {
  .ts-ic-title { font-size: 1.3rem; }
  .ts-ic-desc { font-size: 1em; }
  .ts-ic-table { max-width: 100%; }
  .ts-ic-name { font-size: 0.8rem; white-space: nowrap; }
  .ts-ic-cat td { font-size: 0.8rem; }
  .ts-ic-bars { max-width: none; }
  .ts-ic-bar-row { height: 11px; gap: 3px; }
  .ts-ic-bar { height: 11px; }
  .ts-ic-bar-val { font-size: 0.68rem; min-width: 22px; }
}
</style>

<script>
(function() {
  var root = document.getElementById('ts-intent-comparison-chart');
  if (!root) return;

  var models = [
    { key: 'sonnet', name: 'Sonnet 4.5', color: '#b8785e' },
    { key: 'gpt', name: 'GPT-5', color: '#6a8da8' }
  ];

  var groups = [
    {
      name: 'read',
      annotation: 'GPT-5 reads more across the board; the biggest gap is <code>view file</code> at 2.1×.',
      rows: [
        { intent: 'read-file-range', name: 'view lines (range)', values: { sonnet: 10.6, gpt: 13.8 } },
        { intent: 'read-file-full', name: 'view file', values: { sonnet: 5.5, gpt: 11.6 } },
        { intent: 'read-via-bash', name: 'cat / head / tail', values: { sonnet: 4.1, gpt: 6.9 } }
      ]
    },
    {
      name: 'search',
      annotation: 'GPT-5 never uses <code>find</code>. It substitutes directory browsing (2.4× more) and leans harder on <code>grep</code>.',
      rows: [
        { intent: 'search-keyword', name: 'grep / ripgrep', values: { sonnet: 12.4, gpt: 15.0 } },
        { intent: 'search-files-by-content', name: 'find | grep', values: { sonnet: 5.8, gpt: 0.0 } },
        { intent: 'view-directory', name: 'view directory', values: { sonnet: 2.0, gpt: 4.9 } },
        { intent: 'search-files-by-name', name: 'find by filename', values: { sonnet: 3.2, gpt: 0.1 } },
        { intent: 'list-directory', name: 'ls / tree', values: { sonnet: 1.5, gpt: 1.6 } }
      ]
    },
    {
      name: 'edit',
      annotation: 'Edit rates are close. Sonnet 4.5 does not do any <code>insert_at_line</code>; it prefers only <code>str_replace</code>.',
      rows: [
        { intent: 'edit-source', name: 'str_replace', values: { sonnet: 9.2, gpt: 11.5 } },
        { intent: 'insert-source', name: 'insert_at_line', values: { sonnet: 0.0, gpt: 1.9 } }
      ]
    },
    {
      name: 'verify',
      annotation: 'Sonnet 4.5 likes to write tests; GPT-5 does not. Sonnet also tries <code>go build</code> / <code>make</code> on Python codebases.',
      rows: [
        { intent: 'run-test-suite', name: 'pytest / go test (broad)', values: { sonnet: 10.5, gpt: 1.3 } },
        { intent: 'run-verify-script', name: 'run verify script', values: { sonnet: 6.0, gpt: 0.3 } },
        { intent: 'create-test-script', name: 'write test file', values: { sonnet: 4.7, gpt: 0.0 } },
        { intent: 'run-test-specific', name: 'pytest -k / :: (targeted)', values: { sonnet: 2.0, gpt: 0.9 } },
        { intent: 'compile-build', name: 'go build / make / tsc', values: { sonnet: 1.9, gpt: 0.1 } },
        { intent: 'run-inline-verify', name: 'inline verify snippet', values: { sonnet: 1.8, gpt: 1.6 } }
      ]
    },
    {
      name: 'housekeeping',
      annotation: 'Sonnet 4.5 creates <code>.md</code> files and throwaway scripts that it later needs to clean up.',
      rows: [
        { intent: 'file-cleanup', name: 'rm / mv / cp', values: { sonnet: 2.7, gpt: 0.0 } }
      ]
    }
  ];

  var maxVal = 0;
  groups.forEach(function(group) {
    group.rows.forEach(function(row) {
      models.forEach(function(model) {
        maxVal = Math.max(maxVal, row.values[model.key]);
      });
    });
  });

  function widthPct(value) {
    return ((value / maxVal) * 100).toFixed(1) + '%';
  }

  function render() {
    var isMobile = window.matchMedia('(max-width: 640px)').matches;
    var html = '<table class="ts-ic-table"><tbody>';

    var rowIdx = 0;
    groups.forEach(function(group) {
      html += '<tr class="ts-ic-cat"><td colspan="' + (isMobile ? '2' : '2') + '" style="text-align:left;font-style:italic">' + group.name + '</td></tr>';
      if (isMobile) {
        html += '<tr><td colspan="2" class="ts-ic-annotation-mobile">' + group.annotation + '</td></tr>';
      }
      group.rows.forEach(function(row, groupRowIdx) {
        var rowHref = '#intent-' + row.intent;
        html += '<tr class="ts-ic-row">' +
          '<td class="ts-ic-name" style="text-align:right;padding-right:18px"><a class="ts-ic-link" href="' + rowHref + '" title="' + row.intent + '">' + row.name + '</a></td>' +
          '<td class="ts-ic-bars">';

        var best = Math.max.apply(null, models.map(function(model) { return row.values[model.key]; }));
        models.forEach(function(model) {
          var value = row.values[model.key];
          var bold = value === best && best >= 0.3 ? 'font-weight:700;' : '';
          html += '<div class="ts-ic-bar-row">' +
            '<div class="ts-ic-bar" style="width:' + widthPct(value) + ';background:' + model.color + '"></div>' +
            '<span class="ts-ic-bar-val" style="color:' + model.color + ';' + bold + '">' + value.toFixed(1) + '</span>' +
          '</div>';
        });

        html += '</td>';
        if (!isMobile && groupRowIdx === 0) {
          html += '<td class="ts-ic-annotation" rowspan="' + group.rows.length + '">' + group.annotation + '</td>';
        }
        html += '</tr>';
        rowIdx += 1;
      });
    });

    html += '</tbody></table>';
    root.innerHTML = html;
  }

  render();
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 120);
  });
})();
</script>
{% endcomment %}

### With newer models and a maintainer

<p>I wanted to replicate this chart for Opus 4.6 and GPT-5.4, but the SWE Bench Pro trajectories (or any other SWE-agent trajectories) for them are unavailable. I then remembered that Mario Zechner has been <a href="https://huggingface.co/datasets/badlogicgames/pi-mono">publishing his Pi trajectories on Hugging Face</a>, and downloaded them.</p>

<p>Luckily, he works through GitHub issues methodically. Each session is one issue, and one model. It kicks off with the same <a href="#mario-analysis-prompt">analysis prompt</a>, waits for his <em>go ahead</em>, there is a varied amount of steering to address it, and then he wraps up explicitly to ship a fix, close the issue, leave a triage comment, and so on. Each one starts with git work (read the PR, read the comments) and ends with git work (push the change, close the issue, or do the final triage), with the source-editing loop in between.</p>

<p>While the issue fixes make for similar trajectories to SWE Bench Pro, I&rsquo;m still changing the models, harness, and adding a maintainer, so this is <em>not</em> exactly an apples-to-apples comparison. To keep the trajectory-shape comparison closer to the benchmark, the Pi panels below use only the strict single-model sessions whose final title starts with <code>Issue:</code>. That said, the observations from the previous section still hold. The bars below each Pi panel show steering messages during the run; the labels mark Mario&rsquo;s <em>go ahead</em> and <em>wrap up</em> moments (<button type="button" class="ts-pi-git-toggle" aria-pressed="true">hide git</button>).</p>

<div class="ts-pi-chart" data-model="claude-opus-4-5-6">
  <div class="ts-pi-panels"></div>
</div>

<p>My interpretation here is that the explicit analysis prompt is pushing the understand phase to be longer. The first edit is pushed from 35% to 47%. After that, there&rsquo;s a fair amount of steering, QA, critique, and validation, with verify + edit cycles, after which it wraps up. The push to verify in the <a href="#swe-agent-issue-resolution-prompt">SWE-agent prompt</a> causes the benchmark trajectory to go on longer, and is a fair bit redundant.</p>

<div class="ts-pi-chart" data-model="gpt-5.4">
  <div class="ts-pi-panels"></div>
</div>

<p>As with Claude, the analysis prompt makes GPT go on even longer, pushing the first edit from 50% to 63%. However, the edit duration has reduced significantly from 40% to 23%. I suspect this is a combination of the model upgrade and Mario&rsquo;s steering towards &ldquo;minimal&rdquo; and &ldquo;concise&rdquo; solutions.</p>

<style>
.ts-pi-chart { margin: 1rem 0 1.5rem; font-family: var(--font-serif); color: #333; }
.ts-pi-git-toggle {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  vertical-align: baseline;
  text-decoration: underline dotted;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: #b5b5b5;
}
.ts-pi-git-toggle:hover,
.ts-pi-git-toggle:focus-visible {
  text-decoration-style: solid;
  text-decoration-color: currentColor;
  outline: none;
}
.ts-pi-chart .ts-pi-panel { padding: 0; margin-bottom: 8px; }
.ts-pi-chart .ts-pi-panel-header { display: flex; align-items: baseline; gap: 14px; margin-bottom: 2px; }
.ts-pi-chart .ts-pi-model-tag { font-size: 13px; }
.ts-pi-chart .ts-pi-model-tag.ts-pi-claude { color: #b8785e; }
.ts-pi-chart .ts-pi-model-tag.ts-pi-gpt { color: #6a8da8; }
.ts-pi-chart .ts-pi-side-label { font-size: 0.92rem; font-style: italic; margin: 0 0 4px; color: #222; }
.ts-pi-chart .ts-pi-panel canvas + .ts-pi-side-label { margin-top: 14px; }
.ts-pi-chart .ts-pi-panel-subhead { font-size: 0.82rem; color: #666; padding-left: 8px; }
.ts-pi-chart canvas { display: block; width: 100%; }
</style>

<script>
(function() {
  var D = {"models":["gpt-5.4","claude-opus-4-5-6"],"model_display_names":{"gpt-5.4":"gpt-5.4","claude-opus-4-5-6":"Opus 4.5/4.6"},"resolve_rate":{"gpt-5.4":96.1,"claude-opus-4-5-6":98.0},"raw_single_model_counts":{"gpt-5.4":79,"claude-opus-4-5-6":49},"analyzed_counts":{"gpt-5.4":77,"claude-opus-4-5-6":49},"avg_phase":{"gpt-5.4":{"R":[0.0,0.07039473684210526,0.37521929824561406,0.5339912280701753,0.6486842105263159,0.5611842105263157,0.5839912280701754,0.5675438596491228,0.5063596491228071,0.5125,0.41600877192982455,0.37543859649122807,0.3651315789473685,0.3153508771929824,0.3497807017543859,0.3864035087719298,0.3267543859649123,0.21293859649122812,0.20548245614035093,0.12434210526315788],"S":[0.05372807017543859,0.3364035087719298,0.30855263157894736,0.3197368421052631,0.24057017543859646,0.3039473684210526,0.22412280701754383,0.20438596491228067,0.2236842105263158,0.18969298245614036,0.21206140350877192,0.15504385964912282,0.13486842105263158,0.1118421052631579,0.12214912280701756,0.11228070175438597,0.17149122807017544,0.11842105263157894,0.03837719298245614,0.10307017543859649],"P":[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.013157894736842105,0.017543859649122806,0.013157894736842105,0.013157894736842105,0.006578947368421052],"E":[0.0,0.0,0.0,0.0,0.01293859649122807,0.009868421052631578,0.019736842105263157,0.023026315789473683,0.023903508771929826,0.06710526315789474,0.11710526315789474,0.19671052631578947,0.17324561403508773,0.23618421052631577,0.1475877192982456,0.10394736842105262,0.15460526315789477,0.2530701754385965,0.14846491228070177,0.07171052631578946],"V":[0.013157894736842105,0.0,0.0,0.010307017543859648,0.007017543859649123,0.029605263157894735,0.02850877192982456,0.07236842105263158,0.09692982456140352,0.11622807017543861,0.10087719298245615,0.14342105263157895,0.13706140350877194,0.1524122807017544,0.24013157894736842,0.23728070175438598,0.14100877192982456,0.12171052631578948,0.12061403508771931,0.03399122807017543],"G":[0.8410087719298246,0.5800438596491229,0.2978070175438597,0.09868421052631579,0.06578947368421052,0.0625,0.10416666666666667,0.08771929824561403,0.07236842105263158,0.0756578947368421,0.049342105263157895,0.07017543859649122,0.10416666666666667,0.11074561403508773,0.10855263157894737,0.09429824561403508,0.11293859649122806,0.2017543859649123,0.42894736842105263,0.6328947368421053],"H":[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.010964912280701754,0.006578947368421052,0.0,0.013157894736842105,0.013157894736842105,0.006578947368421052,0.0043859649122807015,0.008771929824561403,0.021929824561403508,0.013157894736842105,0.007675438596491227,0.003289473684210526]},"claude-opus-4-5-6":{"R":[0.05927579365079364,0.13864087301587302,0.33878968253968256,0.4059523809523809,0.40190972222222215,0.3533730158730159,0.2631448412698413,0.3670634920634921,0.21205357142857142,0.3001736111111111,0.33998015873015874,0.24652777777777776,0.4154761904761904,0.22643849206349206,0.16041666666666668,0.1560019841269841,0.13219246031746032,0.11830357142857141,0.07361111111111111,0.15416666666666667],"S":[0.030257936507936508,0.2797619047619047,0.314484126984127,0.3531746031746032,0.3003472222222222,0.3219246031746032,0.3993055555555556,0.3162202380952381,0.2743055555555555,0.2585565476190476,0.1076388888888889,0.22743055555555558,0.03645833333333333,0.10491071428571429,0.0625,0.10267857142857144,0.09970238095238095,0.0974702380952381,0.06101190476190477,0.013020833333333334],"P":[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"E":[0.0,0.0,0.020833333333333332,0.02628968253968254,0.049479166666666664,0.039285714285714285,0.06671626984126984,0.09305555555555556,0.1599702380952381,0.21319444444444446,0.1723214285714286,0.24851190476190477,0.2490079365079365,0.251984126984127,0.284375,0.2621527777777778,0.2027777777777778,0.1753472222222222,0.04811507936507936,0.028472222222222218],"V":[0.0,0.027777777777777776,0.0,0.01875,0.02951388888888889,0.021527777777777774,0.020833333333333332,0.014087301587301588,0.053323412698412696,0.11398809523809524,0.08492063492063491,0.09796626984126984,0.12296626984126985,0.20833333333333334,0.25486111111111115,0.20486111111111113,0.19379960317460318,0.1331845238095238,0.12038690476190476,0.040500992063492065],"G":[0.511656746031746,0.4444444444444444,0.1175595238095238,0.10208333333333335,0.052083333333333336,0.0625,0.041666666666666664,0.10416666666666667,0.109375,0.06944444444444445,0.020833333333333332,0.047619047619047616,0.03720238095238095,0.0625,0.10243055555555554,0.10416666666666667,0.2465277777777778,0.3090277777777778,0.578125,0.7270089285714286],"H":[0.0,0.0,0.0,0.020833333333333332,0.0,0.0,0.0,0.003472222222222222,0.003472222222222222,0.002976190476190476,0.010416666666666666,0.003472222222222222,0.024305555555555552,0.0,0.020833333333333332,0.020833333333333332,0.041666666666666664,0.020833333333333332,0.010416666666666666,0.013020833333333334]}},"first_edit_markers":{"gpt-5.4":{"median":62.9},"claude-opus-4-5-6":{"median":47.4}},"last_edit_markers":{"gpt-5.4":{"median":86.4},"claude-opus-4-5-6":{"median":81.0}},"intervention_markers":{"gpt-5.4":{"authorization":{"median":57.1},"closeout":{"median":84.2}},"claude-opus-4-5-6":{"authorization":{"median":36.4},"closeout":{"median":78.4}}},"steering_message_counts":{"gpt-5.4":[8,0,0,0,0,7,7,6,9,5,6,26,31,33,14,24,15,28,25,25],"claude-opus-4-5-6":[1,0,5,4,2,8,3,12,7,3,5,7,13,4,6,4,13,5,4,9]},"benchmark":{"pair_for_pi_model":{"gpt-5.4":"gpt5","claude-opus-4-5-6":"claude45"},"avg_phase":{"claude45":{"R":[0.13965804428767392,0.5430711682769297,0.39351317406872927,0.31465269983788496,0.2553399960807369,0.21945617254259225,0.21181093711957916,0.21168895500171228,0.2110572212424064,0.19806842677213043,0.20051559094768975,0.1793642381090942,0.17712783330067283,0.16911868043555298,0.16396103896103903,0.1530420806140971,0.15820105820105812,0.16958617133514256,0.22328205630674755,0.12071879880521874],"S":[0.8545120517342736,0.4448444369226261,0.5332993366943987,0.5029946238793981,0.4190492520739432,0.34011692468482574,0.2824930670609682,0.20299175371191833,0.1791625841008558,0.18367300280880539,0.18194051033557215,0.18411337557428095,0.18262459990855057,0.149003952913418,0.11701286824743626,0.12530874094660113,0.10201842053693913,0.09098896074204721,0.08937939061395857,0.043740610098634766],"P":[0.0,0.0008818342151675485,0.006287151348879743,0.023071989738656404,0.029877849630936048,0.03250375596054608,0.02614638447971781,0.0219952315631328,0.015262264027696128,0.01702593245803122,0.013694558756287153,0.014449016918152717,0.015928538768044943,0.01790286759422562,0.01697040956300216,0.018521784571167283,0.020257691553987846,0.023059964726631396,0.026399503559997383,0.024880789078319934],"E":[0.0,0.0003919263178522438,0.002573649487229734,0.013931347573322882,0.05153014566594815,0.13101888966086503,0.18962048468221301,0.25110125357038937,0.2435201515448428,0.21639231824417018,0.17680286106212031,0.1390086441526772,0.12761120909269055,0.09861247196638155,0.08757103664511078,0.07418947460099726,0.06837154614932399,0.05585820976767481,0.05525997779084202,0.013838265072832968],"V":[0.0,0.009037167679142987,0.05554753888087221,0.12699897267798513,0.20733718727545888,0.23276177411979873,0.2410787771898883,0.25338471922834066,0.28828630217519113,0.3290646025213925,0.3696681690508851,0.41042088531800486,0.4261561826376643,0.476058201058201,0.5076572604350388,0.489603065734753,0.47171108498268954,0.4319126994024112,0.3889408488173922,0.20793823993412486],"G":[0.0,0.00102880658436214,0.004686785550983082,0.007992030831537005,0.012499183486837807,0.016856097720295254,0.018525050623816056,0.028146841727088635,0.028907831994251752,0.025919393820628384,0.0208472140570906,0.02734398660324586,0.02034424194918022,0.020762296688222614,0.019935985368084132,0.019067215363511657,0.030472271213011954,0.03833365993859819,0.04405162738496069,0.017463138142150482],"H":[0.0,0.0,0.00027434842249657066,0.000533455265965554,0.0059246195048664185,0.006280619243582206,0.008093278463648835,0.009775295577764714,0.010379515317786922,0.01161734927167026,0.013296100333137368,0.01581422692533804,0.025961852505062378,0.04702789208962047,0.05469984976157815,0.0886047423084461,0.11258736690835462,0.16058527663465952,0.13651179638833966,0.08702471511113505]},"gpt5":{"R":[0.19023445775523332,0.5089693547449784,0.5474244822582772,0.5199558674627927,0.47560403200984935,0.424895714473277,0.4294093986961019,0.42423027880091596,0.3791168511390115,0.3559299733814969,0.3243217347441726,0.31330414353267527,0.30391658971991375,0.298754262050661,0.27372598162071854,0.2739288912072846,0.265446610945226,0.24181341511673926,0.24684193538071655,0.11937134502923975],"S":[0.6907071806310039,0.33964419314142313,0.2844133359715078,0.28030602822846595,0.28524930747922456,0.2956316882563421,0.26218296938518537,0.2560958316844745,0.25994866552345786,0.24186355734139658,0.22461188396091458,0.20993272655322512,0.17409972299168977,0.16964570517202088,0.19225585894560965,0.1646941816263147,0.14372785570846508,0.15838115024403113,0.15650301529802918,0.07873356637207055],"P":[0.0,0.0017313019390581717,0.006902123730378578,0.008953304313415116,0.01055269753330695,0.016258948807425264,0.029125445191927186,0.023199445983379502,0.025359451259728265,0.03386426592797783,0.03748845798707294,0.051873103812162,0.06019324627357869,0.07460262498351139,0.05767378973750166,0.09336664028492282,0.0937332366002726,0.10935617552653566,0.11361517829661873,0.0526167392164622],"E":[0.0,0.0012891540592371617,0.007763927362265311,0.018082878955455135,0.03804027612891878,0.06509889771662623,0.08648650134107198,0.11768836734210697,0.13826626974133893,0.15876140249408943,0.17682943403165005,0.2009044741039201,0.21356516290726815,0.20188029883320752,0.22395792111858578,0.20718043114164997,0.1964599497147973,0.18390768588137005,0.16304647184148563,0.08392087675328679],"V":[0.001654355186211142,0.003516466605109264,0.006499802136921249,0.00873730378578024,0.012628061381523985,0.015406388778964959,0.016533658708173946,0.028347183748845796,0.02584641428131733,0.028268038517345995,0.038256826276216856,0.04215692740623487,0.04836707998065338,0.0642945581657493,0.07607615530053208,0.08698510630643595,0.09825500753478589,0.13621388998812825,0.14525873095817698,0.0744168535373522],"G":[0.0,0.0,0.0,0.0004616805170821791,0.0,0.0,0.00017313019390581717,0.0001538935056940597,0.0,0.0,0.0,0.0,0.00047487138899881284,0.0008903838543727739,0.00042870333729059493,0.0025392428439519853,0.002123730378578024,0.0011014378050389132,0.001436705799586686,0.0013174383326737898],"H":[0.0,0.0,0.0,0.0,0.0,0.0012465373961218836,0.00034626038781163435,0.0,0.00019786307874950534,0.0,0.0004616805170821791,0.00034626038781163435,0.0016620498614958448,0.0,0.0,0.0011426592797783932,0.0010156971375807943,0.0008079409048938134,0.0015004616805170822,0.0006232686980609418]}},"first_edit_markers":{"claude45":{"median":34.6},"gpt5":{"median":49.5}},"last_edit_markers":{"claude45":{"median":61.9},"gpt5":{"median":89.4}},"resolve_rate":{"claude45":43.7,"gpt5":36.3},"model_display_names":{"claude45":"Sonnet 4.5","gpt5":"GPT-5"},"num_trajs":{"claude45":730,"gpt5":730}}};

  var ORDER = D.models.slice().sort(function(a, b) {
    return (D.resolve_rate[b] || -Infinity) - (D.resolve_rate[a] || -Infinity);
  });
  var TAG_CLASS = { 'claude-opus-4-5-6': 'ts-pi-claude', 'gpt-5.4': 'ts-pi-gpt' };
  var FAMILY_LABEL = {
    'claude-opus-4-5-6': 'Claude family',
    'gpt-5.4': 'GPT family'
  };
  var GUIDED_MODEL_LABEL = {
    'claude-opus-4-5-6': 'Opus 4.5/6',
    'gpt-5.4': 'GPT-5.4'
  };
  var showGit = true;
  var ALL_GROUPS = [
    { name: 'understand', letters: ['R','S'], color: '#5a7d9a' },
    { name: 'reproduce', letters: ['P'], color: '#b0956a' },
    { name: 'edit', letters: ['E'], color: '#4a8a5a' },
    { name: 'verify', letters: ['V'], color: '#b56a50' },
    { name: 'git', letters: ['G'], color: '#8a7a5a' },
    { name: 'cleanup', letters: ['H'], color: '#3a8a8a' }
  ];

  function getGroups() {
    return ALL_GROUPS.filter(function(group) {
      return showGit || group.name !== 'git';
    });
  }

  function syncGitToggle() {
    var btns = document.querySelectorAll('.ts-pi-git-toggle');
    btns.forEach(function(btn) {
      btn.textContent = showGit ? 'hide git' : 'show git';
      btn.setAttribute('aria-pressed', showGit ? 'true' : 'false');
    });
  }

  function bindGitToggle() {
    var btns = document.querySelectorAll('.ts-pi-git-toggle');
    btns.forEach(function(btn) {
      if (btn.__tsPiBound) return;
      btn.__tsPiBound = true;
      btn.addEventListener('click', function() {
        showGit = !showGit;
        syncGitToggle();
        render();
      });
    });
    syncGitToggle();
  }

  function getCtx(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.parentElement.clientWidth;
    var cssH = canvas.height;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: cssW, h: cssH };
  }

  function drawPanel(canvas, phaseData, opts) {
    opts = opts || {};
    var groups = opts.groups || ALL_GROUPS;
    var got = getCtx(canvas);
    var ctx = got.ctx, w = got.w, h = got.h;
    var topMarkers = (opts.topMarkers || []).filter(Boolean);
    var bottomMarkers = (opts.bottomMarkers || []).filter(Boolean);
    var steeringCounts = opts.steeringCounts || null;
    var hasSteering = steeringCounts && steeringCounts.some(function(v) { return v > 0; });
    var left = 40, right = 18;
    var top = topMarkers.length ? 34 : 28;
    var bottomReserve = hasSteering ? 44 : (bottomMarkers.length ? 18 : 10);
    var plotW = w - left - right;
    var plotH = h - top - bottomReserve;
    var bins = 20;
    var sparkBaseY = top + plotH + 18;
    var sparkH = 12;
    var sparkTopY = sparkBaseY - sparkH;
    var bottomLabelY = hasSteering ? (top + plotH + 38) : (h - 4);

    function xPct(pct) { return left + (pct / 100) * plotW; }
    function xAtBin(i) { return left + (i / (bins - 1)) * plotW; }
    function xBinStart(i) { return left + (i / bins) * plotW; }
    function xBinEnd(i) { return left + ((i + 1) / bins) * plotW; }

    var groupVals = groups.map(function(g) {
      var summed = new Array(bins).fill(0);
      g.letters.forEach(function(l) {
        var vals = phaseData[l] || [];
        for (var b = 0; b < bins; b++) summed[b] += vals[b] || 0;
      });
      return summed;
    });

    var stacked = [];
    var cumulative = new Array(bins).fill(0);
    for (var gi = 0; gi < groups.length; gi++) {
      var layer = groupVals[gi].map(function(v, i) { return cumulative[i] + v; });
      stacked.push({ group: groups[gi], bottom: cumulative.slice(), top: layer });
      cumulative = layer;
    }
    var maxes = cumulative;

    function yAt(v, idx) {
      var norm = maxes[idx] > 0 ? v / maxes[idx] : 0;
      return top + plotH - norm * plotH;
    }

    ctx.fillStyle = '#6b7280';
    ctx.font = '9px Charter, serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    [0,25,50,75].forEach(function(p) {
      var x = xPct(p);
      ctx.fillText(p + '%', x, top - 8);
      ctx.beginPath();
      ctx.moveTo(x, top - 3);
      ctx.lineTo(x, top + 4);
      ctx.stroke();
    });

    for (var s = stacked.length - 1; s >= 0; s--) {
      var layer = stacked[s];
      ctx.fillStyle = layer.group.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (var i = 0; i < bins; i++) {
        var x = xAtBin(i), y = yAt(layer.top[i], i);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (var j = bins - 1; j >= 0; j--) ctx.lineTo(xAtBin(j), yAt(layer.bottom[j], j));
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (topMarkers.length) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.28)';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([4,4]);
      topMarkers.forEach(function(mk) {
        var x = xPct(mk.at);
        ctx.beginPath();
        ctx.moveTo(x, top - 12);
        ctx.lineTo(x, top + plotH);
        ctx.stroke();
      });
      ctx.restore();
    }

    if (bottomMarkers.length) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.28)';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([4,4]);
      bottomMarkers.forEach(function(mk) {
        var x = xPct(mk.at);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottomLabelY - 12);
        ctx.stroke();
      });
      ctx.restore();
    }

    var halfX = xPct(50);
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3,3]);
    ctx.beginPath();
    ctx.moveTo(halfX, top);
    ctx.lineTo(halfX, top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#cfcfcf';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(left, top + plotH);
    ctx.lineTo(left + plotW, top + plotH);
    ctx.stroke();

    ctx.font = '10px Charter, serif';
    ctx.textAlign = 'center';
    topMarkers.forEach(function(mk) {
      var x = xPct(mk.at);
      var labelW = ctx.measureText(mk.name).width + 10;
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      ctx.fillRect(x - labelW / 2, top - 28, labelW, 12);
      ctx.fillStyle = '#111';
      ctx.fillText(mk.name, x, top - 19);
    });

    if (hasSteering) {
      var maxCount = Math.max.apply(null, steeringCounts.concat([1]));
      ctx.font = '10px Charter, serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#111';
      ctx.fillText('Mario steering', left, sparkTopY + 8);
      ctx.strokeStyle = 'rgba(0,0,0,0.16)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(left, sparkBaseY + 0.5);
      ctx.lineTo(left + plotW, sparkBaseY + 0.5);
      ctx.stroke();
      for (var bi = 0; bi < bins; bi++) {
        var count = steeringCounts[bi] || 0;
        var barH = maxCount > 0 ? (count / maxCount) * sparkH : 0;
        var x0 = xBinStart(bi), x1 = xBinEnd(bi);
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(x0, sparkBaseY - barH, Math.max(1, x1 - x0 - 0.6), barH);
      }
    }

    ctx.font = '10px Charter, serif';
    ctx.textAlign = 'center';
    bottomMarkers.forEach(function(mk) {
      var x = xPct(mk.at);
      var labelW = ctx.measureText(mk.name).width + 10;
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      ctx.fillRect(x - labelW / 2, bottomLabelY - 9, labelW, 12);
      ctx.fillStyle = '#111';
      ctx.fillText(mk.name, x, bottomLabelY);
    });

    var placedLabels = [];
    function rectsOverlap(a, b) {
      return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
    }

    var layerLabels = stacked.map(function(L) {
      var candidates = [];
      for (var bb = 2; bb <= bins - 3; bb++) {
        var hh = Math.abs(yAt(L.bottom[bb], bb) - yAt(L.top[bb], bb));
        candidates.push({
          bin: bb,
          h: hh,
          midY: (yAt(L.top[bb], bb) + yAt(L.bottom[bb], bb)) / 2
        });
      }
      candidates.sort(function(a, b) { return b.h - a.h; });
      return { layer: L, candidates: candidates, maxH: candidates.length ? candidates[0].h : 0 };
    }).sort(function(a, b) {
      return b.maxH - a.maxH;
    });

    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.85;
    ctx.font = '10px Charter, serif';
    ctx.textAlign = 'center';

    layerLabels.forEach(function(item) {
      if (item.maxH < 16) return;
      var text = item.layer.group.name;
      var labelW = ctx.measureText(text).width + 6;
      for (var ci = 0; ci < Math.min(8, item.candidates.length); ci++) {
        var cand = item.candidates[ci];
        if (cand.h < 14) break;
        var x = xAtBin(cand.bin);
        var y = cand.midY + 4;
        var rect = {
          x: x - labelW / 2,
          y: y - 8,
          w: labelW,
          h: 10
        };
        if (rect.x < left || rect.x + rect.w > left + plotW) continue;
        var collides = placedLabels.some(function(prev) { return rectsOverlap(rect, prev); });
        if (collides) continue;
        ctx.fillText(text, x, y);
        placedLabels.push(rect);
        break;
      }
    });

    ctx.globalAlpha = 1;
  }

  function render() {
    syncGitToggle();
    var activeGroups = getGroups();
    var charts = document.querySelectorAll('.ts-pi-chart');
    charts.forEach(function(chart) {
      var root = chart.querySelector('.ts-pi-panels');
      if (!root) return;
      var filter = chart.getAttribute('data-model');
      var modelsToRender = filter ? [filter] : ORDER;
      root.innerHTML = '';
      modelsToRender.forEach(function(model) {
        var wrap = document.createElement('div');
        wrap.className = 'ts-pi-panel';
        var tagCls = TAG_CLASS[model] || '';
        var title = FAMILY_LABEL[model] || D.model_display_names[model];
        var benchmarkModel = D.benchmark.pair_for_pi_model[model];
        var benchmarkName = D.benchmark.model_display_names[benchmarkModel] || benchmarkModel;
        var benchmarkN = D.benchmark.num_trajs[benchmarkModel];
        var rawN = D.raw_single_model_counts[model];
        var guidedName = GUIDED_MODEL_LABEL[model] || D.model_display_names[model];

        wrap.innerHTML =
          '<div class="ts-pi-panel-header"><span class="ts-pi-model-tag ' + tagCls + '">' + title + '</span></div>' +
          '<div class="ts-pi-side-label">swe-agent<span class="ts-pi-panel-subhead">' + benchmarkN + ' trajectories · ' + benchmarkName + '</span></div>' +
          '<canvas height="173"></canvas>' +
          '<div class="ts-pi-side-label">pi + mario<span class="ts-pi-panel-subhead">' + rawN + ' trajs · ' + guidedName + '</span></div>' +
          '<canvas height="207"></canvas>';
        root.appendChild(wrap);
        var canvases = wrap.querySelectorAll('canvas');
        drawPanel(canvases[0], D.benchmark.avg_phase[benchmarkModel], {
          groups: activeGroups,
          topMarkers: [
            { name: 'first edit', at: D.benchmark.first_edit_markers[benchmarkModel].median },
            { name: 'last edit', at: D.benchmark.last_edit_markers[benchmarkModel].median }
          ]
        });
        drawPanel(canvases[1], D.avg_phase[model], {
          groups: activeGroups,
          topMarkers: [
            { name: 'first edit', at: D.first_edit_markers[model].median },
            { name: 'last edit', at: D.last_edit_markers[model].median }
          ],
          bottomMarkers: [
            { name: 'go ahead', at: D.intervention_markers[model].authorization.median },
            { name: 'wrap up', at: D.intervention_markers[model].closeout.median }
          ],
          steeringCounts: D.steering_message_counts[model]
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      bindGitToggle();
      render();
    });
  } else {
    bindGitToggle();
    render();
  }
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });
})();
</script>

### Why this method works?

<p>The simplest thing that changes is the length. On the benchmark, Sonnet 4.5 runs longer than GPT-5 (mean 77.5 steps vs 59.5). With Mario steering newer models, the ordering reverses: Opus 4.5/4.6 finishes in roughly half the steps of GPT-5.4 (30.9 vs 40.6). Same family fingerprint of &ldquo;Claude moves faster,&rdquo; but in a much shorter overall run, and with the relative ordering against GPT inverted.</p>

<div class="ts-lencmp">
  <p class="ts-lencmp-kicker">Mean steps as the dot, p25&ndash;p75 as the bar, on a fixed 0&ndash;100 scale.</p>

  <div class="ts-lencmp-axis">
    <div></div>
    <div class="ts-lencmp-axis-track">
      <span class="ts-lencmp-axis-label start">0</span>
      <span class="ts-lencmp-axis-label" style="left:50%">50</span>
      <span class="ts-lencmp-axis-label end">100</span>
    </div>
    <div class="ts-lencmp-axis-unit">steps</div>
  </div>

  <div class="ts-lencmp-row">
    <div class="ts-lencmp-left">
      <div class="ts-lencmp-label" style="color:#b8785e">SWE agent Sonnet 4.5</div>
      <div class="ts-lencmp-meta">730 tasks &middot; 43.7% resolved</div>
    </div>
    <div class="ts-lencmp-track">
      <div class="ts-lencmp-iqr" style="left:63%;width:26%;background:#b8785e"></div>
      <div class="ts-lencmp-dot" style="left:77.5%;background:#b8785e"></div>
      <div class="ts-lencmp-mean" style="left:77.5%;color:#b8785e">77.5</div>
    </div>
    <div class="ts-lencmp-range">63&ndash;89</div>
  </div>

  <div class="ts-lencmp-row">
    <div class="ts-lencmp-left">
      <div class="ts-lencmp-label" style="color:#6a8da8">SWE agent GPT-5</div>
      <div class="ts-lencmp-meta">730 tasks &middot; 36.3% resolved</div>
    </div>
    <div class="ts-lencmp-track">
      <div class="ts-lencmp-iqr" style="left:34%;width:42%;background:#6a8da8"></div>
      <div class="ts-lencmp-dot" style="left:59.5%;background:#6a8da8"></div>
      <div class="ts-lencmp-mean" style="left:59.5%;color:#6a8da8">59.5</div>
    </div>
    <div class="ts-lencmp-range">34&ndash;76</div>
  </div>

  <div class="ts-lencmp-row">
    <div class="ts-lencmp-left">
      <div class="ts-lencmp-label" style="color:#b8785e">Mario + Pi &middot; Opus 4.5/4.6</div>
      <div class="ts-lencmp-meta">49 sessions &middot; 98.0% completed</div>
    </div>
    <div class="ts-lencmp-track">
      <div class="ts-lencmp-iqr" style="left:16%;width:19%;background:#b8785e"></div>
      <div class="ts-lencmp-dot" style="left:30.9%;background:#b8785e"></div>
      <div class="ts-lencmp-mean" style="left:30.9%;color:#b8785e">30.9</div>
    </div>
    <div class="ts-lencmp-range">16&ndash;35</div>
  </div>

  <div class="ts-lencmp-row">
    <div class="ts-lencmp-left">
      <div class="ts-lencmp-label" style="color:#6a8da8">Mario + Pi &middot; GPT-5.4</div>
      <div class="ts-lencmp-meta">77 sessions &middot; 96.1% completed</div>
    </div>
    <div class="ts-lencmp-track">
      <div class="ts-lencmp-iqr" style="left:27%;width:25%;background:#6a8da8"></div>
      <div class="ts-lencmp-dot" style="left:40.6%;background:#6a8da8"></div>
      <div class="ts-lencmp-mean" style="left:40.6%;color:#6a8da8">40.6</div>
    </div>
    <div class="ts-lencmp-range">27&ndash;52</div>
  </div>
</div>

<style>
.ts-lencmp {
  margin: 0.35rem 0 1.2rem;
  font-family: var(--font-serif);
  color: #333;
}
.ts-lencmp-kicker {
  margin: 0 0 0.65rem 0;
  color: #555;
  font-size: 0.92rem;
}
.ts-lencmp-axis,
.ts-lencmp-row {
  display: grid;
  grid-template-columns: 215px minmax(420px, 1fr) 80px;
  gap: 16px;
  align-items: center;
}
.ts-lencmp-axis {
  margin: 0 0 8px 0;
}
.ts-lencmp-axis-track {
  position: relative;
  height: 24px;
}
.ts-lencmp-axis-track::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: #c8c8c8;
}
.ts-lencmp-axis-label {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: 11px;
  line-height: 1;
  color: #9a9a9a;
  white-space: nowrap;
}
.ts-lencmp-axis-label::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 50%;
  width: 1px;
  height: 7px;
  background: #c8c8c8;
}
.ts-lencmp-axis-label.start {
  left: 0;
  transform: none;
}
.ts-lencmp-axis-label.start::after {
  left: 0;
}
.ts-lencmp-axis-label.end {
  left: auto;
  right: 0;
  transform: none;
}
.ts-lencmp-axis-label.end::after {
  left: auto;
  right: 0;
}
.ts-lencmp-axis-unit {
  align-self: end;
  padding-bottom: 1px;
  font-size: 11px;
  color: #9a9a9a;
  font-style: italic;
}
.ts-lencmp-row {
  margin: 10px 0;
}
.ts-lencmp-left {
  line-height: 1.2;
}
.ts-lencmp-label {
  font-size: 0.95rem;
}
.ts-lencmp-meta {
  margin-top: 3px;
  font-size: 11px;
  color: #9a9a9a;
}
.ts-lencmp-track {
  position: relative;
  height: 22px;
  overflow: visible;
}
.ts-lencmp-iqr {
  position: absolute;
  top: 9px;
  height: 4px;
  border-radius: 999px;
}
.ts-lencmp-dot {
  position: absolute;
  top: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translateX(-50%);
}
.ts-lencmp-mean {
  position: absolute;
  top: 6px;
  transform: translate(-50%, -100%);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.ts-lencmp-range {
  font-size: 11px;
  color: #9a9a9a;
  white-space: nowrap;
}
@media (max-width: 920px) {
  .ts-lencmp-axis,
  .ts-lencmp-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .ts-lencmp-axis > :first-child,
  .ts-lencmp-axis > :last-child {
    display: none;
  }
  .ts-lencmp-range {
    padding-left: 0;
  }
}
</style>

## References

Analysis code and data: [github.com/nilenso/swe-bench-pro-cost-token-time-analysis](https://github.com/nilenso/swe-bench-pro-cost-token-time-analysis).

### 1. High-level action frequencies

Even if we ignore _when_ actions happen and just count _what_ the models spend their steps on, the same signature shows up. GPT-5 spends much more of its trajectory reading, while Sonnet 4.5 spends much more of it verifying. That makes the difference in the trajectory-shape chart feel less like a visual artefact and more like a stable workflow habit.

<div class="ts-hf-chart">
  <div id="ts-highfreq-chart"></div>
</div>

<style>
.ts-hf-chart { margin: 1rem 0 0.6rem; }
.ts-hf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  max-width: 980px;
  border: none !important;
}
.ts-hf-table thead,
.ts-hf-table tbody,
.ts-hf-table tr,
.ts-hf-table th,
.ts-hf-table td {
  border: none !important;
  box-shadow: none !important;
}
.ts-hf-table th {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 400;
  font-style: italic;
  color: #777;
}
.ts-hf-table td { padding: 0; }
.ts-hf-row { border-bottom: 8px solid transparent; }
.ts-hf-name {
  text-align: right;
  padding-right: 12px !important;
  color: #333;
  white-space: nowrap;
  width: 1%;
  vertical-align: middle;
  font-size: 1.05rem;
}
.ts-hf-bars { padding: 4px 4px !important; }
.ts-hf-bar-row {
  display: flex;
  align-items: center;
  height: 20px;
  gap: 6px;
}
.ts-hf-bar {
  height: 20px;
  border-radius: 0;
  opacity: 0.88;
  min-width: 2px;
}
.ts-hf-bar-val {
  font-size: 0.95rem;
  min-width: 34px;
  line-height: 1;
}
.ts-hf-model-sonnet { color: #b8785e; }
.ts-hf-model-gpt { color: #6a8da8; }
@media (max-width: 640px) {
  .ts-hf-name { font-size: 0.95rem; }
  .ts-hf-bar-row { height: 18px; }
  .ts-hf-bar { height: 18px; }
  .ts-hf-bar-val { font-size: 0.85rem; min-width: 30px; }
}
</style>

<script>
(function() {
  var root = document.getElementById('ts-highfreq-chart');
  if (!root) return;

  var models = [
    { key: 'sonnet', name: 'Sonnet 4.5', color: '#b8785e' },
    { key: 'gpt', name: 'GPT-5', color: '#6a8da8' }
  ];

  var rows = [
    { name: 'read', values: { sonnet: 21.9, gpt: 35.6 } },
    { name: 'search', values: { sonnet: 25.3, gpt: 21.7 } },
    { name: 'reproduce', values: { sonnet: 1.8, gpt: 4.0 } },
    { name: 'edit', values: { sonnet: 10.3, gpt: 15.0 } },
    { name: 'verify', values: { sonnet: 29.8, gpt: 5.2 } },
    { name: 'git', values: { sonnet: 2.2, gpt: 0.1 } },
    { name: 'housekeeping', values: { sonnet: 4.0, gpt: 0.1 } }
  ];

  var maxVal = 0;
  rows.forEach(function(row) {
    models.forEach(function(model) {
      maxVal = Math.max(maxVal, row.values[model.key]);
    });
  });

  function widthPct(value) {
    return ((value / maxVal) * 100).toFixed(1) + '%';
  }

  var html = '<table class="ts-hf-table"><thead><tr><th></th><th style="text-align:left;padding-left:4px">' +
    '<span class="ts-hf-model-sonnet">Sonnet 4.5</span>' +
    '<span style="color:#777;padding:0 6px">/</span>' +
    '<span class="ts-hf-model-gpt">GPT-5</span>' +
    '<span style="color:#777;font-weight:400;padding-left:8px">% of steps</span>' +
    '</th></tr></thead><tbody>';

  rows.forEach(function(row, idx) {
    html += '<tr class="ts-hf-row">' +
      '<td class="ts-hf-name">' + row.name + '</td>' +
      '<td class="ts-hf-bars">';

    models.forEach(function(model) {
      var value = row.values[model.key];
      var best = Math.max.apply(null, models.map(function(m) { return row.values[m.key]; }));
      var bold = value === best && best >= 0.3 ? 'font-weight:700;' : '';
      html += '<div class="ts-hf-bar-row">' +
        '<div class="ts-hf-bar" style="width:' + widthPct(value) + ';background:' + model.color + '"></div>' +
        '<span class="ts-hf-bar-val" style="color:' + model.color + ';' + bold + '">' + value.toFixed(1) + '</span>' +
      '</div>';
    });

    html += '</td></tr>';
  });

  html += '</tbody></table>';
  root.innerHTML = html;
})();
</script>

- To "understand", GPT reads more, while both models search about the same amount
- Verification leans the other way. Sonnet 4.5 runs ~3 verify steps per edit, GPT-5 runs ~1 verify step per 3 edits
- Git + housekeeping is effectively Sonnet-only (6.2% vs 0.2%). GPT-5's trajectory has no bookkeeping tail at all.
- Pre-edit information gathering (read + search + reproduce) is 61% of GPT-5's steps vs 49% of Sonnet's. GPT-5 front-loads context; Sonnet spreads work more evenly across the trajectory.

<!-- TODO: edit -->
- Around 40% of GPT-5 trajectories don't do ANY verification at all
- Sonnet 4.5 re-runs the same passing tests many times, without any changes in source

<style>
.ts-ref .notes { font-size: 0.92rem; color: #666; margin: 0.45rem 0 1.2rem; line-height: 1.55; }
.ts-ref .notes p { font-size: inherit; margin: 0.35rem 0; }
.ts-ref table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 0.84rem; }
.ts-ref table th, .ts-ref table td { padding: 4px 6px; vertical-align: top; text-align: left !important; border-bottom: 1px solid #ece7dc; word-break: normal; overflow-wrap: normal; }
.ts-ref thead th { position: sticky; top: 0; background: #fbf7ee; z-index: 2; white-space: normal; }
.ts-ref thead tr.top th { font-family: var(--font-sans); font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; color: #777; font-weight: 600; text-align: center !important; border-bottom: 0; line-height: 1.2; }
.ts-ref thead tr.bottom th { font-family: var(--font-sans); font-size: 10px; color: #888; font-weight: 600; text-align: left !important; border-top: 1px solid #e7dcc8; line-height: 1.15; }
.ts-ref thead tr.bottom th.num { text-align: right !important; }
.ts-ref .claude-head { color: #b8785e !important; }
.ts-ref .gpt-head { color: #6a8da8 !important; }
.ts-ref .category-row td { background: #faf7ed; font-style: italic; color: #555; border-top: 1px solid #d9ccb2; border-bottom: 1px solid #d9ccb2; padding-top: 7px; padding-bottom: 4px; }
.ts-ref .cat-dot { display: inline-block; width: 8px; height: 8px; border-radius: 1px; margin-right: 8px; vertical-align: middle; }
.ts-ref .slot { width: 20%; }
.ts-ref .slot-title { font-size: 12px; line-height: 1.25; }
.ts-ref .slot-labels { margin-top: 2px; font-family: var(--font-monospace); font-size: 9.5px; line-height: 1.32; white-space: normal; }
.ts-ref .slot-labels div { margin-top: 1px; }
.ts-ref .slot-labels code, .ts-ref .desc code { white-space: normal; word-break: break-word; overflow-wrap: break-word; }
.ts-ref .desc { width: 42%; color: #555; font-size: 11px; line-height: 1.32; }
.ts-ref .num { width: 9.5%; text-align: right !important; font-variant-numeric: tabular-nums; white-space: nowrap; }
.ts-ref .claude { color: #8d5a45; }
.ts-ref .gpt { color: #4f718a; }
.ts-ref .na { color: #c2c2c2; }
.ts-ref tr:target td { background: rgba(200,184,138,0.18); }
.ts-ref code { font-size: inherit; background: transparent; padding: 0; }
.ts-ref .label-tag { display: inline-block; min-width: 2rem; margin-right: 4px; padding: 0 4px; border-radius: 999px; font-size: 9px; line-height: 1.4; font-family: var(--font-sans); font-weight: 600; letter-spacing: 0.03em; vertical-align: middle; }
.ts-ref .tag-swe { background: #f5e7e0; color: #915e49; }
.ts-ref .tag-pi { background: #e8eff7; color: #567890; }
.ts-ref .anchor-target { display: block; position: relative; top: -120px; visibility: hidden; height: 0; }
.ts-ref .scroll { overflow: visible; border: 1px solid #e7dcc8; border-radius: 8px; background: #fffef9; }
</style>

<div class="ts-ref" markdown="1">

### 2. Intent Classification Taxonomy

<p style="margin:0 0 8px 0">The benchmark charts above and the Pi / Mario charts later in the post use the same high-level taxonomy, but not always the same raw labels. So this annex merges both into one deterministic reference table. Raw labels stay in monospace under each intent class so chart clicks can still land on the exact label.</p>
<p style="margin:0 0 8px 0">Unlike the trajectory-shape panels, which use the stricter issue-only Pi subset, the Pi counts in this annex use the broader <strong>all strict single-model sessions</strong> cut: <strong>171</strong> analysed Opus 4.5/4.6 trajectories and <strong>133</strong> analysed GPT-5.4 trajectories. The benchmark side remains the full SWE-Bench Pro pair with <strong>730 trajectories per model</strong>.</p>
<div style="font-size:12px;color:#444;background:#f5f1e4;border-left:3px solid #c8b88a;padding:10px 14px;margin:10px 0 16px 0;line-height:1.55;max-width:980px"><p style="margin:0 0 4px 0"><strong>How to read this table</strong>:</p><ul style="margin:4px 0 0 18px;padding:0"><li><strong>Both sides are deterministic.</strong> No model inference is used in either taxonomy.</li><li><strong>Rows are merged by intent class.</strong> If SWE-Agent and Pi use the same raw label, it appears once. If they use different labels for the same kind of action, both labels appear under the same row with <code>SWE</code> / <code>Pi</code> badges.</li><li><strong>Blank counts mean no separate label on that side.</strong> For example, Pi has no distinct <code>insert-source</code> bucket, while Pi adds git workflow labels like <code>git-github-context</code> and <code>git-publish</code>.</li><li><strong>Counts are per dataset.</strong> The left pair is the SWE-Agent benchmark set (730 Sonnet&nbsp;4.5 trajectories, 730 GPT-5 trajectories). The right pair is the all-single-model Pi set (171 Opus&nbsp;4.5/4.6 trajectories, 133 GPT-5.4 trajectories).</li><li><strong>The trajectory-shape panels are narrower.</strong> Earlier Pi charts stay on the issue-only subset because that keeps the comparison closer to the benchmark&rsquo;s issue-fix workflow.</li></ul></div>
<div class="scroll"><table>
<colgroup>
<col style="width:20%" />
<col style="width:42%" />
<col style="width:9.5%" />
<col style="width:9.5%" />
<col style="width:9.5%" />
<col style="width:9.5%" />
</colgroup>
<thead>
<tr class="top">
<th rowspan="2" style="text-align:left">intent class</th>
<th rowspan="2" style="text-align:left">description</th>
<th colspan="2">SWE-Agent</th>
<th colspan="2">Pi (all single-model)</th>
</tr>
<tr class="bottom">
<th class="num claude-head">Sonnet 4.5<br><span style="font-weight:400;color:#888">730 trajs</span></th>
<th class="num gpt-head">GPT-5<br><span style="font-weight:400;color:#888">730 trajs</span></th>
<th class="num claude-head">Opus 4.5/4.6<br><span style="font-weight:400;color:#888">171 trajs</span></th>
<th class="num gpt-head">GPT-5.4<br><span style="font-weight:400;color:#888">133 trajs</span></th>
</tr>
</thead>
<tbody>
<tr class="category-row"><td colspan="6"><span class="cat-dot" style="background:#5a7d9a"></span>read</td></tr><tr>
<td class="slot"><span class="anchor-target" id="intent-read-file-full"></span><div class="slot-title">View an entire file</div><div class="slot-labels"><div><code>read-file-full</code></div></div></td>
<td class="desc">SWE: <code>str_replace_editor view &lt;file&gt;</code> after test/config/range/truncation cases are ruled out. Pi: whole-file <code>read(path)</code>.</td>
<td class="num claude">3,125</td>
<td class="num gpt">5,020</td>
<td class="num claude">455</td><td class="num gpt">803</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-read-file-range"></span><div class="slot-title">View a specific range</div><div class="slot-labels"><div><code>read-file-range</code></div></div></td>
<td class="desc">SWE uses <code>--view_range</code>; Pi uses <code>read(path, offset, limit)</code>.</td>
<td class="num claude">5,974</td>
<td class="num gpt">5,997</td>
<td class="num claude">524</td><td class="num gpt">546</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-read-file-full(truncated)"></span><div class="slot-title">Whole-file read, but truncated</div><div class="slot-labels"><div><code>read-file-full(truncated)</code></div></div></td>
<td class="desc">File was too large to show in full; the read/view output was abbreviated.</td>
<td class="num claude">198</td>
<td class="num gpt">245</td>
<td class="num claude">119</td><td class="num gpt">109</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-read-config-file"></span><div class="slot-title">Read a config / manifest file</div><div class="slot-labels"><div><code>read-config-file</code></div></div></td>
<td class="desc">Filename match such as <code>package.json</code>, <code>pytest.ini</code>, <code>setup.cfg</code>, <code>setup.py</code>, <code>go.mod</code>, <code>Makefile</code>, or <code>config.json</code>.</td>
<td class="num claude">26</td>
<td class="num gpt">206</td>
<td class="num claude">19</td><td class="num gpt">28</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-read-test-file"></span><div class="slot-title">Read a test file as a distinct class</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>read-test-file</code></div></div></td>
<td class="desc">SWE-only filename match for <code>test_*</code>, <code>*_test.*</code>, or <code>conftest*</code>.</td>
<td class="num claude">644</td>
<td class="num gpt">635</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-read-via-bash"></span><div class="slot-title">Read via shell command</div><div class="slot-labels"><div><code>read-via-bash</code></div></div></td>
<td class="desc">Shell read commands like <code>cat</code>, <code>head</code>, <code>tail</code>, <code>sed -n</code>, <code>nl</code>, or <code>awk</code>.</td>
<td class="num claude">2,345</td>
<td class="num gpt">2,974</td>
<td class="num claude">76</td><td class="num gpt">14</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-read-via-inline-script"></span><div class="slot-title">Read via inline snippet</div><div class="slot-labels"><div><code>read-via-inline-script</code></div></div></td>
<td class="desc">Inline code does a pure read-and-print, e.g. <code>.read()</code>, <code>open(...,'r')</code>, or <code>readFileSync</code>, with no write.</td>
<td class="num claude">76</td>
<td class="num gpt">373</td>
<td class="num claude">0</td><td class="num gpt">10</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-view-directory"></span><div class="slot-title">Browse a directory through the editor interface</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>view-directory</code></div></div></td>
<td class="desc">SWE-only: <code>str_replace_editor view</code> where the path has no extension, or the observation says “files and directories”.</td>
<td class="num claude">1,137</td>
<td class="num gpt">2,133</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr class="category-row"><td colspan="6"><span class="cat-dot" style="background:#6f8da6"></span>search</td></tr><tr>
<td class="slot"><span class="anchor-target" id="intent-list-directory"></span><div class="slot-title">List a directory from the shell</div><div class="slot-labels"><div><code>list-directory</code></div></div></td>
<td class="desc">Directory / cwd inspection via <code>ls</code>, <code>tree</code>, or <code>pwd</code>.</td>
<td class="num claude">843</td>
<td class="num gpt">708</td>
<td class="num claude">85</td><td class="num gpt">11</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-search-keyword"></span><div class="slot-title">Search for a keyword / pattern</div><div class="slot-labels"><div><code>search-keyword</code></div></div></td>
<td class="desc">Pattern search via <code>grep</code>, <code>rg</code>, or <code>ag</code>.</td>
<td class="num claude">7,002</td>
<td class="num gpt">6,499</td>
<td class="num claude">699</td><td class="num gpt">584</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-search-files-by-name"></span><div class="slot-title">Find files by name</div><div class="slot-labels"><div><code>search-files-by-name</code></div></div></td>
<td class="desc"><code>find ... -name</code> without a grep / xargs content-search pipeline.</td>
<td class="num claude">1,792</td>
<td class="num gpt">49</td>
<td class="num claude">47</td><td class="num gpt">34</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-search-files-by-content"></span><div class="slot-title">Find files by content via find/grep pipelines</div><div class="slot-labels"><div><code>search-files-by-content</code></div></div></td>
<td class="desc"><code>find ... -exec grep</code> or <code>find ... | xargs grep</code>.</td>
<td class="num claude">3,254</td>
<td class="num gpt">10</td>
<td class="num claude">25</td><td class="num gpt">2</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-inspect-file-metadata"></span><div class="slot-title">Inspect file metadata</div><div class="slot-labels"><div><code>inspect-file-metadata</code></div></div></td>
<td class="desc">Metadata checks like <code>wc</code>, <code>file</code>, or <code>stat</code>.</td>
<td class="num claude">246</td>
<td class="num gpt">22</td>
<td class="num claude">4</td><td class="num gpt">58</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-check-version"></span><div class="slot-title">Check runtime / tool version</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>check-version</code></div></div></td>
<td class="desc">Tiny version probes such as <code>--version</code>, <code>-V</code>, <code>sys.version</code>, or <code>node -v</code>.</td>
<td class="num claude">6</td>
<td class="num gpt">2</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-web-search"></span><div class="slot-title">Search the web</div><div class="slot-labels"><div><span class="label-tag tag-pi">Pi</span><code>web-search</code></div></div></td>
<td class="desc">Pi-only external lookup via the <code>brave-search</code> skill / <code>search.js</code>-style web search call.</td>
<td class="num claude"><span class="na">—</span></td>
<td class="num gpt"><span class="na">—</span></td>
<td class="num claude">2</td><td class="num gpt">5</td>
</tr><tr class="category-row"><td colspan="6"><span class="cat-dot" style="background:#b0956a"></span>reproduce</td></tr><tr>
<td class="slot"><span class="anchor-target" id="intent-create-repro-script"></span><div class="slot-title">Create a repro artifact</div><div class="slot-labels"><div><code>create-repro-script</code></div></div></td>
<td class="desc">Create a file whose name matches <code>repro*</code>, <code>reproduce*</code>, or <code>demo*</code>.</td>
<td class="num claude">157</td>
<td class="num gpt">463</td>
<td class="num claude">0</td><td class="num gpt">7</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-run-repro-script"></span><div class="slot-title">Run a repro artifact</div><div class="slot-labels"><div><code>run-repro-script</code></div></div></td>
<td class="desc">Run a named <code>python</code>/<code>node</code>/<code>sh</code>/<code>bash</code>/<code>go run</code> script whose basename matches <code>repro*</code> / <code>reproduce*</code> / <code>demo*</code>.</td>
<td class="num claude">375</td>
<td class="num gpt">1,067</td>
<td class="num claude">0</td><td class="num gpt">7</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-run-inline-snippet"></span><div class="slot-title">Run a residual inline snippet</div><div class="slot-labels"><div><code>run-inline-snippet</code></div></div></td>
<td class="desc">Inline <code>python -c</code>, <code>python - &lt;&lt;</code>, or <code>node -e</code> that did not match a more specific inline read/edit/verify pattern.</td>
<td class="num claude">472</td>
<td class="num gpt">193</td>
<td class="num claude">2</td><td class="num gpt">18</td>
</tr><tr class="category-row"><td colspan="6"><span class="cat-dot" style="background:#4a8a5a"></span>edit</td></tr><tr>
<td class="slot"><span class="anchor-target" id="intent-edit-source"></span><div class="slot-title">Edit existing source</div><div class="slot-labels"><div><code>edit-source</code></div></div></td>
<td class="desc">Source-file edit on a path that does <em>not</em> match test / repro / verify / check heuristics.</td>
<td class="num claude">5,217</td>
<td class="num gpt">4,983</td>
<td class="num claude">528</td><td class="num gpt">337</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-insert-source"></span><div class="slot-title">Insert into source</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>insert-source</code></div></div></td>
<td class="desc">SWE-only <code>str_replace_editor insert</code> action.</td>
<td class="num claude">12</td>
<td class="num gpt">803</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-apply-patch"></span><div class="slot-title">Apply a patch blob</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>apply-patch</code></div></div></td>
<td class="desc">SWE-only <code>applypatch</code> command path, mostly GPT-specific.</td>
<td class="num claude">0</td>
<td class="num gpt">94</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-create-file"></span><div class="slot-title">Create a new non-test file</div><div class="slot-labels"><div><code>create-file</code></div></div></td>
<td class="desc">Create/write a file that does not match repro / test / verify / documentation filename heuristics.</td>
<td class="num claude">595</td>
<td class="num gpt">326</td>
<td class="num claude">38</td><td class="num gpt">52</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-edit-via-inline-script"></span><div class="slot-title">Edit via inline script</div><div class="slot-labels"><div><code>edit-via-inline-script</code></div></div></td>
<td class="desc">Inline script reads a file, changes text via things like <code>.replace()</code> or <code>re.sub()</code>, then writes it back.</td>
<td class="num claude">5</td>
<td class="num gpt">245</td>
<td class="num claude">0</td><td class="num gpt">3</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-create-file-via-inline-script"></span><div class="slot-title">Create a file via inline script</div><div class="slot-labels"><div><code>create-file-via-inline-script</code></div></div></td>
<td class="desc">Inline script writes a file with no prior read.</td>
<td class="num claude">21</td>
<td class="num gpt">41</td>
<td class="num claude">3</td><td class="num gpt">19</td>
</tr><tr class="category-row"><td colspan="6"><span class="cat-dot" style="background:#b56a50"></span>verify</td></tr><tr>
<td class="slot"><span class="anchor-target" id="intent-run-test-suite"></span><div class="slot-title">Run a broad test suite</div><div class="slot-labels"><div><code>run-test-suite</code></div></div></td>
<td class="desc">Broad runner commands such as <code>pytest</code>, <code>go test</code>, <code>npm test</code>, <code>jest</code>, <code>mocha</code>, <code>yarn test</code>, or <code>python -m unittest</code>.</td>
<td class="num claude">5,942</td>
<td class="num gpt">585</td>
<td class="num claude">45</td><td class="num gpt">2</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-run-test-specific"></span><div class="slot-title">Run targeted tests</div><div class="slot-labels"><div><code>run-test-specific</code></div></div></td>
<td class="desc">Test command narrowed by <code>::</code>, <code>-k</code>, or an explicit file/filter target.</td>
<td class="num claude">1,105</td>
<td class="num gpt">370</td>
<td class="num claude">23</td><td class="num gpt">51</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-create-test-script"></span><div class="slot-title">Create a regression / test file</div><div class="slot-labels"><div><code>create-test-script</code></div></div></td>
<td class="desc">Create a file such as <code>test_*</code>, <code>*test.py</code>, <code>*test.js</code>, or <code>*test.go</code>.</td>
<td class="num claude">2,633</td>
<td class="num gpt">18</td>
<td class="num claude">9</td><td class="num gpt">13</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-run-verify-script"></span><div class="slot-title">Run a named verify / check script</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>run-verify-script</code></div></div></td>
<td class="desc">Run a named script whose basename contains <code>test_</code>, <code>verify</code>, <code>check</code>, <code>validate</code>, or <code>edge_case</code>.</td>
<td class="num claude">3,420</td>
<td class="num gpt">113</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-create-verify-script"></span><div class="slot-title">Create a named verify / check script</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>create-verify-script</code></div></div></td>
<td class="desc">Create a file matching <code>verify*</code>, <code>check*</code>, or <code>validate*</code>.</td>
<td class="num claude">321</td>
<td class="num gpt">47</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-edit-test-or-repro"></span><div class="slot-title">Edit a test or repro file</div><div class="slot-labels"><div><code>edit-test-or-repro</code></div></div></td>
<td class="desc">Edit a file whose path/name matches test / repro / verify / check heuristics.</td>
<td class="num claude">712</td>
<td class="num gpt">243</td>
<td class="num claude">47</td><td class="num gpt">60</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-run-custom-script"></span><div class="slot-title">Run a custom named script</div><div class="slot-labels"><div><code>run-custom-script</code></div></div></td>
<td class="desc">Run a named <code>python</code>/<code>node</code>/<code>sh</code>/<code>bash</code>/<code>go</code> script that does not match repro/test/verify patterns.</td>
<td class="num claude">476</td>
<td class="num gpt">111</td>
<td class="num claude">31</td><td class="num gpt">28</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-syntax-check"></span><div class="slot-title">Syntax-only check</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>syntax-check</code></div></div></td>
<td class="desc">Syntax / compile probes such as <code>py_compile</code>, <code>compileall</code>, or <code>node -c</code>.</td>
<td class="num claude">183</td>
<td class="num gpt">18</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-compile-build"></span><div class="slot-title">Build / compile / typecheck</div><div class="slot-labels"><div><code>compile-build</code></div></div></td>
<td class="desc">Build-ish commands like <code>go build</code>, <code>go vet</code>, <code>make</code>, <code>tsc</code>, <code>npx tsc</code>, <code>npm run build</code>, <code>yarn build</code>; Pi also captures repo-native checks like <code>npm run check</code>, <code>biome</code>, <code>eslint</code>, or <code>tsgo</code>.</td>
<td class="num claude">1,088</td>
<td class="num gpt">41</td>
<td class="num claude">224</td><td class="num gpt">86</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-run-inline-verify"></span><div class="slot-title">Inline verify / assertion probe</div><div class="slot-labels"><div><code>run-inline-verify</code></div></div></td>
<td class="desc">Inline <code>tsx</code>/<code>node</code>/<code>python</code> snippet that imports project code or runs ad hoc assertions / prints as a behavior check.</td>
<td class="num claude">999</td>
<td class="num gpt">696</td>
<td class="num claude">12</td><td class="num gpt">129</td>
</tr><tr class="category-row"><td colspan="6"><span class="cat-dot" style="background:#3a8a8a"></span>git</td></tr><tr>
<td class="slot"><span class="anchor-target" id="intent-git-diff"></span><span class="anchor-target" id="intent-git-diff-review"></span><div class="slot-title">Review the current diff</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>git-diff</code></div><div><span class="label-tag tag-pi">Pi</span><code>git-diff-review</code></div></div></td>
<td class="desc"><code>git diff</code> review of the current changes.</td>
<td class="num claude">538</td>
<td class="num gpt">23</td>
<td class="num claude">45</td><td class="num gpt">31</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-git-status-log"></span><span class="anchor-target" id="intent-git-repo-inspect"></span><div class="slot-title">Inspect repo state</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>git-status-log</code></div><div><span class="label-tag tag-pi">Pi</span><code>git-repo-inspect</code></div></div></td>
<td class="desc">Local repo inspection such as <code>git status</code>, <code>git show</code>, <code>git log</code>; Pi also folds in things like <code>git branch</code> and <code>git worktree</code>.</td>
<td class="num claude">652</td>
<td class="num gpt">23</td>
<td class="num claude">281</td><td class="num gpt">274</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-git-stash"></span><span class="anchor-target" id="intent-git-local-state-change"></span><div class="slot-title">Change local repo state</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>git-stash</code></div><div><span class="label-tag tag-pi">Pi</span><code>git-local-state-change</code></div></div></td>
<td class="desc">Mutating local git state. SWE only breaks out <code>git stash</code>; Pi groups a broader set like <code>git add</code>, <code>commit</code>, <code>stash</code>, <code>reset</code>, <code>checkout</code>, and <code>switch</code>.</td>
<td class="num claude">28</td>
<td class="num gpt">0</td>
<td class="num claude">201</td><td class="num gpt">80</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-git-github-context"></span><div class="slot-title">Read or update GitHub task context</div><div class="slot-labels"><div><span class="label-tag tag-pi">Pi</span><code>git-github-context</code></div></div></td>
<td class="desc">Pi-only GitHub workflow via <code>gh issue</code>, <code>gh pr</code>, or <code>gh api</code>.</td>
<td class="num claude"><span class="na">—</span></td>
<td class="num gpt"><span class="na">—</span></td>
<td class="num claude">382</td><td class="num gpt">389</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-git-sync-integrate"></span><div class="slot-title">Sync or integrate upstream changes</div><div class="slot-labels"><div><span class="label-tag tag-pi">Pi</span><code>git-sync-integrate</code></div></div></td>
<td class="desc">Pi-only integration work like <code>git fetch</code>, <code>pull</code>, <code>rebase</code>, <code>merge</code>, or <code>cherry-pick</code>.</td>
<td class="num claude"><span class="na">—</span></td>
<td class="num gpt"><span class="na">—</span></td>
<td class="num claude">63</td><td class="num gpt">26</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-git-publish"></span><div class="slot-title">Publish finished work</div><div class="slot-labels"><div><span class="label-tag tag-pi">Pi</span><code>git-publish</code></div></div></td>
<td class="desc">Pi-only publish step: <code>git push</code>.</td>
<td class="num claude"><span class="na">—</span></td>
<td class="num gpt"><span class="na">—</span></td>
<td class="num claude">71</td><td class="num gpt">33</td>
</tr><tr class="category-row"><td colspan="6"><span class="cat-dot" style="background:#7b8460"></span>housekeeping</td></tr><tr>
<td class="slot"><span class="anchor-target" id="intent-file-cleanup"></span><div class="slot-title">General file cleanup</div><div class="slot-labels"><div><code>file-cleanup</code></div></div></td>
<td class="desc">Filesystem cleanup / movement such as <code>rm</code>, <code>mv</code>, <code>cp</code>, or <code>chmod</code>.</td>
<td class="num claude">1,554</td>
<td class="num gpt">17</td>
<td class="num claude">25</td><td class="num gpt">17</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-create-documentation"></span><div class="slot-title">Create documentation / summary artifact</div><div class="slot-labels"><div><code>create-documentation</code></div></div></td>
<td class="desc">Create documentation-like files whose names match <code>*summary*</code>, <code>*readme*</code>, <code>*changes*</code>, or <code>*implementation*</code>. In Pi this comes from the <code>write</code> tool using those doc-like filenames.</td>
<td class="num claude">661</td>
<td class="num gpt">2</td>
<td class="num claude">0</td><td class="num gpt">1</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-start-service"></span><div class="slot-title">Start a service or wait process</div><div class="slot-labels"><div><code>start-service</code></div></div></td>
<td class="desc">Environment setup commands such as <code>redis-server</code>, <code>redis-cli</code>, <code>mongod</code>, or <code>sleep</code>.</td>
<td class="num claude">26</td>
<td class="num gpt">4</td>
<td class="num claude">1</td><td class="num gpt">3</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-install-deps"></span><div class="slot-title">Install dependencies</div><div class="slot-labels"><div><code>install-deps</code></div></div></td>
<td class="desc">Package install / env setup such as <code>pip install</code>, <code>pip list</code>, <code>npm install</code>, <code>go get</code>, or <code>apt</code>.</td>
<td class="num claude">20</td>
<td class="num gpt">0</td>
<td class="num claude">18</td><td class="num gpt">0</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-check-tool-exists"></span><div class="slot-title">Check whether a tool exists</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>check-tool-exists</code></div></div></td>
<td class="desc">Capability probe via <code>which</code> or <code>type</code>.</td>
<td class="num claude">16</td>
<td class="num gpt">2</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-tmux-session"></span><div class="slot-title">Manage a tmux / background session</div><div class="slot-labels"><div><span class="label-tag tag-pi">Pi</span><code>tmux-session</code></div></div></td>
<td class="desc">Pi-only <code>tmux</code> usage for long-running / detached processes.</td>
<td class="num claude"><span class="na">—</span></td>
<td class="num gpt"><span class="na">—</span></td>
<td class="num claude">1</td><td class="num gpt">11</td>
</tr><tr class="category-row"><td colspan="6"><span class="cat-dot" style="background:#a05050"></span>failed</td></tr><tr>
<td class="slot"><span class="anchor-target" id="intent-search-keyword(failed)"></span><div class="slot-title">Search command failed at the shell level</div><div class="slot-labels"><div><code>search-keyword(failed)</code></div></div></td>
<td class="desc">A <code>grep</code>/<code>find</code>-style search whose observation shows a shell-level error.</td>
<td class="num claude">46</td>
<td class="num gpt">2,748</td>
<td class="num claude">1</td><td class="num gpt">2</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-read-via-bash(failed)"></span><span class="anchor-target" id="intent-read-file-failed"></span><div class="slot-title">Read attempt failed</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>read-via-bash(failed)</code></div><div><span class="label-tag tag-pi">Pi</span><code>read-file-failed</code></div></div></td>
<td class="desc">The attempted read failed: SWE on shell readers like <code>cat</code>/<code>head</code>/<code>sed</code>/<code>tail</code>/<code>ls</code>; Pi on the <code>read</code> tool itself (missing path, permission, etc.).</td>
<td class="num claude">23</td>
<td class="num gpt">994</td>
<td class="num claude">12</td><td class="num gpt">10</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-run-script(failed)"></span><div class="slot-title">Script run failed</div><div class="slot-labels"><div><code>run-script(failed)</code></div></div></td>
<td class="desc"><code>python</code>/<code>node</code> execution whose observation shows a shell-level error.</td>
<td class="num claude">47</td>
<td class="num gpt">759</td>
<td class="num claude">0</td><td class="num gpt">8</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-run-test-suite(failed)"></span><div class="slot-title">Test-runner command failed</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>run-test-suite(failed)</code></div></div></td>
<td class="desc">A test runner command whose observation shows a shell-level error.</td>
<td class="num claude">6</td>
<td class="num gpt">155</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-edit-source(failed)"></span><div class="slot-title">Source edit failed</div><div class="slot-labels"><div><span class="label-tag tag-pi">Pi</span><code>edit-source(failed)</code></div></div></td>
<td class="desc">Pi-only <code>edit</code> tool failure on a source file.</td>
<td class="num claude"><span class="na">—</span></td>
<td class="num gpt"><span class="na">—</span></td>
<td class="num claude">5</td><td class="num gpt">17</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-edit-test-or-repro(failed)"></span><div class="slot-title">Test / repro edit failed</div><div class="slot-labels"><div><span class="label-tag tag-pi">Pi</span><code>edit-test-or-repro(failed)</code></div></div></td>
<td class="desc">Pi-only <code>edit</code> tool failure on a test / repro / verification-support file.</td>
<td class="num claude"><span class="na">—</span></td>
<td class="num gpt"><span class="na">—</span></td>
<td class="num claude">2</td><td class="num gpt">8</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-bash-command(failed)"></span><div class="slot-title">Generic bash command failed</div><div class="slot-labels"><div><code>bash-command(failed)</code></div></div></td>
<td class="desc">Residual failed shell command after the more specific failure buckets are ruled out.</td>
<td class="num claude">32</td>
<td class="num gpt">1,217</td>
<td class="num claude">11</td><td class="num gpt">14</td>
</tr><tr class="category-row"><td colspan="6"><span class="cat-dot" style="background:#888888"></span>other</td></tr><tr>
<td class="slot"><span class="anchor-target" id="intent-echo"></span><div class="slot-title">Echo / printf</div><div class="slot-labels"><div><code>echo</code></div></div></td>
<td class="desc">Output-only commands like <code>echo</code> or <code>printf</code>.</td>
<td class="num claude">140</td>
<td class="num gpt">69</td>
<td class="num claude">8</td><td class="num gpt">10</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-bash-other"></span><div class="slot-title">Other unclassified bash</div><div class="slot-labels"><div><code>bash-other</code></div></div></td>
<td class="desc">Final fallback for bash commands that matched no more specific rule.</td>
<td class="num claude">928</td>
<td class="num gpt">631</td>
<td class="num claude">79</td><td class="num gpt">66</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-fetch-url"></span><div class="slot-title">Fetch a URL / call an HTTP endpoint</div><div class="slot-labels"><div><span class="label-tag tag-pi">Pi</span><code>fetch-url</code></div></div></td>
<td class="desc">Pi-only <code>curl</code> / HTTP request step.</td>
<td class="num claude"><span class="na">—</span></td>
<td class="num gpt"><span class="na">—</span></td>
<td class="num claude">21</td><td class="num gpt">1</td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-submit"></span><div class="slot-title">Submit the patch</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>submit</code></div></div></td>
<td class="desc">SWE-only terminal action whose first line starts with <code>submit</code>.</td>
<td class="num claude">656</td>
<td class="num gpt">537</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-empty"></span><div class="slot-title">Empty action / context-window exit</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>empty</code></div></div></td>
<td class="desc">SWE-only blank action string, typically rate-limit or context-window exit.</td>
<td class="num claude">770</td>
<td class="num gpt">854</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr><tr>
<td class="slot"><span class="anchor-target" id="intent-undo-edit"></span><div class="slot-title">Undo an editor change</div><div class="slot-labels"><div><span class="label-tag tag-swe">SWE</span><code>undo-edit</code></div></div></td>
<td class="desc">SWE-only <code>str_replace_editor undo_edit</code> action.</td>
<td class="num claude">4</td>
<td class="num gpt">39</td>
<td class="num claude"><span class="na">—</span></td><td class="num gpt"><span class="na">—</span></td>
</tr>
</tbody>
</table></div>
<div class="notes"><p>The label describes <em>what the command is</em>, derived deterministically from tool calls, filenames, command heads, and simple output heuristics. No positional context (before/after first edit) and no model-side intent inference is used.</p><p><strong>(failed)</strong> variants classify by intended action, not outcome quality. They require a shell-level or tool-level failure on that side&rsquo;s classifier.</p><p><strong>run-inline-snippet</strong> remains a residual bucket. Inline snippets (<code>python -c</code>, <code>python - &lt;&lt;</code>, <code>node -e</code>) are first routed to more specific inline read/edit/verify buckets when their code shape makes that obvious.</p><p>Canonical benchmark source: <a href="https://github.com/nilenso/swe-bench-pro-cost-token-time-analysis/blob/main/scripts/classify_intent.py"><code>scripts/classify_intent.py</code></a> and <a href="https://github.com/nilenso/swe-bench-pro-cost-token-time-analysis/blob/main/docs/intent-classification-rules.md"><code>docs/intent-classification-rules.md</code></a>. The Pi side follows the deterministic labeler used in the Pi reference tables.</p></div>

</div>

### 3. Mario's analysis prompt {#mario-analysis-prompt}

Every Pi session in the analyzed set kicks off with this prompt. The `<issue-number>` is filled in per session; Mario steers from there.

```
Analyze GitHub issue(s): https://github.com/badlogic/pi-mono/issues/<issue-number> you will have to pull down the image and read it as well to understand.

For each issue:

1. Read the issue in full, including all comments and linked issues/PRs.

2. **For bugs**:
   - Ignore any root cause analysis in the issue (likely wrong)
   - Read all related code files in full (no truncation)
   - Trace the code path and identify the actual root cause
   - Propose a fix

3. **For feature requests**:
   - Read all related code files in full (no truncation)
   - Propose the most concise implementation approach
   - List affected files and changes needed

Do NOT implement unless explicitly asked. Analyze and propose only.
```

### 4. SWE-Agent issue-resolution prompt {#swe-agent-issue-resolution-prompt}

For comparison, the SWE-Agent setup used in SWE-bench Pro includes the following issue-resolution scaffold in its default prompt (<a href="https://github.com/SWE-agent/SWE-agent/blob/0f4f3bba990e01ca8460b9963abdcd89e38042f2/config/default.yaml#L21">source</a>):

```
Follow these steps to resolve the issue:
1. As a first step, it might be a good idea to find and read code relevant to the <pr_description>
2. Create a script to reproduce the error and execute it with `python <filename.py>` using the bash tool, to confirm the error
3. Edit the source code of the repo to resolve the issue
4. Rerun your reproduce script and confirm that the error is fixed!
5. Think about edgecases and make sure your fix handles them as well
```
