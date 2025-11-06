import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState({
    'Como você classificaria seu sono (bom/regular/ruim)': '',
    'Quantas horas de atividade física por semana?': 0,
    'Como você descreveria sua alimentação no dia a dia?': '',
    'Nível de estresse diário (0-10)': 0
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
      setMessage('✅ PDF gerado e aberto em nova aba.');
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

          {/* Sono */}
          <div className="question">
            <label>Como você classificaria seu sono?</label>
            <select
              value={responses['Como você classificaria seu sono (bom/regular/ruim)']}
              onChange={e =>
                handleChangeQuestion('Como você classificaria seu sono (bom/regular/ruim)', e.target.value)
              }
              required
            >
              <option value="">Selecione...</option>
              <option value="bom">Bom</option>
              <option value="regular">Regular</option>
              <option value="ruim">Ruim</option>
            </select>
          </div>

          {/* Atividade física */}
          <div className="question">
            <label>
              Em média, quantas horas de atividade física você pratica por semana? <span className="highlight">({responses['Quantas horas de atividade física por semana?']}h)</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={responses['Quantas horas de atividade física por semana?']}
              onChange={e =>
                handleChangeQuestion('Quantas horas de atividade física por semana?', e.target.value)
              }
            />
          </div>

          {/* Alimentação */}
          <div className="question">
            <label>Como você descreveria sua alimentação no dia a dia?</label>
            <select
              value={responses['Como você descreveria sua alimentação no dia a dia?']}
              onChange={e =>
                handleChangeQuestion('Como você descreveria sua alimentação no dia a dia?', e.target.value)
              }
              required
            >
              <option value="">Selecione...</option>
              <option value="boa">Boa</option>
              <option value="regular">Regular</option>
              <option value="precisa melhorar">Precisa melhorar</option>
            </select>
          </div>

          {/* Estresse */}
          <div className="question">
            <label className="stress-label">
              Nível de estresse diário (0 a 10):<br />
              <span className="stress-info">
                {responses['Nível de estresse diário (0-10)']}  (<small>0 = muito tranquilo | 10 = muito estressado</small>)
              </span>
            </label>

            <input
              type="range"
              min="0"
              max="10"
              value={responses['Nível de estresse diário (0-10)']}
              onChange={e =>
                handleChangeQuestion('Nível de estresse diário (0-10)', e.target.value)
              }
            />


          </div>

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
