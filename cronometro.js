// ==============================
// CONFIGURAÇÃO DO EVENTO
// ==============================
const dataEvento = new Date(2026, 9, 24, 16, 0, 0); // Date(ano, mês-1, dia, hora, minuto, segundo)

// ==============================
// HELPERS
// ==============================
function somenteData(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addMeses(d, qtd) {
    const copia = new Date(d.getTime());
    copia.setMonth(copia.getMonth() + qtd);
    return copia;
}

function diffMesesESemanas(inicio, fim) {
    const a = somenteData(inicio);
    const b = somenteData(fim);

    if (b <= a) return { meses: 0, semanas: 0 };

    let meses = 0;
    let cursor = new Date(a.getTime());

    while (true) {
        const proximo = addMeses(cursor, 1);
        if (proximo <= b) {
            meses++;
            cursor = proximo;
        } else {
            break;
        }
    }

    const restoMs = b - cursor;
    const restoDias = Math.floor(restoMs / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(restoDias / 7);

    return { meses, semanas };
}

function pluralizar(n, singular, pluralTxt) {
    return n === 1 ? singular : pluralTxt;
}

// ==============================
// EXECUÇÃO
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    const contador = document.getElementById("contador");

    if (!contador) {
        console.error("Elemento #contador não encontrado");
        return;
    }

    function atualizar() {
        const agora = new Date();
        const diffMs = dataEvento - agora;

        if (diffMs <= 0) {
            contador.textContent = "Chegou o grande dia 🎉 e 00:00:00";
            return;
        }

        const msDia = 1000 * 60 * 60 * 24;
        const diasTotal = Math.floor(diffMs / msDia);

        const { meses, semanas } = diffMesesESemanas(agora, dataEvento);

        const diasRestantes = diasTotal - (meses * 30) - (semanas * 7);

        const restoDia = diffMs % msDia;

        const horas = Math.floor(restoDia / (1000 * 60 * 60));
        const minutos = Math.floor((restoDia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((restoDia % (1000 * 60)) / 1000);

        const horario =
            String(horas).padStart(2, "0") + ":" +
            String(minutos).padStart(2, "0") + ":" +
            String(segundos).padStart(2, "0");

        // ==============================
        // ÚLTIMA SEMANA
        // ==============================
        if (meses === 0 && diasTotal < 7) {
            if (diasTotal > 0) {
                contador.textContent =
                    `${diasTotal} ${pluralizar(diasTotal, "dia", "dias")} e ${horario}`;
            } else {
                contador.textContent = horario;
            }
            return;
        }

        // ==============================
        // NORMAL: meses, semanas e dias
        // ==============================
        const partes = [];

        if (meses > 0) {
            partes.push(`${meses} ${pluralizar(meses, "mês", "meses")}`);
        }

        if (semanas > 0) {
            partes.push(`${semanas} ${pluralizar(semanas, "semana", "semanas")}`);
        }

        if (diasRestantes > 0) {
            partes.push(`${diasRestantes} ${pluralizar(diasRestantes, "dia", "dias")}`);
        }

        if (partes.length > 0) {
            contador.textContent = `${partes.join(", ")} e ${horario}`;
        } else {
            contador.textContent = horario;
        }
    }

    atualizar();
    setInterval(atualizar, 1000);
});
