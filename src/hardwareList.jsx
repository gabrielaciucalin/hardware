import React, { useEffect, useState } from "react";

const threshold = {
  cpu: 80,
  ram: 80,
  hdd: 90,
};

const HardwareList = () => {
  const [hardwareData, setHardwareData] = useState([]);

  useEffect(() => {
    fetch("http://192.168.56.1:5173/api/hardware")
      .then((res) => res.json())
      .then((data) => setHardwareData(data))
      .catch((err) => console.error("Error fetching hardware data:", err));
  }, []);

  const getCellStyle = (value, resource) => {
    if (value >= threshold[resource]) {
      return { backgroundColor: "rgba(255, 0, 0, 0.5)" }; 
    } 
    return {};
  };

  return (
    <div>
      <h2>Hardware Monitor</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Machine ID</th>
            <th>CPU (%)</th>
            <th>RAM (%)</th>
            <th>HDD (%)</th>
          </tr>
        </thead>
        <tbody>
          {hardwareData.map(({ machine_id, cpu, ram, hdd }) => (
            <tr key={machine_id}>
              <td>{machine_id}</td>
              <td style={getCellStyle(cpu, "cpu")}>{cpu}</td>
              <td style={getCellStyle(ram, "ram")}>{ram}</td>
              <td style={getCellStyle(hdd, "hdd")}>{hdd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HardwareList;
