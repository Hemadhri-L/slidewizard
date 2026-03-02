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
      user: data.user,
      session: data.session,
    })
  } catch (err) {
    return Response.json({ error: "Something went wrong" }, { status: 500 })
  }
}