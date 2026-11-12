/**
 * Framer CMS Sync Script
 *
 * Syncs case study content to your Framer project via the Server API.
 *
 * SETUP:
 * 1. In Framer: Open your project → Site Settings → General → Generate API Key
 * 2. Create a .env file with:
 *    FRAMER_API_KEY=your-api-key-here
 *    FRAMER_PROJECT_URL=https://framer.com/projects/TD-MaxFolio-copy--aXqJWzmfxksKOT00TGyq-203Tk
 * 3. Run: npx tsx sync-to-framer.ts
 *
 * MODES:
 *   npx tsx sync-to-framer.ts discover    — List all collections and their fields (run this first!)
 *   npx tsx sync-to-framer.ts sync        — Push case study content to the CMS
 *   npx tsx sync-to-framer.ts publish     — Publish and deploy changes
 */

import { connect } from "framer-api"
import { config } from "dotenv"

config() // Load .env

const PROJECT_URL = process.env.FRAMER_PROJECT_URL!
const API_KEY = process.env.FRAMER_API_KEY!

if (!PROJECT_URL || !API_KEY) {
  console.error("❌ Missing FRAMER_PROJECT_URL or FRAMER_API_KEY in .env")
  process.exit(1)
}

// ─────────────────────────────────────────────────
// Case Study Content
// ─────────────────────────────────────────────────

const caseStudies = [
  {
    slug: "headless-360",
    title: "Agentic Automation",
    subtitle: "Agentforce 360 Platform, Flow AI & Automation Services",
    year: "2025",
    category: "Product Leadership, Agent First Platform Architecture",
    overview_headline: "Designing AI-powered automation for the Salesforce Platform — from Setup with Agentforce to Flow AI.",
    overview: `Situation: Salesforce was shifting toward an agentic platform — where AI doesn't just assist but actively builds, tests, and manages automation. But the platform's existing UX wasn't designed for autonomous AI behavior, creating trust and control gaps across a platform processing ~260K flow executions every second (692B total, +50% YoY) for 58.3M monthly active users.

Task: As Senior Director of Product Design leading an international organization of 30+ designers, I was charged with defining the design vision for three interconnected AI initiatives for Dreamforce '25: Setup powered by Agentforce, Flow AI, and next-generation Flow testing and debugging.

Action: Our team designed the UX architecture for Setup with Agentforce (conversational admin tasks), Flow AI (AI-powered flow generation and documentation), and Flow Testing & Debugging (unified test mode with stack traces, variable watch, and AI-powered regression testing). We also integrated DevOps Center for agent-operated release pipelines.

Result: All three capabilities shipped and were showcased at Dreamforce '25. The platform now powers 63%+ of all Agentforce agent actions (55.1% Flow + 8.3% Invocable Actions), with 19.9M agent invocations running through Flow.

Key metrics:

• Marketing Cloud Next active orgs — +121% (~450 → ~1,200)
• Activated Flows on C360 — +363%, still accelerating
• Triggered Flow activation YoY — 28x growth (18 → 506 activated Flows)
• Event-triggered Flow creation YoY (since Oct 2024) — +20%
• Designer comprehension, Data Cloud resource navigation — +80%
• Designer comprehension, Friendly Resource Picker — +100%`,
    problem: ``,
    solution: ``,
    heroImage: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130226/image-5.png",
  },
  {
    slug: "agentic-enterpise",
    title: "Low Code Automation Platform",
    subtitle: "Flow Builder, Automation & Integration Platform",
    year: "2023–2025",
    category: "Product Leadership, Agent First Platform Architecture",
    overview_headline: "Reimagining Salesforce Flow Builder as the automation platform for 58.3M users.",
    overview: `Situation: Flow Builder had grown into the most powerful declarative tool in the Salesforce ecosystem — but years of organic feature growth left it with a rigid canvas, no responsive previews, and fragmented debugging. The gap between what Flow could do and what 58.3M users could figure out was widening.

Task: Our team was tasked with defining the product architecture to scale Flow Builder from an admin tool into a platform-wide automation surface — while maintaining the simplicity that made it trusted.

Action: We designed the Automation Events framework as extensible infrastructure, enabling multiple product teams to ship Wait Events and Path Experiments without duplicate build-out. We created the headless automation design model for design coherence as the platform moved API-first across Slack, IDE, and agent surfaces. We drove a multi-release modernization strategy: single-click canvas interactions, 12-column responsive grid, reactive screen architecture, resizable debug panel, and Flow Orchestration fault paths.

Result: These shipped across Winter '25 through Summer '26 releases and collectively transformed Flow Builder from an admin tool into a low-code application platform — now processing 692B executions annually at 50% YoY growth.`,
    problem: ``,
    solution: ``,
    heroImage: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530125934/image-11.png",
  },
  {
    slug: "mulesoft-integration",
    title: "Integration-As-A-Service",
    subtitle: "MuleSoft Composer, RPA, IDP & Anypoint",
    year: "2020–2023",
    category: "Product Leadership, Agent First Platform Architecture",
    overview_headline: "Making API-first integration accessible to every team, not just developers.",
    overview: `Situation: MuleSoft's Anypoint Platform was the industry-leading integration platform — but its power was locked behind a developer-only IDE. Business teams waited months for integrations that developers considered low-priority, and shadow IT grew as teams built fragile point-to-point connections outside the platform. The gap between integration demand and developer capacity was growing 3x faster than headcount.

Task: As Product Architect for MuleSoft (2020-2023), I was charged with transforming the integration experience from a developer-only tool into a platform that CIOs, developers, and business users could all use — making integration a service any team could consume.

Action: I led design across API, RPA, and intelligent document processing platform experiences. I built design teams and end-to-end customer journeys that brought MuleSoft capabilities to non-developer audiences — including a visual flow designer with 400+ connectors, the Anypoint Exchange redesign, and contributed to MuleSoft Composer's no-code vision.

Result: This work positioned MuleSoft as the integration backbone for Salesforce's broader platform strategy, bridging the gap between technical power and usability and connecting CRM, commerce, and AI capabilities across the enterprise.`,
    problem: ``,
    solution: ``,
    heroImage: "https://docs.mulesoft.com/anypoint-code-builder/_images/welcome-mat-reference.png",
  },
  {
    slug: "cardbon-design-for-analytics",
    title: "Watson AI Carbon Design System",
    subtitle: "IBM Watson + Carbon",
    year: "2016–2018",
    category: "Product Leadership, Agent First Platform Architecture",
    overview_headline: "Building the design language for enterprise AI at IBM Watson.",
    overview: `Situation: Watson's AI products had grown rapidly through acquisition, resulting in fragmented user experiences — each product had its own visual language, interaction patterns, and component libraries. Meanwhile, IBM's Carbon Design System lacked the AI-specific components needed for confidence indicators, model explainability, and data-dense analytical views.

Task: As Senior Product Design Manager for Watson at IBM (2016-2018), I was responsible for unifying the Watson design language within Carbon and leading UX for Watson Customer Experience Analytics and IBM Sterling Supply Chain.

Action: I designed AI-specific component patterns (confidence scoring, entity recognition, explainability panels), established a D3-powered data visualization system on Carbon's design tokens, and pioneered AI transparency patterns before "explainable AI" became an industry standard. I introduced IBM Design Thinking practices and built a craft-focused design team culture.

Result: This work established Carbon as the foundation for IBM's enterprise AI experiences, influenced the later development of Carbon for AI, and promoted several team members into senior roles — defining how millions of users experience AI in the enterprise.`,
    problem: ``,
    solution: ``,
    heroImage: "https://raw.githubusercontent.com/carbon-design-system/carbon-charts/main/assets/hero.png",
  },
]

// ─────────────────────────────────────────────────
// Discovery Mode — Run this first to learn your CMS structure
// ─────────────────────────────────────────────────

async function discover() {
  const framer = await connect(PROJECT_URL, API_KEY)

  try {
    console.log("\n📋 Regular Collections (from your template):")
    console.log("─".repeat(50))
    const collections = await framer.getCollections()
    for (const col of collections) {
      console.log(`\n  📁 "${col.name}" (id: ${col.id})`)
      const fields = await col.getFields()
      for (const field of fields) {
        console.log(`     └─ ${field.name} [${field.type}] (id: ${field.id})`)
      }
      const items = await col.getItems()
      console.log(`     📄 ${items.length} items:`)
      for (const item of items) {
        const slug = item.slug || item.id
        console.log(`        • ${slug}`)
        // Show first few field values for inspection
        if (item.fieldData) {
          const entries = Object.entries(item.fieldData).slice(0, 3)
          for (const [fieldId, data] of entries) {
            const fieldDef = fields.find(f => f.id === fieldId)
            const name = fieldDef?.name || fieldId
            const val = typeof data === "object" && data !== null && "value" in (data as any)
              ? (data as any).value
              : JSON.stringify(data)
            const preview = String(val).substring(0, 60)
            console.log(`          ${name}: "${preview}${String(val).length > 60 ? "..." : ""}"`)
          }
        }
      }
    }

    console.log("\n\n📋 Managed Collections (plugin-created):")
    console.log("─".repeat(50))
    const managed = await framer.getManagedCollections()
    if (managed.length === 0) {
      console.log("  (none)")
    }
    for (const col of managed) {
      console.log(`\n  📁 "${col.name}" (id: ${col.id})`)
      const fields = await col.getFields()
      for (const field of fields) {
        console.log(`     └─ ${field.name} [${field.type}] (id: ${field.id})`)
      }
    }

    console.log("\n\n✅ Discovery complete!")
    console.log("─".repeat(50))
    console.log("Next steps:")
    console.log("1. Find your case studies collection name above")
    console.log("2. Update the COLLECTION_NAME constant in this script")
    console.log("3. Update the FIELD_MAP to match your field IDs")
    console.log("4. Run: npx tsx sync-to-framer.ts sync")
  } finally {
    await framer.disconnect()
  }
}

// ─────────────────────────────────────────────────
// Sync Mode — Push content to CMS
// ─────────────────────────────────────────────────

const COLLECTION_NAME = "Works"
const FIELD_MAP: Record<string, string> = {
  "title": "uOTWfNNv5",
  "subtitle": "QS56NZXcW",        // Short text
  "year": "vQK6Gefqa",
  "category": "kfKXcFJHt",
  "overview_headline": "DA1qjMsKn", // overview title
  "overview": "OlALAX3Xg",          // overview text
  "problem": "wIrCpZG3L",           // Problem text
  "solution": "PQpyEgKZY",          // Solution text
}

// Static values for the Problem/Solution titles
const PROBLEM_TITLE_FIELD = "DClox4BW_"
const SOLUTION_TITLE_FIELD = "GcJFobI__"

async function sync() {
  const framer = await connect(PROJECT_URL, API_KEY)

  try {
    // Find the Works collection
    const collections = await framer.getCollections()
    const collection = collections.find(c => c.name === COLLECTION_NAME)

    if (!collection) {
      console.error(`❌ Collection "${COLLECTION_NAME}" not found.`)
      process.exit(1)
    }

    // Get existing items to map slugs to IDs for updates
    const existingItems = await collection.getItems()
    const slugToId = new Map(existingItems.map(item => [item.slug, item.id]))

    // Map old template slugs to our new slugs
    const templateSlugMap: Record<string, string> = {
      "siri": "headless-360",
      "game-hub": "agentic-enterpise",
      "fitlife": "mulesoft-integration",
      "nutra-coil": "cardbon-design-for-analytics",
    }

    console.log(`\n📤 Syncing ${caseStudies.length} case studies to "${COLLECTION_NAME}"...\n`)

    // Build items for upsert
    const items = caseStudies.map(cs => {
      // Try to find existing item by our slug or by the old template slug
      let existingId = slugToId.get(cs.slug)
      if (!existingId) {
        // Check if there's an old template slug we should replace
        const oldSlug = Object.entries(templateSlugMap).find(([, newSlug]) => newSlug === cs.slug)?.[0]
        if (oldSlug) existingId = slugToId.get(oldSlug)
      }

      const fieldData: Record<string, { type: "string"; value: string }> = {}

      // Map content fields
      for (const [key, fieldId] of Object.entries(FIELD_MAP)) {
        if (key in cs) {
          fieldData[fieldId] = { type: "string", value: (cs as any)[key] }
        }
      }

      // Add static Problem/Solution titles only if there's content
      fieldData[PROBLEM_TITLE_FIELD] = { type: "string", value: (cs as any).problem ? "Problem" : "" }
      fieldData[SOLUTION_TITLE_FIELD] = { type: "string", value: (cs as any).solution ? "Solution" : "" }

      return {
        id: existingId,
        slug: cs.slug,
        fieldData,
      }
    })

    await collection.addItems(items)

    for (const cs of caseStudies) {
      const existed = slugToId.has(cs.slug) || Object.keys(templateSlugMap).some(old => slugToId.has(old))
      console.log(`  ${existed ? "♻️  Updated" : "✨ Created"} ${cs.title} (/${cs.slug})`)
    }

    console.log(`\n✅ Synced ${caseStudies.length} case studies!`)
    console.log("Run 'npx tsx sync-to-framer.ts publish' to go live.")
  } finally {
    await framer.disconnect()
  }
}

// ─────────────────────────────────────────────────
// Publish Mode — Push to production
// ─────────────────────────────────────────────────

async function publish() {
  const framer = await connect(PROJECT_URL, API_KEY)

  try {
    // Check for changes
    const changedPaths = await framer.getChangedPaths()
    const entries = Object.entries(changedPaths)
    const totalChanges = entries.reduce((sum, [, paths]) => sum + (paths as string[]).length, 0)

    if (totalChanges === 0) {
      console.log("⛔️ No changes to publish.")
      process.exit(0)
    }

    console.log(`\n📄 ${totalChanges} change(s):`)
    for (const [type, paths] of entries) {
      for (const path of paths as string[]) {
        console.log(`   ${type}: ${path}`)
      }
    }

    // Publish preview
    const { deployment } = await framer.publish()
    console.log(`\n🚀 Published deployment ${deployment.id}`)

    // Deploy to production
    const deployed = await framer.deploy(deployment.id)

    if (Array.isArray(deployed) && deployed.length > 0) {
      console.log(`\n✅ Deployed to ${deployed.length} domain(s):`)
      for (const hostname of deployed) {
        const host = typeof hostname === "string" ? hostname : (hostname as any).hostname
        console.log(`   https://${host}`)
      }
    } else {
      console.log("\n✅ Deployed — default hostname is live.")
    }
  } finally {
    await framer.disconnect()
  }
}

// ─────────────────────────────────────────────────
// CLI Router
// ─────────────────────────────────────────────────

const command = process.argv[2] || "discover"

switch (command) {
  case "discover":
    discover().catch(console.error)
    break
  case "sync":
    sync().catch(console.error)
    break
  case "publish":
    publish().catch(console.error)
    break
  default:
    console.log(`
Usage: npx tsx sync-to-framer.ts <command>

Commands:
  discover   List all CMS collections, fields, and items (run first!)
  sync       Push case study content to Framer CMS
  publish    Publish changes and deploy to production
`)
}
