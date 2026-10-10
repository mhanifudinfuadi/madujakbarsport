
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Konfigurasi Supabase belum lengkap.")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

const allowedSports = [
  "Badminton",
  "Running",
  "Panahan",
  "Futsal",
  "Tenis Lapangan",
  "Tenis Meja",
  "e-Sport",
]

export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("sports_stories")
      .select("id, name, sport, activity_date, message, created_at")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Supabase GET error:", error.message)
      return NextResponse.json(
        { error: "Gagal memuat cerita." },
        { status: 500 }
      )
    }

    const stories = (data ?? []).map((story) => ({
      id: story.id,
      name: story.name,
      sport: story.sport,
      date: story.activity_date,
      message: story.message,
      created_at: story.created_at,
    }))

    return NextResponse.json(stories)
  } catch (error) {
    console.error("Stories GET error:", error)
    return NextResponse.json(
      { error: "Konfigurasi Supabase belum tersedia." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const sport = typeof body.sport === "string" ? body.sport : ""
    const date = typeof body.date === "string" ? body.date : ""
    const message =
      typeof body.message === "string" ? body.message.trim() : ""

    if (name.length < 1 || name.length > 100) {
      return NextResponse.json(
        { error: "Nama harus terdiri dari 1–100 karakter." },
        { status: 400 }
      )
    }

    if (!allowedSports.includes(sport)) {
      return NextResponse.json(
        { error: "Cabang olahraga tidak valid." },
        { status: 400 }
      )
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid." },
        { status: 400 }
      )
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`)
    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return NextResponse.json(
        { error: "Tanggal kegiatan tidak valid." },
        { status: 400 }
      )
    }

    if (message.length < 5 || message.length > 1500) {
      return NextResponse.json(
        { error: "Pesan harus terdiri dari 5–1500 karakter." },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("sports_stories")
      .insert({
        name,
        sport,
        activity_date: date,
        message,
      })
      .select("id, name, sport, activity_date, message, created_at")
      .single()

    if (error) {
      console.error("Supabase POST error:", error.message)
      return NextResponse.json(
        { error: "Cerita gagal disimpan ke database." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        story: {
          id: data.id,
          name: data.name,
          sport: data.sport,
          date: data.activity_date,
          message: data.message,
          created_at: data.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Stories POST error:", error)
    return NextResponse.json(
      { error: "Permintaan gagal diproses. Periksa konfigurasi Supabase." },
      { status: 500 }
    )
  }
}