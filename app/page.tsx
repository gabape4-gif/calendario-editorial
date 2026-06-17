"use client";

import { useEffect, useMemo, useState } from "react";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const FORMATOS = ["Post Único", "Reels", "Carrossel", "Stories"] as const;
type Formato = (typeof FORMATOS)[number];

type Entrada = {
  id: string;
  dia: number;
  titulo: string;
  formato: Formato;
  nota: string;
};

function daysInMonth(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate();
}

// Abreviação do dia da semana sincronizada com o calendário real
function weekdayAbbr(ano: number, mes: number, dia: number) {
  return SEMANA[new Date(ano, mes, dia).getDay()];
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const STORAGE_KEY = "calendario-editorial-v1";

const CORES_PADRAO = {
  fundo: "#000000",
  texto: "#ffffff",
  destaque: "#ff5b23",
  secundario: "#8c8c8c",
};

function lerArquivo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function Home() {
  const hoje = new Date();
  const [cliente, setCliente] = useState("Nome do Cliente");
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const [contato, setContato] = useState("");
  const [entradas, setEntradas] = useState<Entrada[]>([
    { id: uid(), dia: 1, titulo: "", formato: "Post Único", nota: "" },
  ]);
  const [cores, setCores] = useState(CORES_PADRAO);
  const [logo1, setLogo1] = useState<string>("");
  const [logo2, setLogo2] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  // Carregar do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.cliente !== undefined) setCliente(d.cliente);
        if (typeof d.ano === "number") setAno(d.ano);
        if (typeof d.mes === "number") setMes(d.mes);
        if (d.contato !== undefined) setContato(d.contato);
        if (d.cores) setCores({ ...CORES_PADRAO, ...d.cores });
        if (d.logo1 !== undefined) setLogo1(d.logo1);
        if (d.logo2 !== undefined) setLogo2(d.logo2);
        if (Array.isArray(d.entradas) && d.entradas.length) setEntradas(d.entradas);
      }
    } catch {}
    setLoaded(true);
  }, []);

  // Salvar
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cliente, ano, mes, contato, cores, logo1, logo2, entradas })
    );
  }, [cliente, ano, mes, contato, cores, logo1, logo2, entradas, loaded]);

  const totalDias = daysInMonth(ano, mes);

  // Garante que nenhum dia ultrapasse os dias do mês ao trocar de mês
  useEffect(() => {
    setEntradas((prev) =>
      prev.map((e) => (e.dia > totalDias ? { ...e, dia: totalDias } : e))
    );
  }, [totalDias]);

  const update = (id: string, patch: Partial<Entrada>) =>
    setEntradas((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const add = () =>
    setEntradas((prev) => [
      ...prev,
      { id: uid(), dia: 1, titulo: "", formato: "Post Único", nota: "" },
    ]);

  const remove = (id: string) =>
    setEntradas((prev) => prev.filter((e) => e.id !== id));

  // Cards ordenados por dia (mantém ordem de inserção em empates -> multi conteúdo no mesmo dia)
  const cards = useMemo(
    () =>
      entradas
        .filter((e) => e.titulo.trim() !== "")
        .map((e, i) => ({ ...e, _i: i }))
        .sort((a, b) => a.dia - b.dia || a._i - b._i),
    [entradas]
  );

  const anos = useMemo(() => {
    const base = hoje.getFullYear();
    const arr: number[] = [];
    for (let y = base - 1; y <= base + 3; y++) arr.push(y);
    return arr;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      {/* ---------- PAINEL ---------- */}
      <aside className="panel">
        <h1>Calendário Editorial</h1>
        <p className="sub">
          Preencha os campos e exporte o pôster em PDF (A4 · fonte Transducer).
        </p>

        <div className="field">
          <label>Cliente</label>
          <input
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Nome do cliente"
          />
        </div>

        <div className="row2">
          <div className="field">
            <label>Mês</label>
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
              {MESES.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Ano</label>
            <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
              {anos.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Contato / rodapé (opcional)</label>
          <input
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            placeholder="@perfil · site · telefone"
          />
        </div>

        <div className="divider" />
        <p className="section-title">Cores</p>
        <div className="colors">
          <ColorField
            label="Fundo"
            value={cores.fundo}
            onChange={(v) => setCores((c) => ({ ...c, fundo: v }))}
          />
          <ColorField
            label="Texto"
            value={cores.texto}
            onChange={(v) => setCores((c) => ({ ...c, texto: v }))}
          />
          <ColorField
            label="Destaque"
            value={cores.destaque}
            onChange={(v) => setCores((c) => ({ ...c, destaque: v }))}
          />
          <ColorField
            label="Secundário"
            value={cores.secundario}
            onChange={(v) => setCores((c) => ({ ...c, secundario: v }))}
          />
        </div>
        <button
          className="btn"
          style={{ marginTop: 4 }}
          onClick={() => setCores(CORES_PADRAO)}
        >
          Restaurar cores padrão
        </button>

        <div className="divider" />
        <p className="section-title">Logos (opcional)</p>
        <div className="row2">
          <LogoField
            label="Logo 1"
            value={logo1}
            onPick={async (f) => setLogo1(await lerArquivo(f))}
            onClear={() => setLogo1("")}
          />
          <LogoField
            label="Logo 2"
            value={logo2}
            onPick={async (f) => setLogo2(await lerArquivo(f))}
            onClear={() => setLogo2("")}
          />
        </div>

        <div className="divider" />
        <p className="section-title">Conteúdos do mês</p>

        {entradas.map((e, idx) => (
          <div className="entry" key={e.id}>
            <div className="entry-head">
              <span className="entry-num">
                #{idx + 1} ·{" "}
                {weekdayAbbr(ano, mes, Math.min(e.dia, totalDias))}
              </span>
              <button
                className="remove"
                onClick={() => remove(e.id)}
                disabled={entradas.length === 1}
                title="Remover"
              >
                remover
              </button>
            </div>

            <div className="row2">
              <div className="field" style={{ marginBottom: 10 }}>
                <label>Dia</label>
                <select
                  value={e.dia}
                  onChange={(ev) => update(e.id, { dia: Number(ev.target.value) })}
                >
                  {Array.from({ length: totalDias }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {String(d).padStart(2, "0")} — {weekdayAbbr(ano, mes, d)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 10 }}>
                <label>Formato</label>
                <select
                  value={e.formato}
                  onChange={(ev) =>
                    update(e.id, { formato: ev.target.value as Formato })
                  }
                >
                  {FORMATOS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field" style={{ marginBottom: 10 }}>
              <label>Título do conteúdo</label>
              <textarea
                value={e.titulo}
                onChange={(ev) => update(e.id, { titulo: ev.target.value })}
                placeholder="Pode ser um título longo…"
              />
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label>Descrição / observação (opcional)</label>
              <input
                value={e.nota}
                onChange={(ev) => update(e.id, { nota: ev.target.value })}
                placeholder="Tema, legenda, CTA…"
              />
            </div>
          </div>
        ))}

        <button className="btn" onClick={add}>
          + Adicionar conteúdo
        </button>
        <button className="btn primary" onClick={() => window.print()}>
          ⤓ Baixar PDF
        </button>
        <p className="print-hint">
          No diálogo, ajuste: <b>Margens → Nenhuma</b>, marque{" "}
          <b>Gráficos de plano de fundo</b> e deixe <b>Escala → Padrão (100%)</b>.
          Isso evita cortar as bordas do pôster.
        </p>
      </aside>

      {/* ---------- PREVIEW / PÔSTER ---------- */}
      <main className="preview-wrap">
        <div className="toolbar">
          <button className="ghost" onClick={() => window.print()}>
            Baixar PDF
          </button>
        </div>

        <div
          className="poster"
          style={
            {
              "--bg": cores.fundo,
              "--ink": cores.texto,
              "--accent": cores.destaque,
              "--muted": cores.secundario,
            } as React.CSSProperties
          }
        >
          <div className="month-side">
            <span>{MESES[mes]}</span>
          </div>

          <div className="head">
            <div className="client">
              {logo1 && <img className="logo logo1" src={logo1} alt="Logo 1" />}
              <div className="kicker">Calendário Editorial</div>
              <div className="name">{cliente || "Cliente"}</div>
            </div>
            <div className="head-right">
              {logo2 && <img className="logo logo2" src={logo2} alt="Logo 2" />}
              <div className="year">’{String(ano).slice(-2)}</div>
            </div>
          </div>

          <div className="grid">
            {cards.length === 0 && (
              <div className="empty-hint">
                Adicione conteúdos no painel à esquerda para montar o calendário.
              </div>
            )}
            {cards.map((c) => (
              <div className="card" key={c.id}>
                <div className="card-top">
                  <div className="day">{String(c.dia).padStart(2, "0")}</div>
                  <div className="weekday">
                    {weekdayAbbr(ano, mes, Math.min(c.dia, totalDias))}
                  </div>
                </div>
                <div>
                  <span className="fmt">{c.formato}</span>
                </div>
                <div className="title">{c.titulo}</div>
                {c.nota.trim() !== "" && <div className="note">{c.nota}</div>}
              </div>
            ))}
          </div>

          <div className="foot">
            <span>
              {MESES[mes]} · {ano}
            </span>
            <span className="accent">{contato || cliente}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="color-field">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
      <div className="color-meta">
        <span className="color-label">{label}</span>
        <input
          className="color-hex"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function LogoField({
  label,
  value,
  onPick,
  onClear,
}: {
  label: string;
  value: string;
  onPick: (f: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="field" style={{ marginBottom: 0 }}>
      <label>{label}</label>
      {value ? (
        <div className="logo-preview">
          <img src={value} alt={label} />
          <button className="remove" onClick={onClear}>
            remover
          </button>
        </div>
      ) : (
        <label className="logo-drop">
          <span>+ enviar imagem</span>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}
