'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

const SUPPORT_EMAIL = 'support@symbiosystech.com';

/** Simple contact form — composes a prefilled email in the user's mail app. */
export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[YouTube Summary] Message from ${name || 'a visitor'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ''}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }

  const inputCls =
    'w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder-indigo-200 outline-none transition focus:border-white/70 focus:bg-white/15';

  return (
    <form onSubmit={submit} className="space-y-3 text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          maxLength={80}
          className={inputCls}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          maxLength={120}
          className={inputCls}
        />
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="How can we help?"
        required
        rows={4}
        maxLength={2000}
        className={`${inputCls} resize-none`}
      />
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50 sm:w-auto"
      >
        <Send className="h-4 w-4" /> Send Message
      </button>
    </form>
  );
}
