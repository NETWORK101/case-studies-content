/**
 * Fix gallery images — inspect array field structure and upload correctly
 */
import { connect } from "framer-api"
import { config } from "dotenv"
config()

async function main() {
  const framer = await connect(process.env.FRAMER_PROJECT_URL!, process.env.FRAMER_API_KEY!)

  try {
    const collections = await framer.getCollections()
    const works = collections.find(c => c.name === "Works")!
    const fields = await works.getFields()

    // Find the Gallery array field and inspect its sub-fields
    const galleryField = fields.find(f => f.name === "Gallery")
    console.log("Gallery field:", JSON.stringify(galleryField, null, 2))

    // Check if there's a fields property on the gallery field
    const galleryAny = galleryField as any
    if (galleryAny.fields) {
      console.log("\nGallery sub-fields:", JSON.stringify(galleryAny.fields, null, 2))
    }

    // Check all properties
    console.log("\nAll gallery field keys:", Object.keys(galleryAny))
    console.log("All gallery field props:", Object.getOwnPropertyNames(galleryAny))

    // Try to get the items from another case study that still has the old gallery
    const items = await works.getItems()
    for (const item of items) {
      const galleryData = (item as any).fieldData?.["nQv925x9z"]
      if (galleryData?.value?.length > 0) {
        console.log(`\n\nExisting gallery data from "${item.slug}":`)
        console.log(JSON.stringify(galleryData, null, 2))
        break
      }
    }

    // Now upload gallery images for headless-360
    console.log("\n\n--- Uploading gallery images ---")

    const galleryUrls = [
      { url: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130226/image-5.png", alt: "Invoke Agent" },
      { url: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530131704/image-16.png", alt: "Debug panel" },
      { url: "https://d3nqfz2gm66yqg.cloudfront.net/images/20250530131535/image-14.png", alt: "Fault paths" },
    ]

    const assets = []
    for (const img of galleryUrls) {
      const res = await fetch(img.url)
      const bytes = new Uint8Array(await res.arrayBuffer())
      const asset = await framer.uploadImage({
        image: { bytes, mimeType: "image/png" },
        name: img.alt.replace(/\s+/g, "-").toLowerCase(),
        altText: img.alt,
      })
      assets.push(asset)
      console.log(`Uploaded: ${asset.url}`)
    }

    // Try different gallery formats
    const item = items.find(i => i.slug === "headless-360")!

    // Format 1: Array of image asset data objects
    try {
      console.log("\n\nTrying format 1: array of {id, url, thumbnailUrl, resolution}...")
      await works.addItems([{
        id: item.id,
        slug: item.slug,
        fieldData: {
          "nQv925x9z": {
            type: "array",
            value: assets.map(a => ({
              id: a.id,
              url: a.url,
              thumbnailUrl: a.thumbnailUrl,
              resolution: a.resolution,
            }))
          }
        }
      }])
      console.log("✅ Format 1 succeeded!")
    } catch (e: any) {
      console.log(`❌ Format 1 failed: ${e.message}`)
    }

    // Verify
    const updatedItems = await works.getItems()
    const updated = updatedItems.find(i => i.slug === "headless-360")!
    const galleryResult = (updated as any).fieldData?.["nQv925x9z"]
    console.log("\nGallery after update:", JSON.stringify(galleryResult, null, 2))

  } finally {
    await framer.disconnect()
  }
}

main().catch(console.error)
