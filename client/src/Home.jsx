
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'  

function Home() {
  const [handle, setHandle] = useState('')
  const Navigate = useNavigate();


  const submit = (e) => {
    e.preventDefault()
    if (!handle.trim()) return
    // TODO: trigger backend fetch
    Navigate(`/user/${handle.replace(/^@/, '')}`, { state: { username: handle.replace(/^@/, '') } })
    
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d1013] text-slate-100 px-4 py-10">
      <div className="w-full max-w-xl space-y-8">
        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-[#10151a]/95 p-8 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur-sm">
          {/* Header */}
          <header className="space-y-4">
            <h1 className="text-[42px] leading-none font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">
                Influencer Insight
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              Enter a public Instagram username to preview core profile metrics & engagement placeholders.
            </p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
          </header>

            {/* Form */}
            <form onSubmit={submit} className="mt-6 flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="@username"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full rounded-xl bg-[#0c1115] border border-slate-700/70 focus:border-emerald-400 focus:ring focus:ring-emerald-500/25 px-4 py-3 text-sm placeholder-slate-500 outline-none transition shadow-inner shadow-black/40"
                />
              </div>
              <button
                type="submit"
                onClick={()=>{
                    Navigate(`/user/${handle.replace(/^@/, '')}`, { state: { username: handle.replace(/^@/, '') } })
                }}
                className="px-6 py-3 rounded-xl text-sm font-semibold tracking-wide
                  bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-600
                  focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#0d1013]
                  shadow-[0_4px_18px_-4px_rgba(16,185,129,0.55)]
                  active:scale-[0.97] transition"
              >
                Analyze
              </button>
            </form>

            {/* Placeholder Metrics */}
            {/* <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Followers', value: '—' },
                { label: 'Avg Likes', value: '—' },
                { label: 'Engagement', value: '—' }
              ].map(m => (
                <div
                  key={m.label}
                  className="rounded-2xl bg-[#0f1418] border border-slate-800 py-4 flex flex-col gap-1 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.5)]"
                >
                  <span className="text-lg font-semibold text-emerald-300">{m.value}</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                    {m.label}
                  </span>
                </div>
              ))}
            </div> */}

            
        </div>
      </div>
    </div>
  )
}

export default Home
