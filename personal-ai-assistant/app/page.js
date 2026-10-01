function Study(){
  const [tasks,setTasks]=useState([]);
  const [exams,setExams]=useState([]);

  const [title,setTitle]=useState('');
  const [due,setDue]=useState('');

  const [subject,setSubject]=useState('');
  const [examDate,setExamDate]=useState('');

  async function load(){
    const [t,e]=await Promise.all([
      supabase.from('tasks').select('*').order('due_date'),
      supabase.from('exams').select('*').order('exam_date')
    ]);

    setTasks(t.data||[]);
    setExams(e.data||[]);
  }

  useEffect(()=>{
    load();
  },[]);

  async function addTask(e){
    e.preventDefault();

    if(!title)return;

    await supabase.from('tasks').insert({
      title,
      due_date:due||null
    });

    setTitle('');
    setDue('');
    load();
  }

  async function addExam(e){
    e.preventDefault();

    if(!subject || !examDate)return;

    await supabase.from('exams').insert({
      subject:subject,
      exam_date:examDate
    });

    setSubject('');
    setExamDate('');
    load();
  }

  return <>
    <h1>Study</h1>

    <p className="muted">
      Your academic workspace is separate from both business pages.
    </p>

    <div className="grid">

      {/* ADD TASK */}
      <div className="card">
        <h2>Quick Task</h2>

        <form onSubmit={addTask}>
          <input
            placeholder="Task title"
            value={title}
            onChange={e=>setTitle(e.target.value)}
          />

          <input
            type="datetime-local"
            value={due}
            onChange={e=>setDue(e.target.value)}
          />

          <button>Add task</button>
        </form>
      </div>


      {/* ADD EXAM */}
      <div className="card">
        <h2>Add Exam</h2>

        <form onSubmit={addExam}>
          <input
            placeholder="Subject name"
            value={subject}
            onChange={e=>setSubject(e.target.value)}
            required
          />

          <input
            type="datetime-local"
            value={examDate}
            onChange={e=>setExamDate(e.target.value)}
            required
          />

          <button>Add Exam</button>
        </form>
      </div>


      {/* TASKS */}
      <div className="card">
        <h2>Tasks</h2>

        {tasks.length
          ? tasks.map(t=>(
              <div className="row" key={t.id}>
                <span>{t.title}</span>
                <span>{t.status}</span>
              </div>
            ))
          : <p className="muted">No tasks yet.</p>
        }
      </div>


      {/* EXAMS */}
      <div className="card">
        <h2>Upcoming Exams</h2>

        {exams.length
          ? exams.map(x=>(
              <div className="row" key={x.id}>
                <span>{x.subject}</span>

                <span>
                  {new Date(x.exam_date).toLocaleString()}
                </span>
              </div>
            ))
          : <p className="muted">No exams yet.</p>
        }
      </div>

    </div>
  </>
}
