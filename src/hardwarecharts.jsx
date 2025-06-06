
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const chartStyle = { marginBottom: "30px", textAlign: "center" };

const HardwareCharts = ({ data }) => {
  return (
    <div style={{ display: "flex", gap: "30px", justifyContent: "center", flexWrap: "wrap" }}>
      <div style={chartStyle}>
        <h3>CPU Usage</h3>
        <LineChart width={300} height={200} data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cpu" stroke="#8884d8" dot />
        </LineChart>
      </div>

      <div style={chartStyle}>
        <h3>RAM Usage</h3>
        <LineChart width={300} height={200} data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ram" stroke="#82ca9d" dot />
        </LineChart>
      </div>

      <div style={chartStyle}>
        <h3>HDD Usage</h3>
        <LineChart width={300} height={200} data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="hdd" stroke="#ffc658" dot />
        </LineChart>
      </div>
    </div>
  );
};

export default HardwareCharts;
