"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NovaConsulta() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [pacienteId, setPacienteId] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const carregarPacientes = async () => {
      const snap = await getDocs(collection(db, "pacientes"));
      setPacientes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    carregarPacientes();
  }, []);

  const handleAgendar = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pacienteInfo = pacientes.find(p => p.id === pacienteId);

      // Salvamos na mesma coleção 'atendimentos', mas com status 'Agendado'
      await addDoc(collection(db, "atendimentos"), {
        pacienteId,
        pacienteNome: pacienteInfo.nome,
        pacienteTelefone: pacienteInfo.telefone || "", // Salva o telefone para o botão de WhatsApp
        plano: pacienteInfo.plano,
        data,
        hora,
        obs, // Observação extra (Ex: "Primeira vez")
        status: "Agendado",
        valor: 0, // Valor entra só quando confirmar depois
        criadoEm: new Date()
      });

      alert("✅ Consulta agendada!");
      router.push("/agenda");
    } catch (error) {
      alert("Erro ao agendar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Agendar Nova Consulta</h1>
      <div style={styles.card}>
        <form onSubmit={handleAgendar} style={styles.form}>

          <label style={styles.label}>Paciente</label>
          <select style={styles.input} value={pacienteId} onChange={e => setPacienteId(e.target.value)} required>
            <option value="">Selecione...</option>
            {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Data</label>
              <input type="date" style={styles.input} value={data} onChange={e => setData(e.target.value)} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Horário</label>
              <input type="time" style={styles.input} value={hora} onChange={e => setHora(e.target.value)} required />
            </div>
          </div>

          <label style={styles.label}>Observações (Opcional)</label>
          <textarea style={styles.textarea} value={obs} onChange={e => setObs(e.target.value)} placeholder="Ex: Retorno, trazer exames..." />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Agendando..." : "Confirmar Agendamento"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#121212", color: "#fff", padding: "40px 20px", display: "flex", flexDirection: "column" as const, alignItems: "center", fontFamily: "sans-serif" },
  title: { marginBottom: "30px", fontSize: "28px" },
  card: { backgroundColor: "#1e1e1e", padding: "30px", borderRadius: "10px", width: "100%", maxWidth: "500px", border: "1px solid #333" },
  form: { display: "flex", flexDirection: "column" as const, gap: "15px" },
  label: { fontSize: "14px", color: "#aaa" },
  input: { width: "100%", padding: "12px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#2c2c2c", color: "#fff", fontSize: "16px" },
  textarea: { width: "100%", padding: "12px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#2c2c2c", color: "#fff", fontSize: "16px", minHeight: "80px" },
  button: { padding: "15px", backgroundColor: "#2196f3", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "10px" }
};