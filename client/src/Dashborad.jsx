import React from 'react'

/*
  Props (example):
  <Dashborad
     profile={{
       name:'Ralph Edwards',
       username:'ralph.edwards',
       profile_picture_url:'https://via.placeholder.com/300',
       followers_count:12000,
       follows_count:530,
       media_count:210
     }}
     stats={{
       avgLikes: 840,
       avgComments: 32,
       engagementRate: 7.25
     }}
  />
*/

export default function Dashboard({ profile, stats }) {
  // Fallback (skeleton placeholders)
  const loading = !profile || !stats

  return (
    <div className="min-h-screen bg-[#0b0d10] text-slate-100 flex">
      {/* Side rail */}
      <aside className="hidden md:flex flex-col w-16 items-center pt-6 gap-6 border-r border-slate-800 bg-[#0d1013]">
        {['🏠','📊','🖼','🎬','⚙️'].map((x,i)=>(
          <button
            key={i}
            className="h-11 w-11 rounded-xl bg-[#151a20] border border-slate-700/70 text-base hover:border-slate-600 hover:text-white text-slate-400 transition shadow-inner shadow-black/40"
          >
            {x}
          </button>
        ))}
        <div className="mt-auto mb-6 h-11 w-11 grid place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 font-semibold text-sm shadow-lg shadow-indigo-900/50">
          B
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 px-6 py-10 md:py-14 md:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Top Card */}
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-[#12171d] to-[#0f1419] p-8 md:p-10 shadow-[0_18px_60px_-25px_rgba(0,0,0,0.55)]">
              <div className="grid lg:grid-cols-12 gap-10">
                {/* Avatar */}
                <div className="lg:col-span-3">
                  <div className="relative rounded-2xl bg-[#1a2128] border border-slate-700/70 aspect-square flex items-center justify-center overflow-hidden">
                    {loading
                      ? <Skeleton className="w-3/4 h-3/4" />
                      : <img
                          src={profile.profile_picture_url}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />}
                  </div>
                </div>

                {/* Core Info + Metrics */}
                <div className="lg:col-span-9 flex flex-col gap-10">
                  {/* Name + Username */}
                  <div className="flex flex-col gap-3">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                      <span className="bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">
                        {loading ? <InlineSkeleton w="220px" h="44px" /> : profile.name}
                      </span>
                    </h1>
                    <div className="text-sm text-slate-400 font-medium">
                      {loading ? <InlineSkeleton w="140px" /> : '@' + profile.username}
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/40 to-transparent mt-2" />
                  </div>

                  {/* Basic Information Boxes */}
                  <section className="grid sm:grid-cols-3 md:grid-cols-6 gap-4">
                    <InfoBox label="Followers" value={loading ? '—' : number(profile.followers_count)} accent="emerald" />
                    <InfoBox label="Following" value={loading ? '—' : number(profile.follows_count)} accent="cyan" />
                    <InfoBox label="Posts" value={loading ? '—' : number(profile.media_count)} accent="indigo" />
                    <InfoBox label="Avg Likes" value={loading ? '—' : number(stats.avgLikes)} accent="lime" />
                    <InfoBox label="Avg Comments" value={loading ? '—' : number(stats.avgComments)} accent="orange" />
                    <InfoBox label="Engagement" value={loading ? '—' : stats.engagementRate + '%'} accent="pink" />
                  </section>

                  {/* Engagement Bar (visual) */}
                  <section className="space-y-3">
                    <h2 className="text-xs font-semibold tracking-wider text-slate-400">
                      ENGAGEMENT DISTRIBUTION
                    </h2>
                    <div className="h-4 w-full rounded-full bg-[#1a2128] overflow-hidden relative border border-slate-700/60">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300"
                        style={{
                          width: loading
                            ? '40%'
                            : Math.min(100, (stats.engagementRate || 0) * 4) + '%'
                        }}
                      />
                      <div className="absolute inset-0 flex">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div key={i} className="w-[2.5%] h-full border-r border-slate-900/30" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 tracking-wide">
                      Engagement bar scaled (cap at 25%  full width). Replace with real distribution later.
                    </p>
                  </section>
                </div>
              </div>
            </div>
        </div>
      </main>
    </div>
  )
}

/* ---- Helper Components ---- */

function InfoBox({ label, value, accent = 'emerald' }) {
  const accentMap = {
    emerald: 'from-emerald-500/20 to-emerald-400/10 text-emerald-300',
    cyan: 'from-cyan-500/20 to-cyan-400/10 text-cyan-300',
    indigo: 'from-indigo-500/20 to-indigo-400/10 text-indigo-300',
    lime: 'from-lime-500/20 to-lime-400/10 text-lime-300',
    orange: 'from-orange-500/20 to-orange-400/10 text-orange-300',
    pink: 'from-pink-500/20 to-pink-400/10 text-pink-300'
  }
  return (
    <div className="group relative rounded-2xl border border-slate-800 bg-[#141a20] px-4 py-5 flex flex-col gap-1 overflow-hidden shadow-[0_4px_18px_-8px_rgba(0,0,0,0.55)]">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br ${accentMap[accent] || accentMap.emerald}`} />
      <span className={`text-lg font-semibold relative ${accentMap[accent]?.split(' ').slice(-1)}`}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium relative">
        {label}
      </span>
    </div>
  )
}

function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-700/30 rounded-md ${className}`} />
  )
}

function InlineSkeleton({ w = '100px', h = '18px' }) {
  return (
    <span
      className="inline-block align-middle animate-pulse bg-slate-700/40 rounded"
      style={{ width: w, height: h }}
    />
  )
}

function number(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n
}

