import React, { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";

const FilterForm = ({ filters, setFilters, handleFilter }) => {
  return (
    <div className="filter-form">
      <Input
        type="text"
        placeholder="Nome do Cliente"
        value={filters.nomeCliente}
        onChange={(e) =>
          setFilters({ ...filters, nomeCliente: e.target.value })
        }
      />
      <Input
        type="date"
        value={filters.dataInicio}
        onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
      />
      <Input
        type="date"
        value={filters.dataFim}
        onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
      />
      <Button label="Filtrar" onClick={handleFilter} />
    </div>
  );
};

export default FilterForm;
