'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

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

    const {
      data: { subscription },
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

          <button
            className="secondary"
            onClick={signUp}
          >
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
            className={
              active === key ? 'nav active' : 'nav'
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
    const [t, e] = await Promise.all([
