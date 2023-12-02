"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

const data = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
];

const COLORS = ["#0088FE", "#00c49f", "#FFBB28", "#FF8042"];

const RADIAN = Math.PI / 180;

const renderLegend = (props: any) => {
  const { payload } = props;
  const totalValue = payload.reduce(
    (acc: any, entry: any) =>
      acc + (Number.isFinite(entry.value) ? entry.value : 0),
    0
  );

  return (
    <ul>
      {payload.map((entry: any, index: any) => {
        const percentage =
          totalValue !== 0 ? ((entry.value / totalValue) * 100).toFixed(2) : 0;
        return (
          <li key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name} ({percentage}%)
          </li>
        );
      })}
    </ul>
  );
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: any) => {
  const MIN_PERCENT_FOR_LABEL = 0.2;

  if (percent < MIN_PERCENT_FOR_LABEL) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

type PieData = {
  name: string;
  value: string;
}[];

type ResponsePieProps = {
  data: PieData;
};

const ResponsePie = ({ data }: ResponsePieProps) => {
  if (!data || data.length === 0) {
    return null;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart width={400} height={200}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend
          height={24}
          align="left"
          verticalAlign="top"
          layout="vertical"
          wrapperStyle={{
            paddingRight: "0px",
            paddingLeft: "0px",
            fontSize: "12px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ResponsePie;
