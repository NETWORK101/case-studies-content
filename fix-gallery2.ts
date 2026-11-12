import { connect } from "framer-api"
import { config } from "dotenv"
config()

async function main() {
  const framer = await connect(process.env.FRAMER_PROJECT_URL!, process.env.FRAMER_API_KEY!)

  try {
    const collections = await framer.getCollections()
    const works = collections.find(c => c.name === "Works")!
    const items = await works.getItems()
    const item = items.find(i => i.slug === "headless-360")!

    // Upload 3 test images
    const urls = [
      "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130226/image-5.png",
      "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530131704/image-16.png",
      "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530131535/image-14.png",
    ]

    const assets = []
    for (const url of urls) {
      const res = await fetch(url)
      const bytes = new Uint8Array(await res.arrayBuffer())
      const asset = await framer.uploadImage({
        image: { bytes, mimeType: "image/png" },
        name: `gallery-${assets.length}`,
        altText: `Gallery image ${assets.length + 1}`,
      })
      assets.push(asset)
      console.log(`Uploaded: ${asset.id}`)
    }

    // The gallery array field has sub-fields: [{type: "image"}]
    // The sub-field has no id/name, so let's try various formats

    const formats = [
      // Format 2: array items as strings (just URLs)
      {
        name: "strings",
        value: assets.map(a => a.url)
      },
      // Format 3: array items with nested fieldData using image type key
      {
        name: "fieldData with type key",
        value: assets.map(a => ({
          fieldData: {
            image: { type: "image" as const, value: a.url }
          }
        }))
      },
      // Format 4: plain image asset data objects wrapped in fieldData
      {
        name: "fieldData with ImageAssetData",
        value: assets.map(a => ({
          fieldData: {
            image: {
              type: "image" as const,
              value: { id: a.id, url: a.url, thumbnailUrl: a.thumbnailUrl, resolution: a.resolution }
            }
          }
        }))
      },
      // Format 5: Just the URLs as image field entries
      {
        name: "image entries",
        value: assets.map(a => ({
          type: "image" as const,
          value: a.url
        }))
      },
    ]

    for (const fmt of formats) {
      try {
        console.log(`\nTrying format: ${fmt.name}...`)
        await works.addItems([{
          id: item.id,
          slug: item.slug,
          fieldData: {
            "nQv925x9z": { type: "array", value: fmt.value }
          }
        }])

        // Check result
        const updated = (await works.getItems()).find(i => i.slug === "headless-360")!
        const gallery = (updated as any).fieldData?.["nQv925x9z"]
        const hasContent = gallery?.value?.length > 0
        console.log(`  Result: ${hasContent ? "✅ HAS CONTENT" : "❌ empty"} (${gallery?.value?.length || 0} items)`)
        if (hasContent) {
          console.log(`  Value:`, JSON.stringify(gallery.value[0], null, 2))
          break // Found working format!
        }
      } catch (e: any) {
        console.log(`  ❌ Error: ${e.message.substring(0, 100)}`)
      }
    }

  } finally {
    await framer.disconnect()
  }
}

main().catch(console.error)
