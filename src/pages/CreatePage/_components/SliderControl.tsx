import './SliderControl.css';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  icon?: string;
}

export default function SliderControl({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  unit = '',
  icon
}: SliderControlProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider-control">
      <div className="slider-header">
        <label className="slider-label">
          {icon && <span className="slider-icon">{icon}</span>}
          {label}
        </label>
        <span className="slider-value">
          {value.toFixed(1)}{unit}
        </span>
      </div>
      
      <div className="slider-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="slider-input"
          style={{
            background: `linear-gradient(to right, var(--sakura-pink) 0%, var(--sakura-pink) ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%, rgba(255, 255, 255, 0.2) 100%)`
          }}
        />
        
        <div className="slider-track">
          <div 
            className="slider-progress"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <div className="slider-markers">
        <span className="marker-min">{min}</span>
        <span className="marker-max">{max}</span>
      </div>
    </div>
  );
}