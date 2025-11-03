import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from "moment";
import "./CalendarioSocio.css";

const CalendarioSocio = () => {
  const [eventos, setEventos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [eventosDelDia, setEventosDelDia] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/socios/api/eventos-soap/")
      .then((res) => res.json())
      .then((data) => setEventos(data))
      .catch((err) => console.error("Error cargando eventos:", err));
  }, []);

  const handleDateChange = (date) => {
    setFechaSeleccionada(date);
    const seleccion = eventos.filter(
      (e) =>
        moment(e.fecha).format("YYYY-MM-DD") ===
        moment(date).format("YYYY-MM-DD")
    );
    setEventosDelDia(seleccion);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const tieneEvento = eventos.some(
        (e) =>
          moment(e.fecha).format("YYYY-MM-DD") ===
          moment(date).format("YYYY-MM-DD")
      );
      return tieneEvento ? "tiene-evento" : null;
    }
  };

  return (
    <div className="calendario-container">
      <div className="calendario-card">
        <h2 className="titulo-calendario">Calendario de Socio</h2>

        <div className="calendar-wrapper">
          <Calendar
            onChange={handleDateChange}
            value={fechaSeleccionada}
            tileClassName={tileClassName}
            locale="es-AR"
          />
        </div>

        <div className="eventos-lista">
          <h3>
            Eventos del <span>{moment(fechaSeleccionada).format("DD/MM/YYYY")}</span>
          </h3>

          {eventosDelDia.length === 0 ? (
            <p className="sin-eventos">No hay eventos en esta fecha.</p>
          ) : (
            <ul>
              {eventosDelDia.map((e, i) => (
                <li key={i} className="evento-item">
                  <div className="evento-info">
                    <h4>{e.titulo}</h4>
                    <p>
                      🕒 {moment(e.fecha).format("HH:mm")} — 📍 {e.lugar}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarioSocio;
