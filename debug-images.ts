/**
 * Debug: inspect how image fields are stored in the CMS
 */
import { connect } from "framer-api"
import { config } from "dotenv"
config()

async function main() {
  const framer = await connect(process.env.FRAMER_PROJECT_URL!, process.env.FRAMER_API_KEY!)

  try {
    const collections = await framer.getCollections()
    const works = collections.find(c => c.name === "Works")!
    const items = await works.getItems()
    const fields = await works.getFields()

    // Check first item's image fields in detail
    const item = items[0]
    console.log(`\nItem: ${item.slug} (id: ${item.id})\n`)

    for (const field of fields) {
      if (field.type === "image" || field.type === "array") {
        const value = (item as any).fieldData?.[field.id]
        console.log(`${field.name} [${field.type}] (${field.id}):`)
        console.log(JSON.stringify(value, null, 2))
        console.log()
      }
    }

    // Also upload a test image and inspect the returned asset
    console.log("\n--- Test upload ---")
    const res = await fetch("https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130226/image-5.png")
    const bytes = new Uint8Array(await res.arrayBuffer())
    const asset = await framer.uploadImage({
      image: { bytes, mimeType: "image/png" },
      name: "test-image",
      altText: "test",
    })
    console.log("Uploaded asset object:")
    console.log(JSON.stringify(asset, null, 2))
    console.log("\nasset.url:", asset.url)
    console.log("asset.id:", asset.id)
    console.log("asset.thumbnailUrl:", asset.thumbnailUrl)

    // Inspect all enumerable and own properties
    console.log("\nAll own keys:", Object.keys(asset))
    console.log("All props:", Object.getOwnPropertyNames(asset))

    // Try to get serialized form
    for (const sym of Object.getOwnPropertySymbols(asset)) {
      const val = (asset as any)[sym]
      if (typeof val === "function") {
        try {
          const result = val.call(asset)
          console.log(`\nSymbol marshal result:`, JSON.stringify(result, null, 2))
        } catch {}
      }
    }

  } finally {
    await framer.disconnect()
  }
}

main().catch(console.error)
