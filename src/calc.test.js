import { describe, it, expect } from 'vitest'
import { calcular } from './calc.js'

const base = { salario: 3000, admissao: '2022-03-01', demissao: '2025-06-15', tipo: 'sem_justa', aviso: 'indenizado', feriasVencidas: 0 }
const val = (r, k) => r.linhas.find((l) => l.k === k).valor

describe('calcular', () => {
  it('sem justa causa: aviso de 39 dias (3 anos completos)', () => {
    const r = calcular(base)
    expect(val(r, 'aviso')).toBe(3900)
    expect(val(r, 'saldo')).toBe(1500)
  })
  it('pedido de demissão não tem aviso indenizado nem multa', () => {
    const r = calcular({ ...base, tipo: 'pedido' })
    expect(val(r, 'aviso')).toBe(0)
    expect(r.fgts.multa).toBe(0)
  })
  it('acordo: aviso pela metade, multa menor', () => {
    const s = calcular(base), a = calcular({ ...base, tipo: 'acordo' })
    expect(val(a, 'aviso')).toBe(1950)
    expect(a.fgts.multa).toBeLessThan(s.fgts.multa)
  })
  it('justa causa: só saldo e férias vencidas', () => {
    const r = calcular({ ...base, tipo: 'justa', feriasVencidas: 1 })
    expect(val(r, '13')).toBe(0)
    expect(val(r, 'ferv')).toBe(3000)
    expect(val(r, 'terco')).toBe(1000)
  })
  it('valida entradas', () => {
    expect(() => calcular({ ...base, salario: 0 })).toThrow()
    expect(() => calcular({ ...base, demissao: '2020-01-01' })).toThrow()
  })
  it('total é a soma das linhas', () => {
    const r = calcular(base)
    expect(r.total).toBeCloseTo(r.linhas.reduce((s, l) => s + l.valor, 0), 2)
  })
})
