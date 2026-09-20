'use client';

import { useState } from 'react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'editorial',
    articleUrl: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [referenceId, setReferenceId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to submit contact message. Please try again.');
      }

      setStatus('success');
      setReferenceId(data?.referenceId || `GD-${Date.now().toString(36).toUpperCase()}`);
      setFormData({
        name: '',
        email: '',
        department: 'editorial',
        articleUrl: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'A network error occurred. Please try again later.');
    }
  };

  if (status === 'success') {
    return (
      <div
        style={{
          border: '1px solid #16835f',
          backgroundColor: '#f4fbf7',
          padding: '28px',
          borderRadius: '8px',
          margin: '28px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ color: '#16835f', fontSize: '1.4rem' }}>✓</span>
          <h3 style={{ margin: 0, color: '#116245', fontSize: '1.25rem' }}>Message Transmitted to Newsroom</h3>
        </div>
        <p style={{ color: '#2d4a3e', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 16px 0' }}>
          Thank you for reaching out. Your dispatch has been routed to the appropriate editorial desk.
          Our team reviews incoming submissions continuously during newsroom operating hours.
        </p>
        <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 20px 0' }}>
          Reference Tracking ID: <strong>{referenceId}</strong>
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{
            padding: '8px 18px',
            backgroundColor: '#116245',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ margin: '32px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {status === 'error' && (
        <div
          role="alert"
          style={{
            padding: '14px 18px',
            backgroundColor: '#fdf2f2',
            border: '1px solid #f0b4b4',
            borderRadius: '6px',
            color: '#991b1b',
            fontSize: '0.95rem',
          }}
        >
          <strong>Submission Notice:</strong> {errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div>
          <label htmlFor="contact-name" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
            Full Name <span style={{ color: '#c33a31' }}>*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
            Email Address <span style={{ color: '#c33a31' }}>*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="jane@example.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div>
          <label htmlFor="contact-department" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
            Department / Inquiry Type <span style={{ color: '#c33a31' }}>*</span>
          </label>
          <select
            id="contact-department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.95rem',
              backgroundColor: '#fff',
              boxSizing: 'border-box',
            }}
          >
            <option value="editorial">Editorial Desk &amp; Story Suggestions</option>
            <option value="corrections">Corrections &amp; Factual Clarifications</option>
            <option value="privacy">Privacy &amp; Data Subject Requests</option>
            <option value="commercial">Commercial, Advertising &amp; Partnerships</option>
            <option value="press">Press Credentials &amp; Media Inquiries</option>
          </select>
        </div>

        <div>
          <label htmlFor="contact-url" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
            Article URL (Optional)
          </label>
          <input
            id="contact-url"
            name="articleUrl"
            type="url"
            value={formData.articleUrl}
            onChange={handleChange}
            placeholder="https://globdot.com/article/..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
          Subject <span style={{ color: '#c33a31' }}>*</span>
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          value={formData.subject}
          onChange={handleChange}
          placeholder="Brief summary of your message"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.95rem',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
          Message <span style={{ color: '#c33a31' }}>*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="Please provide complete context, citation details, or the inquiry you wish to submit..."
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          style={{
            padding: '12px 28px',
            backgroundColor: status === 'submitting' ? '#555' : '#111',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          {status === 'submitting' ? 'Transmitting to Desk...' : 'Transmit Message →'}
        </button>
      </div>
    </form>
  );
}
