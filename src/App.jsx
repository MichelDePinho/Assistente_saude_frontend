import React, { useState } from 'react';

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
      const resp = await fetch('http://localhost:3333/api/analyze', {
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
    <div style={{ maxWidth: 820, margin: '36px auto', fontFamily: 'Inter, system-ui, Arial', padding: 20 }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 8px 30px rgba(13,38,76,0.08)' }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Assistente de Bem-estar</h1>
        <p style={{ color: '#666', marginTop: 6 }}>Preencha o formulário e gere um relatório profissional em PDF.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600 }}>Nome</label>
              <input value={name} onChange={e=>setName(e.target.value)} required style={{ width: '100%', padding:8, borderRadius:8, border:'1px solid #ddd' }} />
            </div>
            <div style={{ width: 300 }}>
              <label style={{ fontWeight: 600 }}>Email (opcional)</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" style={{ width: '100%', padding:8, borderRadius:8, border:'1px solid #ddd' }} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={{ fontWeight: 600 }}>Logo (opcional)</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
            {logoData && <div style={{ marginTop:8 }}><img src={logoData} style={{ maxHeight:60 }} alt="logo preview" /></div>}
          </div>

          <h3 style={{ marginTop: 18 }}>Perguntas</h3>
          {Object.keys(responses).map((q) => (
            <div key={q} style={{ marginBottom: 10 }}>
              <label style={{ display:'block', fontWeight:600 }}>{q}</label>
              <input value={responses[q]} onChange={e=>handleChangeQuestion(q, e.target.value)} style={{ width: '100%', padding:8, borderRadius:8, border:'1px solid #eee' }} />
            </div>
          ))}

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 18 }}>
            <small style={{ color:'#777' }}>O backend pode armazenar relatórios em Supabase se configurado.</small>
            <button type="submit" disabled={loading} style={{ background:'#2563eb', color:'#fff', padding:'10px 16px', borderRadius:8, border:'none' }}>
              {loading ? 'Gerando...' : 'Gerar e visualizar PDF'}
            </button>
          </div>
        </form>

        {message && <div style={{ marginTop:12, padding:10, background:'#f3f4f6', borderRadius:8 }}>{message}</div>}
      </div>
    </div>
  );
}
