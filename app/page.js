'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const nav = [
  ['Study', 'study'],
  ['SutaOshon', 'suta'],
  ['Soulful Ayhas', 'soulful'],
  ['Approval', 'approval']
];

export default function Home() {
  const [active, setActive] = useState('study');
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function signIn(e) {
    e.preventDefault();

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg('');
    setSession(data.session);
  }

  async function signUp(e) {
    e.preventDefault();

    const { error } =
      await supabase.auth.signUp({
        email,
        password
      });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg(
        'Account created. Check your email if confirmation is enabled.'
      );
    }
  }

  if (!session) {
    return (
      <main className="auth">
        <div className="card authcard">

          <h1>Personal AI Assistant</h1>

          <p className="muted">
            Study + SutaOshon + Soulful Ayhas
          </p>

          <form onSubmit={signIn}>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">
              Sign in
            </button>

          </form>

          <button
            className="secondary"
            onClick={signUp}
          >
            Create account
          </button>

          {msg && (
            <p className="notice">
              {msg}
            </p>
          )}

        </div>
      </main>
    );
  }

  return (
    <main className="shell">

      <aside className="sidebar">

        <div className="brand">
          My AI
        </div>

        {nav.map(([label, key]) => (
          <button
            key={key}
            className={
              active === key
                ? 'nav active'
                : 'nav'
            }
            onClick={() => setActive(key)}
          >
            {label}
          </button>
        ))}

        <button
          className="nav logout"
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </button>

      </aside>

      <section className="content">

        {active === 'study' && (
          <Study user={session.user} />
        )}

        {active === 'suta' && (
          <Business
            page="SutaOshon"
            user={session.user}
          />
        )}

        {active === 'soulful' && (
          <Business
            page="Soulful Ayhas"
            user={session.user}
          />
        )}

        {active === 'approval' && (
          <Approval user={session.user} />
        )}

      </section>

    </main>
  );
}


/* =========================
   STUDY
========================= */

function Study({ user }) {
  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');

  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState('');

  const [savingTask, setSavingTask] = useState(false);
  const [savingExam, setSavingExam] = useState(false);

  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', {
        ascending: true,
        nullsFirst: false
      });

    if (!error) {
      setTasks(data || []);
    }
  }

  async function loadExams() {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', user.id)
      .order('exam_date', {
        ascending: true
      });

    if (!error) {
      setExams(data || []);
    }
  }

  async function loadAll() {
    await Promise.all([
      loadTasks(),
      loadExams()
    ]);
  }

  useEffect(() => {
    if (user?.id) {
      loadAll();
    }
  }, [user?.id]);

  async function addTask(e) {
    e.preventDefault();

    if (!taskTitle.trim()) {
      alert('Please enter a task title.');
      return;
    }

    setSavingTask(true);

    const { error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: taskTitle.trim(),
        due_date: taskDue || null
      });

    setSavingTask(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTaskTitle('');
    setTaskDue('');

    await loadTasks();
  }

  async function addExam(e) {
    e.preventDefault();

    if (!examSubject.trim()) {
      alert('Please enter the subject name.');
      return;
    }

    if (!examDate) {
      alert('Please select the exam date and time.');
      return;
    }

    setSavingExam(true);

    const { error } = await supabase
      .from('exams')
      .insert({
        user_id: user.id,
        subject: examSubject.trim(),
        exam_date: examDate
      });

    setSavingExam(false);

    if (error) {
      alert(error.message);
      return;
    }

    setExamSubject('');
    setExamDate('');

    await loadExams();
  }

  async function deleteTask(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadTasks();
  }

  async function deleteExam(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this exam?'
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadExams();
  }

  return (
    <>
      <h1>Study</h1>

      <p className="muted">
        Your academic workspace is separate from both business pages.
      </p>

      <div className="grid">

        <div className="card">
          <h2>Quick Task</h2>

          <form onSubmit={addTask}>

            <input
              type="text"
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) =>
                setTaskTitle(e.target.value)
              }
            />

            <input
              type="datetime-local"
              value={taskDue}
              onChange={(e) =>
                setTaskDue(e.target.value)
              }
            />

            <button
              type="submit"
              disabled={savingTask}
            >
              {savingTask ? 'Saving...' : 'Add task'}
            </button>

          </form>
        </div>


        <div className="card">
          <h2>Add Exam</h2>

          <form onSubmit={addExam}>

            <input
              type="text"
              placeholder="Subject name"
              value={examSubject}
              onChange={(e) =>
                setExamSubject(e.target.value)
              }
            />

            <input
              type="datetime-local"
              value={examDate}
              onChange={(e) =>
                setExamDate(e.target.value)
              }
            />

            <button
              type="submit"
              disabled={savingExam}
            >
              {savingExam ? 'Saving...' : 'Add Exam'}
            </button>

          </form>
        </div>


        <div className="card">
          <h2>Tasks</h2>

          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                className="row"
                key={task.id}
              >
                <span>
                  {task.title}
                </span>

                <span>
                  {task.status || 'pending'}
                </span>

                <button
                  className="danger"
                  onClick={() =>
                    deleteTask(task.id)
                  }
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="muted">
              No tasks yet.
            </p>
          )}
        </div>


        <div className="card">
          <h2>Upcoming Exams</h2>

          {exams.length > 0 ? (
            exams.map((exam) => (
              <div
                className="row"
                key={exam.id}
              >
                <div>
                  <strong>
                    {exam.subject}
                  </strong>

                  <br />

                  <span className="muted">
                    {new Date(
                      exam.exam_date
                    ).toLocaleString()}
                  </span>
                </div>

                <button
                  className="danger"
                  onClick={() =>
                    deleteExam(exam.id)
                  }
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="muted">
              No exams yet.
            </p>
          )}
        </div>

      </div>
    </>
  );
}


/* =========================
   BUSINESS
========================= */

function Business({ page, user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);

  async function load() {
    const { data, error } = await supabase
      .from('business_posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('page_name', page)
      .order('created_at', {
        ascending: false
      });

    if (!error) {
      setPosts(data || []);
    }
  }

  useEffect(() => {
    if (user?.id) {
      load();
    }
  }, [page, user?.id]);

  async function save(e) {
    e.preventDefault();

    if (!content.trim()) {
      alert('Please enter content.');
      return;
    }

    const { error } = await supabase
      .from('business_posts')
      .insert({
        user_id: user.id,
        page_name: page,
        title: title.trim(),
        content: content.trim(),
        status: 'draft'
      });

    if (error) {
      alert(error.message);
      return;
    }

    setTitle('');
    setContent('');

    await load();
  }

  return (
    <>
      <h1>{page}</h1>

      <p className="muted">
        AI drafts stay here until you approve them.
      </p>

      <div className="card">

        <h2>Create Draft</h2>

        <form onSubmit={save}>

          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <textarea
            placeholder="Caption / content"
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
          />

          <button type="submit">
            Save Draft
          </button>

        </form>

      </div>


      <div className="card">

        <h2>Drafts</h2>

        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              className="post"
              key={post.id}
            >
              <b>
                {post.title || 'Untitled'}
              </b>

              <p>
                {post.content}
              </p>

              <span className="badge">
                {post.status}
              </span>
            </div>
          ))
        ) : (
          <p className="muted">
            No drafts yet.
          </p>
        )}

      </div>
    </>
  );
}


/* =========================
   APPROVAL
========================= */

function Approval({ user }) {
  const [posts, setPosts] = useState([]);

  async function load() {
    const { data, error } = await supabase
      .from('business_posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .order('created_at', {
        ascending: false
      });

    if (!error) {
      setPosts(data || []);
    }
  }

  useEffect(() => {
    if (user?.id) {
      load();
    }
  }, [user?.id]);

  async function changeStatus(id, status) {
    const { error } = await supabase
      .from('business_posts')
      .update({
        status: status
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      alert(error.message);
      return;
    }

    await load();
  }

  return (
    <>
      <h1>Approval</h1>

      <p className="muted">
        Nothing is published automatically. Your approval comes first.
      </p>

      <div className="card">

        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              className="post"
              key={post.id}
            >

              <div className="row">

                <b>
                  {post.page_name}
                </b>

                <span className="badge">
                  Draft
                </span>

              </div>

              <h3>
                {post.title || 'Untitled'}
              </h3>

              <p>
                {post.content}
              </p>

              <button
                onClick={() =>
                  changeStatus(
                    post.id,
                    'approved'
                  )
                }
              >
                Approve
              </button>

              <button
                className="danger"
                onClick={() =>
                  changeStatus(
                    post.id,
                    'rejected'
                  )
                }
              >
                Reject
              </button>

            </div>
          ))
        ) : (
          <p className="muted">
            No pending drafts.
          </p>
        )}

      </div>
    </>
  );
}
