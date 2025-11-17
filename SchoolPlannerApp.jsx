import React, { useEffect, useState } from 'react'

// SchoolPlannerApp.jsx
// Corrected single-file React component (no Tailwind dependency)

export default function SchoolPlannerApp() {
  const defaultSubjects = [
    'Limba română', 'Matematică', 'Geografie', 'Biologie', 'Fizică',
    'Chimie', 'Istorie', 'Engleză', 'Franceză', 'Religie', 'Info & TIC',
    'Ed. fizică', 'Ed. muzicală', 'Ed. tehn. / financiară', 'Arte'
  ]

  const [subjects, setSubjects] = useState(() => {
    return JSON.parse(localStorage.getItem('subjects')) || defaultSubjects
  })

  const emptyDay = Array(7).fill('')
  const [timetable, setTimetable] = useState(() => {
    return JSON.parse(localStorage.getItem('timetable')) || {
      Luni: [...emptyDay],
      Marti: [...emptyDay],
      Miercuri: [...emptyDay],
      Joi: [...emptyDay],
      Vineri: [...emptyDay]
    }
  })

  // Use ISO date string (YYYY-MM-DD) as planner keys for consistency
  const todayISO = new Date().toISOString().slice(0,10)
  const [selectedDay, setSelectedDay] = useState(() => {
    return localStorage.getItem('selectedDay') || todayISO
  })
  const [planners, setPlanners] = useState(() => JSON.parse(localStorage.getItem('planners')) || {})
  const [newTask, setNewTask] = useState('')
  const [topPriorities, setTopPriorities] = useState(() => planners[selectedDay]?.priorities || ['', '', ''])
  const [notes, setNotes] = useState(() => planners[selectedDay]?.notes || '')
  const [mood, setMood] = useState(() => planners[selectedDay]?.mood || '')

  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects))
  }, [subjects])

  useEffect(() => {
    localStorage.setItem('timetable', JSON.stringify(timetable))
  }, [timetable])

  useEffect(() => {
    localStorage.setItem('planners', JSON.stringify(planners))
  }, [planners])

  useEffect(() => {
    localStorage.setItem('selectedDay', selectedDay)
    const data = planners[selectedDay] || { todos: [], priorities: ['', '', ''], notes: '', mood: '' }
    setTopPriorities(data.priorities || ['', '', ''])
    setNotes(data.notes || '')
    setMood(data.mood || '')
  }, [selectedDay, planners])

  function updateLesson(day, index, value) {
    setTimetable(prev => ({ ...prev, [day]: prev[day].map((v, i) => i === index ? value : v) }))
  }

  function savePlanner() {
    setPlanners(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        priorities: topPriorities,
        notes,
        mood: mood,
        todos: prev[selectedDay]?.todos || []
      }
    }))
    alert('Planner salvat pentru ' + selectedDay)
  }

  function addTodo() {
    if (!newTask.trim()) return
    setPlanners(prev => {
      const dayData = prev[selectedDay] || { todos: [], priorities: ['', '', ''], notes: '', mood: '' }
      return {
        ...prev,
        [selectedDay]: { ...dayData, todos: [...dayData.todos, { text: newTask.trim(), done: false }] }
      }
    })
    setNewTask('')
  }

  function toggleTodo(i) {
    setPlanners(prev => {
      const dayData = prev[selectedDay] || { todos: [] }
      const todos = dayData.todos.map((t, idx) => idx === i ? { ...t, done: !t.done } : t)
      return { ...prev, [selectedDay]: { ...dayData, todos } }
    })
  }

  function removeTodo(i) {
    setPlanners(prev => {
      const dayData = prev[selectedDay] || { todos: [] }
      const todos = dayData.todos.filter((_, idx) => idx !== i)
      return { ...prev, [selectedDay]: { ...dayData, todos } }
    })
  }

  function resetTimetable() {
    if (!window.confirm('Resetează orarul la valorile implicite?')) return
    setTimetable({ Luni: [...emptyDay], Marti: [...emptyDay], Miercuri: [...emptyDay], Joi: [...emptyDay], Vineri: [...emptyDay] })
  }

  function autofillExample() {
    setTimetable({
      Luni: ['Limba română', 'Geografie', 'Religie', 'Chimie', 'Info & TIC', 'Lb. engleză', ''],
      Marti: ['Matematică', 'Ed. tehn. / financiară', 'Ed. plastică', 'Limba română opţ.', 'Lb. engleză', '', ''],
      Miercuri: ['Matematică', 'Ed. fizică', 'Biologie', 'Limba română', 'Limba franceză', 'Istorie', 'Dirigenţie'],
      Joi: ['Fizică', 'Geografie', 'Ed. muzicală', 'Limba română', 'Istorie', 'Limba română', ''],
      Vineri: ['Chimie', 'Limba franceză', 'Matematică', 'Limba română', 'Ed. fizică', '', '']
    })
  }

  function exportData() {
    const data = { subjects, timetable, planners }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'school-planner.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        setSubjects(parsed.subjects || defaultSubjects)
        setTimetable(parsed.timetable || { Luni: [...emptyDay], Marti: [...emptyDay], Miercuri: [...emptyDay], Joi: [...emptyDay], Vineri: [...emptyDay] })
        setPlanners(parsed.planners || {})
        alert('Date importate cu succes')
      } catch (err) { alert('Fișier invalid') }
    }
    reader.readAsText(file)
  }

  const days = Object.keys(timetable)

  return (
    <div style={{fontFamily:'Arial,Helvetica,sans-serif',padding:20,background:'#f8fafc',minHeight:'100vh'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <h1 style={{margin:0}}>Planner Școală • Organizator</h1>
          <p style={{margin:0,color:'#555'}}>Orar editabil, planner zilnic, listă de sarcini — salvat local</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={autofillExample}>Umple exemplu</button>
          <button onClick={resetTimetable}>Resetează orar</button>
          <button onClick={exportData}>Export JSON</button>
          <label style={{border:'1px solid #ccc',padding:'6px 8px',borderRadius:6,cursor:'pointer'}}>
            Import
            <input onChange={importData} type="file" accept="application/json" style={{display:'none'}} />
          </label>
        </div>
      </header>

      <main style={{display:'flex',gap:16,flexWrap:'wrap'}}>
        <section style={{flex:'1 1 65%',background:'#fff',padding:12,borderRadius:12,boxShadow:'0 2px 6px rgba(0,0,0,0.05)'}}>
          <h2>Orar săptămânal</h2>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{textAlign:'left',color:'#666'}}>
                  <th style={{padding:8}}>Zi / Ora</th>
                  {[1,2,3,4,5,6,7].map(o => <th key={o} style={{padding:8}}>Ora {o}</th>)}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day} style={{borderTop:'1px solid #eee'}}>
                    <td style={{padding:8,fontWeight:600,width:110}}>{day}</td>
                    {timetable[day].map((lesson, i) => (
                      <td key={i} style={{padding:6}}>
                        <input value={lesson} onChange={e => updateLesson(day, i, e.target.value)} placeholder="Adaugă materie" style={{width:'100%',padding:6,border:'1px solid #ddd',borderRadius:6}} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{marginTop:12}}>
            <h3>Subiecte rapide</h3>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {subjects.map((s,i) => <button key={i} onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(s) }} style={{padding:'6px 8px',borderRadius:6}}>{s}</button>)}
              <button onClick={() => { const s = prompt('Adaugă materie nouă'); if (s) setSubjects(prev => [...prev, s]) }}>Adaugă materie</button>
            </div>
          </div>
        </section>

        <aside style={{flex:'1 1 30%',background:'#fff',padding:12,borderRadius:12,boxShadow:'0 2px 6px rgba(0,0,0,0.05)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h2 style={{margin:0}}>Planner zilnic</h2>
            <input type="date" value={selectedDay} onChange={e => setSelectedDay(e.target.value)} />
          </div>

          <div style={{marginTop:10}}>
            <h3>Top Priorități</h3>
            {topPriorities.map((p, idx) => (
              <input key={idx} value={p} onChange={e => setTopPriorities(prev => prev.map((x,i)=> i===idx? e.target.value:x))} placeholder={`Prioritatea ${idx+1}`} style={{width:'100%',marginTop:6,padding:6,borderRadius:6,border:'1px solid #ddd'}} />
            ))}
          </div>

          <div style={{marginTop:10}}>
            <h3>To do list</h3>
            <div style={{display:'flex',gap:8,marginTop:6}}>
              <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Adaugă sarcină" style={{flex:1,padding:6,borderRadius:6,border:'1px solid #ddd'}} />
              <button onClick={addTodo}>Adaugă</button>
            </div>
            <ul style={{marginTop:8}}>
              {(planners[selectedDay]?.todos || []).map((t, i) => (
                <li key={i} style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
                  <input type="checkbox" checked={t.done} onChange={() => toggleTodo(i)} />
                  <span style={t.done ? {textDecoration:'line-through',color:'#999'} : {}}>{t.text}</span>
                  <button onClick={() => removeTodo(i)} style={{marginLeft:'auto',color:'#c00'}}>Șterge</button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{marginTop:10}}>
            <h3>Notes</h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd'}} />
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
            <div>
              <h3 style={{margin:0}}>Mood</h3>
              <select value={mood} onChange={e => setMood(e.target.value)} style={{padding:6,borderRadius:6,border:'1px solid #ddd'}}>
                <option value="">Alege</option>
                <option>😊 Fericit</option>
                <option>🙂 Bine</option>
                <option>😐 Obosit</option>
                <option>😟 Stresat</option>
                <option>😴 Somnolent</option>
              </select>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button onClick={savePlanner} style={{background:'#0ea5a4',color:'#fff',padding:'8px 12px',borderRadius:6}}>Salvează</button>
              <button onClick={() => { setTopPriorities(['','','']); setNotes(''); setMood(''); }} style={{padding:'8px 12px',borderRadius:6}}>Curăță</button>
            </div>
          </div>
        </aside>
      </main>

      <footer style={{marginTop:20,color:'#666'}}>Aplicație offline (PWA friendly) — Salvează local datele. Poți exporta/importa JSON pentru backup.</footer>
    </div>
  )
}
