"use client";

import { useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NovoPaciente() {
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [plano, setPlano] = useState("Particular");
    const [nascimento, setNascimento] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Salva no Firestore
            await addDoc(collection(db, "pacientes"), {
                nome,
                telefone, // Importante: Salvar apenas números idealmente, mas por enquanto vamos deixar livre
                plano,
                nascimento,
                criadoEm: new Date().toISOString()
            });

            alert("Paciente cadastrado com sucesso!");
            router.push("/pacientes");
        } catch (error) {
            console.error("Erro ao salvar", error);
            alert("Erro ao salvar paciente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Novo Paciente</h1>

            <form onSubmit={handleSalvar} style={styles.formCard}>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Nome Completo</label>
                    <input
                        required
                        type="text"
                        style={styles.input}
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Ex: Maria da Silva"
                    />
                </div>

                <div style={styles.row}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Telefone (WhatsApp)</label>
                        <input
                            required
                            type="tel"
                            style={styles.input}
                            value={telefone}
                            onChange={e => setTelefone(e.target.value)}
                            placeholder="Ex: 11999998888"
                        />
                        <small style={{ color: '#666', fontSize: '12px' }}>Apenas números com DDD</small>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Data de Nascimento</label>
                        <input
                            type="date"
                            style={styles.input}
                            value={nascimento}
                            onChange={e => setNascimento(e.target.value)}
                        />
                    </div>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Convênio / Plano</label>
                    <select
                        style={styles.select}
                        value={plano}
                        onChange={e => setPlano(e.target.value)}
                    >
                        <option value="Particular">Particular</option>
                        <option value="Unimed">Unimed</option>
                        <option value="BRF">BRF</option>
                        <option value="Cassi">Cassi</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>

                <div style={styles.actions}>
                    <button type="button" onClick={() => router.back()} style={styles.cancelButton}>Cancelar</button>
                    <button type="submit" disabled={loading} style={styles.saveButton}>
                        {loading ? "Salvando..." : "Cadastrar Paciente"}
                    </button>
                </div>

            </form>
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#121212", color: "#e0e0e0", padding: "40px 20px", fontFamily: "sans-serif", display: "flex", flexDirection: "column" as const, alignItems: "center" },
    title: { fontSize: "28px", marginBottom: "30px", color: "#fff" },
    formCard: { backgroundColor: "#1e1e1e", padding: "30px", borderRadius: "8px", width: "100%", maxWidth: "600px", border: "1px solid #333", display: "flex", flexDirection: "column" as const, gap: "20px" },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
    inputGroup: { display: "flex", flexDirection: "column" as const, gap: "8px" },
    label: { fontSize: "14px", color: "#aaa", fontWeight: "bold" as const },
    input: { padding: "12px", backgroundColor: "#2c2c2c", border: "1px solid #444", color: "#fff", borderRadius: "5px", fontSize: "16px", outline: "none" },
    select: { padding: "12px", backgroundColor: "#2c2c2c", border: "1px solid #444", color: "#fff", borderRadius: "5px", fontSize: "16px", outline: "none", cursor: "pointer" },
    actions: { display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "10px" },
    cancelButton: { padding: "12px 24px", backgroundColor: "transparent", border: "1px solid #555", color: "#ccc", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
    saveButton: { padding: "12px 24px", backgroundColor: "#4caf50", border: "none", color: "#fff", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }
};
