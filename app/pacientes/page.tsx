"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Busca os pacientes no banco assim que a tela abre
  useEffect(() => {
    const carregarPacientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pacientes"));
        const lista = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPacientes(lista);
      } catch (error) {
        console.error("Erro ao buscar pacientes", error);
      } finally {
        setLoading(false);
      }
    };

    carregarPacientes();
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Meus Pacientes</h1>
        <button onClick={() => router.push("/pacientes/novo")} style={styles.addButton}>
          + Novo Paciente
        </button>
      </header>

      {loading ? (
        <p>Carregando fichas...</p>
      ) : (
        <div style={styles.tableContainer}>
          {pacientes.length === 0 ? (
            <p style={{textAlign: 'center', padding: '20px', color: '#888'}}>
              Nenhum paciente cadastrado ainda.
            </p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>Convênio</th>
                  <th style={styles.th}>Telefone</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((p) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{p.nome}</strong>
                    </td>
                    <td style={styles.td}>
                      {/* Etiqueta colorida dependendo do plano */}
                      <span style={{
                        ...styles.badge, 
                        backgroundColor: p.plano === 'Particular' ? '#4caf50' : '#2196f3'
                      }}>
                        {p.plano || 'Não informado'}
                      </span>
                    </td>
                    <td style={styles.td}>{p.telefone}</td>
                    <td style={styles.td}>
                    <button 
  style={styles.actionButton}
  onClick={() => router.push(`/pacientes/${p.id}`)} // <--- ISSO É O QUE FAZ O LINK
>
  Ver Prontuário
</button>
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

// Estilos de Tabela Profissional
const styles = {
  container: { minHeight: "100vh", backgroundColor: "#121212", color: "#e0e0e0", padding: "40px 20px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", maxWidth: "800px", margin: "0 auto 30px auto" },
  title: { fontSize: "28px", margin: 0 },
  addButton: { padding: "10px 20px", backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
  tableContainer: { maxWidth: "800px", margin: "0 auto", backgroundColor: "#1e1e1e", borderRadius: "8px", overflow: "hidden", border: "1px solid #333" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  trHeader: { backgroundColor: "#2c2c2c", textAlign: "left" as const },
  th: { padding: "15px", color: "#aaa", fontSize: "14px", fontWeight: "normal" },
  tr: { borderBottom: "1px solid #333" },
  td: { padding: "15px", fontSize: "15px" },
  badge: { padding: "4px 8px", borderRadius: "4px", fontSize: "12px", color: "#fff", fontWeight: "bold" },
  actionButton: { padding: "6px 12px", backgroundColor: "transparent", border: "1px solid #666", color: "#ccc", borderRadius: "4px", cursor: "pointer", fontSize: "12px" },
  backButton: { display: "block", margin: "40px auto", background: "none", border: "none", color: "#888", cursor: "pointer", textDecoration: "underline" }
};