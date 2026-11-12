/**
 * Framer CMS Image Sync
 *
 * Downloads images from URLs, uploads them to Framer, and assigns them
 * to the correct CMS collection items.
 *
 * Run: npx tsx sync-images.ts
 */

import { connect } from "framer-api"
import { config } from "dotenv"

config()

const PROJECT_URL = process.env.FRAMER_PROJECT_URL!
const API_KEY = process.env.FRAMER_API_KEY!

// Field IDs from discovery
const IMAGE_FIELD = "C9TjyRmgB"      // Image (hero)
const IMAGE2_FIELD = "zV7fZKbpl"      // Image 2 (overview section)

// Case study images — hero + detail image per case study
const caseStudyImages: Record<string, { hero: string; detail: string; heroAlt: string; detailAlt: string }> = {
  "headless-360": {
    hero: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130226/image-5.png",
    heroAlt: "Agentforce - Invoke Agent action in Flow Builder",
    detail: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530131704/image-16.png",
    detailAlt: "Flow Builder debug panel with agent reasoning traces",
  },
  "agentic-enterpise": {
    hero: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530125934/image-11.png",
    heroAlt: "Flow Builder new flow creation modal",
    detail: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530132503/image-81.png",
    detailAlt: "Flow Builder reactive screen actions",
  },
  "mulesoft-integration": {
    hero: "https://docs.mulesoft.com/anypoint-code-builder/_images/welcome-mat-reference.png",
    heroAlt: "Anypoint Code Builder IDE welcome screen",
    detail: "https://docs.mulesoft.com/anypoint-code-builder/_images/ui-elements.png",
    detailAlt: "Anypoint Code Builder integration project view",
  },
  "cardbon-design-for-analytics": {
    hero: "https://raw.githubusercontent.com/carbon-design-system/carbon-charts/main/assets/hero.png",
    heroAlt: "Carbon Charts data visualization library",
    detail: "https://raw.githubusercontent.com/carbon-design-system/carbon-charts/main/assets/dashboard.png",
    detailAlt: "Carbon Charts dashboard with multiple chart types",
  },
}

// Gallery images per case study
const galleryImages: Record<string, Array<{ url: string; alt: string }>> = {
  "headless-360": [
    { url: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130226/image-5.png", alt: "Invoke Agent action" },
    { url: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530131911/image-17.png", alt: "Agent testing" },
  ],
  "agentic-enterpise": [
    { url: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530125934/image-11.png", alt: "New flow creation modal" },
    { url: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130007/image-22.png", alt: "Single-click elements" },
  ],
  "mulesoft-integration": [
    { url: "https://docs.mulesoft.com/anypoint-code-builder/_images/welcome-mat-reference.png", alt: "Code Builder welcome" },
    { url: "https://docs.mulesoft.com/anypoint-code-builder/_images/ui-elements.png", alt: "Integration project" },
    { url: "https://docs.mulesoft.com/anypoint-code-builder/_images/ui-elements-api.png", alt: "API design" },
    { url: "https://docs.mulesoft.com/anypoint-code-builder/_images/acb-ui-dark-theme.png", alt: "Dark theme" },
    { url: "https://cdn.davidwells.io/work/mulesoft-anypoint-dashboard.jpg", alt: "Anypoint dashboard" },
  ],
  "cardbon-design-for-analytics": [
    { url: "https://raw.githubusercontent.com/carbon-design-system/carbon-charts/main/assets/hero.png", alt: "Carbon Charts" },
    { url: "https://raw.githubusercontent.com/carbon-design-system/carbon-charts/main/assets/dashboard.png", alt: "Carbon Charts dashboard" },
    { url: "https://carbondesignsystem.com/static/b6071484f2ee4105120300c14cdf48b8/3cbba/datatable-anatomy.png", alt: "Data Table" },
    { url: "https://carbondesignsystem.com/static/e89a6ca012b7ee35e7a397b877e7367e/3cbba/usage-ai-presence-datatable.png", alt: "AI Data Table" },
  ],
}

async function downloadImage(url: string): Promise<Uint8Array> {
  console.log(`    ⬇  Downloading ${url.split("/").pop()}...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buffer = await res.arrayBuffer()
  return new Uint8Array(buffer)
}

function getMimeType(url: string): string {
  if (url.endsWith(".png")) return "image/png"
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg"
  if (url.endsWith(".webp")) return "image/webp"
  if (url.endsWith(".svg")) return "image/svg+xml"
  return "image/png"
}

async function main() {
  const framer = await connect(PROJECT_URL, API_KEY)

  try {
    // Get collection and items
    const collections = await framer.getCollections()
    const works = collections.find(c => c.name === "Works")
    if (!works) throw new Error("Works collection not found")

    const items = await works.getItems()
    const fields = await works.getFields()

    console.log("\n🖼  Uploading images to Framer...\n")

    for (const item of items) {
      const slug = item.slug
      const images = caseStudyImages[slug]
      if (!images) {
        console.log(`  ⏭  Skipping ${slug} (no images defined)`)
        continue
      }

      console.log(`\n  📁 ${slug}:`)

      // Upload hero image
      try {
        const heroBytes = await downloadImage(images.hero)
        const heroAsset = await framer.uploadImage({
          image: { bytes: heroBytes, mimeType: getMimeType(images.hero) },
          name: `${slug}-hero`,
          altText: images.heroAlt,
        })
        console.log(`    ✅ Hero uploaded (${heroAsset.id})`)

        // Upload detail image
        const detailBytes = await downloadImage(images.detail)
        const detailAsset = await framer.uploadImage({
          image: { bytes: detailBytes, mimeType: getMimeType(images.detail) },
          name: `${slug}-detail`,
          altText: images.detailAlt,
        })
        console.log(`    ✅ Detail uploaded (${detailAsset.id})`)

        // Update CMS item with image fields (value must be the asset URL string)
        const fieldData: Record<string, any> = {
          [IMAGE_FIELD]: { type: "image", value: heroAsset.url },
          [IMAGE2_FIELD]: { type: "image", value: detailAsset.url },
        }

        await works.addItems([{
          id: item.id,
          slug: slug,
          fieldData,
        }])
        console.log(`    ✅ CMS item updated with images`)

      } catch (err: any) {
        console.error(`    ❌ Error for ${slug}: ${err.message}`)
      }
    }

    // Upload gallery images
    console.log("\n\n🖼  Uploading gallery images...\n")

    const GALLERY_FIELD = "nQv925x9z" // Gallery [array] field

    for (const item of items) {
      const slug = item.slug
      const gallery = galleryImages[slug]
      if (!gallery) continue

      console.log(`\n  📁 ${slug} gallery (${gallery.length} images):`)

      try {
        const galleryAssets = []
        for (const img of gallery) {
          const bytes = await downloadImage(img.url)
          const asset = await framer.uploadImage({
            image: { bytes, mimeType: getMimeType(img.url) },
            name: `${slug}-gallery-${img.alt.replace(/\s+/g, "-").toLowerCase()}`,
            altText: img.alt,
          })
          galleryAssets.push(asset)
          console.log(`    ✅ ${img.alt}`)
        }

        // Update gallery field (array of image URLs)
        await works.addItems([{
          id: item.id,
          slug: slug,
          fieldData: {
            [GALLERY_FIELD]: {
              type: "array",
              value: galleryAssets.map(asset => ({
                fieldData: {
                  image: { type: "image", value: asset.url }
                }
              }))
            }
          },
        }])
        console.log(`    ✅ Gallery updated with ${galleryAssets.length} images`)

      } catch (err: any) {
        console.error(`    ❌ Gallery error for ${slug}: ${err.message}`)
      }
    }

    console.log("\n\n✅ All images uploaded!")
    console.log("Open your Framer project and hit Publish to go live.")

  } finally {
    await framer.disconnect()
  }
}

main().catch(console.error)
