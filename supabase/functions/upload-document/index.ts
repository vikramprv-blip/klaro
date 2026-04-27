import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const formData = await req.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const firm_id = formData.get("firm_id") as string
    const profession = formData.get("profession") as string

    const filePath = `${firm_id}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("documents-us")
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { error: dbError } = await supabase
      .from("document_vault")
      .insert({
        firm_id,
        title,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        profession
      })

    if (dbError) throw dbError

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
