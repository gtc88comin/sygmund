"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { use } from "react"; // Necessário para ler o ID na versão nova do Next.js

export default function ProntuarioPaciente({ params }: { params: Promise<{ id: string }> }) {
  // Desembrulha o ID da URL
  const { id } = use(params);

  const [paciente, setPaciente] = useState<any>(null);
  const [evolucao, setEvolucao] = useState(""); // Texto da consulta de hoje
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Carrega os dados do Paciente e o Histórico
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Busca dados pessoais
        const docRef = doc(db, "pacientes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPaciente(docSnap.data());

          // Busca histórico de evoluções (Sub-coleção)
          // Salvaremos as anotações DENTRO da pasta do paciente para ficar organizado
          const evolucoesRef = collection(db, "pacientes", id, "evolucoes");
          const q = query(evolucoesRef, orderBy("data", "desc")); // Do mais recente para o antigo
          const querySnapshot = await getDocs(q);

          const listaEvolucoes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setHistorico(listaEvolucoes);

        } else {
          alert("Paciente não encontrado!");
          router.push("/pacientes");
        }
      } catch (error) {
        console.error("Erro ao carregar prontuário:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [id, router]);

  // 2. Salva a anotação do dia
  const salvarEvolucao = async () => {
    if (!evolucao.trim()) return;

    try {
      const evolucoesRef = collection(db, "pacientes", id, "evolucoes");
      await addDoc(evolucoesRef, {
        texto: evolucao,
        data: new Date(),
        autor: "Dra. Stelen" // Futuramente pegaremos do login
      });

      alert("Evolução salva!");
      setEvolucao(""); // Limpa o campo
      // Recarrega a página para mostrar a nova anotação
      window.location.reload();
    } catch (error) {
      alert("Erro ao salvar evolução.");
    }
  };

  if (loading) return <div style={styles.container}>Carregando prontuário...</div>;

  return (
    <div style={styles.container}>
      {/* CABEÇALHO DO PACIENTE */}
      <div style={styles.headerCard}>
        <div>
          <h1 style={styles.nomePaciente}>{paciente?.nome}</h1>
          <div style={styles.tags}>
            <span style={{
              ...styles.tagPlano,
              backgroundColor: paciente?.plano === 'Particular' ? '#4caf50' : '#2196f3'
            }}>
              {paciente?.plano || 'Sem convênio'}
            </span>
            <span style={styles.tagInfo}>{paciente?.nascimento ? `Nasc: ${new Date(paciente.nascimento).toLocaleDateString('pt-BR')}` : 'Sem data nasc.'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* BOTÃO DO WHATSAPP */}
          {paciente?.telefone && (
            <button
              onClick={() => {
                // Limpa o numero para pegar só digitos e adiciona 55 se não tiver
                const numbers = paciente.telefone.replace(/\D/g, '');
                const fullNumber = numbers.length <= 11 ? `55${numbers}` : numbers;
                window.open(`https://wa.me/${fullNumber}`, '_blank');
              }}
              style={{ ...styles.backButton, backgroundColor: '#25D366', color: '#000', border: 'none', fontWeight: 'bold' }}
            >
              💬 Chamar no Zap
            </button>
          )}
          <button onClick={() => router.push("/pacientes")} style={styles.backButton}>Voltar</button>
        </div>
      </div>

      <div style={styles.contentGrid}>

        {/* LADO ESQUERDO: Escrever nova evolução */}
        <div style={styles.writeArea}>
          <h3 style={styles.sectionTitle}>📝 Evolução do Dia</h3>
          <textarea
            style={styles.textarea}
            value={evolucao}
            onChange={(e) => setEvolucao(e.target.value)}
            placeholder="Descreva o atendimento de hoje..."
            rows={10}
          />
          <button onClick={salvarEvolucao} style={styles.saveButton}>Salvar Atendimento</button>
        </div>

        {/* LADO DIREITO: Histórico */}
        <div style={styles.historyArea}>
          <h3 style={styles.sectionTitle}>Histórico Clínico</h3>
          {historico.length === 0 && <p style={{ color: '#666' }}>Nenhum registro anterior.</p>}

          <div style={styles.timeline}>
            {historico.map((item) => (
              <div key={item.id} style={styles.timelineItem}>
                <div style={styles.timelineDate}>
                  {/* Formata a data bonitinha (DD/MM/AAAA) */}
                  {new Date(item.data.seconds * 1000).toLocaleDateString('pt-BR')} às {new Date(item.data.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={styles.timelineText}>{item.texto}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Estilos de Prontuário Médico
const styles = {
  container: { minHeight: "100vh", backgroundColor: "#121212", color: "#e0e0e0", padding: "20px", fontFamily: "sans-serif" },
  headerCard: { backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", borderBottom: "4px solid #4caf50", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  nomePaciente: { margin: 0, fontSize: "28px", color: "#fff" },
  tags: { marginTop: "10px", display: "flex", gap: "10px" },
  tagPlano: { backgroundColor: "#4caf50", color: "#fff", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" },
  tagInfo: { backgroundColor: "#333", color: "#ccc", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" },
  backButton: { background: "none", border: "1px solid #666", color: "#888", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" },

  contentGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }, // Divide a tela em 2

  writeArea: { backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px" },
  sectionTitle: { marginTop: 0, borderBottom: "1px solid #333", paddingBottom: "10px", marginBottom: "15px" },
  textarea: { width: "100%", backgroundColor: "#252525", border: "1px solid #333", color: "#fff", padding: "15px", borderRadius: "5px", fontSize: "16px", resize: "vertical" as const, outline: "none" },
  saveButton: { width: "100%", marginTop: "15px", padding: "15px", backgroundColor: "#2196f3", color: "#fff", border: "none", borderRadius: "5px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },

  historyArea: { backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", maxHeight: "80vh", overflowY: "auto" as const },
  timeline: { display: "flex", flexDirection: "column" as const, gap: "15px" },
  timelineItem: { backgroundColor: "#252525", padding: "15px", borderRadius: "8px", borderLeft: "3px solid #666" },
  timelineDate: { fontSize: "12px", color: "#888", marginBottom: "5px", fontWeight: "bold" },
  timelineText: { fontSize: "15px", lineHeight: "1.5", whiteSpace: "pre-wrap" as const }
};