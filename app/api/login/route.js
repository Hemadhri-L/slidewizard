import { supabaseServer } from "../../../lib/supabaseServer"

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
  } catch (err) {
    return Response.json({ error: "Something went wrong" }, { status: 500 })
  }
}