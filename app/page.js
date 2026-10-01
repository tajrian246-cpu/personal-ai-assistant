```javascript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

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

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(e) {
    e.preventDefault();

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    setMsg(error?.message || '');

    if (data?.session) {
      setSession(data.session);
    }
  }

  async function signUp(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    setMsg(
      error?.message ||
        'Account created. Check your email if confirmation is enabled.'
    );
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

  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');

  async function load() {
    const [taskResult, examResult] =
      await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .order('due_date'),

        supabase
          .from('exams')
          .select('*')
          .order('exam_date')
      ]);

    setTasks(taskResult.data || []);
    setExams(examResult.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTask(e) {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    const { error } =
      await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: title,
          due_date: due || null
        });

    if (!error) {
      setTitle('');
      setDue('');
      load();
    } else {
      alert(error.message);
    }
  }

  async function addExam(e) {
    e.preventDefault();

    if (!subject.trim() || !examDate) {
      return;
    }

    const { error } =
      await supabase
        .from('exams')
        .insert({
          user_id: user.id,
          subject: subject,
          exam_date: examDate
        });

    if (!error) {
      setSubject('');
      setExamDate('');
      load();
    } else {
      alert(error.message);
    }
  }

  return (
    <>
      <h1>Study</h1>

      <p className="muted">
        Your academic workspace is separate
        from both business pages.
      </p>

      <div className="grid">

        {/* QUICK TASK */}

        <div className="card">
          <h2>Quick Task</h2>

          <form onSubmit={addTask}>

            <input
              placeholder="Task title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <input
              type="datetime-local"
              value={due}
              onChange={(e) =>
                setDue(e.target.value)
              }
            />

            <button type="submit">
              Add task
            </button>

          </form>
        </div>


        {/* ADD EXAM */}

        <div className="card">
          <h2>Add Exam</h2>

          <form onSubmit={addExam}>

            <input
              placeholder="Subject"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
            />

            <input
              type="datetime-local"
              value={examDate}
              onChange={(e) =>
                setExamDate(e.target.value)
              }
            />

            <button type="submit">
              Add Exam
            </button>

          </form>
        </div>


        {/* TASKS */}

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
              </div>
            ))
          ) : (
            <p className="muted">
              No tasks yet.
            </p>
          )}
        </div>


        {/* EXAMS */}

        <div className="card">
          <h2>Upcoming Exams</h2>

          {exams.length > 0 ? (
            exams.map((exam) => (
              <div
                className="row"
                key={exam.id}
              >
                <span>
                  {exam.subject}
                </span>

                <span>
                  {new Date(
                    exam.exam_date
                  ).toLocaleString()}
                </span>
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
   BUSINESS PAGES
========================= */

function Business({ page, user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);

  async function load() {
    const { data, error } =
      await supabase
        .from('business_posts')
        .select('*')
        .eq('page_name', page)
        .order('created_at', {
          ascending: false
        });

    if (!error) {
      setPosts(data || []);
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  async function save(e) {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    const { error } =
      await supabase
        .from('business_posts')
        .insert({
          user_id: user.id,
          page_name: page,
          title: title,
          content: content,
          status: 'draft'
        });

    if (!error) {
      setTitle('');
      setContent('');
      load();
    } else {
      alert(error.message);
    }
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
    const { data, error } =
      await supabase
        .from('business_posts')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', {
          ascending: false
        });

    if (!error) {
      setPosts(data || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function change(id, status) {
    const { error } =
      await supabase
        .from('business_posts')
        .update({ status: status })
        .eq('id', id);

    if (!error) {
      load();
    } else {
      alert(error.message);
    }
  }

  return (
    <>
      <h1>Approval</h1>

      <p className="muted">
        Nothing is published automatically.
        Your approval comes first.
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
                  change(
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
                  change(
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
```
