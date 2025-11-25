import React, { useState, useRef } from 'react';
import { Activity, Droplets, Apple, Heart, Info, Scale, Ruler, User, Copy } from 'lucide-react';

// --- DATOS DE REFERENCIA APROXIMADOS (Basados en tablas de crecimiento estandarizadas) ---
// Estos datos son simplificaciones de las curvas de IMC para la edad (5to y 85vo percentil)
// Se usan para dibujar la "Zona Saludable" en el gráfico.
const growthData = {
  boys: [
    { age: 2, min: 14.7, max: 18.2 }, { age: 3, min: 14.3, max: 17.4 },
    { age: 4, min: 14.0, max: 16.9 }, { age: 5, min: 13.8, max: 16.8 },
    { age: 6, min: 13.7, max: 17.0 }, { age: 7, min: 13.7, max: 17.4 },
    { age: 8, min: 13.8, max: 17.9 }, { age: 9, min: 14.0, max: 18.6 },
    { age: 10, min: 14.2, max: 19.4 }, { age: 11, min: 14.6, max: 20.2 },
    { age: 12, min: 15.0, max: 21.0 }, { age: 13, min: 15.5, max: 21.8 },
    { age: 14, min: 16.0, max: 22.6 }, { age: 15, min: 16.6, max: 23.4 },
    { age: 16, min: 17.1, max: 24.2 }, { age: 17, min: 17.7, max: 24.9 }
  ],
  girls: [
    { age: 2, min: 14.4, max: 18.0 }, { age: 3, min: 14.0, max: 17.6 },
    { age: 4, min: 13.7, max: 17.3 }, { age: 5, min: 13.5, max: 17.1 },
    { age: 6, min: 13.4, max: 17.3 }, { age: 7, min: 13.4, max: 17.7 },
    { age: 8, min: 13.6, max: 18.3 }, { age: 9, min: 13.9, max: 19.0 },
    { age: 10, min: 14.3, max: 19.9 }, { age: 11, min: 14.8, max: 20.8 },
    { age: 12, min: 15.3, max: 21.8 }, { age: 13, min: 15.9, max: 22.7 },
    { age: 14, min: 16.4, max: 23.6 }, { age: 15, min: 17.0, max: 24.3 },
    { age: 16, min: 17.5, max: 25.0 }, { age: 17, min: 17.9, max: 25.6 }
  ]
};

const CalculatorSection = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'boys',
    height: '', // cm
    weight: ''  // kg
  });
  const [result, setResult] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');
  const resultRef = useRef(null); // Ref para acceder al contenido de los resultados

  const calculateBMI = (e) => {
    e.preventDefault();
    setCopyStatus(''); // Resetear el estado de copiado
    const { age, gender, height, weight } = formData;
    
    if (!age || !height || !weight) return;

    const heightInMeters = parseFloat(height) / 100;
    const bmi = parseFloat(weight) / (heightInMeters * heightInMeters);
    const ageNum = parseInt(age);

    // Obtener datos de referencia para la edad seleccionada
    const refData = growthData[gender].find(d => d.age === ageNum);
    
    let status = '';
    let color = '';
    let advice = '';

    if (refData) {
      if (bmi < refData.min) {
        status = 'Bajo Peso';
        color = 'text-blue-500';
        advice = 'El IMC está por debajo del rango esperado (Percentil 5). Consulta con un pediatra sobre la nutrición.';
      } else if (bmi >= refData.min && bmi <= refData.max) {
        status = 'Peso Saludable';
        color = 'text-green-600';
        advice = '¡Excelente trabajo! El IMC se encuentra dentro del rango saludable (Percentiles 5-85). Mantengan los hábitos saludables actuales.';
      } else {
        status = 'Sobrepeso / Obesidad';
        color = 'text-orange-500';
        advice = 'El IMC está por encima del rango esperado (Percentil 85). Es buen momento para revisar hábitos de actividad y alimentación.';
      }
    } else {
      // Cálculo genérico de IMC para mayores de 17 (aunque el rango del selector es 2-17)
      status = 'Cálculo Básico';
      color = 'text-gray-600';
      advice = 'IMC calculado, pero sin referencia percentil para esta edad.';
    }

    setResult({
      bmi: bmi.toFixed(1),
      status,
      color,
      advice,
      age: ageNum,
      gender,
      refData
    });
  };

  const copyResults = () => {
    if (resultRef.current && result) {
      // 1. Crear el texto formateado para copiar
      const textToCopy = `
Resultados de Creciendo Sano:
Edad: ${result.age} años
Género: ${formData.gender === 'boys' ? 'Niño' : 'Niña'}
IMC (kg/m²): ${result.bmi}
Estado: ${result.status}
Consejo: ${result.advice}
      `.trim();

      // 2. Crear un elemento temporal de texto y asignarle el valor
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = textToCopy;
      document.body.appendChild(tempTextArea);
      
      // 3. Seleccionar y copiar
      // Usamos document.execCommand('copy') como fallback para entornos sandboxed.
      tempTextArea.select();
      document.execCommand('copy');
      
      // 4. Limpiar
      document.body.removeChild(tempTextArea);
      
      // 5. Mostrar confirmación
      setCopyStatus('¡Resultados copiados al portapapeles!');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  // No necesitamos chartData con SVG
  // const chartData = ...

  return (
    <div id="calculadora" className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">Calculadora de Crecimiento</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Ingresa los datos de tu hijo/a (entre 2 y 17 años) para obtener una estimación de su IMC y compararlo con los rangos de crecimiento saludable estándar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Formulario */}
          <div className="bg-green-50 rounded-2xl p-8 shadow-lg border border-green-100">
            <form onSubmit={calculateBMI} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 appearance-none"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="boys">Niño</option>
                      <option value="girls">Niña</option>
                    </select>
                    <svg className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad (años)</label>
                  <div className="relative">
                    <select
                      className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 appearance-none"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    >
                      <option value="">Seleccionar (2-17)</option>
                      {Array.from({length: 16}, (_, i) => i + 2).map(age => (
                        <option key={age} value={age}>{age} años</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estatura (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.1"
                      min="50"
                      max="200"
                      placeholder="Ej. 120.5"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.1"
                      min="5"
                      max="150"
                      placeholder="Ej. 24.3"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-md transition-all transform hover:scale-[1.02] duration-200 disabled:bg-gray-400"
                disabled={!formData.age || !formData.height || !formData.weight}
              >
                Calcular IMC
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                <strong>Nota Importante:</strong> Esta herramienta es solo orientativa y usa datos estandarizados (CDC/OMS). Los niños crecen a ritmos diferentes. Un diagnóstico real solo puede ser dado por un pediatra.
              </p>
            </div>
          </div>

          {/* Resultados y Gráfico */}
          <div className={`transition-all duration-500 ${result ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 grayscale blur-sm pointer-events-none'}`}>
            {result ? (
              <div ref={resultRef} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">Resultados</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">{result.bmi}</span>
                    <span className="ml-2 text-sm text-gray-500">IMC (kg/m²)</span>
                  </div>
                  <div className={`mt-2 text-xl font-bold ${result.color}`}>
                    {result.status}
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">
                    {result.advice}
                  </p>
                  
                  {/* Botón de Copiar */}
                  <div className="mt-4 flex items-center gap-4">
                    <button 
                        onClick={copyResults}
                        className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Resultado
                    </button>
                    {copyStatus && (
                      <span className="text-sm text-blue-600 font-semibold animate-pulse">
                        {copyStatus}
                      </span>
                    )}
                  </div>

                </div>
                
                <div className="p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Comparativa de Crecimiento ({result.gender === 'boys' ? 'Niños' : 'Niñas'})
                  </h4>
                  <div className="w-full bg-gray-50 rounded-lg p-4">
                    <svg width="100%" height="300" viewBox="0 0 500 300" className="border border-gray-200 rounded">
                      {/* Eje Y */}
                      <line x1="40" y1="20" x2="40" y2="260" stroke="#999" strokeWidth="2" />
                      {/* Eje X */}
                      <line x1="40" y1="260" x2="480" y2="260" stroke="#999" strokeWidth="2" />
                      
                      {/* Etiquetas de ejes */}
                      <text x="20" y="140" fontSize="12" fill="#666" textAnchor="end">IMC</text>
                      <text x="260" y="285" fontSize="12" fill="#666" textAnchor="middle">Edad (años)</text>
                      
                      {/* Grid y datos simplificados */}
                      {[10, 15, 20, 25, 30].map((imc, i) => (
                        <g key={`imc-${i}`}>
                          <line x1="35" y1={260 - (imc - 10) * 24} x2="480" y2={260 - (imc - 10) * 24} stroke="#e0e0e0" strokeWidth="1" />
                          <text x="30" y={260 - (imc - 10) * 24 + 4} fontSize="10" fill="#999" textAnchor="end">{imc}</text>
                        </g>
                      ))}
                      
                      {/* Puntos de datos de referencia */}
                      {growthData[result.gender].map((d, i) => {
                        const x = 40 + (d.age - 2) * (440 / 15);
                        const yMin = 260 - (d.min - 10) * 24;
                        const yMax = 260 - (d.max - 10) * 24;
                        const yAvg = 260 - ((d.min + d.max) / 2 - 10) * 24;
                        return (
                          <g key={`ref-${i}`}>
                            {/* Área saludable */}
                            {i < growthData[result.gender].length - 1 && (
                              <polygon points={`${x},${yMin} ${x + (440 / 15)},${260 - (growthData[result.gender][i+1].min - 10) * 24} ${x + (440 / 15)},${260 - (growthData[result.gender][i+1].max - 10) * 24} ${x},${yMax}`} fill="#22c55e" fillOpacity="0.1" />
                            )}
                            {/* Línea promedio */}
                            {i < growthData[result.gender].length - 1 && (
                              <line x1={x} y1={yAvg} x2={x + (440 / 15)} y2={260 - ((growthData[result.gender][i+1].min + growthData[result.gender][i+1].max) / 2 - 10) * 24} stroke="#34D399" strokeWidth="2" strokeDasharray="5,5" />
                            )}
                          </g>
                        );
                      })}
                      
                      {/* Punto del usuario */}
                      {(() => {
                        const x = 40 + (result.age - 2) * (440 / 15);
                        const y = 260 - (parseFloat(result.bmi) - 10) * 24;
                        return (
                          <g>
                            <circle cx={x} cy={y} r="5" fill={result.status === 'Peso Saludable' ? '#16a34a' : '#ef4444'} stroke="#fff" strokeWidth="2" />
                            <text x={x} y={y - 15} fontSize="12" fill={result.color} textAnchor="middle" fontWeight="bold">
                              IMC: {result.bmi}
                            </text>
                          </g>
                        );
                      })()}
                      
                      {/* Etiquetas de edad */}
                      {[2, 5, 8, 11, 14, 17].map(age => (
                        <text key={`age-${age}`} x={40 + (age - 2) * (440 / 15)} y="275" fontSize="10" fill="#666" textAnchor="middle">
                          {age}
                        </text>
                      ))}
                    </svg>
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-2">
                    Gráfico de referencia: zona verde = rango saludable | punto rojo/verde = tu IMC actual
                  </p>
                </div>
              </div>
            ) : (
               <div className="h-full min-h-[300px] flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-400">
                 Completa el formulario para ver la comparativa gráfica.
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, text, colorClass }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 transform transition duration-300 hover:-translate-y-2 hover:shadow-xl border-t-4 border-transparent hover:border-green-400">
    <div className={`w-14 h-14 rounded-full ${colorClass} flex items-center justify-center mb-4`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{text}</p>
  </div>
);

const App = () => {
  const scrollToCalculator = () => {
    document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-green-700 tracking-tight">Creciendo<span className="text-blue-600">Sano</span></span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#inicio" className="text-gray-600 hover:text-green-600 font-medium transition">Inicio</a>
              <a href="#concientizacion" className="text-gray-600 hover:text-green-600 font-medium transition">Por qué importa</a>
              <a href="#consejos" className="text-gray-600 hover:text-green-600 font-medium transition">Hábitos</a>
            </div>
            <button 
              onClick={scrollToCalculator}
              className="bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:bg-green-700 transition"
            >
              Calculadora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative bg-blue-600 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1472162072942-cd5147eb3902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Niños corriendo felices" 
            className="w-full h-full object-cover opacity-30 mix-blend-multiply"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/1920x1080/0f172a/94a3b8?text=Niños+Jugando" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/60 to-blue-900/60" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
          <span className="bg-green-400/20 text-green-100 py-1 px-4 rounded-full text-sm font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm border border-green-400/30">
            Guía de Salud Infantil
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            El futuro saludable <br/> comienza con <span className="text-green-400">pequeños pasos</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-blue-100 mb-10">
            Monitorea el crecimiento de tus hijos, recibe consejos prácticos y construye hábitos que durarán toda la vida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={scrollToCalculator}
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-1"
            >
              Calcular Crecimiento
            </button>
            <a 
              href="#consejos" 
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full font-bold text-lg transition-all"
            >
              Ver Consejos
            </a>
          </div>
        </div>
        
        <div className="absolute bottom-0 w-full">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto text-gray-50 fill-current">
             <path fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
        </div>
      </section>

      {/* Awareness Section */}
      <section id="concientizacion" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Por qué actuar ahora contra el sobrepeso?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                      <Activity className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Salud Física Futura</h3>
                    <p className="mt-2 text-gray-600">
                      Prevenir el sobrepeso infantil reduce drásticamente el riesgo de diabetes tipo 2, problemas cardiovasculares y articulares en la adultez.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600">
                      <Heart className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Bienestar Emocional</h3>
                    <p className="mt-2 text-gray-600">
                      Un peso saludable contribuye a una mejor autoestima, mayor energía para jugar y reduce el riesgo de ansiedad social.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl transform rotate-3 scale-105 opacity-20"></div>
              <img 
                src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Padres e hijos comiendo sano" 
                className="relative rounded-2xl shadow-xl w-full object-cover h-80 md:h-96"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x800/22c55e/ffffff?text=Familia+Saludable" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <CalculatorSection />

      {/* Practical Tips Section */}
      <section id="consejos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold tracking-wide uppercase">Hábitos Saludables</span>
            <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Pequeños cambios, grandes resultados
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              No se trata de dietas estrictas, sino de sumar colores y movimiento a la vida diaria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Droplets} 
              title="Prioriza el Agua" 
              text="Reemplaza jugos azucarados y gaseosas por agua. Una buena hidratación mejora la concentración y energía."
              colorClass="bg-blue-500"
            />
            <FeatureCard 
              icon={Activity} 
              title="1 Hora de Juego" 
              text="El movimiento es medicina. Asegura al menos 60 minutos de actividad física moderada al día: correr, saltar o bailar."
              colorClass="bg-green-500"
            />
            <FeatureCard 
              icon={Apple} 
              title="Plato Arcoíris" 
              text="Intenta que cada plato tenga al menos 3 colores diferentes de frutas y verduras. Más color significa más color significa más vitaminas."
              colorClass="bg-red-500" // Rojo para destacar frutas como manzanas/fresas
            />
          </div>

          {/* Rainbow Plate Visual Extra */}
          <div className="mt-16 bg-gray-50 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:w-1/2 md:pr-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">El Reto del Arcoíris </h3>
                <p className="text-gray-600 mb-6">
                  Involucra a tus hijos en la cocina. Jueguen a "comer el arcoíris" durante la semana. 
                  Los vegetales rojos ayudan al corazón, los naranjas a la vista, y los verdes a los huesos.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <span className="h-3 w-3 rounded-full bg-red-500 mr-3"></span> Rojo: Tomate, Fresa, Manzana
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="h-3 w-3 rounded-full bg-orange-400 mr-3"></span> Naranja: Zanahoria, Naranja, Calabaza
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="h-3 w-3 rounded-full bg-green-500 mr-3"></span> Verde: Espinaca, Brócoli, Aguacate
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 flex justify-center">
                  {/* Visual simple abstracta de comida saludable */}
                   <div className="relative w-64 h-64">
                     <div className="absolute inset-0 bg-red-100 rounded-full opacity-50 transform -translate-x-4"></div>
                     <div className="absolute inset-0 bg-green-100 rounded-full opacity-50 transform translate-x-4"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                            src="https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                            className="rounded-full w-56 h-56 object-cover border-8 border-white shadow-lg"
                            alt="Plato de frutas variadas"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x600/fecaca/991b1b?text=Arcoiris+Nutricional" }}
                        />
                     </div>
                   </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-green-500" />
                <span className="font-bold text-xl tracking-tight">CreciendoSano</span>
              </div>
              <p className="text-gray-400 text-sm max-w-sm">
                Una herramienta dedicada a informar y empoderar a los padres para construir un futuro más saludable para sus hijos.
              </p>
            </div>
            <div className="md:text-right">
              <h4 className="text-lg font-semibold mb-4 text-green-400">Aviso Legal</h4>
              <p className="text-gray-400 text-xs leading-relaxed max-w-md ml-auto">
                Los cálculos y recomendaciones proporcionados en este sitio web son meramente informativos y orientativos. 
                No sustituyen el consejo, diagnóstico o tratamiento de un profesional de la salud. 
                Consulte siempre con su pediatra para una evaluación completa.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Creciendo Sano. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;