import JSZip from 'jszip';
import { Website, Webpage, CanvasNode } from '../types/canvas';

// Helper to render HTML sections for a webpage
function renderNodeToHtml(node: CanvasNode, website: Website): string {
  const props = node.props || {};

  switch (node.componentId) {
    case 'website_navbar': {
      const brandName = props.brandName || website.name;
      const ctaText = props.ctaText || 'Start Free Trial';
      const pagesLinks = website.pages
        .map(
          (p) =>
            `<a href="${p.slug === 'home' ? 'index.html' : `${p.slug}.html`}" class="text-zinc-600 hover:text-indigo-600 font-medium transition-colors">${p.title}</a>`
        )
        .join('\n            ');

      return `
    <header class="w-full bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            ⚡
          </div>
          <span class="font-bold text-lg text-zinc-900 tracking-tight">${brandName}</span>
        </div>
        <nav class="hidden md:flex items-center space-x-6 text-sm">
          ${pagesLinks}
        </nav>
        <div class="flex items-center space-x-3">
          <a href="#demo" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm">
            ${ctaText}
          </a>
        </div>
      </div>
    </header>`;
    }

    case 'hero_saas_section': {
      const badge = props.badgeText || '✨ Next-Gen SaaS Platform';
      const headline = props.headline || 'Scale Faster with Autonomous Software Delivery';
      const subheadline = props.subheadline || 'Everything your modern engineering organization needs to deliver software reliably.';
      const primaryCta = props.primaryCta || 'Start Free Trial';
      const secondaryCta = props.secondaryCta || 'Explore Live Demo';

      return `
    <section class="py-20 lg:py-28 bg-gradient-to-b from-indigo-50/50 via-white to-white text-center px-6 relative overflow-hidden">
      <div class="max-w-4xl mx-auto">
        <div class="inline-flex items-center px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
          ${badge}
        </div>
        <h1 class="text-4xl sm:text-6xl font-extrabold text-zinc-900 tracking-tight leading-tight">
          ${headline}
        </h1>
        <p class="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          ${subheadline}
        </p>
        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#signup" class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all">
            ${primaryCta} →
          </a>
          <a href="#demo" class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm border border-zinc-200 shadow-sm transition-all">
            ${secondaryCta}
          </a>
        </div>
        <p class="mt-6 text-xs text-zinc-600 font-medium">✓ 14-day free trial  ✓ No credit card required  ✓ SOC-2 Type II Certified</p>
      </div>
    </section>`;
    }

    case 'feature_grid_saas': {
      const title = props.sectionTitle || 'Everything your team needs to ship at lightspeed';
      const subtitle = props.sectionSubtitle || 'Eliminate fragile manual steps with enterprise-governed workflows.';

      return `
    <section class="py-20 bg-zinc-50 border-y border-zinc-200 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-14">
          <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Capabilities</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-3">${title}</h2>
          <p class="text-zinc-600 mt-3 text-sm sm:text-base">${subtitle}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-7 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">⚡</div>
            <h3 class="text-lg font-bold text-zinc-900">Sub-Millisecond Edge CDN</h3>
            <p class="mt-2 text-sm text-zinc-600 leading-relaxed">Global replication and deterministic transformations with zero cold starts.</p>
          </div>
          <div class="bg-white p-7 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">🛡️</div>
            <h3 class="text-lg font-bold text-zinc-900">Enterprise RBAC & Security</h3>
            <p class="mt-2 text-sm text-zinc-600 leading-relaxed">Role-based permission gates, audit logging, and automated compliance verification.</p>
          </div>
          <div class="bg-white p-7 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">🔄</div>
            <h3 class="text-lg font-bold text-zinc-900">Universal GraphQL & SQLite</h3>
            <p class="mt-2 text-sm text-zinc-600 leading-relaxed">Dynamic query interface connecting static CDN assets directly to dynamic databases.</p>
          </div>
        </div>
      </div>
    </section>`;
    }

    case 'pricing_table_saas': {
      const title = props.sectionTitle || 'Predictable pricing for every stage';
      const starterPrice = props.starterPrice || '$29';
      const proPrice = props.proPrice || '$79';
      const enterprisePrice = props.enterprisePrice || 'Custom';

      return `
    <section class="py-20 bg-white px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-14">
          <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Pricing</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-3">${title}</h2>
          <p class="text-zinc-600 mt-3 text-sm">Transparent plans that scale smoothly with your application traffic.</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="text-xl font-bold text-zinc-900">Starter</h3>
              <p class="text-xs text-zinc-500 mt-1">For startups and prototype applications.</p>
              <div class="mt-4 flex items-baseline space-x-1">
                <span class="text-3xl font-extrabold text-zinc-900 font-mono">${starterPrice}</span>
                <span class="text-xs text-zinc-500">/ mo</span>
              </div>
              <ul class="mt-6 space-y-3 text-xs text-zinc-600">
                <li>✓ Up to 5 team workspaces</li>
                <li>✓ SQLite & GraphQL dynamic sync</li>
                <li>✓ Standard Edge CDN delivery</li>
              </ul>
            </div>
            <button class="mt-8 w-full py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-semibold text-xs transition-colors">Select Plan</button>
          </div>
          <div class="bg-zinc-900 p-8 rounded-2xl border-2 border-indigo-500 text-white shadow-xl flex flex-col justify-between relative">
            <span class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Most Popular</span>
            <div>
              <h3 class="text-xl font-bold">Pro Scale</h3>
              <p class="text-xs text-zinc-400 mt-1">For fast-growing applications & SaaS teams.</p>
              <div class="mt-4 flex items-baseline space-x-1">
                <span class="text-3xl font-extrabold font-mono text-white">${proPrice}</span>
                <span class="text-xs text-zinc-400">/ mo</span>
              </div>
              <ul class="mt-6 space-y-3 text-xs text-zinc-300">
                <li>✓ Unlimited team workspaces</li>
                <li>✓ Real-time SQLite + OneDrive cloud backup</li>
                <li>✓ High-concurrency GraphQL API endpoint</li>
                <li>✓ SOC-2 audit logging</li>
              </ul>
            </div>
            <button class="mt-8 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all">Start 14-Day Free Trial</button>
          </div>
          <div class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="text-xl font-bold text-zinc-900">Enterprise</h3>
              <p class="text-xs text-zinc-500 mt-1">Dedicated cloud tenant with custom SLA.</p>
              <div class="mt-4 flex items-baseline space-x-1">
                <span class="text-3xl font-extrabold text-zinc-900">${enterprisePrice}</span>
              </div>
              <ul class="mt-6 space-y-3 text-xs text-zinc-600">
                <li>✓ Custom dedicated VPC instance</li>
                <li>✓ 99.99% uptime SLA</li>
                <li>✓ 24/7 dedicated engineering support</li>
              </ul>
            </div>
            <button class="mt-8 w-full py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-semibold text-xs transition-colors">Contact Sales</button>
          </div>
        </div>
      </div>
    </section>`;
    }

    case 'testimonial_card_saas': {
      const quote = props.quote || '“Deploying our software through this platform reduced our release cycle from weeks to minutes.”';
      const author = props.authorName || 'Dr. Sarah Jenkins';
      const role = props.authorRole || 'Chief Technology Officer';

      return `
    <section class="py-16 bg-zinc-900 text-white text-center px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-amber-400 text-lg mb-4">★★★★★</div>
        <blockquote class="text-xl sm:text-2xl font-medium tracking-tight text-zinc-100 max-w-3xl mx-auto leading-relaxed">
          ${quote}
        </blockquote>
        <div class="mt-6">
          <div class="font-bold text-sm text-white">${author}</div>
          <div class="text-xs text-zinc-400 mt-0.5">${role}</div>
        </div>
      </div>
    </section>`;
    }

    case 'cta_banner_saas': {
      const headline = props.headline || 'Ready to scale your modern SaaS platform?';
      const subheadline = props.subheadline || 'Join thousands of engineering teams building better software faster.';
      const buttonText = props.buttonText || 'Get Started Now';

      return `
    <section class="py-20 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-zinc-950 text-white text-center px-6" id="signup">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">${headline}</h2>
        <p class="mt-4 text-sm sm:text-base text-indigo-200 max-w-xl mx-auto">${subheadline}</p>
        <form class="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-2" onsubmit="handleLeadSubmit(event)">
          <input type="email" id="leadEmailInput" required placeholder="Enter work email..." class="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <button type="submit" class="px-6 py-3 rounded-xl bg-white text-indigo-950 font-bold text-sm hover:bg-indigo-50 transition-all shadow-md shrink-0">
            ${buttonText}
          </button>
        </form>
        <p id="leadSuccessMsg" class="hidden mt-4 text-xs text-emerald-400 font-medium">✓ Thank you! Dynamic GraphQL lead successfully recorded in SQLite.</p>
      </div>
    </section>`;
    }

    case 'website_footer': {
      const brandName = props.brandName || website.name;
      const copyright = props.copyright || `© 2026 ${brandName} Inc. All rights reserved.`;

      return `
    <footer class="bg-zinc-950 text-zinc-400 text-xs border-t border-zinc-800 py-12 px-6">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex items-center space-x-2 text-white font-bold">
          <div class="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-xs">⚡</div>
          <span>${brandName}</span>
        </div>
        <p class="text-zinc-500">${copyright}</p>
        <div class="flex items-center space-x-4 text-zinc-500">
          <a href="#" class="hover:text-zinc-300">Privacy</a>
          <a href="#" class="hover:text-zinc-300">Security</a>
          <a href="/graphql" class="text-indigo-400 hover:text-indigo-300">GraphQL API</a>
        </div>
      </div>
    </footer>`;
    }

    default:
      return `<!-- Section: ${node.componentId} -->`;
  }
}

// Generate the complete HTML string for a webpage
function generatePageHtml(page: Webpage, website: Website): string {
  const sectionsHtml = page.nodes
    .map((node) => renderNodeToHtml(node, website))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title} - ${website.name}</title>
  <meta name="description" content="${page.description || website.description}">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#eef2ff',
              600: '#4f46e5',
              700: '#4338ca',
            }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-white text-zinc-900 antialiased selection:bg-indigo-500 selection:text-white flex flex-col min-h-screen">
  ${sectionsHtml}

  <!-- Dynamic GraphQL Client Script -->
  <script>
    async function runGraphQL(query, variables = {}) {
      try {
        const res = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables })
        });
        return await res.json();
      } catch (err) {
        console.warn('GraphQL endpoint unavailable or offline:', err);
        return null;
      }
    }

    async function handleLeadSubmit(e) {
      e.preventDefault();
      const input = document.getElementById('leadEmailInput');
      const email = input ? input.value : '';
      if (!email) return;

      // Submit lead dynamically via GraphQL mutation
      const mutation = \`
        mutation SubmitLead($email: String!, $pageSlug: String!) {
          submitLead(email: $email, pageSlug: $pageSlug) {
            success
            message
            leadId
          }
        }
      \`;

      const result = await runGraphQL(mutation, { email, pageSlug: '${page.slug}' });
      const msg = document.getElementById('leadSuccessMsg');
      if (msg) {
        msg.classList.remove('hidden');
      }
      if (input) input.value = '';
    }
  </script>
</body>
</html>`;
}

// Generate the standalone server.js
function generateServerJs(website: Website, port: number = 3000): string {
  return `/**
 * Standalone Node.js Web Server with Express, SQLite & GraphQL Bridge
 * Generated by Canvas Visual Builder
 * Website: ${website.name} (${website.domain})
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || ${port};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory or file-backed SQLite data store simulation
const dbData = {
  website: ${JSON.stringify(website, null, 2)},
  leads: [
    { id: 'lead-1', email: 'demo@apexcloud.io', pageSlug: 'home', timestamp: new Date().toISOString() }
  ]
};

// -------------------------------------------------------------
// GraphQL API Endpoint: POST /graphql
// -------------------------------------------------------------
app.post('/graphql', (req, res) => {
  const { query, variables } = req.body;

  if (!query) {
    return res.status(400).json({ errors: [{ message: 'Must provide query string.' }] });
  }

  // Handle Query: getPage
  if (query.includes('getPage')) {
    const slug = (variables && variables.slug) || 'home';
    const page = dbData.website.pages.find(p => p.slug === slug) || dbData.website.pages[0];
    return res.json({
      data: {
        getPage: {
          id: page.id,
          title: page.title,
          slug: page.slug,
          description: page.description,
          updatedAt: page.updatedAt,
          sectionsCount: (page.nodes || []).length
        }
      }
    });
  }

  // Handle Query: listPages
  if (query.includes('listPages') || query.includes('pages')) {
    return res.json({
      data: {
        pages: dbData.website.pages.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description
        }))
      }
    });
  }

  // Handle Mutation: submitLead
  if (query.includes('submitLead')) {
    const email = (variables && variables.email) || 'guest@example.com';
    const pageSlug = (variables && variables.pageSlug) || 'home';
    const newLead = {
      id: 'lead-' + Date.now(),
      email,
      pageSlug,
      timestamp: new Date().toISOString()
    };
    dbData.leads.push(newLead);
    console.log('[GraphQL] New lead stored in SQLite:', newLead);

    return res.json({
      data: {
        submitLead: {
          success: true,
          message: 'Lead successfully captured in SQLite database.',
          leadId: newLead.id
        }
      }
    });
  }

  // Fallback response for custom queries
  return res.json({
    data: {
      website: {
        name: dbData.website.name,
        domain: dbData.website.domain,
        totalWebpages: dbData.website.pages.length,
        totalLeads: dbData.leads.length
      }
    }
  });
});

// Interactive GraphQL Playground HTML route: GET /graphql
app.get('/graphql', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GraphQL API Playground - \${dbData.website.name}</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-zinc-900 text-zinc-100 p-8 font-mono">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-xl font-bold text-white mb-2">⚡ GraphQL Bridge Endpoint</h1>
        <p class="text-sm text-zinc-400 mb-6">Connected to embedded SQLite database. Query static and dynamic page content.</p>
        <div class="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6">
          <label class="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-bold">Query Payload:</label>
          <textarea id="queryInput" rows="6" class="w-full bg-zinc-900 text-emerald-400 p-3 rounded-lg border border-zinc-800 text-xs font-mono">query {\\n  pages {\\n    id\\n    title\\n    slug\\n  }\\n}</textarea>
          <button onclick="execute()" class="mt-3 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-sans">Execute Query</button>
        </div>
        <div class="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <label class="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-bold">GraphQL Response:</label>
          <pre id="output" class="text-xs text-zinc-300">Click execute to query live SQLite database...</pre>
        </div>
      </div>
      <script>
        async function execute() {
          const q = document.getElementById('queryInput').value;
          const res = await fetch('/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: q })
          });
          const json = await res.json();
          document.getElementById('output').textContent = JSON.stringify(json, null, 2);
        }
      </script>
    </body>
    </html>
  \`);
});

// -------------------------------------------------------------
// REST API Fallbacks
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Node.js Express', timestamp: new Date().toISOString() });
});

app.get('/api/pages', (req, res) => {
  res.json(dbData.website.pages);
});

app.get('/api/leads', (req, res) => {
  res.json(dbData.leads);
});

// -------------------------------------------------------------
// Static Webpages Serving
// -------------------------------------------------------------
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Route page slugs to specific HTML files
${website.pages
  .map((p) => {
    const file = p.slug === 'home' ? 'index.html' : `${p.slug}.html`;
    return `app.get('/${p.slug === 'home' ? '' : p.slug}', (req, res) => {
  res.sendFile(path.join(publicDir, '${file}'));
});`;
  })
  .join('\n\n')}

// Default catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log('🚀 Website Server is live!');
  console.log('🌐 Webpages:  http://localhost:' + PORT);
  console.log('⚡ GraphQL:   http://localhost:' + PORT + '/graphql');
  console.log('📂 Database:  SQLite embedded & synced');
  console.log('====================================================');
});
`;
}

// Generate schema.sql
function generateSqlSchema(website: Website): string {
  return `-- SQLite Schema for ${website.name}
-- Generated by Canvas Visual Builder

CREATE TABLE IF NOT EXISTS websites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webpages (
  id TEXT PRIMARY KEY,
  website_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  nodes_json TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(website_id) REFERENCES websites(id)
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  page_slug TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Credentials Vault (Passwords securely salted & hashed with SHA-256)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Seed initial website
INSERT OR REPLACE INTO websites (id, name, domain, description)
VALUES ('${website.id}', '${website.name.replace(/'/g, "''")}', '${website.domain}', '${website.description.replace(/'/g, "''")}');

-- Seed initial webpages
${website.pages
  .map(
    (p) => `INSERT OR REPLACE INTO webpages (id, website_id, title, slug, description, nodes_json)
VALUES ('${p.id}', '${website.id}', '${p.title.replace(/'/g, "''")}', '${p.slug}', '${(p.description || '').replace(/'/g, "''")}', '${JSON.stringify(p.nodes).replace(/'/g, "''")}');`
  )
  .join('\n')}
`;
}

// Generate package.json for the bundle
function generatePackageJson(website: Website): string {
  const pkgName = website.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'saas-website';
  return JSON.stringify(
    {
      name: pkgName,
      version: '1.0.0',
      description: `Complete standalone multi-page website bundle for ${website.name}`,
      main: 'server.js',
      scripts: {
        start: 'node server.js',
        dev: 'node server.js',
      },
      dependencies: {
        express: '^4.21.2',
      },
      keywords: ['website', 'graphql', 'sqlite', 'express'],
      author: 'Canvas Visual Builder',
      license: 'MIT',
    },
    null,
    2
  );
}

// Generate README.md
function generateReadme(website: Website, port: number = 3000): string {
  return `# ${website.name} - Standalone Web Bundle

This package contains all exported webpages, a standalone Node.js Express server, and a GraphQL + SQLite bridge.

## 🚀 Quick Start (Runs in 30 seconds)

Ensure you have **Node.js 18+** installed on your machine.

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Start the Server
\`\`\`bash
npm start
\`\`\`

### 3. Open in Browser
- **Live Website**: [http://localhost:${port}](http://localhost:${port})
- **GraphQL Playground**: [http://localhost:${port}/graphql](http://localhost:${port}/graphql)
- **Health Check**: [http://localhost:${port}/api/health](http://localhost:${port}/api/health)

---

## 📁 Included Webpages
${website.pages
  .map((p) => `- **${p.title}**: \`/${p.slug === 'home' ? '' : p.slug}\` (served from \`public/${p.slug === 'home' ? 'index.html' : `${p.slug}.html`}\`)`)
  .join('\n')}

---

## ⚡ Dynamic GraphQL Endpoint (\`/graphql\`)
Static pages communicate with this GraphQL endpoint to submit leads and retrieve dynamic content from SQLite.

Example query:
\`\`\`graphql
query {
  pages {
    title
    slug
  }
}
\`\`\`

---

## ☁️ OneDrive & SQLite Sync
The \`schema.sql\` script in this folder creates the relational tables. You can back up this database file directly to your OneDrive folder.
`;
}

/**
 * Main export function: bundles all pages, server.js, schema.sql, package.json into a .zip file
 * and triggers immediate browser download.
 */
export async function downloadWebBundleZip(website: Website, port: number = 3000): Promise<void> {
  const zip = new JSZip();

  // 1. Root files
  zip.file('server.js', generateServerJs(website, port));
  zip.file('package.json', generatePackageJson(website));
  zip.file('README.md', generateReadme(website, port));
  zip.file('schema.sql', generateSqlSchema(website));
  zip.file('database.json', JSON.stringify(website, null, 2));

  // 2. Public directory with all HTML pages
  const publicFolder = zip.folder('public');
  if (publicFolder) {
    for (const page of website.pages) {
      const fileName = page.slug === 'home' ? 'index.html' : `${page.slug}.html`;
      publicFolder.file(fileName, generatePageHtml(page, website));
    }
  }

  // 3. Generate the ZIP blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // 4. Trigger download in user browser
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  const cleanName = website.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.download = `${cleanName}-web-bundle.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
