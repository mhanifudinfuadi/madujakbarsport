
@'
"use client"

import { useCallback, useEffect, useState } from "react"
import { Send, RefreshCw, CalendarDays, UserRound, MessageSquare } from "lucide-react"

type Story = {
  id: string | number
  name: string
  sport: string
  date: string
  message: string
  created_at?: string
}

export function StoriesForm() {
  const [name, setName] = useState("")
  const [sport, setSport] = useState("Badminton")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus("")

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sport, date, message }),
      })

      if (!response.ok) {
        throw new Error("Gagal menyimpan cerita.")
      }

      setName("")
      setMessage("")
      setStatus("Cerita berhasil dikirim!")
      window.dispatchEvent(new Event("stories-updated"))
    } catch {
      setStatus(
        "Cerita belum tersimpan. Pastikan API dan database sudah dikonfigurasi."
      )
    } finally {
      setLoading(false)
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#164a7b]"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Nama anggota
          <input
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            className={fieldClass}
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Cabang olahraga
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className={fieldClass}
          >
            {[
              "Badminton",
              "Running",
              "Panahan",
              "Futsal",
              "Tenis Lapangan",
              "Tenis Meja",
              "e-Sport",
            ].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
          Tanggal kegiatan
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
          Kesan dan pesan
          <textarea
            required
            minLength={5}
            maxLength={1500}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ceritakan pengalaman seru, pelajaran, atau momen berkesan..."
            className={fieldClass}
          />
          <span className="mt-1 block text-right text-xs font-normal text-slate-400">
            {message.length}/1500 karakter
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-[#164a7b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#102b46] disabled:opacity-50"
      >
        <Send size={16} />
        {loading ? "Mengirim..." : "Kirim cerita"}
      </button>

      {status && (
        <p role="status" className="text-sm text-slate-600">
          {status}
        </p>
      )}
    </form>
  )
}

export default function StoriesDashboard() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadStories = useCallback(async () => {
    try {
      const response = await fetch("/api/stories", { cache: "no-store" })
      if (!response.ok) throw new Error("Gagal memuat cerita.")

      const data = await response.json()
      setStories(Array.isArray(data) ? data : data.stories ?? [])
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStories()

    const timer = window.setInterval(loadStories, 15000)
    window.addEventListener("stories-updated", loadStories)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener("stories-updated", loadStories)
    }
  }, [loadStories])

  return (
    <section className="mt-10" aria-live="polite">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b78332]">
            Member stories
          </p>
          <h3 className="mt-2 text-xl font-black text-[#102b46]">
            Cerita terbaru
          </h3>
        </div>
        <button
          type="button"
          onClick={loadStories}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Muat ulang
        </button>
      </div>

      {loading ? (
        <p className="py-6 text-sm text-slate-500">Memuat cerita anggota...</p>
      ) : error ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Cerita belum dapat dimuat. Periksa konfigurasi API dan database.
        </p>
      ) : stories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <MessageSquare className="mx-auto mb-3 text-slate-400" size={28} />
          <p className="font-semibold text-slate-700">Belum ada cerita.</p>
          <p className="mt-1 text-sm text-slate-500">
            Jadilah anggota pertama yang berbagi pengalaman kegiatan!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {stories.map((story) => (
            <article
              key={story.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#e8edf2] px-3 py-1 text-xs font-bold text-[#164a7b]">
                  {story.sport}
                </span>
                <span className="text-xs text-slate-400">
                  {story.date}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {story.message}
              </p>
              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-semibold text-[#102b46]">
                <UserRound size={16} />
                {story.name}
                <span className="ml-auto flex items-center gap-1 text-xs font-normal text-slate-400">
                  <CalendarDays size={13} />
                  {story.date}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
'@ | Set-Content -Encoding utf8 .\components\stories-dashboard.tsx