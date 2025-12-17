"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
// 👇 1. Importar a segurança
import { useAuth } from "../contexts/AuthContext";

export default function FinanceiroAvancado() {
  // 👇 2. Pegar os dados de segurança
  const { cargo, loading: authLoading } = useAuth();

  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Controles
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [porcentagemSala, setPorcentagemSala] = useState(30);

  // Totais Gerais
  const [faturamentoBruto, setFaturamentoBruto] = useState(0);
  const [valorSala, setValorSala] = useState(0);
  const [lucroLiquido, setLucroLiquido] = useState(0);

  // Totais por Categoria
  const [resumoPorPlano, setResumoPorPlano] = useState<Record<string, number>>({});

  const router = useRouter();

  // 👇 3. Efeito de Segurança: Chuta para fora se não for admin
  useEffect(() => {
    if (!authLoading && cargo !== 'admin') {
      router.push("/"); // Volta pra home se for intruso
    }
  }, [cargo, authLoading, router]);

  // Carregar dados (seu código original)
  useEffect(() => {
    if (cargo === 'admin') { // Só carrega se for admin, pra economizar dados
      carregarAtendimentosDoMes();
    }
  }, [mesSelecionado, porcentagemSala, cargo]);

  const carregarAtendimentosDoMes = async () => {
    // ... (MANTENHA O SEU CÓDIGO DAQUI PARA BAIXO IGUALZINHO) ...
    // Vou resumir para não ficar gigante, mas você copia o bloco 'carregarAtendimentosDoMes' e 'exportarParaExcel' do seu código anterior.
    // ...
    setLoading(true);
    try {
      const q = query(collection(db, "atendimentos"), orderBy("data", "desc"));
      const querySnapshot = await getDocs(q);

      const listaCompleta = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]; // Forçando any para evitar erros de TS rápidos

      const listaFiltrada = listaCompleta.filter((item: any) => {
        return item.data.startsWith(mesSelecionado) && item.status === 'Realizado';
      });

      setAtendimentos(listaFiltrada);

      const bruto = listaFiltrada.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
      const custoSala = bruto * (porcentagemSala / 100);

      setFaturamentoBruto(bruto);
      setValorSala(custoSala);
      setLucroLiquido(bruto - custoSala);

      const resumo: Record<string, number> = {};
      listaFiltrada.forEach((item: any) => {
        const plano = item.plano || "Outros";
        const valor = Number(item.valor) || 0;

        if (resumo[plano]) {
          resumo[plano] += valor;
        } else {
          resumo[plano] = valor;
        }
      });
      setResumoPorPlano(resumo);

    } catch (error) {
      console.error("Erro", error);
    } finally {
      setLoading(false);
    }
  };

  const exportarParaExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data,Hora,Paciente,Convenio,Status,Valor\n";
    atendimentos.forEach((row) => {
      const rowString = `${row.data},${row.hora},${row.pacienteNome},${row.plano},${row.status},${row.valor}`;
      csvContent += rowString + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `faturamento_${mesSelecionado}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // 👇 Proteção Visual: Enquanto verifica, mostra carregando ou tela em branco
  if (authLoading) return <div style={styles.container}>Verificando acesso...</div>;
  if (cargo !== 'admin') return null; // Não mostra nada se não for admin

  return (
    <div style={styles.container}>
      {/* ... (MANTENHA TODO O SEU JSX IGUALZINHO AQUI) ... */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestão Financeira</h1>
          <p style={styles.subtitle}>Visão detalhada de receitas</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportarParaExcel} style={styles.exportButton}>
            📥 Exportar Excel
          </button>
          <button onClick={() => router.push("/atendimentos/novo")} style={styles.addButton}>
            + Novo Recebimento
          </button>
        </div>
      </header>
      {/* ... Resto do seu JSX igual ... */}

      {/* Vou colocar apenas o finalzinho para referência */}
      <div style={styles.controlBar}>
        <div style={styles.controlItem}>
          <label style={styles.label}>Mês de Referência</label>
          <input type="month" style={styles.input} value={mesSelecionado} onChange={e => setMesSelecionado(e.target.value)} />
        </div>
        <div style={styles.controlItem}>
          <label style={styles.label}>Taxa Sala (%)</label>
          <input type="number" style={styles.input} value={porcentagemSala} onChange={e => setPorcentagemSala(Number(e.target.value))} />
        </div>
      </div>

      <div style={styles.dashboard}>
        <div style={styles.dashCard}>
          <span style={styles.dashLabel}>Faturamento Bruto</span>
          <span style={{ ...styles.dashValue, color: '#2196f3' }}>
            {faturamentoBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <div style={{ ...styles.dashCard, border: '1px solid #ff4444' }}>
          <span style={styles.dashLabel}>Custo Sala ({porcentagemSala}%)</span>
          <span style={{ ...styles.dashValue, color: '#ff4444' }}>
            - {valorSala.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <div style={{ ...styles.dashCard, border: '1px solid #4caf50', backgroundColor: '#1b2e1e' }}>
          <span style={styles.dashLabel}>Lucro Líquido</span>
          <span style={{ ...styles.dashValue, color: '#4caf50' }}>
            {lucroLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      <div style={styles.detailsGrid}>
        <div style={styles.detailsCard}>
          <h3 style={styles.cardHeader}>Receita por Fonte</h3>
          <ul style={styles.listReset}>
            {Object.entries(resumoPorPlano).length === 0 && <p style={{ color: '#666' }}>Sem dados.</p>}
            {Object.entries(resumoPorPlano).map(([plano, valor]) => (
              <li key={plano} style={styles.listItem}>
                <span style={{ fontWeight: 'bold', color: '#ccc' }}>{plano}</span>
                <span style={{ color: '#fff' }}>
                  {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div style={styles.detailsCard}>
          <h3 style={styles.cardHeader}>Métricas Rápidas</h3>
          <div style={styles.metricRow}>
            <span>Atendimentos Realizados:</span>
            <strong>{atendimentos.length}</strong>
          </div>
          <div style={styles.metricRow}>
            <span>Ticket Médio:</span>
            <strong>
              {atendimentos.length > 0
                ? (faturamentoBruto / atendimentos.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'R$ 0,00'}
            </strong>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '30px', color: '#888' }}>Extrato de Lançamentos</h3>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.trHeader}>
              <th style={styles.th}>Dia</th>
              <th style={styles.th}>Paciente</th>
              <th style={styles.th}>Fonte</th>
              <th style={styles.th}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {atendimentos.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>{new Date(item.data + 'T00:00').toLocaleDateString('pt-BR')}</td>
                <td style={styles.td}>{item.pacienteNome}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: item.plano === 'Particular' ? '#4caf50' : '#2196f3' }}>
                    {item.plano}
                  </span>
                </td>
                <td style={styles.td}>
                  {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={() => router.push("/")} style={styles.backButton}>Voltar ao Painel</button>
    </div>
  );
}

// Estilos (MANTENHA OS MESMOS)
const styles = {
  container: { minHeight: "100vh", backgroundColor: "#121212", color: "#e0e0e0", padding: "40px 20px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", maxWidth: "900px", margin: "0 auto 30px auto" },
  title: { fontSize: "28px", margin: 0, color: "#fff" },
  subtitle: { fontSize: "14px", color: "#888", marginTop: "5px" },
  addButton: { padding: "10px 20px", backgroundColor: "#2196f3", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
  exportButton: { padding: "10px 20px", backgroundColor: "#333", color: "#fff", border: "1px solid #555", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
  controlBar: { display: "flex", gap: "20px", maxWidth: "900px", margin: "0 auto 30px auto", backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px" },
  controlItem: { display: "flex", flexDirection: "column" as const, gap: "5px" },
  label: { fontSize: "12px", color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "1px" },
  input: { padding: "10px", backgroundColor: "#2c2c2c", border: "1px solid #444", color: "#fff", borderRadius: "5px", fontSize: "16px", outline: "none" },
  dashboard: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", maxWidth: "900px", margin: "0 auto" },
  dashCard: { backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "10px", display: "flex", flexDirection: "column" as const, alignItems: "center", border: "1px solid #333" },
  dashLabel: { fontSize: "14px", color: "#aaa", marginBottom: "10px" },
  dashValue: { fontSize: "28px", fontWeight: "bold", marginBottom: "5px" },
  detailsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "900px", margin: "30px auto 0 auto" },
  detailsCard: { backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "10px", border: "1px solid #333" },
  cardHeader: { marginTop: 0, borderBottom: "1px solid #333", paddingBottom: "10px", marginBottom: "15px", fontSize: "16px", color: "#aaa" },
  listReset: { listStyle: "none", padding: 0, margin: 0 },
  listItem: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #2c2c2c" },
  metricRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "14px", color: "#ddd" },
  tableContainer: { maxWidth: "900px", margin: "10px auto", backgroundColor: "#1e1e1e", borderRadius: "8px", overflow: "hidden", border: "1px solid #333" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  trHeader: { backgroundColor: "#2c2c2c", textAlign: "left" as const },
  th: { padding: "15px", color: "#aaa", fontSize: "14px", fontWeight: "normal" },
  tr: { borderBottom: "1px solid #333" },
  td: { padding: "15px", fontSize: "15px" },
  badge: { padding: "4px 8px", borderRadius: "4px", fontSize: "12px", color: "#fff", fontWeight: "bold" },
  backButton: { display: "block", margin: "40px auto", background: "none", border: "none", color: "#888", cursor: "pointer", textDecoration: "underline" }
};