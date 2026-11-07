import { useMemo, useState } from 'react'
import { calcular, TIPOS } from './calc.js'

const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const AREAS = [
  ['Verbas rescisórias', 'Conferência do termo de rescisão, saldo de salário, férias, 13º e multa do FGTS.'],
  ['Horas extras e banco de horas', 'Levantamento de jornada, intervalos suprimidos e reflexos sobre as demais verbas.'],
  ['Vínculo e pejotização', 'Reconhecimento de vínculo quando há subordinação, habitualidade e pessoalidade.'],
  ['Assédio e danos morais', 'Orientação sobre provas, prazos e o caminho até a audiência.'],
  ['Acidente e doença do trabalho', 'Estabilidade, CAT, afastamento e indenizações cabíveis.'],
  ['Acordos e homologações', 'Revisão de propostas de acordo antes da assinatura, em linguagem direta.'],
]
const PASSOS = [
  ['Conversa inicial', 'Quinze minutos por vídeo ou telefone para entender o que aconteceu. Sem custo.'],
  ['Análise dos documentos', 'Contracheques, ponto, termo de rescisão e conversas. Você envia, nós organizamos.'],
  ['Estratégia combinada', 'Você recebe por escrito o caminho, os riscos, os prazos e os honorários.'],
  ['Acompanhamento', 'Atualizações a cada movimentação relevante, sem juridiquês.'],
]
const FAQ = [
  ['Qual o prazo para entrar com ação?', 'Em regra, dois anos após o fim do contrato, cobrando os últimos cinco anos de trabalho. Quanto antes a análise, melhor a prova.'],
  ['Preciso pagar algo para começar?', 'A conversa inicial é gratuita. Os honorários, quando houver ação, são combinados por escrito antes de qualquer passo.'],
  ['A calculadora vale como cálculo oficial?', 'Não. É uma estimativa simplificada, sem INSS, imposto de renda, médias de variáveis ou convenção coletiva. Serve para ter uma ordem de grandeza.'],
  ['Posso ir sozinho à Justiça do Trabalho?', 'Pode, em causas simples. Mas verbas variáveis, provas e prazos costumam pedir acompanhamento técnico.'],
]

function Marca() {
  return (
    <a className="marca" href="#topo" aria-label="Valadão & Reis, início">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="currentColor" /><path d="M9 8h4l3 11 3-11h4l-5 16h-4z" fill="var(--papel)" /></svg>
      <span>Valadão <i>&amp;</i> Reis</span>
    </a>
  )
}

const hoje = new Date().toISOString().slice(0, 10)

function Calculadora() {
  const [f, setF] = useState({ salario: '3200', admissao: '2022-03-01', demissao: '2025-06-15', tipo: 'sem_justa', aviso: 'indenizado', feriasVencidas: '0' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const res = useMemo(() => {
    try { return { ok: calcular({ ...f, salario: parseFloat(f.salario.replace(',', '.')), feriasVencidas: parseInt(f.feriasVencidas, 10) || 0 }) } }
    catch (e) { return { erro: e.message } }
  }, [f])
  return (
    <section id="calculadora" className="secao calc">
      <div className="wrap">
        <header className="cab">
          <p className="sobre">Calculadora</p>
          <h2>Quanto deveria constar na sua rescisão?</h2>
          <p className="lead">Uma estimativa em segundos. Nada é enviado: o cálculo acontece no seu navegador.</p>
        </header>
        <div className="calcgrid">
          <form className="painel" onSubmit={(e) => e.preventDefault()} aria-label="Dados da rescisão">
            <label>Último salário mensal (R$)
              <input inputMode="decimal" value={f.salario} onChange={set('salario')} />
            </label>
            <div className="dois">
              <label>Admissão<input type="date" value={f.admissao} max={hoje} onChange={set('admissao')} /></label>
              <label>Saída<input type="date" value={f.demissao} onChange={set('demissao')} /></label>
            </div>
            <label>Tipo de saída
              <select value={f.tipo} onChange={set('tipo')}>
                {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <fieldset>
              <legend>Aviso prévio</legend>
              <div className="seg">
                {[['indenizado', 'Indenizado'], ['trabalhado', 'Trabalhado']].map(([v, t]) => (
                  <label key={v} className={f.aviso === v ? 'on' : ''}><input type="radio" name="aviso" value={v} checked={f.aviso === v} onChange={set('aviso')} />{t}</label>
                ))}
              </div>
            </fieldset>
            <label>Períodos de férias vencidas
              <select value={f.feriasVencidas} onChange={set('feriasVencidas')}>
                <option value="0">Nenhum</option><option value="1">1 período</option><option value="2">2 períodos</option>
              </select>
            </label>
          </form>
          <div className="painel resultado" aria-live="polite">
            {res.erro ? <p className="erro" role="alert">{res.erro}</p> : (
              <>
                <p className="rot">Total estimado em verbas</p>
                <p className="total">{brl(res.ok.total)}</p>
                <ul className="linhas">
                  {res.ok.linhas.filter((l) => l.valor > 0).map((l) => (
                    <li key={l.k}><span>{l.rotulo}</span><b>{brl(l.valor)}</b></li>
                  ))}
                </ul>
                {res.ok.fgts.multa > 0 && (
                  <div className="fgts">
                    <div><span>Multa do FGTS</span><b>{brl(res.ok.fgts.multa)}</b></div>
                    <div><span>Saque do FGTS estimado</span><b>{brl(res.ok.fgts.saque)}</b></div>
                    <div className="soma"><span>Total com FGTS</span><b>{brl(res.ok.totalComFgts)}</b></div>
                  </div>
                )}
                <p className="aviso">Estimativa sem INSS, imposto de renda, horas extras ou convenção coletiva. Não substitui análise do seu caso.</p>
                <a className="btn" href="#contato">Quero revisar meu termo</a>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [enviado, setEnviado] = useState(false)
  return (
    <>
      <div className="demo" role="note">Site de demonstração. Escritório, pessoas, números e endereço são fictícios.</div>
      <header className="topo" id="topo">
        <div className="wrap barra">
          <Marca />
          <nav aria-label="Principal">
            <a href="#areas">Áreas</a><a href="#calculadora">Calculadora</a><a href="#como">Como atuamos</a><a href="#duvidas">Dúvidas</a>
          </nav>
          <a className="btn pequeno" href="#contato">Falar conosco</a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap herogrid">
            <div>
              <p className="sobre">Advocacia trabalhista · Curitiba</p>
              <h1>Seus direitos, <em>contados</em> com clareza.</h1>
              <p className="lead">Atuamos só com Direito do Trabalho, para empregados. Primeiro entendemos o que aconteceu; depois dizemos, por escrito, o que vale a pena fazer.</p>
              <div className="acoes"><a className="btn" href="#calculadora">Calcular minha rescisão</a><a className="link" href="#como">Como funciona →</a></div>
              <dl className="nums">
                <div><dt>Atuação exclusiva</dt><dd>Trabalhista</dd></div>
                <div><dt>Primeira conversa</dt><dd>Sem custo</dd></div>
                <div><dt>Resposta em</dt><dd>1 dia útil</dd></div>
              </dl>
            </div>
            <aside className="cartao" aria-label="Exemplo de conferência">
              <p className="rot">Conferência de termo · exemplo</p>
              <table>
                <tbody>
                  <tr><td>Saldo de salário</td><td className="ok">conferido</td></tr>
                  <tr><td>13º proporcional</td><td className="ok">conferido</td></tr>
                  <tr><td>Férias + 1/3</td><td className="ok">conferido</td></tr>
                  <tr><td>Multa de 40% do FGTS</td><td className="no">não consta</td></tr>
                  <tr><td>Horas extras habituais</td><td className="no">sem reflexo</td></tr>
                </tbody>
              </table>
              <p className="nota">Dois itens para discutir antes de assinar.</p>
            </aside>
          </div>
        </section>

        <section id="areas" className="secao">
          <div className="wrap">
            <header className="cab"><p className="sobre">Áreas de atuação</p><h2>O que resolvemos todo dia</h2></header>
            <ul className="areas">
              {AREAS.map(([t, d], i) => (
                <li key={t}><span className="idx">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></li>
              ))}
            </ul>
          </div>
        </section>

        <Calculadora />

        <section id="como" className="secao">
          <div className="wrap">
            <header className="cab"><p className="sobre">Como atuamos</p><h2>Quatro passos, sem surpresa</h2></header>
            <ol className="passos">
              {PASSOS.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
            </ol>
          </div>
        </section>

        <section id="duvidas" className="secao faq">
          <div className="wrap estreito">
            <header className="cab"><p className="sobre">Dúvidas frequentes</p><h2>Antes de começar</h2></header>
            {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </section>

        <section id="contato" className="secao contato">
          <div className="wrap contgrid">
            <div>
              <p className="sobre claro">Contato</p>
              <h2>Conte o que aconteceu.</h2>
              <p className="lead">Respondemos em até um dia útil. Dados e mensagens deste formulário de demonstração não são enviados a lugar nenhum.</p>
              <p className="end">Rua das Palmeiras, 1200 · sala 41<br />Curitiba, PR (endereço fictício)</p>
            </div>
            {enviado ? <div className="painel ok2" role="status"><h3>Recebido (simulação)</h3><p>Em um site real, a equipe responderia por aqui em até um dia útil.</p></div> : (
              <form className="painel" onSubmit={(e) => { e.preventDefault(); setEnviado(true) }}>
                <label>Nome<input required autoComplete="name" /></label>
                <label>Telefone ou WhatsApp<input required inputMode="tel" autoComplete="tel" /></label>
                <label>Em poucas palavras<textarea rows="3" /></label>
                <button className="btn" type="submit">Enviar</button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="rodape">
        <div className="wrap">
          <Marca />
          <p>Demonstração de interface. Conteúdo informativo, não constitui aconselhamento jurídico nem oferta de serviços. OAB e demais dados são fictícios.</p>
        </div>
      </footer>
    </>
  )
}
