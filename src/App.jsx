import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState({
    'Como você classificaria seu sono (bom/regular/ruim)': '',
    'Quantas horas de atividade física por semana?': '',
    'Como descreveria sua alimentação?': '',
    'Nível de estresse diário (0-10)': ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoData, setLogoData] = useState(null);

  function handleChangeQuestion(key, value) {
    setResponses(prev => ({ ...prev, [key]: value }));
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoData(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const resp = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, responses, logoBase64: logoData })
      });
      if (!resp.ok) {
        const t = await resp.json();
        throw new Error(t.error || 'Erro no servidor');
      }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setMessage('PDF gerado — abriu em nova aba. Faça o download pelo visualizador do navegador.');
    } catch (err) {
      console.error(err);
      setMessage('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Assistente de Bem-estar</h1>
        <p>Preencha o formulário e gere um relatório profissional em PDF.</p>

        <form onSubmit={handleSubmit} className="form">
          <div className="flex-row">
            <div className="flex-item">
              <label>Nome</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="flex-item">
              <label>Email (opcional)</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
            </div>
          </div>

          <div className="logo-upload">
            <label>Logo (opcional)</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
            {logoData && <img src={logoData} alt="logo preview" />}
          </div>

          <h3>Perguntas</h3>
          {Object.keys(responses).map(q => (
            <div key={q} className="question">
              <label>{q}</label>
              <input value={responses[q]} onChange={e => handleChangeQuestion(q, e.target.value)} />
            </div>
          ))}

          <div className="flex-row space-between">
            <button type="submit" disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar e visualizar PDF'}
            </button>
          </div>
        </form>

        {message && <div className="msg">{message}</div>}
      </div>
    </div>
  );
}
