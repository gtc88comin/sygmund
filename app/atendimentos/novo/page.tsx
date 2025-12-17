"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ListaAtendimentos() {
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFaturado, setTotalFaturado] = useState(0);
  const [totalAtendimentos, setTotalAtendimentos] = useState(0);
  const router = useRouter();

  useEffect(() => {
    carregarAtendimentos();
  }, []);

  const carregarAtendimentos = async () => {
    try {
      // Tenta buscar ordenado. Se der erro de índice, o console avisa.
      const q = query(collection(db, "atendimentos"), orderBy("data", "desc"));
      const querySnapshot = await getDocs(q);

      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      setAtendimentos(lista);

      // Soma os valores
      const soma = lista.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
      setTotalFaturado(soma);
      setTotalAtendimentos(lista.length);

    } catch (error) {
      console.log("Buscando sem ordenação (índice pendente)...");
      const querySnapshot = await getDocs(collection(db, "atendimentos"));
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAtendimentos(lista);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Histórico de Atendimentos</h1>
        <button onClick={() => router.push("/atendimentos/novo")} style={styles.addButton}>
          + Registrar Novo
        </button>
      </header>

      {/* RESUMO FINANCEIRO */}
      <div style={styles.summaryBar}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Total Realizado</span>
          <span style={styles.summaryValue}>{totalAtendimentos}</span>
        </div>
        <div style={styles.divider}></div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Faturamento</span>
          <span style={styles.summaryValueMoney}>
            {totalFaturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div style={styles.tableContainer}>
          {atendimentos.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Sem registros.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Convênio</th>
                  <th style={styles.th}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {atendimentos.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      {item.data ? new Date(item.data + 'T00:00').toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td style={styles.td}><strong>{item.pacienteNome}</strong></td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: item.plano === 'Particular' ? '#4caf50' : '#2196f3'
                      }}>
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
          )}
        </div>
      )}
      <button onClick={() => router.push("/")} style={styles.backButton}>Voltar ao Painel</button>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#121212", color: "#e0e0e0", padding: "40px 20px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "30px", maxWidth: "800px", margin: "0 auto 30px auto" },
  title: { fontSize: "28px", margin: 0 },
  addButton: { padding: "10px 20px", backgroundColor: "#2196f3", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
  summaryBar: { display: "flex", justifyContent: "center", gap: "40px", backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", maxWidth: "800px", margin: "0 auto 30px auto", border: "1px solid #333" },
  summaryItem: { display: "flex", flexDirection: "column" as const, alignItems: "center" },
  summaryLabel: { fontSize: "14px", color: "#aaa" },
  summaryValue: { fontSize: "24px", fontWeight: "bold" },
  summaryValueMoney: { fontSize: "24px", fontWeight: "bold", color: "#4caf50" },
  divider: { width: "1px", height: "40px", backgroundColor: "#444" },
  tableContainer: { maxWidth: "800px", margin: "0 auto", backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  trHeader: { backgroundColor: "#2c2c2c", textAlign: "left" as const },
  th: { padding: "15px", color: "#aaa", fontSize: "14px", fontWeight: "normal" },
  tr: { borderBottom: "1px solid #333" },
  td: { padding: "15px", fontSize: "15px" },
  badge: { padding: "4px 8px", borderRadius: "4px", fontSize: "12px", color: "#fff", fontWeight: "bold" },
  backButton: { display: "block", margin: "40px auto", background: "none", border: "none", color: "#888", cursor: "pointer", textDecoration: "underline" }
};