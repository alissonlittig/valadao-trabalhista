// Estimativa simplificada de rescisão CLT. Sem INSS/IR, sem médias de horas extras, sem convenção coletiva.
export const TIPOS = {
  sem_justa: 'Dispensa sem justa causa',
  pedido: 'Pedido de demissão',
  acordo: 'Acordo (art. 484-A)',
  justa: 'Dispensa por justa causa',
}
const DAY = 86400000
const d = (s) => { const [y, m, dd] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd)) }
const r2 = (n) => Math.round(n * 100) / 100
const diasNoMes = (x) => new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate()

// Meses completos entre duas datas (admissão inclusive, saída inclusive).
export function mesesCompletos(a, b) {
  const fim = new Date(b.getTime() + DAY)
  let m = (fim.getUTCFullYear() - a.getUTCFullYear()) * 12 + fim.getUTCMonth() - a.getUTCMonth()
  if (fim.getUTCDate() < a.getUTCDate()) m -= 1
  return Math.max(m, 0)
}

// Avos: meses com 15 dias ou mais de trabalho dentro do intervalo [ini, fim].
function avos(ini, fim) {
  let n = 0
  let c = new Date(Date.UTC(ini.getUTCFullYear(), ini.getUTCMonth(), 1))
  while (c <= fim) {
    const a = c < ini ? ini : c
    const fimMes = new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + 1, 0))
    const b = fimMes > fim ? fim : fimMes
    if ((b - a) / DAY + 1 >= 15) n++
    c = new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + 1, 1))
  }
  return n
}

export function calcular({ salario, admissao, demissao, tipo, aviso = 'indenizado', feriasVencidas = 0 }) {
  if (!(salario > 0)) throw new Error('Informe um salário maior que zero.')
  if (!admissao || !demissao) throw new Error('Informe as duas datas.')
  const A = d(admissao), D = d(demissao)
  if (D < A) throw new Error('A saída não pode ser anterior à admissão.')
  if (!TIPOS[tipo]) throw new Error('Tipo de rescisão inválido.')
  const justa = tipo === 'justa'
  const mesesTotal = mesesCompletos(A, D)
  const anosCompletos = Math.floor(mesesTotal / 12)

  const saldoDias = Math.min(D.getUTCDate(), 30)
  const saldo = (salario / 30) * saldoDias

  const indeniza = aviso === 'indenizado' && (tipo === 'sem_justa' || tipo === 'acordo')
  let diasAviso = 0
  if (indeniza) {
    diasAviso = Math.min(30 + 3 * anosCompletos, 90)
  }
  const avisoVal = (salario / 30) * diasAviso * (tipo === 'acordo' ? 0.5 : 1) // acordo: 50% do aviso
  // Aviso indenizado projeta o contrato: conta para 13º e férias proporcionais.
  const fimProj = new Date(D.getTime() + diasAviso * DAY)

  const ano = fimProj.getUTCFullYear()
  const jan = new Date(Date.UTC(ano, 0, 1))
  const avos13 = justa ? 0 : avos(A > jan ? A : jan, fimProj)
  const dec = (salario / 12) * avos13

  // Férias proporcionais: período aquisitivo em curso (aniversário da admissão).
  let aniv = A
  for (;;) {
    const prox = new Date(Date.UTC(aniv.getUTCFullYear() + 1, aniv.getUTCMonth(), aniv.getUTCDate()))
    if (prox > fimProj) break
    aniv = prox
  }
  const avosFer = justa ? 0 : Math.min(avos(aniv, fimProj), 12)
  const feriasProp = (salario / 12) * avosFer
  const nVenc = Math.max(0, Math.floor(feriasVencidas))
  const feriasVenc = salario * nVenc
  const terco = (feriasProp + feriasVenc) / 3

  // FGTS estimado: 8% do salário por mês trabalhado (sem correção monetária).
  const fgtsSaldo = salario * 0.08 * (mesesTotal + 1) + (dec + avisoVal) * 0.08
  const multa = tipo === 'sem_justa' ? fgtsSaldo * 0.4 : tipo === 'acordo' ? fgtsSaldo * 0.2 : 0
  const saque = tipo === 'sem_justa' ? fgtsSaldo : tipo === 'acordo' ? fgtsSaldo * 0.8 : 0

  const linhas = [
    { k: 'saldo', rotulo: `Saldo de salário (${saldoDias} dias)`, valor: saldo },
    { k: 'aviso', rotulo: `Aviso prévio indenizado (${diasAviso} dias${tipo === 'acordo' ? ', 50%' : ''})`, valor: avisoVal },
    { k: '13', rotulo: `13º proporcional (${avos13}/12)`, valor: dec },
    { k: 'ferp', rotulo: `Férias proporcionais (${avosFer}/12)`, valor: feriasProp },
    { k: 'ferv', rotulo: `Férias vencidas (${nVenc} ${nVenc === 1 ? 'período' : 'períodos'})`, valor: feriasVenc },
    { k: 'terco', rotulo: 'Adicional de 1/3 de férias', valor: terco },
  ].map((l) => ({ ...l, valor: r2(l.valor) }))
  const total = r2(linhas.reduce((s, l) => s + l.valor, 0))
  return {
    linhas, total,
    fgts: { saldoEstimado: r2(fgtsSaldo), multa: r2(multa), saque: r2(saque) },
    totalComFgts: r2(total + multa + saque),
  }
}
