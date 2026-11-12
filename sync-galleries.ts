import { connect } from "framer-api"
import { config } from "dotenv"
config()

const GALLERY_FIELD = "nQv925x9z"
const GALLERY_IMAGE_SUBFIELD = "QOAMgLX9m"

const galleryImages: Record<string, string[]> = {
  "headless-360": [
    "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130226/image-5.png",
    "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530131911/image-17.png",
    "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130341/image-7.png",
  ],
  "agentic-enterpise": [
    "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530125934/image-11.png",
    "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130007/image-22.png",
  ],
  "mulesoft-integration": [
    "https://docs.mulesoft.com/anypoint-code-builder/_images/welcome-mat-reference.png",
    "https://docs.mulesoft.com/anypoint-code-builder/_images/ui-elements.png",
    "https://docs.mulesoft.com/anypoint-code-builder/_images/ui-elements-api.png",
    "https://docs.mulesoft.com/anypoint-code-builder/_images/acb-ui-dark-theme.png",
    "https://cdn.davidwells.io/work/mulesoft-anypoint-dashboard.jpg",
  ],
  "cardbon-design-for-analytics": [
    "https://raw.githubusercontent.com/carbon-design-system/carbon-charts/main/assets/hero.png",
    "https://raw.githubusercontent.com/carbon-design-system/carbon-charts/main/assets/dashboard.png",
    "https://carbondesignsystem.com/static/b6071484f2ee4105120300c14cdf48b8/3cbba/datatable-anatomy.png",
    "https://carbondesignsystem.com/static/e89a6ca012b7ee35e7a397b877e7367e/3cbba/usage-ai-presence-datatable.png",
  ],
}

function getMime(url: string) {
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg"
  return "image/png"
}

async function main() {
  const framer = await connect(process.env.FRAMER_PROJECT_URL!, process.env.FRAMER_API_KEY!)

  try {
    const collections = await framer.getCollections()
    const works = collections.find(c => c.name === "Works")!
    const items = await works.getItems()

    for (const item of items) {
      const urls = galleryImages[item.slug]
      if (!urls) continue

      console.log(`\n📁 ${item.slug} (${urls.length} images):`)

      const galleryEntries = []
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        const filename = url.split("/").pop()!
        console.log(`  ⬇  ${filename}...`)

        const res = await fetch(url)
        if (!res.ok) { console.log(`  ❌ Failed: ${res.status}`); continue }

        const bytes = new Uint8Array(await res.arrayBuffer())
        const asset = await framer.uploadImage({
          image: { bytes, mimeType: getMime(url) },
          name: `${item.slug}-gallery-${i}`,
          altText: filename,
        })

        galleryEntries.push({
          fieldData: {
            [GALLERY_IMAGE_SUBFIELD]: { type: "image" as const, value: asset.url }
          }
        })
        console.log(`  ✅ ${filename}`)
      }

      await works.addItems([{
        id: item.id,
        slug: item.slug,
        fieldData: {
          [GALLERY_FIELD]: { type: "array", value: galleryEntries }
        }
      }])
      console.log(`  🖼  Gallery updated with ${galleryEntries.length} images`)
    }

    console.log("\n\n✅ All galleries updated!")
    console.log("Open Framer and publish to go live.")

  } finally {
    await framer.disconnect()
  }
}

main().catch(console.error)
