import { connect } from "framer-api"
import { config } from "dotenv"
config()

async function main() {
  const framer = await connect(process.env.FRAMER_PROJECT_URL!, process.env.FRAMER_API_KEY!)

  try {
    const collections = await framer.getCollections()
    const works = collections.find(c => c.name === "Works")!
    const fields = await works.getFields()
    const items = await works.getItems()

    // Get the gallery field's sub-field structure
    const galleryField = fields.find(f => f.name === "Gallery") as any
    console.log("Gallery field full:", JSON.stringify(galleryField, null, 2))

    // Check if the sub-field has an id we need to use
    if (galleryField.fields?.[0]) {
      console.log("Sub-field keys:", Object.keys(galleryField.fields[0]))
      console.log("Sub-field:", JSON.stringify(galleryField.fields[0], null, 2))
      // Check for id
      console.log("Sub-field id:", galleryField.fields[0].id)
      console.log("Sub-field name:", galleryField.fields[0].name)
    }

    // Upload one image
    const res = await fetch("https://d3nqfz2gm66yqg.cloudfront.net/images/20250530130226/image-5.png")
    const bytes = new Uint8Array(await res.arrayBuffer())
    const asset = await framer.uploadImage({
      image: { bytes, mimeType: "image/png" },
      name: "gallery-test",
      altText: "test",
    })
    console.log("\nUploaded:", asset.url)

    const item = items.find(i => i.slug === "headless-360")!

    // Get the sub-field id if it exists
    const subFieldId = galleryField.fields?.[0]?.id

    // Try with sub-field ID
    const formats = []

    if (subFieldId) {
      formats.push({
        name: `fieldData with sub-field id "${subFieldId}"`,
        value: [{
          fieldData: {
            [subFieldId]: { type: "image" as const, value: asset.url }
          }
        }]
      })
    }

    // Try: array of objects with just the URL in the image sub-field by index
    formats.push({
      name: "array with slug and fieldData using 0-index",
      value: [{
        slug: "img-0",
        fieldData: {
          "0": { type: "image" as const, value: asset.url }
        }
      }]
    })

    // Try: simple object with image key matching type
    formats.push({
      name: "object with image type value",
      value: [{ image: asset.url }]
    })

    for (const fmt of formats) {
      try {
        console.log(`\nTrying: ${fmt.name}...`)
        await works.addItems([{
          id: item.id,
          slug: item.slug,
          fieldData: {
            "nQv925x9z": { type: "array", value: fmt.value }
          }
        }])

        const updated = (await works.getItems()).find(i => i.slug === "headless-360")!
        const gallery = (updated as any).fieldData?.["nQv925x9z"]
        console.log(`  Result: ${gallery?.value?.length || 0} items`)
        if (gallery?.value?.length > 0) {
          console.log("  ✅ SUCCESS:", JSON.stringify(gallery.value, null, 2))
          break
        }
      } catch (e: any) {
        console.log(`  ❌ ${e.message.substring(0, 120)}`)
      }
    }

  } finally {
    await framer.disconnect()
  }
}

main().catch(console.error)
