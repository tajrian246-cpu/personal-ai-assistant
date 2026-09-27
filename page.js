'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const nav = [
  ['Study', 'study'],
  ['SutaOshon', 'suta'],
  ['Soulful Ayhas', 'soulful'],
  ['Approval', 'approval'],
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

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(e) {
    e.preventDefault();

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
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
      password,
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

            <button type="submit">Sign in</button>
          </form>

          <button className="secondary" onClick={signUp}>
            Create account
          </button>

          {msg && <p className="notice">{msg}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">My AI</div>

        {nav.map(([label, key]) => (
          <button
            key={key}
            className={active === key ? 'nav active' : 'nav'}
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
        {active === 'study' && <Study user={session.user} />}
        {active === 'suta' && (
          <Business page="SutaOshon" user={session.user} />
        )}
        {active === 'soulful' && (
          <Business page="Soulful Ayhas" user={session.user} />
        )}
        {active === 'approval' && (
          <Approval user={session.user} />
        )}
      </section>
    </main>
  );
}

function Study({ user }) {
  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  async function load() {
    const [t, e] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .order('due_date'),

      supabase
        .from('exams')
        .select('*')
        .order('exam_date'),
    ]);

    setTasks(t.data || []);
    setExams(e.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();

    if (!title) return;

    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title,
      due_date: due || null,
    });

    if (!error) {
      setTitle('');
      setDue('');
      load();
    }
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

          <form onSubmit={add}>
            <input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="datetime-local"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />

            <button type="submit">Add task</button>
          </form>
        </div>

        <div className="card">
          <h2>Tasks</h2>

          {tasks.length ? (
            tasks.map((t) => (
              <div className="row" key={t.id}>
                <span>{t.title}</span>
                <span>{t.status}</span>
              </div>
            ))
          ) : (
            <p className="muted">No tasks yet.</p>
          )}
        </div>

        <div className="card">
          <h2>Upcoming Exams</h2>

          {exams.length ? (
            exams.map((x) => (
              <div className="row" key={x.id}>
                <span>{x.subject}</span>
                <span>
                  {new Date(x.exam_date).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">No exams yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

function Business({ page, user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);

  async function load() {
    const { data } = await supabase
      .from('business_posts')
      .select('*')
      .eq('page_name', page)
      .order('created_at', { ascending: false });

    setPosts(data || []);
  }

  useEffect(() => {
    load();
  }, [page]);

  async function save(e) {
    e.preventDefault();

    if (!content) return;

    const { error } = await supabase
      .from('business_posts')
      .insert({
        user_id: user.id,
        page_name: page,
        title,
        content,
        status: 'draft',
      });

    if (!error) {
      setTitle('');
      setContent('');
      load();
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
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Caption / content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button type="submit">Save Draft</button>
        </form>
      </div>

      <div className="card">
        <h2>Drafts</h2>

        {posts.length ? (
          posts.map((p) => (
            <div className="post" key={p.id}>
              <b>{p.title || 'Untitled'}</b>

              <p>{p.content}</p>

              <span className="badge">{p.status}</span>
            </div>
          ))
        ) : (
          <p className="muted">No drafts yet.</p>
        )}
      </div>
    </>
  );
}

function Approval() {
  const [posts, setPosts] = useState([]);

  async function load() {
    const { data } = await supabase
      .from('business_posts')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    setPosts(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function change(id, status) {
    await supabase
      .from('business_posts')
      .update({ status })
      .eq('id', id);

    load();
  }

  return (
    <>
      <h1>Approval</h1>

      <p className="muted">
        Nothing is published automatically. Your approval comes first.
      </p>

      <div className="card">
        {posts.length ? (
          posts.map((p) => (
            <div className="post" key={p.id}>
              <div className="row">
                <b>{p.page_name}</b>
                <span className="badge">Draft</span>
              </div>

              <h3>{p.title || 'Untitled'}</h3>

              <p>{p.content}</p>

              <button
                onClick={() => change(p.id, 'approved')}
              >
                Approve
              </button>

              <button
                className="danger"
                onClick={() => change(p.id, 'rejected')}
              >
                Reject
              </button>
            </div>
          ))
        ) : (
          <p className="muted">No pending drafts.</p>
        )}
      </div>
    </>
  );
}
