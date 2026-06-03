import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function RadarVAK({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600 }}
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Perfil VAK"
          dataKey="A"
          stroke="var(--color-brand-primary)"
          fill="var(--color-brand-primary)"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ r: 4, fill: 'var(--color-brand-primary)' }}
        />
        <Tooltip
          formatter={(v) => [`${v}%`, 'Puntaje']}
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '13px',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
