import React, { useState } from 'react';
import { Card, Typography, Box, Tabs, Tab } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const RentalsCalendar = ({ rentals }) => {
  const [view, setView] = useState('month');
  
  // Formatar dados para o calendário
  const rentalEvents = rentals.map(rental => ({
    id: rental.id,
    title: `${rental.nome_cliente || 'Cliente'} - ${rental.itens?.length || 0} itens`,
    start: new Date(rental.data_inicio),
    end: new Date(rental.data_fim),
    resource: rental
  }));
  
  // Eventos de devolução
  const returnEvents = rentals.map(rental => ({
    id: `return-${rental.id}`,
    title: `Devolução: ${rental.nome_cliente || 'Cliente'}`,
    start: new Date(rental.data_fim),
    end: new Date(rental.data_fim),
    resource: rental,
    allDay: true
  }));
  
  const allEvents = [...rentalEvents, ...returnEvents];
  
  const handleViewChange = (newView) => {
    setView(newView);
  };
  
  const eventStyleGetter = (event) => {
    const isReturn = event.id.toString().startsWith('return');
    return {
      style: {
        backgroundColor: isReturn ? '#ff9800' : '#2196f3',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Card sx={{ p: 3, mt: 3, boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom>Calendário de Locações</Typography>
      
      <Tabs 
        value={view} 
        onChange={(e, newValue) => handleViewChange(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Mês" value="month" />
        <Tab label="Semana" value="week" />
        <Tab label="Dia" value="day" />
        <Tab label="Agenda" value="agenda" />
      </Tabs>
      
      <Box sx={{ height: 500 }}>
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          onView={handleViewChange}
          eventPropGetter={eventStyleGetter}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "Não há locações neste período."
          }}
        />
      </Box>
    </Card>
  );
};

export default RentalsCalendar;
