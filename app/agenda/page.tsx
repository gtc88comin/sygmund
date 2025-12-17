"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AgendaPage() {
  // Pega a data de hoje (YYYY-MM-DD)
  const hoje = new Date().toISOString().split('T')[0];
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Função para gerar o calendário simples (apenas dias do mês atual)
  const renderCalendario = () => {
    const dias = [];
    const date = new Date(dataSelecionada);
    const ano = date.getFullYear();
    const mes = date.getMonth();
    
    // Dias no mês
    const qtdDias = new Date(ano, mes + 1, 0).getDate();

    for (let i = 1; i <= qtdDias; i++) {
      // Formata dia para comparar com dataSelecionada (YYYY-MM-DD)
      const diaFormatado = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = diaFormatado === dataSelecionada;

      dias.push(
        <button 
          key={i} 
          onClick={() => setDataSelecionada(diaFormatado)}
          style={{
            ...styles.dayBox,
            backgroundColor: isSelected ? '#2196f3' : '#2c2c2c',
            border: isSelected ? '1px solid #fff' : '1px solid #444'
          }}
        >
          {i}
        </button>
      );
    }
    return dias;
  };

  // Busca consultas sempre que a data muda
  useEffect(() => {
    const carregarAgenda = async () => {
      setLoading(true);
      setConsultas([]); // Limpa lista anterior
      try {
        const q = query(collection(db, "atendimentos"), where("data", "==", dataSelecionada));
        const snap = await getDocs(q);
        const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Ordena por horário
        lista.sort((a: any, b: any) => a.hora.localeCompare(b.hora));
        
        setConsultas(lista);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    carregarAgenda();
  }, [dataSelecionada]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Agenda</h1>
        <button onClick={() => router.push("/agenda/novo")} style={styles.addButton}>
          + Agendar Consulta
        </button>
      </header>

      {/* Navegação de Calendário Simplificada */}
      <div style={styles.calendarContainer}>
        <h3 style={styles.monthTitle}>
          {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <div style={styles.calendarGrid}>
          {renderCalendario()}
        </div>
      </div>

      {/* Lista do Dia */}
      <div style={styles.daySection}>
        <h2 style={styles.dayTitle}>
          Consultas para {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR')}
        </h2>

        {loading ? <p>Carregando...</p> : (
          <div style={styles.list}>
            {consultas.length === 0 ? (
              <p style={{color: '#666'}}>Nenhuma consulta agendada para este dia.</p>
            ) : (
              consultas.map((c) => (
                <div key={c.id} style={styles.card}>
                  <div style={styles.timeBox}>{c.hora}</div>
                  <div style={styles.infoBox}>
                    <strong style={{fontSize: '18px'}}>{c.pacienteNome}</strong>
                    <div style={styles.subInfo}>
                      <span style={styles.badge}>{c.plano}</span>
                      <span style={{color: c.status === 'Realizado' ? '#4caf50' : '#aaa'}}>
                        Status: {c.status}
                      </span>
                    </div>
                    {c.obs && <p style={styles.obs}>📝 {c.obs}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <button onClick={() => router.push("/")} style={styles.backButton}>Voltar ao Painel</button>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#121212", color: "#e0e0e0", padding: "40px 20px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "30px", maxWidth: "800px", margin: "0 auto" },
  title: { fontSize: "28px", margin: 0 },
  addButton: { padding: "10px 20px", backgroundColor: "#2196f3", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
  
  calendarContainer: { maxWidth: "800px", margin: "0 auto 40px auto", backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "10px", border: "1px solid #333" },
  monthTitle: { textAlign: "center" as const, textTransform: "capitalize" as const, marginBottom: "20px", color: "#fff" },
  calendarGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" },
  dayBox: { padding: "10px", borderRadius: "5px", color: "#fff", cursor: "pointer", fontSize: "14px" },

  daySection: { maxWidth: "800px", margin: "0 auto" },
  dayTitle: { fontSize: "20px", borderBottom: "1px solid #333", paddingBottom: "10px", marginBottom: "20px" },
  
  list: { display: "flex", flexDirection: "column" as const, gap: "15px" },
  card: { display: "flex", backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333", overflow: "hidden" },
  timeBox: { backgroundColor: "#2c2c2c", width: "80px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold", color: "#fff" },
  infoBox: { padding: "15px", flex: 1 },
  subInfo: { display: "flex", gap: "15px", marginTop: "5px", fontSize: "14px" },
  badge: { backgroundColor: "#333", padding: "2px 8px", borderRadius: "4px", color: "#ccc" },
  obs: { marginTop: "10px", fontSize: "13px", color: "#888", fontStyle: "italic" },
  
  backButton: { display: "block", margin: "40px auto", background: "none", border: "none", color: "#888", cursor: "pointer", textDecoration: "underline" }
};